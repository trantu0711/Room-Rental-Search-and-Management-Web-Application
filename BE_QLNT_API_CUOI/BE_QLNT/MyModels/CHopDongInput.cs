namespace BE_QLNT.MyModels
{
    public class CHopDongInput
    {
        public int UserId { get; set; }      // ID khách thuê (lấy từ tìm kiếm SĐT)
        public int PhongTroId { get; set; }  // ID phòng đang chọn
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        public string NoiDungHopDong { get; set; } // Tên hợp đồng hoặc ghi chú
        public IFormFile FileHopDong { get; set; } // <--- Quan trọng: Để nhận file PDF
    }
}
