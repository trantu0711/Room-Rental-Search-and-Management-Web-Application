using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class PhongTro
    {
        public PhongTro()
        {
            HopDongs = new HashSet<HopDong>();
        }

        public int PhongTroId { get; set; }
        public int? BaiDangId { get; set; }
        public string? TenPhong { get; set; }
        public double? DienTich { get; set; }
        public decimal? GiaThue { get; set; }
        public int? SoNguoi { get; set; }
        public int? SoLuongPhong { get; set; }
        public string? TrangThaiPhong { get; set; }

        public virtual BaiDang? BaiDang { get; set; }
        public virtual ICollection<HopDong> HopDongs { get; set; }
    }
}
