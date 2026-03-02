using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class ThanhToan
    {
        public int ThanhToanId { get; set; }
        public decimal? SoTien { get; set; }
        public string? PhuongThuc { get; set; }
        public string? TrangThai { get; set; }
        public string? MaGiaoDich { get; set; }
        public int? UserId { get; set; }
        public int? BaiDangId { get; set; }
        public DateTime NgayThanhToan { get; set; }

        public virtual BaiDang? BaiDang { get; set; }
        public virtual NguoiDung? User { get; set; }
    }
}
