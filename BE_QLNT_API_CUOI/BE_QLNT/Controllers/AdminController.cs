
using BE_QLNT.Models;
using BE_QLNT.MyModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;

namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : Controller
    {
        [HttpGet("laydanhsachnguoidung")]
        public IActionResult adminlaydanhsach()
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();

                var ds = db.NguoiDungs.Select(ds => new
                {
                    ds.UserId,
                    ds.HoTen,
                    ds.Email,
                    ds.MatKhau,
                    ds.Sdt,
                    ds.Role,
                    TrangThai = ds.TrangThai ?? "Hoạt Động"
                }).ToList();
                return Ok(ds);
            }
            catch
            {
                return BadRequest("Lỗi lấy danh sách người dùng");
            }
        }

        [HttpPut("khoa-mo/{id}")]
        public IActionResult KhoaMoUser(int id)
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();

                var user = db.NguoiDungs.FirstOrDefault(u => u.UserId == id);
                if (user == null) return NotFound("Không tìm thấy user");

                // Logic đảo ngược: Đang khóa thì mở, đang mở thì khóa
                if (user.TrangThai == "Bị khóa")
                {
                    user.TrangThai = "Hoạt động";
                }
                else
                {
                    user.TrangThai = "Bị khóa";
                }

                db.SaveChanges();
                return Ok(new { message = $"Đã chuyển trạng thái thành: {user.TrangThai}" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        //ADMIn
        // 1. Lấy danh sách các tin đang "Chờ duyệt"

        [HttpGet("choduyet")]
        public IActionResult GetTinChoDuyet()
        {
            try
            {
                using (var db = new DBLuanVanContext())
                {
                    var list = db.BaiDangs
                        .Include(b => b.User)
                        .Include(b => b.PhongTros)
                        .Where(b => b.TrangThaiTin == "Chờ duyệt") // Chỉ lấy tin chưa duyệt
                        .OrderByDescending(b => b.NgayDang) // sắp xếp giảm dần theo ngày đăng 
                        .Select(b => new
                        {
                            BaiDangId = b.BaiDangId,
                            TieuDe = b.TieuDe,  
                            MoTa = b.MoTa,

                           
                            SoNha = b.SoNha,
                            QuanHuyen = b.QuanHuyen, // Map đúng tên trường trong DB
                            TinhThanh = b.TinhThanh,
                            PhuongXa = b.PhuongXa,   

                            // Thông tin phòng
                            GiaThue = b.GiaThueBaiDang,
                            DienTich = b.PhongTros.FirstOrDefault() != null ? b.PhongTros.FirstOrDefault().DienTich : 0,

                            // Người đăng
                            NguoiDang = b.User != null ? b.User.HoTen : "Người dùng đã xóa",
                            SdtLienHe = b.User != null ? b.User.Sdt : "",
                            NgayGui = b.NgayDang,

                            // Ảnh đại diện
                            AnhDaiDien = b.AnhPhongTros.FirstOrDefault() != null
                                         ? b.AnhPhongTros.FirstOrDefault().Url
                                         : null,

                            // Danh sách ảnh chi tiết
                            AnhPhongTros = b.AnhPhongTros.Select(a => new { a.Url }).ToList()
                        })
                        .ToList();

                    return Ok(list);
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi: " + ex.Message);
            }
        }

        // 2. Duyệt tin (Chuyển sang "Đang đăng")

        [HttpPut("duyet/{id}")]
        public IActionResult DuyetTin(int id) // id này là BaiDangId
        {
            using (var db = new DBLuanVanContext())
            {
                var bai = db.BaiDangs.FirstOrDefault(x => x.BaiDangId == id);
                if (bai == null) return NotFound();
                
                bai.TrangThaiTin = "Đang đăng";
                bai.NgayHetHan = DateTime.Now.AddDays(7);


                //var thanhToan = db.ThanhToans
                //          .Where(tt => tt.BaiDangId == id)
                //          .OrderByDescending(tt => tt.ThanhToanId) // sắp xếp theo thứ tự giảm dần
                //          .FirstOrDefault(); // lấy phần tử đầu tiên 
                //decimal soTienDaTra = thanhToan.SoTien ?? 0;

                //DateTime ngayBatDau = DateTime.Now;

                //if (soTienDaTra == 10000)
                //{
                //    bai.NgayHetHan = ngayBatDau.AddDays(7);
                //}
                //else if (soTienDaTra == 20000)
                //{
                //    bai.NgayHetHan = ngayBatDau.AddDays(14);
                //}
                //else if (soTienDaTra == 30000)
                //{
                //    bai.NgayHetHan = ngayBatDau.AddDays(21);
                //}
                //else if (soTienDaTra == 40000)
                //{
                //    bai.NgayHetHan = ngayBatDau.AddMonths(1);
                //}
                //else if (soTienDaTra == 70000)
                //{
                //    bai.NgayHetHan = ngayBatDau.AddMonths(2);
                //}
                //else if (soTienDaTra == 100000)
                //{
                //    bai.NgayHetHan = ngayBatDau.AddMonths(3);
                //}
                //else
                //{
                //    // Trường hợp số tiền lạ, 
                //    bai.NgayHetHan = ngayBatDau.AddDays(0);
                //}

                db.SaveChanges();
                return Ok(new { message = "Đã duyệt tin!" });
            }
        }

        // 3. Từ chối tin
        [HttpPut("tuchoi/{id}")]
        public async Task<IActionResult> TuChoiTin(int id, [FromQuery] string lyDo)
        {

            string tenAdmin = "Admin";

            using (var db = new DBLuanVanContext())
            {
                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        // =======================================================
                        // BƯỚC 1: LẤY BÀI ĐĂNG + USER (Quan trọng để lấy Email)
                        // =======================================================
                        var bai = await db.BaiDangs
                                          .Include(x => x.User)
                                          .FirstOrDefaultAsync(x => x.BaiDangId == id);

                        if (bai == null) return NotFound(new { message = "Không tìm thấy bài đăng!" });

                        // =======================================================
                        // BƯỚC 2: CẬP NHẬT TRẠNG THÁI & LƯU LÝ DO
                        // =======================================================
                        bai.TrangThaiTin = "Bị từ chối";

                        var lyDoRecord = new LyDoTuChoi
                        {
                            BaiDangId = id,
                            NoiDung = lyDo,
                            NgayTuChoi = DateTime.Now,
                            NguoiTuChoi = tenAdmin // Kiểu string khớp với class của bạn
                        };
                        db.LyDoTuChois.Add(lyDoRecord);

                        // =======================================================
                        // BƯỚC 3: GỬI MAIL THÔNG BÁO CHO CHỦ TRỌ
                        // =======================================================
                        if (bai.User != null && !string.IsNullOrEmpty(bai.User.Email))
                        {
                            try
                            {
                                // --- CẤU HÌNH GỬI MAIL (Thông tin của bạn) ---
                                string myEmail = "trantu7112003@gmail.com";
                                string myPassword = "vhvyiiydmbavxlfw";

                                SmtpClient smtp = new SmtpClient("smtp.gmail.com", 587);
                                smtp.EnableSsl = true;
                                smtp.Credentials = new NetworkCredential(myEmail, myPassword);

                                // --- TẠO NỘI DUNG MAIL ---
                                MailMessage mail = new MailMessage();
                                mail.From = new MailAddress(myEmail, "Hệ thống QLPT KáTo");
                                mail.To.Add(bai.User.Email);
                                mail.Subject = "[KÁTO] Thông báo: Bài đăng của bạn bị từ chối";

                                mail.Body = $@"
                                    <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                                        <h3 style='color: #d32f2f;'>Xin chào {bai.User.HoTen},</h3>
                                        <p>Cảm ơn bạn đã đăng tin trên hệ thống <strong>KÁTO</strong>.</p>
                                        <p>Tuy nhiên, bài đăng <strong>{bai.TieuDe}</strong> (Mã tin: {bai.BaiDangId}) của bạn chưa đạt yêu cầu kiểm duyệt.</p>
                        
                                        <div style='background-color: #fff3cd; padding: 15px; border-left: 5px solid #ffc107; margin: 20px 0;'>
                                            <strong>⚠️ Lý do từ chối:</strong>
                                            <p style='margin-top: 5px; color: #333;'>{lyDo}</p>
                                        </div>

                                        <p>Vui lòng đăng nhập vào trang quản lý, chỉnh sửa lại thông tin theo yêu cầu và gửi duyệt lại.</p>
                                        <br/>
                                        <p>Trân trọng,<br/>Đội ngũ KÁTO</p>
                                        <hr/>
                                        <span style='font-size: 12px; color: #777;'>Đây là email tự động, vui lòng không trả lời email này.</span>
                                    </div>
                                ";
                                mail.IsBodyHtml = true;

                                // Gửi mail
                                smtp.Send(mail);
                            }
                            catch (Exception emailEx)
                            {
                                // Chỉ log lỗi mail để biết, KHÔNG chặn transaction
                                // Để đảm bảo bài vẫn được từ chối dù mail lỗi
                                Console.WriteLine("Lỗi gửi mail: " + emailEx.Message);
                            }
                        }

                        // =======================================================
                        // BƯỚC 4: LƯU TẤT CẢ XUỐNG DB
                        // =======================================================
                        await db.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return Ok(new { message = "Đã từ chối tin và gửi email thông báo thành công." });
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { message = "Lỗi hệ thống: " + ex.Message });
                    }
                }
            }
        }

        // đếm tổng số bài đăng 
        [HttpGet("thongke-tongquat")]
        public IActionResult GetThongKeTongQuat()
        {
            try
            {
                using (var db = new DBLuanVanContext())
                {
                    // 1. Đếm tổng số bài đăng
                    var soBaiDang = db.BaiDangs.Count();

                    // 2. Đếm số chủ trọ
                    // LƯU Ý: Thay "ChucVu" và "Chủ trọ" bằng tên cột và giá trị thực tế trong DB của bạn
                    // Ví dụ: u.RoleId == 1 hoặc u.LoaiUser == "Landlord"
                    var soChuTro = db.NguoiDungs.Count(u => u.Role == "chutro");

                    // 3. Đếm số người thuê
                    var soNguoiThue = db.NguoiDungs.Count(u => u.Role == "nguoithue");

                    var tongDoanhThu = db.ThanhToans
                        .Where(tt => tt.TrangThai == "Thành công")
                        .Sum(tt => tt.SoTien);

                    // Tạo đối tượng chứa cả 3 thông tin để trả về
                    var thongKe = new
                    {
                        TongBaiDang = soBaiDang,
                        TongChuTro = soChuTro,
                        TongNguoiThue = soNguoiThue,
                        TongDoanhThu = tongDoanhThu,
                        
                    };

                    return Ok(thongKe);
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi: " + ex.Message);
            }
        }

        [HttpGet("laydanhsachthanhtoan")]
        public IActionResult laydanhsachthanhtoan()
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();

                var ds = db.ThanhToans
                    .OrderByDescending(bd => bd.NgayThanhToan) // Mới nhất lên đầu
                    .Select(ds => new
                    {
                        ds.MaGiaoDich,
                        ds.SoTien,
                        ds.PhuongThuc,
                        ds.TrangThai,
                        ds.UserId,
                        ds.BaiDangId,
                        ds.NgayThanhToan,

                    }).ToList();
                return Ok(ds);
            }
            catch
            {
                return BadRequest("Lỗi lấy danh sách thanh toan");
            }
        }

    }
}

