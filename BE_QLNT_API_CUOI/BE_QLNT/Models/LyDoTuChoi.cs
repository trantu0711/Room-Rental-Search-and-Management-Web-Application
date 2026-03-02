using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class LyDoTuChoi
    {
        public int LyDoTuChoiId { get; set; }
        public int BaiDangId { get; set; }
        public string NoiDung { get; set; } = null!;
        public DateTime? NgayTuChoi { get; set; }
        public string? NguoiTuChoi { get; set; }

        public virtual BaiDang BaiDang { get; set; } = null!;
    }
}
