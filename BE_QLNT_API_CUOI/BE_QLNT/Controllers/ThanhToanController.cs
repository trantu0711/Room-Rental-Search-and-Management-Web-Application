using BE_QLNT.Helpers;
using BE_QLNT.Models;
using BE_QLNT.MyModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BE_QLNT.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThanhToanController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        // Inject IConfiguration để đọc appsettings.json
        public ThanhToanController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("Thanhtoan_vnpay")]
        public async Task<IActionResult> Thanhtoan_vnpay([FromForm] CThanhToan c)
        {
            // Kiểm tra dữ liệu đầu vào
            if (c.SoTien == null || c.SoTien <= 0)
                return BadRequest("Số tiền không hợp lệ");


            // lấy tgian 
            var timeNow = DateTime.Now;
            var tick = DateTime.Now.Ticks; // bỏ dấu /

            // Lấy thông tin cấu hình
            string vnp_Returnurl = _configuration["VnPay:ReturnUrl"]; //url trả về 
            string vnp_Url = _configuration["VnPay:BaseUrl"]; //url gửi đến vnp 
            string vnp_TmnCode = _configuration["VnPay:TmnCode"]; // lấy tên đăng nhập 
            string vnp_HashSecret = _configuration["VnPay:HashSecret"]; // lấy mk chuỗi bí maật 
            string ipAddr = HttpContext.Connection.RemoteIpAddress?.ToString();
            // Tạo đối tượng xử lý VNPay
            VnPayLibrary vnpay = new VnPayLibrary();

            vnpay.AddRequestData("vnp_Version", "2.1.0"); // phiên bản vnp 
            vnpay.AddRequestData("vnp_Command", "pay"); // phương thức
            vnpay.AddRequestData("vnp_TmnCode", vnp_TmnCode); // ktra ai gửi 
            vnpay.AddRequestData("vnp_Amount", ((long)c.SoTien * 100).ToString()); // Số tiền nhân 100

            // Tạo mã đơn hàng duy nhất (có thể dùng ID bài đăng + timestamp)
            var orderId = c.BaiDangId.ToString() + "_" + tick;
            vnpay.AddRequestData("vnp_TxnRef", orderId); //thêm mã giao dịch vnpay 

            vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan bai dang: " + c.BaiDangId); // nội dung 
            vnpay.AddRequestData("vnp_OrderType", "other"); // Loại hàng hóa
            vnpay.AddRequestData("vnp_Locale", "vn"); // ngôn ngữ 
            vnpay.AddRequestData("vnp_ReturnUrl", vnp_Returnurl); // url trả về kq
            
            vnpay.AddRequestData("vnp_IpAddr", ipAddr ?? "127.0.0.1");
            // Trong môi trường thật, hãy lấy IP của user
            vnpay.AddRequestData("vnp_CreateDate", timeNow.ToString("yyyyMMddHHmmss")); // lấy tgian tạo thanh toán 
            vnpay.AddRequestData("vnp_CurrCode", "VND"); // đợn vị tiền tệ 

            // Tạo URL thanh toán/ gửi qua vnp và chuỗi bí mật 
            string paymentUrl = vnpay.CreateRequestUrl(vnp_Url, vnp_HashSecret);


            // Trả về URL cho Frontend để redirect
            return Ok(new { url = paymentUrl });
        }

        // 2. API XỬ LÝ KẾT QUẢ TRẢ VỀ (ReturnUrl gọi vào đây)
        [HttpGet("PaymentCallback")]
        public IActionResult PaymentCallback()
        {
            if (Request.Query.Count > 0)
            {
                string vnp_HashSecret = _configuration["VnPay:HashSecret"];
                var vnpayData = Request.Query;
                VnPayLibrary vnpay = new VnPayLibrary();

                // 1. Lấy dữ liệu từ VNPay trả về
                foreach (var s in vnpayData)
                {
                    if (!string.IsNullOrEmpty(s.Key) && s.Key.StartsWith("vnp_")
                        && s.Key != "vnp_SecureHash" && s.Key != "vnp_SecureHashType")
                    {
                        vnpay.AddResponseData(s.Key, s.Value);
                    }
                }

                // 2. Lấy các tham số quan trọng
                string vnp_TxnRef = vnpay.GetResponseData("vnp_TxnRef");
                string vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
                string vnp_SecureHash = Request.Query["vnp_SecureHash"];
                string vnp_Amount = vnpay.GetResponseData("vnp_Amount");

                // 3. Kiểm tra chữ ký (Quan trọng nhất)
                bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, vnp_HashSecret);

                if (checkSignature)
                {
                    DBLuanVanContext db = new DBLuanVanContext();

                    // Kiểm tra trùng lặp đơn hàng (Idempotency Check)
                    var giaoDichTonTai = db.ThanhToans.Any(x => x.MaGiaoDich == vnp_TxnRef);
                    if (giaoDichTonTai)
                    {
                        return Ok(new { Message = "Giao dịch đã được xử lý", Code = vnp_ResponseCode });
                    }

                    try
                    {
                        // Tách lấy BaiDangId
                        string[] parts = vnp_TxnRef.Split('_');
                        int baiDangId = int.Parse(parts[0]);

                        // Tìm bài đăng (để lấy UserId cho bảng ThanhToan)
                        var baiDang = db.BaiDangs.FirstOrDefault(x => x.BaiDangId == baiDangId);

                        // Tạo đối tượng ThanhToan (Dùng chung cho cả thành công và thất bại)
                        var thanhtoan = new ThanhToan();
                        thanhtoan.SoTien = Convert.ToInt32(vnp_Amount) / 100;
                        thanhtoan.PhuongThuc = "Vnpay";
                        thanhtoan.MaGiaoDich = vnp_TxnRef;
                        thanhtoan.BaiDangId = baiDangId;
                        thanhtoan.NgayThanhToan = DateTime.Now;

                        // Nếu tìm thấy bài đăng thì gán UserId, không thì để null hoặc xử lý tùy logic
                        if (baiDang != null)
                        {
                            thanhtoan.UserId = baiDang.UserId;
                        }

                        // --- XỬ LÝ LOGIC THEO TRẠNG THÁI ---
                        if (vnp_ResponseCode == "00")
                        {
                            // === TRƯỜNG HỢP THÀNH CÔNG ===
                            thanhtoan.TrangThai = "Thành công";

                            // Chỉ cộng ngày hạn khi thành công
                            if (baiDang != null)
                            {
                                baiDang.TrangThaiTin = "Đang đăng";
                                switch (vnp_Amount)
                                {
                                    case "1500000": baiDang.NgayHetHan = DateTime.Now.AddDays(7); break;
                                    case "3000000": baiDang.NgayHetHan = DateTime.Now.AddDays(14); break;
                                    case "5000000": baiDang.NgayHetHan = DateTime.Now.AddDays(30); break;
                                    case "9000000": baiDang.NgayHetHan = DateTime.Now.AddDays(60); break;
                                    default: baiDang.NgayHetHan = DateTime.Now; break;
                                }
                            }
                        }
                        else
                        {
                            // === TRƯỜNG HỢP THẤT BẠI / HỦY ===
                            // Ghi rõ lý do lỗi (VD: 24 là Khách hủy, 51 là Tài khoản không đủ tiền...)
                            thanhtoan.TrangThai = "Thất bại (Mã lỗi: " + vnp_ResponseCode + ")";

                            // KHÔNG cộng ngày hạn cho bài đăng
                        }

                        // Lưu vào Database (Lưu cả ThanhToan và update BaiDang nếu có)
                        db.ThanhToans.Add(thanhtoan);
                        db.SaveChanges();

                        // Trả về kết quả cho Frontend
                        if (vnp_ResponseCode == "00")
                            return Ok(new { Message = "Thanh toán thành công", Code = "00" });
                        else
                            return Ok(new { Message = "Thanh toán lỗi", Code = vnp_ResponseCode });

                    }
                    catch (Exception ex)
                    {
                        return BadRequest("Lỗi xử lý dữ liệu: " + ex.Message);
                    }
                }
                else
                {
                    return BadRequest("Chữ ký không hợp lệ");
                }
            }
            return NotFound();
        }



    }
}
