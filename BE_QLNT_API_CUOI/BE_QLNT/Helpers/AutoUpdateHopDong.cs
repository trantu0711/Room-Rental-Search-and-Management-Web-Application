using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BE_QLNT.Models;
using System.Net.Mail;
using System.Net;
using System.Collections.Generic;

namespace BE_QLNT.Helpers
{
    public class AutoUpdateHopDongService : BackgroundService
    {
        // Danh sách lưu tạm ID các hợp đồng đã gửi mail trong ngày để tránh gửi lặp lại liên tục
        private List<int> _sentMailCache = new List<int>();
        private DateTime _lastRunDate = DateTime.MinValue;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("--> BOT NHẮC HẠN HỢP ĐỒNG ĐANG CHẠY...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Reset cache nếu sang ngày mới
                    if (DateTime.Now.Date != _lastRunDate)
                    {
                        _sentMailCache.Clear();
                        _lastRunDate = DateTime.Now.Date;
                    }

                    using (var db = new DBLuanVanContext())
                    {
                        var today = DateTime.Now.Date;
                        // Tính ngày mục tiêu: Hôm nay + 7 ngày
                        var sevenDaysLater = today.AddDays(7);

                        // 1. TRUY VẤN: Tìm hợp đồng hết hạn đúng vào ngày (Hôm nay + 7)
                        var listSapHetHan = await db.HopDongs
                            .Include(x => x.User)         // Lấy Tenant (Khách)
                            .Include(x => x.PhongTro)     // Lấy Phòng
                                .ThenInclude(p => p.BaiDang)
                                    .ThenInclude(bd => bd.User) // Lấy Chủ trọ
                            .Where(x => x.TrangThaiHopDong == "Đang hiệu lực"
                                        && x.NgayKetThuc.HasValue
                                        && x.NgayKetThuc.Value.Date == sevenDaysLater) // So sánh ngày
                            .ToListAsync();

                        if (listSapHetHan.Count > 0)
                        {
                            foreach (var hd in listSapHetHan)
                            {
                                // Kiểm tra xem hợp đồng này đã gửi mail hôm nay chưa
                                if (_sentMailCache.Contains(hd.HopDongId)) continue;

                                string tenBaiDang = hd.PhongTro?.BaiDang?.TieuDe ?? "Không xác định";
                                string tenPhong = hd.PhongTro?.TenPhong ?? "Phòng trọ";

                                Console.WriteLine($"[NHẮC NHỞ] HĐ phòng: {tenPhong} còn 7 ngày nữa hết hạn.");

                                // 2. GỌI HÀM GỬI MAIL
                                await GuiMailNhacNho(hd, tenBaiDang);

                                // Đánh dấu đã gửi
                                _sentMailCache.Add(hd.HopDongId);
                            }
                            // Không cần SaveChangesAsync() vì ta không sửa dữ liệu
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR] {ex.Message}");
                }

                // Quét 1 tiếng 1 lần (để đỡ tốn tài nguyên server)
                // Thay vì 10 giây, mail nhắc nhở không cần realtime
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        // 3. HÀM GỬI MAIL (Nội dung nhắc nhở)
        private async Task GuiMailNhacNho(HopDong hd, string tenBaiDang)
        {
            try
            {
                string adminEmail = "thay_bang_email_cua_ban"; // <--- ĐIỀN EMAIL CỦA BẠN
                string appPassword = "mk_cua_ban";       // <--- ĐIỀN MẬT KHẨU ỨNG DỤNG

                string emailKhach = hd.User?.Email;
                string emailChuTro = hd.PhongTro?.BaiDang?.User?.Email; // Lấy mail chủ trọ
                string tenPhong = hd.PhongTro?.TenPhong ?? "Phòng trọ";
                string ngayHetHan = hd.NgayKetThuc?.ToString("dd/MM/yyyy");

                using (SmtpClient smtp = new SmtpClient("smtp.gmail.com", 587))
                {
                    smtp.EnableSsl = true;
                    smtp.Credentials = new NetworkCredential(adminEmail, appPassword);

                    // --- Gửi cho KHÁCH THUÊ ---
                    if (!string.IsNullOrEmpty(emailKhach))
                    {
                        MailMessage mail = new MailMessage();
                        mail.From = new MailAddress(adminEmail, "KÁTO System");
                        mail.To.Add(emailKhach);
                        mail.Subject = $"[KÁTO] Nhắc nhở: Hợp đồng phòng {tenPhong} sắp hết hạn (còn 7 ngày)";

                        mail.Body = $@"
                            <h3>Xin chào bạn,</h3>
                            <p>Hệ thống thông báo hợp đồng thuê phòng <b>{tenPhong}</b> của bạn sẽ hết hạn vào ngày <b>{ngayHetHan}</b> (còn 1 tuần).</p>
                            <p>Vui lòng liên hệ chủ trọ để gia hạn hoặc làm thủ tục trả phòng.</p>
                            <hr/>
                            <small>Tin đăng gốc: {tenBaiDang}</small>";

                        mail.IsBodyHtml = true;
                        await smtp.SendMailAsync(mail);
                        Console.WriteLine($"   -> Đã gửi nhắc nhở khách: {emailKhach}");
                    }

                    // --- Gửi cho CHỦ TRỌ ---
                    if (!string.IsNullOrEmpty(emailChuTro))
                    {
                        MailMessage mail = new MailMessage();
                        mail.From = new MailAddress(adminEmail, "KÁTO System");
                        mail.To.Add(emailChuTro);
                        mail.Subject = $"[KÁTO] Sắp hết hạn HĐ: Phòng {tenPhong}";

                        mail.Body = $@"
                            <h3>Chào chủ trọ,</h3>
                            <p>Hợp đồng của khách hàng: <b>{hd.User?.HoTen}</b> tại phòng <b>{tenPhong}</b> còn 7 ngày nữa là kết thúc (Ngày: {ngayHetHan}).</p>
                            <p>Vui lòng kiểm tra và liên hệ khách thuê.</p>";

                        mail.IsBodyHtml = true;
                        await smtp.SendMailAsync(mail);
                        Console.WriteLine($"   -> Đã gửi nhắc nhở chủ: {emailChuTro}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"   -> Lỗi gửi mail: {ex.Message}");
            }
        }
    }
}