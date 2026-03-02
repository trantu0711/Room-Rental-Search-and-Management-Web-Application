using BE_QLNT.Models;
using BE_QLNT.MyModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhGiaController : ControllerBase
    {
        [HttpPost("danhgia")]
        public IActionResult themdanhgia([FromBody] CDanhGia c)
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();
                if (string.IsNullOrEmpty(c.Comment)) { return BadRequest("Thiếu dữ liệu"); }
                var ds = db.TuCams.Where(t => t.NoiDung != null).Select(t => t.NoiDung);
                string noidungLoc = c.Comment;
                foreach (var tuCam in ds)
                {
                    if (!string.IsNullOrEmpty(tuCam))
                    {
                        string pattern = Regex.Escape(tuCam);//esxcape để tránh lỗi nếu có kí tự lạ
                        noidungLoc = Regex.Replace(noidungLoc, $@"\b{pattern}\b", "***", RegexOptions.IgnoreCase);

                    }
                }
                var dg = new DanhGium();
                dg.UserId = c.UserId;
                dg.BaiDangId = c.BaiDangId;
                //dg.DanhGiaId = c.DanhGiaId;
                dg.Sao = c.Sao;

                var bd = db.BaiDangs.FirstOrDefault(t => t.BaiDangId == c.BaiDangId);
                if (bd == null) return NotFound("Bài đăng không tồn tại");

                bd.TongLuotDanhGia = bd.TongLuotDanhGia + 1;
                bd.TongSoSao = bd.TongSoSao + c.Sao;


                //luw vào db
                dg.Comment = noidungLoc;
                dg.NgayComment = DateTime.Now;
                db.DanhGia.Add(dg);
                db.SaveChanges();
                return Ok("cảm ơn bạn đã đánh giá");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);


            }
        }
        [HttpGet("laydsdanhgia/{baidangId}")]

        public IActionResult LayDanhGia(int baidangId)
        {
            try
            {
                using (var db = new DBLuanVanContext())
                {
                    // Lấy danh sách đánh giá của bài đăng đó
                    var ds = db.DanhGia.Include(x => x.User)
                        .Where(x => x.BaiDangId == baidangId)
                        .OrderByDescending(x => x.NgayComment) // Mới nhất lên đầu
                        .Select(x => new
                        {
                            // Lấy thông tin người dùng từ bảng User liên kết
                            // (Lưu ý: Kiểm tra lại model của bạn là x.User hay x.UserIdNavigation)
                            HoTen = x.User != null ? x.User.HoTen : "Người dùng ẩn danh",
                            avatar = x.User.Avatar,

                            // Thông tin đánh giá
                            comment = x.Comment,
                            sao = x.Sao,
                            ngayComment = x.NgayComment
                        })
                        .ToList();

                    return Ok(ds);
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi lấy đánh giá: " + ex.Message);
            }
        }

        [HttpGet("laydsdanhgia")]
        public IActionResult Laydsdanhgia()
        {
            try
            {
                using (var db = new DBLuanVanContext())
                {
                    // Lấy danh sách đánh giá của bài đăng đó
                    var ds = db.DanhGia.Include(x => x.User)
                        .OrderByDescending(x => x.NgayComment) // Mới nhất lên đầu
                        .Select(x => new
                        {
                            // Lấy thông tin người dùng từ bảng User liên kết
                            // (Lưu ý: Kiểm tra lại model của bạn là x.User hay x.UserIdNavigation)
                            HoTen = x.User != null ? x.User.HoTen : "Người dùng ẩn danh",

                            // Thông tin đánh giá
                            baidangid = x.BaiDangId,
                            danhgiaid =x.DanhGiaId,
                            comment = x.Comment,
                            sao = x.Sao,
                            ngayComment = x.NgayComment,
                        })
                        .ToList();

                    return Ok(ds);
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi lấy đánh giá: " + ex.Message);
            }
        }

    }
}
