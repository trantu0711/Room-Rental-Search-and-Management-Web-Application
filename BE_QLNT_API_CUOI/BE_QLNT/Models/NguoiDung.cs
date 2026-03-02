using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class NguoiDung
    {
        public NguoiDung()
        {
            BaiDangs = new HashSet<BaiDang>();
            DanhGia = new HashSet<DanhGium>();
            HopDongs = new HashSet<HopDong>();
            LienHes = new HashSet<LienHe>();
            ThanhToans = new HashSet<ThanhToan>();
        }

        public int UserId { get; set; }
        public string? HoTen { get; set; }
        public string? Email { get; set; }
        public string? Sdt { get; set; }
        public string? MatKhau { get; set; }
        public string? DiaChi { get; set; }
        public string? Cccd { get; set; }
        public string? Avatar { get; set; }
        public string? Role { get; set; }
        public string? TrangThai { get; set; }
        public DateTime NgayTaoTaiKhoan { get; set; }

        public virtual ICollection<BaiDang> BaiDangs { get; set; }
        public virtual ICollection<DanhGium> DanhGia { get; set; }
        public virtual ICollection<HopDong> HopDongs { get; set; }
        public virtual ICollection<LienHe> LienHes { get; set; }
        public virtual ICollection<ThanhToan> ThanhToans { get; set; }
    }
}
