using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class DanhGium
    {
        public int DanhGiaId { get; set; }
        public int? UserId { get; set; }
        public int? Sao { get; set; }
        public string? Comment { get; set; }
        public DateTime? NgayComment { get; set; }
        public int BaiDangId { get; set; }

        public virtual BaiDang BaiDang { get; set; } = null!;
        public virtual NguoiDung? User { get; set; }
    }
}
