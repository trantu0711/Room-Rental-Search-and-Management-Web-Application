
using BE_QLNT.Models;
namespace BE_QLNT.MyModels
{
    public class CDangNhap
    {
        public string Email { get; set; } = null!;

        public string Sdt { get; set; } = null!;
        public string MatKhau { get; set; } = null!;
        public string? Role { get; set; } = null!;
    }
}