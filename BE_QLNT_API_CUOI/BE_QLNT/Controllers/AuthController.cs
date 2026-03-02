using BE_QLNT.Models;
using BE_QLNT.MyModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {

        [HttpPost("dangky")]
        public IActionResult dangkytaikhoan(CDangKy tkm)
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();
                if (tkm == null) return NotFound("Không tìm thấy đối tượng");
                // ktra trùng sdt hoặc email, role
                var nd = db.NguoiDungs.FirstOrDefault(t => (t.Email == tkm.Email || t.Sdt == tkm.SDT) && t.Role == tkm.Role );

                if (nd != null)
                {
                    return BadRequest("Email hoặc sdt này đã được sử dụng!");
                }

                db.NguoiDungs.Add(CDangKy.ChuyenDoi(tkm));
                db.SaveChanges();
                return Ok("Đăng ký thành công");
            }
            catch
            {
                return BadRequest("Đăng ký thất bại");
            }
        }
        // cài thư viện System.IdentityModel.Tokens.Jwt
        [HttpPost("dangnhap")]
        public IActionResult Dangnhaptaikhoan(CDangNhap dn)
        {
            try
            {
                using (DBLuanVanContext db = new DBLuanVanContext())
                {
                    // 1. Tìm user theo (Email HOẶC SĐT) VÀ Role
                    // Lưu ý: Đã sửa lại logic ngoặc đơn cho chuẩn
                    NguoiDung t = db.NguoiDungs
                        .FirstOrDefault(u => (u.Email == dn.Email || u.Sdt == dn.Sdt) && u.Role == dn.Role);

                    if (t == null)
                    {
                        return NotFound("Sai thông tin đăng nhập hoặc sai vai trò.");
                    }

                    // 2. Kiểm tra trạng thái bị khóa
                    if (t.TrangThai == "Bị khóa")
                    {
                        return BadRequest("Tài khoản của bạn đã bị khóa.");
                    }

                    // 3. Kiểm tra mật khẩu (Dùng BCrypt)
                    if (BCrypt.Net.BCrypt.Verify(dn.MatKhau, t.MatKhau))
                    {
                        // ============================================================
                        // BẮT ĐẦU TẠO TOKEN (JWT) TẠI ĐÂY
                        // ============================================================

                        // A. Tạo "Secret Key" (Khóa bí mật)
                        // Lưu ý: Chuỗi này phải dài và bảo mật. Sau này nên để trong appsettings.json
                        var secretKey = ""; 
                        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)); // dịch ra để máy tính hiểu 

                        // B. Tạo "Claims" (Thông tin đính kèm trong vé)
                        // Server sẽ dựa vào đây để biết user này là ai mà không cần query DB lại
                        // dùng để ktra được mã hóa 
                        var claims = new List<Claim>    
                            {
                                new Claim("UserID", t.UserId.ToString()), // Lưu ID
                                new Claim("Sdt", t.Sdt ?? ""),                   // luwuw std
                                new Claim("Email", t.Email ?? ""),                 // Lưu Email
                                new Claim("Role", t.Role),                         // Lưu Quyền (Quan trọng)
                                new Claim("HoTen", t.HoTen ?? "")                  // Lưu Họ tên
                            };

                        // C. Cấu hình chữ ký và thời gian hết hạn
                        var tokenDescriptor = new SecurityTokenDescriptor
                        {
                            Subject = new ClaimsIdentity(claims),// gói ghém toàn bộ thông tin nhét vào trong Token.
                            Expires = DateTime.UtcNow.AddHours(24), // Token sống 24 giờ
                            // đữa key vaof và mã hóa thuật toán băm HmacSha256 ký tên lên token 
                            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature) 
                        };

                        // D. Tạo Token
                        var tokenHandler = new JwtSecurityTokenHandler(); //tạo, đọc và xác thực Token JWT.
                        var tokenObj = tokenHandler.CreateToken(tokenDescriptor); // bắt đầu tạo trả về 1 dtuong token nằm trong ram máy chủ
                        var tokenString = tokenHandler.WriteToken(tokenObj); //biến đối tượng Token trong RAM thành một chuỗi ký tự dài ngoằng (dạng eyJhbGciOiJIUz25...).

                        // ============================================================
                        // TRẢ VỀ KẾT QUẢ CHO REACT
                        // ============================================================

                        return Ok(new
                        {
                            status = "success",
                            message = "Đăng nhập thành công",
                            token = tokenString, // <-- React sẽ lấy cái này lưu vào LocalStorage
                            user = new
                            {         // Trả về thông tin cơ bản để hiển thị lên Header 
                                        // dùng để hiển thị lên fe 
                                        // lưu ý khi gửi đi dự c# tự động viêt thường chữ cái đầu khi gọi phải viết thường 
                               Hoten = t.HoTen,
                               Role =  t.Role,
                               Avatar = t.Avatar,
                               Email = t.Email,
                               Sdt = t.Sdt,
                               UserId = t.UserId

                            }
                        });
                    }

                    return BadRequest("Sai mật khẩu.");
                }
            }
            catch (Exception ex)
            {
                // Ghi log lỗi ra console để debug nếu cần
                Console.WriteLine(ex.Message);
                return BadRequest("Lỗi server: " + ex.Message);
            }
        }
    }
}
