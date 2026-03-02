using BE_QLNT.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnhPhongTroController : ControllerBase
    {
        [HttpDelete("xoa-anh/{id}")]
        public async Task<IActionResult> XoaAnh(int id)
        {
            try
            {
                using (var db = new DBLuanVanContext())
                {
                    // 1. Tìm ảnh trong Database
                    var anh = await db.AnhPhongTros.FindAsync(id);
                    if (anh == null)
                    {
                        return NotFound(new { message = "Không tìm thấy ảnh này trong hệ thống" });
                    }

                    // 2. Xóa file vật lý trong thư mục wwwroot (QUAN TRỌNG)
                    // URL trong DB thường là: "/assets/phongtro/ten-file.jpg"
                    if (!string.IsNullOrEmpty(anh.Url))
                    {
                        // Lấy đường dẫn gốc server
                        string root = Directory.GetCurrentDirectory();

                        // Cắt bỏ dấu "/" ở đầu chuỗi URL nếu có để ghép đường dẫn cho đúng
                        // Kết quả mong muốn: D:\Project\wwwroot\assets\phongtro\ten-file.jpg
                        string relativePath = anh.Url.TrimStart('/');
                        string fullPath = Path.Combine(root, "wwwroot", relativePath);

                        // Kiểm tra file có tồn tại không rồi xóa
                        if (System.IO.File.Exists(fullPath))
                        {
                            System.IO.File.Delete(fullPath);
                        }
                    }

                    // 3. Xóa record trong Database
                    db.AnhPhongTros.Remove(anh);
                    await db.SaveChangesAsync();

                    return Ok(new { message = "Đã xóa ảnh thành công" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa ảnh: " + ex.Message });
            }
        }
    }
}
