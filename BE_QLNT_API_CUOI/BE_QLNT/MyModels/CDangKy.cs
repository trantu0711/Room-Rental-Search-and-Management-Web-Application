using BE_QLNT.Models;

namespace BE_QLNT.MyModels
{
    public class CDangKy
    {
        public string HoTen { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string SDT { get; set; } = null!;
        public string MatKhau { get; set; } = null!;
        public string DiaChi { get; set; } = null!;
        public string CCCD { get; set; } = null!;
        public string? Avatar { get; set; }
        public string? Role { get; set; }
        public DateTime NgayTaoTaiKhoan { get; set; }
        public string? TrangThai { get; set; }
        //public IFormFile? HinhAnh { get; set; }


        public static NguoiDung ChuyenDoi(CDangKy nd)
        {
            return new NguoiDung
            {
                HoTen = nd.HoTen,
                Email = nd.Email,
                Sdt = nd.SDT,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(nd.MatKhau),
                DiaChi = nd.DiaChi,
                Cccd = nd.CCCD,
                //Avatar = "",
                Role = nd.Role,
                TrangThai = "Hoạt Động",
                NgayTaoTaiKhoan = DateTime.Now

            };
        }

    }

}
