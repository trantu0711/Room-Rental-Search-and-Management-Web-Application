using Microsoft.AspNetCore.Mvc;
using BE_QLNT.Models;   // Chứa entity BaiDang, PhongTro
using BE_QLNT.MyModels;
namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TuCamController : Controller
    {
        [HttpGet("danhsachtucam")]
        public IActionResult GetTuCam()
        {
            using (var db = new DBLuanVanContext())
            {
                var ds = db.TuCams.OrderByDescending(x => x.TuCamId).ToList();
                return Ok(ds);
            }
        }
        [HttpPost("them")]
        public IActionResult ThemTuCam([FromBody] CTuCam c)
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();
                if (string.IsNullOrEmpty(c.NoiDung))
                    return BadRequest("không được để trống");
                bool daTonTai = db.TuCams.Any(x => x.NoiDung.ToLower() == c.NoiDung.ToLower());
                if (daTonTai)
                {
                    return BadRequest($"Từ '{c.NoiDung}' đã có trong danh sách");
                }
                var tuCam = new TuCam
                {
                    NoiDung = c.NoiDung.Trim()
                };
                db.TuCams.Add(tuCam);
                db.SaveChanges();
                return Ok("Thêm thành công");
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi khi thêm từ" + ex.Message);
            }
        }
        [HttpDelete("xoa/{id}")]

        public IActionResult XoaTuCam(int id)
        {

            DBLuanVanContext db = new DBLuanVanContext();
            var tuCam = db.TuCams.Find(id);
            if (tuCam == null) return NotFound("không tìm thấy");
            db.TuCams.Remove(tuCam);
            db.SaveChanges();
            return Ok("Xóa thành công");
        }
    }
}
