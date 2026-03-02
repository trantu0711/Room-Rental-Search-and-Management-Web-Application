using BE_QLNT.Models;
using BE_QLNT.MyModels;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;
using System.Net.NetworkInformation;


namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LienHeController : ControllerBase
    {
        [HttpPost("GuiLienHe")]
        public IActionResult Guilienhe([FromBody] CLienHe request) // request nơi chứa dữ liêụ từ ng dùng nhập vào
        {
            try
            {
                //khoi tao ket noi
                DBLuanVanContext db = new DBLuanVanContext();

                // 2. Tìm bài đăng để lấy Email chủ trọ
                // Dùng .Include(b => b.User) để lấy luôn thông tin người đăng bài
                var Baidang = db.BaiDangs.Include(b => b.User).FirstOrDefault(b => b.BaiDangId == request.BaiDangId);
                if (Baidang == null) return NotFound("Bài đăng không tồn tại");

                // Lấy email chủ trọ
                string Emailchutro = Baidang.User.Email;
                if (string.IsNullOrEmpty(Emailchutro))
                {
                    return BadRequest("Chủ bài đăng này không có email hoặc chưa cập nhật email.");
                }

                // 3. CẤU HÌNH GỬI MAIL 
                string myEmail = "thay_bang_email_cua_ban";     // <---email trung gian 
                string myPassword = "mk_cua_ban"; // <--- ĐIỀN MẬT KHẨU ỨNG DỤNG

                // Khởi tạo SmtpClient
                SmtpClient smtp = new SmtpClient("smtp.gmail.com", 587); //dùng dịch vụ của google  587 port
                smtp.EnableSsl = true; // Bật chế độ bảo mật (SSL/TLS). đóng gói trước khi gửi qua internet 
                smtp.Credentials = new NetworkCredential(myEmail, myPassword); //trình thẻ chứng minh thư (Đăng nhập)





                //------------------------------------gui mail cho chu tro--------------------------
                MailMessage mailtochutro = new MailMessage();
                mailtochutro.From = new MailAddress(myEmail, "Hệ thống QLPT KáTo"); // username  và email trung gian 
                mailtochutro.To.Add(Emailchutro); // gui toi chu bai dang(chu tro)
                mailtochutro.Subject = "Thông báo liên hệ mới"; // tiêu đề 

                //noi dung mail
                mailtochutro.Body = $@"
                    <p>Xin chào {Baidang.User.HoTen},</p>
                    <p>
                        Bạn có một yêu cầu liên hệ mới từ khách thuê thông qua nền tảng <strong>KÁTO</strong>
                        <br/>
                        cho bài đăng: <strong>{request.BaiDangId}</strong>.
                    </p>
                    <h3>📌 Thông tin người liên hệ</h3>
                    <ul>
                        <li><strong>Họ và tên:</strong> {request.HoTen}</li>
                        <li><strong>Số điện thoại:</strong> {request.Sdt}</li>
                        <li><strong>Email:</strong> {request.Email}</li>
                        <li><strong>Thời gian gửi:</strong> {DateTime.Now}</li>
                    </ul>
                    <h3>📩 Nội dung trao đổi</h3>
                    <p style=""white-space: pre-line; border-left: 3px solid #ccc; padding-left: 10px;"">
                        {request.NoiDung}
                    </p>
                    <p>
                        Vui lòng chủ động liên hệ lại với khách để trao đổi thêm.
                        <br />
                        Nếu bạn cần hỗ trợ, hãy liên hệ đội ngũ KÁTO.
                    </p>
                    <p>Trân trọng,<br />Đội ngũ KÁTO</p>
                    <hr />
                    <span>Bấm Reply để trả lời khách hàng này.</span>
                ";
                mailtochutro.IsBodyHtml = true;

                // Cài đặt Reply-To: Để chủ trọ bấm Reply là gửi cho khách
                if (!string.IsNullOrEmpty(request.Email))
                {
                    mailtochutro.ReplyToList.Add(new MailAddress(request.Email));
                }

                // gui ngay lap tuc gửi sau khi replay
                smtp.Send(mailtochutro);




                //---------------------gui mail xac nhan cho ng thue----------------------------------
                if (!string.IsNullOrEmpty(request.Email)) // Chỉ gửi nếu khách có nhập email
                {
                    MailMessage mailTonguoithue = new MailMessage();
                    mailTonguoithue.From = new MailAddress(myEmail, "Hệ thống Trọ KATO");
                    mailTonguoithue.To.Add(request.Email); // Gửi cho chính người thuê
                    mailTonguoithue.Subject = "[KATO] Xác nhận yêu cầu liên hệ thành công";

                    // Nội dung cảm ơn lịch sự
                    mailTonguoithue.Body = $@"
                        <p>Xin Chào {request.HoTen},</p>
                        <span>Cảm ơn bạn đã sử dụng KÁTO để tìm phòng trọ.</span>
                        <br />
                        <br />
                        <span style=""display: inline-block; width: 500px;"">Chúng tôi đã gửi thông tin liên hệ của bạn đến chủ bài đăng {Baidang.TieuDe ?? "Phòng trọ"}, chủ trọ sẽ sớm
                            liên hệ lại với bạn qua số điện thoại hoặc email.</span>
                        <br />
                        <p>Chúc bạn sớm tìm được phòng ưng ý!</p>

                        <span>Trân trọng!</span>
                        <br />
                        <span>Đội ngũ KÁTO</span>
                        <hr />
                        <span>Đây là email tự động, vui lòng không trả lời mail này.</span>
                    ";
                    mailTonguoithue.IsBodyHtml = true;

                    smtp.Send(mailTonguoithue); // Gửi tiếp phát nữa
                }




                // ---------------------------------luwu vao database--------------------------------

                var lienhemoi = new LienHe();
                lienhemoi.BaiDangId = request.BaiDangId;
                lienhemoi.UserId = request.UserId; // Nếu có
                lienhemoi.HoTen = request.HoTen;
                lienhemoi.Sdt = request.Sdt;
                lienhemoi.Email = request.Email;
                lienhemoi.NoiDung = request.NoiDung;
                lienhemoi.NgayLienHe = DateTime.Now;

                db.LienHes.Add(lienhemoi);
                db.SaveChanges();

                // thông báo 
                return Ok(new { message = "Đã gửi mail và lưu liên hệ thành công!" });

            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi: " + ex.Message);
            }
        }
    }
}
