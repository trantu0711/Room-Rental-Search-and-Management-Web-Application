//var builder = WebApplication.CreateBuilder(args);

//// Add services to the container.

//builder.Services.AddControllers();
//// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

//var app = builder.Build();

//// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();

//app.UseAuthorization();

//app.MapControllers();

//app.Run();
using BE_QLNT.Helpers;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ----- 1. ĐỊNH NGHĨA TÊN POLICY CHO CORS -----
var myAllowSpecificOrigins = "_myAllowSpecificOrigins";

// Add services to the container.

// ----- CẤU HÌNH JSON (Sửa lỗi vòng lặp) -----
builder.Services.AddControllers().AddJsonOptions(x =>
{
    x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ----- 2. CẤU HÌNH CORS -----
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: myAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:5173")
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});
builder.Services.AddHostedService<AutoUpdateHopDongService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ----- 3. KHỞI TẠO BỘ LỌC TỪ XẤU -----

// -------------------------------------

// ----- 4. BẬT CORS -----
app.UseCors(myAllowSpecificOrigins);

// Kích hoạt Static Files để xem ảnh
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// --- cấu  hình để máy nhận dấu . giống chuẩn quốc tế phân biệt 1.4 ---
var cultureInfo = new System.Globalization.CultureInfo("en-US"); // Hoặc InvariantCulture
System.Globalization.CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
System.Globalization.CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;

app.Run();
