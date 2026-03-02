using BE_QLNT.Models;

namespace BE_QLNT.MyModels
{
    public class CChiTietBaiDang
    {
        // Thông tin thuộc BaiDang
        public string TieuDe { get; set; }
        public string MoTa { get; set; }
        public string TinhThanh { get; set; }
        public string QuanHuyen { get; set; } 
        public string PhuongXa { get; set; }
        public string SoNha { get; set; }

        // Thông tin thuộc PhongTro
        public decimal GiaThue { get; set; }
        public double? DienTich { get; set; }
        public int? SoLuongPhong { get; set; }

        // Danh sách ảnh (Link ảnh)
        public List<string> HinhAnhUrls { get; set; }
    }
}
