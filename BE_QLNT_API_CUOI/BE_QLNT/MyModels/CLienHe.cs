namespace BE_QLNT.MyModels
{
    public class CLienHe
    {
        public int BaiDangId { get; set; } // Khách đang hỏi về bài đăng nào
        public int? UserId { get; set; }   // Có thể null 
        public string HoTen { get; set; }
        public string Sdt { get; set; }
        public string Email { get; set; }  // Email người thuê (để Reply-To)
        public string NoiDung { get; set; }
    }
}
