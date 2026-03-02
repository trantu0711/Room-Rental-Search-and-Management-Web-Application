using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class LienHe
    {
        public int LienHeId { get; set; }
        public int? BaiDangId { get; set; }
        public int? UserId { get; set; }
        public string? HoTen { get; set; }
        public string? Sdt { get; set; }
        public string? Email { get; set; }
        public DateTime? NgayLienHe { get; set; }
        public string? NoiDung { get; set; }

        public virtual BaiDang? BaiDang { get; set; }
        public virtual NguoiDung? User { get; set; }
    }
}
