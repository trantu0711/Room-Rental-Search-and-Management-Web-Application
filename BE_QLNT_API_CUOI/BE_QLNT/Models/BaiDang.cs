using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class BaiDang
    {
        public BaiDang()
        {
            AnhPhongTros = new HashSet<AnhPhongTro>();
            DanhGia = new HashSet<DanhGium>();
            LienHes = new HashSet<LienHe>();
            LyDoTuChois = new HashSet<LyDoTuChoi>();
            PhongTros = new HashSet<PhongTro>();
            ThanhToans = new HashSet<ThanhToan>();
            TienIches = new HashSet<TienIch>();
        }

        public int BaiDangId { get; set; }
        public int? UserId { get; set; }
        public string? TieuDe { get; set; }
        public string? MoTa { get; set; }
        public string? QuanHuyen { get; set; }
        public string? PhuongXa { get; set; }
        public string? SoNha { get; set; }
        public int? SoLuongPhong { get; set; }
        public string? TrangThaiTin { get; set; }
        public DateTime? NgayDang { get; set; }
        public string? TinhThanh { get; set; }
        public decimal? GiaThueBaiDang { get; set; }
        public DateTime? NgayHetHan { get; set; }
        public int TongSoSao { get; set; }
        public int TongLuotDanhGia { get; set; }

        public virtual NguoiDung? User { get; set; }
        public virtual HopDongMau? HopDongMau { get; set; }
        public virtual ICollection<AnhPhongTro> AnhPhongTros { get; set; }
        public virtual ICollection<DanhGium> DanhGia { get; set; }
        public virtual ICollection<LienHe> LienHes { get; set; }
        public virtual ICollection<LyDoTuChoi> LyDoTuChois { get; set; }
        public virtual ICollection<PhongTro> PhongTros { get; set; }
        public virtual ICollection<ThanhToan> ThanhToans { get; set; }

        public virtual ICollection<TienIch> TienIches { get; set; }
    }
}
