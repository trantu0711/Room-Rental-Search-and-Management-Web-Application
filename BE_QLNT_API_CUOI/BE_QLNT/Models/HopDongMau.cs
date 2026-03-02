using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class HopDongMau
    {
        public int BaiDangId { get; set; }
        public string FilePdf { get; set; } = null!;
        public DateTime? NgayTao { get; set; }
        public int HopDongMauId { get; set; }

        public virtual BaiDang BaiDang { get; set; } = null!;
    }
}
