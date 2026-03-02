namespace BE_QLNT.MyModels
{
    public class CDanhGia
    {
        public int DanhGiaId { get; set; }
        public int UserId { get; set; }
        public string? HoTen { get; set; }

        // Đổi thành BaiDangId cho đúng thực tế người dùng
        public int BaiDangId { get; set; }

        public int Sao { get; set; }
        public string Comment { get; set; }
    }
}
