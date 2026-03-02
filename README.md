
# Ứng dụng Web Tìm kiếm và Quản lý Cho thuê Phòng 

## Giới thiệu 
Một ứng dụng web fullstack kết nối người thuê và chủ nhà, cho phép người dùng tìm kiếm, đăng tải và quản lý danh sách cho thuê một cách hiệu quả. 

## Công nghệ 
- ASP.NET Core Web API 
- ReactJS 
- SQL Server 
- Xác thực JWT 
- Phân quyền theo vai trò 

## Các tính năng chính 
- Xác thực và phân quyền người dùng (Người thuê, Chủ trọ, Quản trị viên) 
- Tìm kiếm theo từ khóa và lọc phòng nâng cao (giá, diện tích, địa chỉ)
- liện hệ qua form trên giao diện gửi trực tiếp mail chủ trọ, quét mã qr để nhắn tin trực tiếp qua zalo
- Quản lý danh sách với tích hợp thanh toán trực tuyến 
- Hệ thống đánh giá và xếp hạng
- Hệ thống lọc comment tự động
- Bảng điều khiển quản trị viên để quản lý tài khoản, duyệt bài đăng và thống kê doanh thu
- Quản lý hồ sơ cá nhân (avatar, tên, sdt ...)
- Đăng tin cho thuê
- Xem chi tiết phòng
  
## Kiến trúc 
- Backend: API RESTful 
- Frontend: SPA dựa trên React 
- Cơ sở dữ liệu: SQL Server
