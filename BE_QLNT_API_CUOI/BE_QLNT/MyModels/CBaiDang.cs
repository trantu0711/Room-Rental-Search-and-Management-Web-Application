using Microsoft.AspNetCore.Http;
using System.Collections.Generic;

namespace BE_QLNT.MyModels
{
    public class CBaiDang
    {
        // --- Phần 1: Bảng BaiDang (Tin tức) ---
        public int UserId { get; set; }
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public string? TinhThanh { get; set; }
        public string? QuanHuyen { get; set; }
        public string? PhuongXa { get; set; }
        public string? SoNha { get; set; }

        public decimal? GiaThueBaiDang { get; set; }

        // --- Phần 2: Bảng PhongTro (Sản phẩm) -
        public double? DienTich { get; set; }
        public int SoLuongPhong { get; set; }
        public int? SoNguoi { get; set; }


        // --- Phần 3: File Ảnh ---
        public List<IFormFile>? HinhAnh { get; set; }
        public IFormFile? HopDongPDF { get; set; }
    }
}