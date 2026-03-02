using BE_QLNT.Models;   // Chứa entity BaiDang, PhongTro
using BE_QLNT.MyModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;



namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaiDangController : Controller
    {
        //1.LẤY DANH SÁCH PHÒNG TRỌ
        [HttpGet("laydanhsachbaidang")]
        public IActionResult laydanhsachphongtro()
        {
            DBLuanVanContext db = new DBLuanVanContext();
            var ds = db.BaiDangs
             .Where(bd => bd.TrangThaiTin == "Đang đăng" && bd.NgayHetHan > DateTime.Now) // Điều kiện lọc
             .OrderByDescending(bd => bd.NgayDang) // Mới nhất lên đầu
             .Select(bd => new
             
             {
                 // 1. Lấy thông tin từ bảng Bai_Dang
                 MaBaiDang = bd.BaiDangId,
                 Tieude = bd.TieuDe,
                 Ngaydang = bd.NgayDang,
                 Mota = bd.MoTa,
                 Sonha = bd.SoNha,
                 Quanhuyen = bd.QuanHuyen,
                 Phuongxa = bd.PhuongXa,
                 Tinhthanh = bd.TinhThanh,
                 // 2. Lấy thông tin từ bảng Phong_Tro liên kết
                 // Lưu ý: Tùy vào quan hệ trong Database là 1-1 hay 1-Nhiều mà cách gọi sẽ khác nhau.
                 // Trường hợp phổ biến: Một bài đăng chứa thông tin 1 phòng trọ (1-Nhiều hoặc 1-1)

                 // Nếu model sinh ra có quan hệ (Navigation Property), bạn gọi trực tiếp như sau:
                 Gia = bd.GiaThueBaiDang,
                 Dientich = bd.PhongTros.FirstOrDefault().DienTich,
                 Soluongphong = bd.PhongTros.Count(),
                 Songuoi = bd.PhongTros.FirstOrDefault().SoNguoi,

                 HinhAnh = bd.AnhPhongTros.Select(a => a.Url).FirstOrDefault(),
                 
             }).ToList();
            return Ok(ds);
        }

        [HttpGet("lay_ds_bd_danhgia_caonhat")]
        public IActionResult lay_ds_bd_danhgia_caonhat()
        {
            DBLuanVanContext db = new DBLuanVanContext();
            var ds = db.BaiDangs
             .Where(bd => bd.TrangThaiTin == "Đang đăng" && bd.NgayHetHan > DateTime.Now) 
             // Điều kiện lọc
             // Sắp xếp theo công thức: (Tổng Sao / Tổng Lượt) giảm dần.
             // Nếu chưa có lượt đánh giá nào (TongLuot == 0) thì coi là 0 điểm.
             .OrderByDescending(bd => bd.TongLuotDanhGia == 0
                                      ? 0
                                      : (double)bd.TongSoSao / bd.TongLuotDanhGia)
             // Nếu điểm bằng nhau thì bài nào mới đăng lên trước
             .ThenByDescending(bd => bd.NgayDang)
             .Select(bd => new

             {
                 // 1. Lấy thông tin từ bảng Bai_Dang
                 MaBaiDang = bd.BaiDangId,
                 Tieude = bd.TieuDe,
                 Ngaydang = bd.NgayDang,
                 Mota = bd.MoTa,
                 Sonha = bd.SoNha,
                 Quanhuyen = bd.QuanHuyen,
                 Phuongxa = bd.PhuongXa,
                 Tinhthanh = bd.TinhThanh,
                 // 2. Lấy thông tin từ bảng Phong_Tro liên kết
                 // Lưu ý: Tùy vào quan hệ trong Database là 1-1 hay 1-Nhiều mà cách gọi sẽ khác nhau.
                 // Trường hợp phổ biến: Một bài đăng chứa thông tin 1 phòng trọ (1-Nhiều hoặc 1-1)

                 // Nếu model sinh ra có quan hệ (Navigation Property), bạn gọi trực tiếp như sau:
                 Gia = bd.GiaThueBaiDang,
                 Dientich = bd.PhongTros.FirstOrDefault().DienTich,
                 Soluongphong = bd.PhongTros.Count(),
                 Songuoi = bd.PhongTros.FirstOrDefault().SoNguoi,

                 HinhAnh = bd.AnhPhongTros.Select(a => a.Url).FirstOrDefault(),

             }).ToList();
            return Ok(ds);
        }

        //2. ĐĂNG TIN
        [HttpPost("dangtin")]
        public async Task<IActionResult> DangTin([FromForm] CBaiDang c)
        {
            DBLuanVanContext db = new DBLuanVanContext();
            using (var transaction = db.Database.BeginTransaction()) // đảm bảo tính toàn vẹn dữ liệu
            {
                try
                {
                    // 1. Lưu BaiDang
                    var baiDang = new BaiDang
                    {
                        UserId = c.UserId,
                        TieuDe = c.TieuDe,
                        MoTa = c.MoTa,
                        TinhThanh = c.TinhThanh,
                        QuanHuyen = c.QuanHuyen,
                        PhuongXa = c.PhuongXa,
                        SoNha = c.SoNha,
                        SoLuongPhong = c.SoLuongPhong > 0 ? c.SoLuongPhong : 1,
                        NgayDang = DateTime.Now,
                        TrangThaiTin = "Chưa thanh toán",
                        GiaThueBaiDang = c.GiaThueBaiDang,
                        PhongTros = new List<PhongTro>(),
                        
                        
                    };


                    
                    bool ktrachu = Regex.IsMatch(c.TieuDe, @"\p{L}");

                    if (!ktrachu)
                    {
                        return BadRequest("Tiêu đề không hợp lệ. Phải chứa ít nhất 1 chữ cái");
                    }

                    // 2. Xử lý ảnh
                    if (c.HinhAnh != null && c.HinhAnh.Count > 0)
                    {
                        string root = Directory.GetCurrentDirectory(); //Lấy đường dẫn tuyệt đối của thư mục chứa ứng dụng đang chạy.
                        string folder = Path.Combine(root, "wwwroot", "assets", "phongtro");
                        if (!Directory.Exists(folder)) // ktra xem thư mục có tồn tại ko 
                            Directory.CreateDirectory(folder); // nếu ko tạo 

                        foreach (var file in c.HinhAnh)
                        {
                            if (file.Length > 0)
                            {
                                // 2.1 Lưu file vật lý
                                string fileName = Guid.NewGuid() + Path.GetExtension(file.FileName); // lấy đuôi file vd .png
                                string fullPath = Path.Combine(folder, fileName); //nối chuỗi bằng dấu /
                                using (var stream = new FileStream(fullPath, FileMode.Create))
                                {   
                                    await file.CopyToAsync(stream); //Copy dữ liệu từ file upload vào file stream (lưu file xuống ổ cứng).
                                }

                                // 2.2 Tạo đối tượng Anh_Phong_Tro và add vào BaiDang
                                var anhMoi = new AnhPhongTro
                                {
                                   
                                    Url = "/assets/phongtro/" + fileName
                                };

                                // thêm 
                                baiDang.AnhPhongTros.Add(anhMoi);
                            }
                        }
                    }

                    // xử lý file pdf
                    if (c.HopDongPDF != null && c.HopDongPDF.Length > 0)
                    {
                        string root = Directory.GetCurrentDirectory();

                        // thư mục lưu
                        string folder = Path.Combine(root, "wwwroot", "assets", "hopdong");
                        if (!Directory.Exists(folder))
                            Directory.CreateDirectory(folder);

                        // tên file
                        string fileName = "hopdong_" + Guid.NewGuid() + ".pdf";

                        
                        string fullPath = Path.Combine(folder, fileName);

                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            await c.HopDongPDF.CopyToAsync(stream);
                        }

                        baiDang.HopDongMau = new HopDongMau
                        {
                            FilePdf = "/assets/hopdong/" + fileName,
                            NgayTao = DateTime.Now,
                        };

                       

                    }
                    

                    // tạo phòng tương ứng 
                    int soLuong = c.SoLuongPhong > 0 ? c.SoLuongPhong : 1;
                    for (int i = 1; i <= soLuong; i++)
                    {
                        var phongTro = new PhongTro
                        {
                            TenPhong = $"P.{i}",

                            GiaThue = c.GiaThueBaiDang,
                            DienTich = c.DienTich,
                            SoNguoi = c.SoNguoi,
                            TrangThaiPhong = "Còn trống",
                            
                        };
                       
                        baiDang.PhongTros.Add(phongTro);
                    }
                    db.BaiDangs.Add(baiDang);
                    await db.SaveChangesAsync(); //EF Core tự động lưu BaiDang -> lấy ID -> lưu tiếp PhongTro và Anh
                    transaction.Commit(); //lưu các thay đổi từ tran.. vào database
                    return Ok(new { message = $"Đăng tin thành công! Đã tạo {soLuong} phòng" ,
                        baiDangId = baiDang.BaiDangId}); // <--- Lấy ID ở đây
                }
                catch (Exception ex)
                {
                    return BadRequest(ex);
                }

            }
        }

        //3. SỬA THÔNG TIN BÀI ĐĂNG
        
        [HttpPut("suabaidang/{id}")]
        public async Task<IActionResult> SuaTin([FromForm] CBaiDang c, int id)
        {
            DBLuanVanContext db = new DBLuanVanContext();
            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    var baiDang = db.BaiDangs.Include(x => x.User).Include(x => x.PhongTros)
                        .Include(x => x.AnhPhongTros).Include(x => x.HopDongMau).FirstOrDefault(x => x.BaiDangId == id);
                    if (baiDang == null) return NotFound("Bài đăng không tồn tại");
                    baiDang.TieuDe = c.TieuDe;
                    baiDang.MoTa = c.MoTa; baiDang.SoNha = c.SoNha;
                    baiDang.TinhThanh = c.TinhThanh;
                    baiDang.QuanHuyen = c.QuanHuyen;
                    baiDang.PhuongXa = c.PhuongXa;
                    baiDang.SoLuongPhong = c.SoLuongPhong;
                    baiDang.GiaThueBaiDang = c.GiaThueBaiDang;
                    //baiDang.TrangThaiTin = "Chờ duyệt";
                    if (c.HinhAnh != null && c.HinhAnh.Count > 0)
                    {
                        string root = Directory.GetCurrentDirectory();
                        string folder = Path.Combine(root, "wwwroot", "assets", "phongtro");
                        if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
                        foreach (var file in c.HinhAnh)
                        {
                            if (file.Length > 0)
                            {
                                string fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
                                string fullpath = Path.Combine(folder, fileName);
                                using (var stream = new FileStream(fullpath, FileMode.Create))
                                {
                                    await file.CopyToAsync(stream);
                                }
                                var anhMoi = new AnhPhongTro
                                {
                                    BaiDangId = id,
                                    Url = "/assets/phongtro/" + fileName
                                };
                                db.AnhPhongTros.Add(anhMoi);
                            }

                        }
                    }
                    if (c.HopDongPDF != null && c.HopDongPDF.Length > 0)
                    {
                        string root = Directory.GetCurrentDirectory();
                        string folder = Path.Combine(root, "wwwroot", "assets", "hopdong");
                        if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                        // 1. Lưu file mới vật lý
                        string fileName = "hopdong_" + Guid.NewGuid() + ".pdf";
                        string fullPath = Path.Combine(folder, fileName);
                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            await c.HopDongPDF.CopyToAsync(stream);
                        }

                        // 2. Cập nhật vào Database
                        if (baiDang.HopDongMau != null)
                        {
                            // Trường hợp A: Đã có hợp đồng cũ -> Xóa file cũ đi cho đỡ tốn bộ nhớ (Optional)
                            try
                            {
                                // Logic xóa file cũ: cắt bỏ dấu '/' đầu tiên để map đúng đường dẫn
                                string oldFilePath = Path.Combine(root, "wwwroot", baiDang.HopDongMau.FilePdf.TrimStart('/'));
                                if (System.IO.File.Exists(oldFilePath))
                                {
                                    System.IO.File.Delete(oldFilePath);
                                }
                            }
                            catch { /* Bỏ qua lỗi xóa file cũ nếu không tìm thấy */ }

                            // Cập nhật đường dẫn mới
                            baiDang.HopDongMau.FilePdf = "/assets/hopdong/" + fileName;
                            baiDang.HopDongMau.NgayTao = DateTime.Now;
                        }
                        else
                        {
                            // Trường hợp B: Chưa có hợp đồng -> Tạo mới
                            baiDang.HopDongMau = new HopDongMau
                            {
                                BaiDangId = id, // Đảm bảo gán khóa ngoại nếu cần
                                FilePdf = "/assets/hopdong/" + fileName,
                                NgayTao = DateTime.Now
                            };
                            // Lưu ý: Nếu HopDongMau là bảng riêng, có thể cần db.HopDongMaus.Add(...) 
                            // nhưng nếu navigation property set tốt thì EF tự hiểu.
                        }
                    }
                    if (baiDang.PhongTros != null)
                    {
                        foreach (var phongTro in baiDang.PhongTros)
                        {


                            // Chỉ sửa phòng TRỐNG (Tránh sửa giá hợp đồng người đang ở)
                            // Kiểm tra kỹ xem DB bạn lưu là "Còn trống", "Trống" hay số 0
                            string tt = phongTro.TrangThaiPhong ?? "";

                            if (tt.ToLower().Contains("trống") || tt == "0" || tt == "ConTrong")
                            {
                                phongTro.GiaThue = c.GiaThueBaiDang; // Lấy giá từ form
                                phongTro.DienTich = c.DienTich;      // Lấy diện tích từ form
                                phongTro.SoNguoi = c.SoNguoi;

                            }
                        }
                    }
                    await db.SaveChangesAsync();
                    transaction.Commit();
                    return Ok("sửa bài đăng thành công");
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return BadRequest(ex.Message);
                }
            }
        }


        [HttpPut("Anbaidang/{id}")]
        public IActionResult An(int id)
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();
                var pt = db.BaiDangs.FirstOrDefault(x => x.BaiDangId == id);
                if (pt == null) return NotFound("Không tìm thấy bài đăng");
                if (pt.TrangThaiTin == "Chờ duyệt" || pt.TrangThaiTin == "Từ chối")
                {
                    return BadRequest("Bài đăng chưa được duyệt hoặc đã bị từ chối, không thể ẩn/hiện!");
                }
                pt.TrangThaiTin = "Đã ẩn";
                db.SaveChanges();
                return Ok($"Bài đăng ID {id} đã bị ẩn");
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi ẩn bài đăng" + ex.Message);
            }
        }

        //5. MỞ BÀI
        [HttpPut("Mobaidang/{id}")]
        public IActionResult Mo(int id)
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();
                var pt = db.BaiDangs.FirstOrDefault(x => x.BaiDangId == id);
                if (pt == null) return NotFound("Không tìm thấy bài đăng");
                if (pt.TrangThaiTin == "Từ chối")
                {
                    return BadRequest("Bài đăng này đã bị Admin từ chối, không thể mở lại!");
                }
                if (pt.TrangThaiTin == "Chờ duyệt")
                {
                    return BadRequest("Bài đăng đang chờ duyệt!");
                }
                pt.TrangThaiTin = "Đang đăng";
                pt.NgayDang = DateTime.Now;
                db.SaveChanges();
                return Ok($"Đã mở bài đăng ID :{id}");
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi mở bài đăng" + ex.Message);
            }

        }


        // XEM CHI TIẾT BÀI ĐĂNG 
        [HttpGet("chitietbaidang/{id}")]
        public IActionResult chitietBaiDang(int id)
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();
                var baiDang = db.BaiDangs
                 .Include(b => b.User)                  // Lấy chủ trọ
                 .Include(b => b.AnhPhongTros)             // Lấy thông tin phòng
                 .Include(b => b.HopDongMau)
                 .Where(b => b.BaiDangId == id)
                 .Select(b => new
                 {
                     // --- Thông tin từ BÀI ĐĂNG ---
                     b.BaiDangId,
                     b.TieuDe,
                     b.MoTa,
                     b.NgayDang,

                     Sonha = b.SoNha,
                     QuanXa = b.QuanHuyen, // Map tên biến cho khớp Frontend
                     Tinhthanh = b.TinhThanh,
                     PhuongXa = b.PhuongXa,

                     // --- Thông tin Chủ trọ ---
                     NguoiDang = b.User != null ? b.User.HoTen : "Người dùng ẩn danh",
                     Sdt = b.User != null ? b.User.Sdt : "",
                     Avatar = b.User != null ? b.User.Avatar : null,
                     Email = b.User != null ? b.User.Email : "",
                     UserID = b.User !=null ? b.UserId : 0,
                     slBaidang = db.BaiDangs
                     .Where(x => x.TrangThaiTin == "Đang đăng")
                     .Count(x => x.UserId == b.UserId),
                     Ngaytao = b.User.NgayTaoTaiKhoan.ToString("dd/MM/yyyy"),


                     // --- Thông tin từ PHÒNG TRỌ (Lấy phòng đầu tiên vì 1 bài thường có 1 loại phòng) ---
                     PhongtroId = b.PhongTros.FirstOrDefault().PhongTroId,
                     Giathue = b.PhongTros.FirstOrDefault().GiaThue,
                     Dientich = b.PhongTros.FirstOrDefault().DienTich,
                     Soluongphong = b.SoLuongPhong,
                     Songuoi = b.PhongTros.FirstOrDefault().SoNguoi,
                     Tongluotdanhgia = b.TongLuotDanhGia,

                     Diemtrungbinh = b.TongLuotDanhGia == 0 ? 0 : Math.Round((double)b.TongSoSao / b.TongLuotDanhGia, 1),

                     HopDong = b.HopDongMau == null ? null : new
                     {
                         b.HopDongMau.FilePdf,
                     },


                     // --- Hình ảnh ---
                     AnhPhongTros = b.AnhPhongTros.Select(a => new {
                         a.AnhId,
                         a.Url
                     }).ToList(),

                 }).FirstOrDefault();

                if (baiDang == null) return NotFound("Không tìm thấy bài đăng");

                return Ok(baiDang);
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi: " + ex.Message);
            }
        }

        //public void capnhattrangthai(DBLuanVanContext db, BaiDang bd)
        //{
        //    if (bd.NgayHetHan <= DateTime.Now)
        //    {
        //        bd.TrangThaiTin = "Chưa thanh toán";
        //    }
        //}


        //1.LẤY DANH SÁCH bài đăng thuộc chủ trọ
        [HttpGet("dsbaidang_chutro/{id}")]
        public IActionResult dsbaidang_chutro(int id)
        {
            DBLuanVanContext db = new DBLuanVanContext();

            // 1. Lấy danh sách bài đăng của chủ trọ
            var baiDangs = db.BaiDangs
                .Where(bd => bd.UserId == id)
                .Include(b => b.PhongTros)
                .Include(b => b.AnhPhongTros)
                .OrderByDescending(bd => bd.NgayDang) // Mới nhất lên đầu
                .ToList();

            // 2. Kiểm tra ngày hết hạn & cập nhật trạng thái
            foreach (var bd in baiDangs)
            {
                if (bd.NgayHetHan < DateTime.Now)
                {
                    bd.TrangThaiTin = "Chưa thanh toán";
                }
            }

            db.SaveChanges(); // cập nhật DB

            // 3. Trả dữ liệu
            var ds = baiDangs
                .Select(bd => {
                var phong = bd.PhongTros.FirstOrDefault();

                return new
                {
                    MaBaiDang = bd.BaiDangId,
                    Tieude = bd.TieuDe,
                    Ngaydang = bd.NgayDang,
                    Mota = bd.MoTa,
                    Sonha = bd.SoNha,
                    Quanhuyen = bd.QuanHuyen,
                    Phuongxa = bd.PhuongXa,
                    Tinhthanh = bd.TinhThanh,
                    Trangthai = bd.TrangThaiTin,
                    // Nếu có ngày thì format, không có thì trả về chuỗi rỗng ""
                    Ngayhethan = bd.NgayHetHan.HasValue ? bd.NgayHetHan.Value.ToString("dd/MM/yyyy") : "",

                    Gia = bd.GiaThueBaiDang,
                    Dientich = phong?.DienTich,
                    Soluongphong = bd.PhongTros.Count(),
                    Songuoi = phong?.SoNguoi,

                    HinhAnh = bd.AnhPhongTros.Select(a => a.Url).FirstOrDefault(),
                };
            }).ToList();


            return Ok(ds);
        }


        //1.LẤY DANH SÁCH bài đăng theo địa chỉ quận phong tuong tu
        [HttpGet("dsbaidang_tuongtu/{id}")]
        public IActionResult dsbaidang_tuongtu(string id)
        {
            DBLuanVanContext db = new DBLuanVanContext();
            var ds = db.BaiDangs
             .Where(bd => bd.QuanHuyen == id && bd.TrangThaiTin == "Đang đăng" && bd.NgayHetHan > DateTime.Now) // Điều kiện lọc
             .OrderByDescending(bd => bd.NgayDang).Take(4) // laays 4 phong ms nhat sắp xếp giảm dần lớn -> nhỏ
             .Select(bd => new
             {
                 // 1. Lấy thông tin từ bảng Bai_Dang
                 MaBaiDang = bd.BaiDangId,
                 Tieude = bd.TieuDe,
                 Ngaydang = bd.NgayDang,
                 Mota = bd.MoTa,
                 Sonha = bd.SoNha,
                 Quanhuyen = bd.QuanHuyen,
                 Phuongxa = bd.PhuongXa,
                 Tinhthanh = bd.TinhThanh,
                 Trangthai = bd.TrangThaiTin,
                 // 2. Lấy thông tin từ bảng Phong_Tro liên kết
                 // Lưu ý: Tùy vào quan hệ trong Database là 1-1 hay 1-Nhiều mà cách gọi sẽ khác nhau.
                 // Trường hợp phổ biến: Một bài đăng chứa thông tin 1 phòng trọ (1-Nhiều hoặc 1-1)

                 // Nếu model sinh ra có quan hệ (Navigation Property), bạn gọi trực tiếp như sau:
                 Gia = bd.GiaThueBaiDang,
                 Dientich = bd.PhongTros.FirstOrDefault().DienTich,
                 Soluongphong = bd.PhongTros.Count(),
                 Songuoi = bd.PhongTros.FirstOrDefault().SoNguoi,


                // Dientich = bd.PhongTros
                //.Select(p => p.DienTich)
                //.FirstOrDefault(),

                 HinhAnh = bd.AnhPhongTros.Select(a => a.Url).FirstOrDefault()
             }).ToList();
            return Ok(ds);
        }

        
        //5. caapj nhaatj trang thai cho duet
        [HttpPut("capnhattt_choduyet/{id}")]
        public IActionResult capnhattt_choduyet(int id)
        {
            try
            {
                DBLuanVanContext db = new DBLuanVanContext();
                var pt = db.BaiDangs.FirstOrDefault(x => x.BaiDangId == id);
                if (pt == null) return NotFound("Không tìm thấy bài đăng");
                pt.TrangThaiTin = "Chờ duyệt";
                pt.NgayHetHan = null; // caapj nhat lai ngay het han de duyet
                db.SaveChanges();
                return Ok($"Cập nhật thành công");
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi cập nhật bài đăng" + ex.Message);
            }

        }



    }
}

