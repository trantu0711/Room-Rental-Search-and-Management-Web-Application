using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class HopDong
    {
        public int HopDongId { get; set; }
        public int? UserId { get; set; }
        public int? PhongTroId { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public string? TrangThaiHopDong { get; set; }
        public string? NoiDungHopDong { get; set; }

        public virtual PhongTro? PhongTro { get; set; }
        public virtual NguoiDung? User { get; set; }
    }
}
