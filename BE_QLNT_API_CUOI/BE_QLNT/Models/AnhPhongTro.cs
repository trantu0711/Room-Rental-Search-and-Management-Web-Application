using System;
using System.Collections.Generic;

namespace BE_QLNT.Models
{
    public partial class AnhPhongTro
    {
        public int AnhId { get; set; }
        public string? Url { get; set; }
        public int? BaiDangId { get; set; }

        public virtual BaiDang? BaiDang { get; set; }
    }
}
