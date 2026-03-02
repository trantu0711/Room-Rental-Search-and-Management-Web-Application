using Microsoft.AspNetCore.Mvc;
using BE_QLNT.Models;
using BE_QLNT.MyModels;
using BE_LVTN_QLPT_API.MyModels;
using Microsoft.EntityFrameworkCore;

namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhongTroController : Controller
    {
        [HttpGet("theobaidang/{baiDangId}")]
        public IActionResult GetPhongByBaiDang(int baiDangId)
        {
            try
            {
                DBLuanVanContext db=new DBLuanVanContext();
                    // 1. Truy vấn DB
                    var listPhong = db.PhongTros
                        .Where(p => p.BaiDangId == baiDangId) // Lọc theo ID bài đăng
                        .Select(p => new CPhongTro
                        {
                            // Map dữ liệu từ Entity sang DTO (CPhongTro)
                            PhongTroId = p.PhongTroId,
                            BaiDangId = p.BaiDangId,
                            TenPhong = p.TenPhong,
                            DienTich = p.DienTich,
                            GiaThue = p.GiaThue,
                            SoNguoi = p.SoNguoi,
                            SoLuongPhong = p.SoLuongPhong ?? 1,
                            TrangThaiPhong = p.TrangThaiPhong,
                        })
                        .ToList();
                    // 2. Trả về kết quả
                    if (listPhong.Count == 0)
                    {
                        return Ok(new { message = "Bài đăng này chưa có phòng nào hoặc không tồn tại." });
                    }
                    return Ok(listPhong);
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi lấy danh sách phòng: " + ex.Message);
            }
        }


        [HttpPut("trangthai/{phongtroId}")]
        public IActionResult trangthai(int phongtroId, string trangthaimoi)
        {
            try
            {
                using (DBLuanVanContext db = new DBLuanVanContext())
                {
                    // 1. Tìm phòng trọ
                    var pt = db.PhongTros.FirstOrDefault(tt => tt.PhongTroId == phongtroId);
                    if (pt == null) return NotFound("Không tìm thấy phòng trọ");

                  
                    if (trangthaimoi == "0" || trangthaimoi == "Trống")
                    {
                        // Tìm hợp đồng ĐANG HOẠT ĐỘNG của phòng này
                        // Giả sử trong DB: Trạng thái 1 là "Đang thuê" (hoặc "DangHoatDong")
                        var hopDong = db.HopDongs.FirstOrDefault(hd =>
                                            hd.PhongTroId == phongtroId &&
                                            hd.TrangThaiHopDong == "Đang hiệu lực" // Chỉ lấy hợp đồng đang chạy
                                      );

                        if (hopDong != null)
                        {
                            hopDong.TrangThaiHopDong = "Đã kết thúc"; // Chuyển hợp đồng về trạng thái đã kết thúc
                            hopDong.NgayKetThuc = DateTime.Now; // Cập nhật ngày kết thúc là hiện tại
                        }
                    }

                    // 3. Cập nhật trạng thái phòng
                   
                    pt.TrangThaiPhong = trangthaimoi;

                    // 4. Lưu tất cả thay đổi (cả phòng và hợp đồng)
                    db.SaveChanges();

                    return Ok(new
                    {
                        Message = "Cập nhật thành công",
                        Phong = pt
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("xoa/{phongtroId}")]
        public IActionResult xoa(int phongtroId)
        {
            try
            {
                DBLuanVanContext db=new DBLuanVanContext();
                var pt = db.PhongTros.Find(phongtroId);
                if (pt == null) return NotFound("không tìm thấy phòng trọ");
                else
                {
                    if(pt.TrangThaiPhong=="Đã thuê") 
                    {
                        return NotFound("không xóa được");
                    }
                    var listHopDong = db.HopDongs.Where(x => x.PhongTroId == phongtroId).ToList();

                    //if (listHopDong.Count > 0)
                    //{
                    //    foreach (var hd in listHopDong)
                    //    {
                    //        // Tìm và xóa tất cả THANH TOÁN thuộc về hợp đồng này trước
                    //        // (Lưu ý: Kiểm tra tên bảng db.ThanhToans trong code của bạn)
                    //        var listThanhToan = db.ThanhToans.Where(tt => tt.HopDongId == hd.HopDongId).ToList();
                    //        if (listThanhToan.Count > 0)
                    //        {
                    //            db.ThanhToans.RemoveRange(listThanhToan);
                    //        }
                    //    }
                    //    // Sau khi xóa hết thanh toán con, thì xóa Hợp đồng cha
                    //    db.HopDongs.RemoveRange(listHopDong);
                    //}
                   
                    //var danhgias = db.DanhGia.Where(x => x.BaiDangId == phongtroId).ToList();
                    //if (danhgias.Count > 0)
                    //{
                    //    db.DanhGia.RemoveRange(danhgias);
                    //}
                    var hopdongs=db.HopDongs.Where(x=>x.PhongTroId == phongtroId).ToList();
                    if (hopdongs.Count > 0)
                    {
                        db.HopDongs.RemoveRange(hopdongs);
                    }
                    
                    else
                    {
                        var baiDang=db.BaiDangs.FirstOrDefault(x=>x.BaiDangId==pt.BaiDangId);
                        baiDang.SoLuongPhong = baiDang.SoLuongPhong - 1;
                    }
                    db.PhongTros.Remove(pt);
                    db.SaveChanges();
                    return Ok("Đã xóa thành công phòng trọ");
                }
            }catch (Exception ex)
            {
                var loiChiTiet = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest("Lỗi chi tiết: " + loiChiTiet);
            }
        }
    }
}