//[HttpGet("laydanhsachthanhtoan")]
//public IActionResult laydanhsachthanhtoan(int? thang, int? nam)
//{
//    try
//    {
//        // Sử dụng using để tự động giải phóng tài nguyên sau khi xong
//        using (DBLuanVanContext db = new DBLuanVanContext())
//        {
//            // 1. Khởi tạo truy vấn (chưa chạy xuống DB ngay)
//            var query = db.ThanhToans.AsQueryable();

//            // 2. Kiểm tra điều kiện lọc
//            // Nếu người dùng có truyền 'nam'
//            if (nam.HasValue)
//            {
//                query = query.Where(x => x.NgayThanhToan.Year == nam.Value);
//            }

//            // Nếu người dùng có truyền 'thang'
//            if (thang.HasValue)
//            {
//                query = query.Where(x => x.NgayThanhToan.Month == thang.Value);
//            }

//            // 3. Chọn các trường cần lấy và thực thi truy vấn
//            var ds = query.Select(ds => new
//            {
//                ds.MaGiaoDich,
//                ds.SoTien,
//                ds.PhuongThuc,
//                ds.TrangThai,
//                ds.UserId,
//                ds.BaiDangId,
//                ds.NgayThanhToan
//            })
//            .OrderByDescending(x => x.NgayThanhToan) // (Tùy chọn) Sắp xếp mới nhất lên đầu
//            .ToList();

//            return Ok(ds);
//        }
//    }
//    catch (Exception ex)
//    {
//        return BadRequest("Lỗi lấy danh sách thanh toán: " + ex.Message);
//    }
//}