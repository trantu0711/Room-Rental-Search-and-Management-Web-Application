using BE_QLNT.Models;
using Microsoft.AspNetCore.Mvc;

namespace BE_QLNT.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public IEnumerable<WeatherForecast> Get()
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateTime.Now.AddDays(index),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
        }
    }


}

//[HttpGet("thongke_doanhthu_ngay")]
//public IActionResult thongke_doanhthu_ngay()
//{
//    DBLuanVanContext db = new DBLuanVanContext();

//    var thongKe = db.ThanhToans
//        // 1. Chỉ lấy các giao dịch thành công và có ngày thanh toán
//        .Where(tt => tt.TrangThai == "Thành công" && tt.NgayThanhToan != null)

//        // 2. Nhóm dữ liệu theo Ngày (Dùng .Date để bỏ phần giờ:phút:giây)
//        .GroupBy(tt => tt.NgayThanhToan.Value.Date)

//        // 3. Chọn ra các thông tin cần thống kê
//        .Select(g => new
//        {
//            Ngay = g.Key,                            // Ngày thống kê
//            TongTien = g.Sum(tt => tt.SoTien),       // Tổng tiền thu được trong ngày
//            SoGiaoDich = g.Count(),                  // Tổng số lượt giao dịch trong ngày

//            // Tùy chọn: Lấy ra giao dịch lớn nhất trong ngày đó
//            GiaoDichLonNhat = g.Max(tt => tt.SoTien)
//        })

//        // 4. Sắp xếp ngày mới nhất lên đầu (hoặc bỏ Descending nếu muốn cũ -> mới)
//        .OrderByDescending(tk => tk.Ngay)
//        .ToList();

//    return Ok(thongKe);
//}

//[HttpGet("thongke_doanhthu_ngay")]
//public IActionResult thongke_doanhthu_ngay()
//{
//    DBLuanVanContext db = new DBLuanVanContext();

//    var thongKe = db.ThanhToans
//        // 1. Chỉ lấy các giao dịch thành công và có ngày thanh toán
//        .Where(tt => tt.TrangThai == "Thành công" && tt.NgayThanhToan != null)

//        // 2. Nhóm dữ liệu theo Ngày (Dùng .Date để bỏ phần giờ:phút:giây)
//        .GroupBy(tt => tt.NgayThanhToan.Value.Date)

//        // 3. Chọn ra các thông tin cần thống kê
//        .Select(g => new
//        {
//            Ngay = g.Key,                            // Ngày thống kê
//            TongTien = g.Sum(tt => tt.SoTien),       // Tổng tiền thu được trong ngày
//            SoGiaoDich = g.Count(),                  // Tổng số lượt giao dịch trong ngày

//            // Tùy chọn: Lấy ra giao dịch lớn nhất trong ngày đó
//            GiaoDichLonNhat = g.Max(tt => tt.SoTien)
//        })

//        // 4. Sắp xếp ngày mới nhất lên đầu (hoặc bỏ Descending nếu muốn cũ -> mới)
//        .OrderByDescending(tk => tk.Ngay)
//        .ToList();

//    return Ok(thongKe);
//}