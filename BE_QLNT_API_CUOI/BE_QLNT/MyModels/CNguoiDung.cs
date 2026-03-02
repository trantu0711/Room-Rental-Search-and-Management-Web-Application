namespace BE_QLNT.MyModels
{
    public class CNguoiDung
    {
        public string HoTen { get; set; }
        public string SDT { get; set; } 
        public string? CCCD { get; set; }
        public string? DiaChi { get; set; }

        
        public IFormFile? HinhAnh { get; set; }
    }
}
