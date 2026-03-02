using BE_QLNT.Models;
using BE_QLNT.MyModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class TimKiemController : Controller
    {

        [HttpGet("loc")]
        public IActionResult LocBaiDang(string? dienTich, string? mucGia, string? tinhThanh, string? quanHuyen, string? phuongXa)
        {
            try
            {
                // 1. Khởi tạo Context trực tiếp (theo phong cách bạn muốn)
                using (DBLuanVanContext db = new DBLuanVanContext())
                {
                    // 'using' ở đây giúp tự động đóng kết nối sau khi chạy xong, 
                    // an toàn hơn là chỉ 'new' mà không dispose.

                    // 2. Bắt đầu tạo truy vấn
                    // Phải .Include(x => x.PhongTros) để có dữ liệu mà lọc Diện tích/Giá
                    // 1. Tạo truy vấn cơ bản & Include bảng liên quan
                    string[] tieude = new string[1];
                    string t = "Tim";
                    var query = db.BaiDangs
                                  .Include(b => b.PhongTros)             // Để lọc theo giá/diện tích
                                  .Where(b => b.TrangThaiTin == "Đang đăng" && b.TrangThaiTin == "Đang đăng" && b.NgayHetHan > DateTime.Now) // Chỉ lấy tin đang hiển thị
                                  .AsQueryable();
                    // 3. Xử lý Lọc DIỆN TÍCH
                    if (!string.IsNullOrEmpty(dienTich))
                    {
                        switch (dienTich)
                        {
                            case "duoi20":
                                query = query.Where(b => b.PhongTros.Any(p => p.DienTich < 20));
                                t = string.Concat("/<20m2"); // noois chuooix
                                break;
                            case "20-30":
                                query = query.Where(b => b.PhongTros.Any(p => p.DienTich >= 20 && p.DienTich < 30));
                                t = string.Concat("/20-30m2"); // nối chuỗi
                                break;
                            case "30-50":
                                query = query.Where(b => b.PhongTros.Any(p => p.DienTich >= 30 && p.DienTich < 50));
                                t = string.Concat("/30-50m2"); // nối chuỗi
                                break;
                            case "tren50":
                                query = query.Where(b => b.PhongTros.Any(p => p.DienTich >= 50));
                                t = string.Concat("/>50m2"); // nối chuỗi
                                break;
                        }
                    }

                    // 4. Xử lý Lọc GIÁ (Vì GiaThue trong DB là string, cần convert cẩn thận)
                    if (!string.IsNullOrEmpty(mucGia))
                    {
                        switch (mucGia)
                        {
                            case "duoi2":
                                query = query.Where(bd =>bd.GiaThueBaiDang <2000000);
                                t = string.Concat("/<2 trieu"); // nối chuỗi
                                break;
                            case "2-4":
                                query = query.Where(bd => bd.GiaThueBaiDang >= 2000000 && bd.GiaThueBaiDang <= 4000000);
                                t = string.Concat("/tu 2 - 4 trieu"); // nối chuỗi
                                break;
                            case "4-6":
                                query = query.Where((bd => bd.GiaThueBaiDang >= 4000000 && bd.GiaThueBaiDang <= 6000000));
                                t = string.Concat("/tu 4 - 5 trieu"); // nối chuỗi
                                break;
                            case "tren6":
                                query = query.Where((bd => bd.GiaThueBaiDang > 6000000));
                                t = string.Concat("/tren 6 trieu"); // nối chuỗi
                                break;
                        }
                    }

                    // 5. Xử lý Lọc ĐỊA ĐIỂM
                    if (!string.IsNullOrEmpty(tinhThanh))
                    {
                        query = query.Where(b => b.TinhThanh == tinhThanh);
                        t = string.Concat("/tu "); // nối chuỗi
                    }

                    if (!string.IsNullOrEmpty(quanHuyen))
                    {
                        query = query.Where(b => b.QuanHuyen == quanHuyen);
                    }

                    if (!string.IsNullOrEmpty(phuongXa))
                    {
                        query = query.Where(b => b.PhuongXa == phuongXa);
                    }

                    // 6. Thực thi truy vấn và lấy kết quả
                    var ketQua = query.Select(bd => new
                    {
                        // Thông tin bài đăng
                        MaBaiDang = bd.BaiDangId,
                        Tieude = bd.TieuDe,
                        Ngaydang = bd.NgayDang,
                        Mota = bd.MoTa,
                        Sonha = bd.SoNha,
                        Quanhuyen = bd.QuanHuyen,
                        Phuongxa = bd.PhuongXa,
                        Tinhthanh = bd.TinhThanh,

                        // Thông tin phòng trọ (Lấy phòng đầu tiên tìm thấy trong bài đăng)
                        // Vì 1 bài đăng có thể có nhiều phòng, ta dùng FirstOrDefault()
                        Gia = bd.GiaThueBaiDang,
                        Dientich = bd.PhongTros.FirstOrDefault().DienTich,
                        Soluongphong = bd.PhongTros.Count(),
                        Songuoi = bd.PhongTros.FirstOrDefault().SoNguoi,

                        HinhAnh = bd.AnhPhongTros.Select(a => a.Url).FirstOrDefault(),

                     
                    }).ToList();

                    // 7. Trả về kết quả (Style của bạn: check null/count rồi return Ok)
                    if (ketQua == null || ketQua.Count == 0)
                    {
                        return NotFound("Không tìm thấy bài đăng nào phù hợp yêu cầu.");
                    }

                    return Ok(ketQua);
                }
            }
            catch (Exception ex)
            {
                // 8. Bắt lỗi nếu có (ví dụ lỗi convert số, lỗi DB)
                return BadRequest("Lỗi server: " + ex.Message);
            }

        }

        // Hàm chuyển đổi tiếng Việt có dấu thành không dấu
        // Ví dụ: "Gò Vấp" -> "go vap"
        private string ChuyenVeKhongDau(string text)
        {
            if (string.IsNullOrEmpty(text)) return string.Empty;

            // 1. Chuyển thành chữ thường
            text = text.ToLower().Trim();

            // 2. Chuẩn hóa chuỗi unicode để tách dấu ra khỏi ký tự gốc
            var regex = new System.Text.RegularExpressions.Regex("\\p{IsCombiningDiacriticalMarks}+");
            string temp = text.Normalize(System.Text.NormalizationForm.FormD);

            // 3. Loại bỏ dấu
            return regex.Replace(temp, String.Empty).Replace('\u0111', 'd').Replace('\u0110', 'd');
        }

        
        [HttpGet("timkiem")]
        public IActionResult TimKiem(string tukhoa)
        {
            try
            {
                using (DBLuanVanContext db = new DBLuanVanContext())
                {
                    // --- BƯỚC 1: XỬ LÝ ĐẦU VÀO ---
                    if (string.IsNullOrEmpty(tukhoa))
                        return BadRequest("Vui lòng nhập từ khóa");

                    // Chuyển từ khóa sang dạng: chữ thường + không dấu
                    // Ví dụ: "Quận 9" -> "quan 9"
                    string tuKhoaKhongDau = ChuyenVeKhongDau(tukhoa);

                    var rawData = db.BaiDangs
                        .Include(bd => bd.PhongTros)
                        .Include(bd => bd.AnhPhongTros)
                        .AsEnumerable() // Chuyển sang xử lý trên RAM từ đoạn này
                        .Where(p =>
                            // So sánh: Tiêu đề (đã bỏ dấu) CÓ CHỨA Từ khóa (đã bỏ dấu) không?
                            ChuyenVeKhongDau(p.TieuDe).Contains(tuKhoaKhongDau)
                        )
                        .ToList();

                    // --- BƯỚC 3: SẮP XẾP THÔNG MINH & TRẢ VỀ KQ ---
                    var ketQua = rawData
                        .OrderBy(p => {
                            // Logic tính điểm ưu tiên trên chuỗi KHÔNG DẤU
                            string tieuDeKhongDau = ChuyenVeKhongDau(p.TieuDe);

                            // Ưu tiên 1: Giống y hệt (VD: tìm "go vap" -> bài "Gò Vấp" lên đầu)
                            if (tieuDeKhongDau.Equals(tuKhoaKhongDau)) return 1;

                            // Ưu tiên 2: Bắt đầu bằng (VD: "go vap" -> "Gò Vấp giá rẻ")
                            if (tieuDeKhongDau.StartsWith(tuKhoaKhongDau)) return 2;

                            // Ưu tiên 3: Nằm ở giữa/cuối
                            return 3;
                        })
                        .Select(bd => new
                        {
                            MaBaiDang = bd.BaiDangId,
                            Tieude = bd.TieuDe,
                            Ngaydang = bd.NgayDang,
                            Mota = bd.MoTa,
                            Sonha = bd.SoNha,
                            Quanhuyen = bd.QuanHuyen,
                            Phuongxa = bd.PhuongXa,
                            Tinhthanh = bd.TinhThanh,

                            // Thông tin phòng trọ (an toàn null)
                            Gia = bd.GiaThueBaiDang,
                            Dientich = bd.PhongTros.FirstOrDefault()?.DienTich ?? 0,
                            Soluongphong = bd.PhongTros.Count(),
                            Songuoi = bd.PhongTros.FirstOrDefault()?.SoNguoi ?? 0,

                            // Hình ảnh
                            HinhAnh = bd.AnhPhongTros.Select(a => a.Url).FirstOrDefault()
                        })
                        .ToList();

                    if (ketQua.Count == 0) return NotFound("Không tìm thấy kết quả phù hợp.");

                    return Ok(ketQua);
                }
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi server: " + ex.Message);
            }
        }

    }
}
