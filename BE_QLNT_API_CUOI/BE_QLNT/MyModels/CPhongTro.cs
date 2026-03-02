
using System;
using System.Collections.Generic;
using System.Linq;
using BE_QLNT.Models;
namespace BE_LVTN_QLPT_API.MyModels
{
    public class CPhongTro
    {
        public int PhongTroId { get; set; }
        public int? BaiDangId { get; set; }
        public string? TenPhong { get; set; }
        public double? DienTich { get; set; }
        public decimal? GiaThue { get; set; }
        public int? SoNguoi { get; set; }
        public int SoLuongPhong { get; set; }
        public string? TrangThaiPhong { get; set; }

      

        public static PhongTro ChuyenDoi(CPhongTro c)
        {
            var pt = new PhongTro
            {
                PhongTroId = c.PhongTroId,
                BaiDangId = c.BaiDangId,
                TenPhong = c.TenPhong,
                DienTich = c.DienTich,
                GiaThue = c.GiaThue,
                SoLuongPhong = c.SoLuongPhong,
               SoNguoi=c.SoNguoi,
               TrangThaiPhong = c.TrangThaiPhong
            };

            

            return pt;
        }
    }

    
}

