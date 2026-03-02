using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class TienIch
    {
        public TienIch()
        {
            BaiDangs = new HashSet<BaiDang>();
        }

        public int TienIchId { get; set; }
        public string? TenTienIch { get; set; }

        public virtual ICollection<BaiDang> BaiDangs { get; set; }
    }
}
