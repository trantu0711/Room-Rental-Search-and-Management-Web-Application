using BE_QLNT.Models;
using BE_QLNT.MyModels;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BE_LVTN_QLPT_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {

        [HttpGet("thongtinnguoidung/{id}")]
        public IActionResult Xem(int id) {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();
                var thongtin = db.NguoiDungs.Where(p => p.UserId == id).Select(x => new
                {
                    x.UserId,
                    x.HoTen,
                    x.Email,
                    x.Sdt,
                    x.DiaChi,
                    x.Cccd,
                    x.Avatar,
                    x.Role,
        
                }).FirstOrDefault();

                if (thongtin == null) return NotFound("Không tìm thấy thông tin");
                return Ok(thongtin);
            }catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        
        }
        
        [HttpPut("suathongtin/{id}")]
        public async Task<IActionResult> SuaThongTin([FromForm] CNguoiDung c, int id)
        {
            try
            {
                if (c == null) return BadRequest("Thiếu dữ liệu đầu vào");

                using (var db = new DBLuanVanContext()) // Dùng using để tự đóng kết nối
                {
                    // ---TÌM USER TRONG DB ---
                    var nd = db.NguoiDungs.FirstOrDefault(x => x.UserId == id);
                    if (nd == null) return NotFound("Không tìm thấy thông tin user");

                    // Cập nhật thông tin chữ cơ bản 
                    nd.HoTen = c.HoTen;
                    nd.Sdt = c.SDT;
                    nd.Cccd = c.CCCD;
                    nd.DiaChi = c.DiaChi;

                    // ---XỬ LÝ ẢNH ---

                    // Kiểm tra xem người dùng có gửi ảnh mới lên không?
                    if (c.HinhAnh != null && c.HinhAnh.Length > 0)
                    {
                        // A. CHUẨN BỊ ĐƯỜNG DẪN
                        string root = Directory.GetCurrentDirectory(); // Lấy thư mục gốc nơi ứng dụng đang chạy
                        // Lưu vào thư mục: wwwroot/assets/avatar
                        string folderName = "assets/avatar";
                        string folderPath = Path.Combine(root, "wwwroot", folderName); // nối chuỗi 
                        // Path.Combine dùng để nối tùy vào hdt mà dùng / ỏr \ cho phù hợp

                        if (!Directory.Exists(folderPath)) // ktra xem đã có thư mục avatả chưa 
                            Directory.CreateDirectory(folderPath); // chưa có thì tạo 

                        // B. XÓA ẢNH CŨ (Nếu đã có)
                        if (!string.IsNullOrEmpty(nd.Avatar))
                        {
                            // nd.Avatar trong DB ví dụ là: "/assets/avatar/anh1.jpg"
                            // Cắt dấu "/" ở đầu đi để ghép chuỗi cho đúng
                            string pathAnhCu = Path.Combine(root, "wwwroot", nd.Avatar.TrimStart('/'));

                            if (System.IO.File.Exists(pathAnhCu))
                            {
                                System.IO.File.Delete(pathAnhCu); // Xóa file cũ đi
                            }
                        }

                        // C. LƯU ẢNH MỚI
                        // Đặt tên file ngẫu nhiên để không bị trùng
                        string fileName = Guid.NewGuid().ToString() + Path.GetExtension(c.HinhAnh.FileName);
                        string fullPath = Path.Combine(folderPath, fileName); // tạo tên song nối vs đường dẫn file 

                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            await c.HinhAnh.CopyToAsync(stream); // Lưu file vật lý xuống ổ cứng
                        }

                        // D. CẬP NHẬT DATABASE
                        // Lưu đường dẫn tương đối để Web hiển thị
                        // Kết quả lưu vào DB: "/assets/avatar/ten-file-moi.jpg"
                        nd.Avatar = "/" + folderName + "/" + fileName;
                    }

                    db.SaveChanges(); // Lưu tất cả thay đổi
                    return Ok(new { message = "Sửa thông tin thành công", avatar = nd.Avatar });
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi: " + ex.Message);
            }
        }
        [HttpGet("tim-theo-sdt")]
        public IActionResult TimNguoiDungTheoSdt(string sdt)
        {
            try
            {
                // 1. Kiểm tra đầu vào
                if (string.IsNullOrEmpty(sdt))
                {
                    return BadRequest("Vui lòng nhập số điện thoại");
                }

                DBLuanVanContext db = new DBLuanVanContext();

                // 2. Tìm trong database
                // Trim() để cắt khoảng trắng thừa nếu có
                var user = db.NguoiDungs
                    .Where(p => p.Sdt == sdt.Trim())
                    .Select(x => new
                    {
                        x.UserId,   // Cần cái này để lưu vào Hợp Đồng
                        x.HoTen,    // Cần cái này để hiển thị cho Chủ trọ xác nhận đúng người chưa
                        x.Sdt,
                        x.Email,
                        x.Avatar    // (Tùy chọn) Hiện ảnh cho dễ nhận diện
                    })
                    .FirstOrDefault();

                // 3. Trả về kết quả
                if (user == null)
                {
                    // Trả về 404 để Frontend biết mà báo lỗi "Không tìm thấy"
                    return NotFound("Không tìm thấy khách hàng nào có SĐT này.");
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


    }
}
