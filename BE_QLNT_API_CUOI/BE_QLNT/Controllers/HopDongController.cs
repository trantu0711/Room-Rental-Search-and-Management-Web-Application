using BE_QLNT.Models;
using BE_QLNT.MyModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HopDongController : ControllerBase
    {
        [HttpPost("taohopdong")]
        public async Task<IActionResult> TaoHopDong([FromForm] CHopDongInput c)
        {
            DBLuanVanContext db = new DBLuanVanContext();
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    // =======================================================================
                    // 1. [MỚI] CHECK KỸ: KIỂM TRA TRONG BẢNG HỢP ĐỒNG TRƯỚC
                    // (Chặn ngay cả khi trạng thái phòng bị lệch)
                    // =======================================================================
                    var hopDongCu = db.HopDongs.FirstOrDefault(x => x.PhongTroId == c.PhongTroId
                                                                 && x.TrangThaiHopDong == "Đang hiệu lực");

                    if (hopDongCu != null)
                    {
                        return BadRequest(new { message = $"Phòng này đang có Hợp đồng (ID: {hopDongCu.HopDongId}) chưa thanh lý. Vui lòng thanh lý hợp đồng cũ trước!" });
                    }

                    // =======================================================================
                    // 2. CHECK PHÒNG (Logic cũ giữ nguyên làm lớp bảo vệ thứ 2)
                    // =======================================================================
                    var phong = db.PhongTros.FirstOrDefault(x => x.PhongTroId == c.PhongTroId);
                    if (phong == null) return NotFound("Phòng không tồn tại");

                    if (phong.TrangThaiPhong == "Đã thuê" || phong.TrangThaiPhong == "1")
                    {
                        return BadRequest(new { message = "Phòng này trạng thái đang là 'Đã thuê'. Không thể tạo mới!" });
                    }

                    // 3. CHECK KHÁCH
                    var khach = db.NguoiDungs.FirstOrDefault(x => x.UserId == c.UserId);
                    if (khach == null) return NotFound("Khách thuê không tồn tại");

                    // 4. XỬ LÝ FILE PDF (Upload)
                    string pathFileDB = "";
                    if (c.FileHopDong != null && c.FileHopDong.Length > 0)
                    {
                        string root = Directory.GetCurrentDirectory();
                        string folder = Path.Combine(root, "wwwroot", "assets", "hopdong");
                        if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                        string fileName = $"HD_{c.PhongTroId}_{Guid.NewGuid()}.pdf";
                        string fullPath = Path.Combine(folder, fileName);

                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            await c.FileHopDong.CopyToAsync(stream);
                        }
                        pathFileDB = "/assets/hopdong/" + fileName;
                    }

                    // 5. TẠO DATA HỢP ĐỒNG
                    var hopDong = new HopDong
                    {
                        UserId = c.UserId,
                        PhongTroId = c.PhongTroId,
                        NgayBatDau = c.NgayBatDau,
                        NgayKetThuc = c.NgayKetThuc,
                        NoiDungHopDong = c.NoiDungHopDong,
                        TrangThaiHopDong = "Đang hiệu lực"
                    };

                    if (!string.IsNullOrEmpty(pathFileDB))
                    {
                        hopDong.NoiDungHopDong = pathFileDB;
                    }

                    db.HopDongs.Add(hopDong);

                    // 6. KHÓA PHÒNG
                    phong.TrangThaiPhong = "Đã thuê"; // Hoặc "1" tùy database của bạn

                    await db.SaveChangesAsync();
                    transaction.Commit();

                    return Ok(new { message = "Tạo hợp đồng thành công! Phòng đã chuyển sang trạng thái Đã thuê.", id = hopDong.HopDongId });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return BadRequest(new { message = "Lỗi server: " + ex.Message });
                }
            }
        }
        [HttpGet("xemhopdong/{phongTroId}")]
        public async Task<IActionResult> XemHopDong(int phongTroId)
        {
            using (var db = new DBLuanVanContext())
            {
                // LOGIC MỚI: Không quan tâm trạng thái, chỉ lấy cái MỚI NHẤT (ID lớn nhất)
                var hopDong = await db.HopDongs
                    .Include(x => x.User)
                    .Where(x => x.PhongTroId == phongTroId) // Chỉ tìm theo ID phòng
                    .OrderByDescending(x => x.HopDongId)     // Sắp xếp giảm dần để lấy cái mới nhất
                    .FirstOrDefaultAsync();

                if (hopDong == null)
                {
                    return NotFound(new { message = "Phòng này chưa có hợp đồng nào trong hệ thống!" });
                }

                // Trả về dữ liệu
                return Ok(new
                {
                    hopDong.HopDongId,
                    hopDong.PhongTroId,
                    TenKhach = hopDong.User != null ? hopDong.User.HoTen : "Khách vãng lai",
                    SdtKhach = hopDong.User != null ? hopDong.User.Sdt : "",
                    hopDong.NgayBatDau,
                    hopDong.NgayKetThuc,
                    hopDong.TrangThaiHopDong, // Lúc này nó sẽ hiện ra trạng thái mà Bot đã cập nhật
                    hopDong.NoiDungHopDong
                });
            }
        }
    }
}
