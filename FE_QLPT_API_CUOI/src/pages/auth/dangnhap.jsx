import React, { useState, useContext } from "react";
import "/src/styles/auth/dangky.css"; // Import file CSS
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import API from "/src/services/api.jsx";
import { Thongbaocontext } from "../../context/thongbao";
import Loading from "/src/components/UI/loading.jsx";

function Dangnhap() {
  // thêm state loading-------------------------------------------------------
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context-------------------------------------------
  const { showthongbao } = useContext(Thongbaocontext);

  //----------------------------------------------------------------------------------------------
  const navigate = useNavigate();
  // BƯỚC 2: Sửa lại State cho Đăng Nhập
  // Chỉ cần 2 trường (Email/Tên đăng nhập và Mật khẩu)
  const [formData, setFormData] = useState({
    email_sdt: "", // (Giả sử bạn dùng email để đăng nhập)
    matKhau: "",
    role: "Admin",
  });

  // (State để chứa lỗi)
  const [error, setError] = useState(null);

  // BƯỚC 3: Hàm handleChange (Hàm này vẫn đúng, dùng để cập nhật state)
  const handleChange = (e) => {
    // e.target.name sẽ là "email" hoặc "matKhau"
    // e.target.value sẽ là "người dùng gõ vào"
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // BƯỚC 4: Sửa lại hàm handleSubmit cho Đăng Nhập
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form tải lại trang
    setLoading(true); // bật loading

    try {
      // --- QUAN TRỌNG: CHUẨN BỊ DỮ LIỆU ĐỂ GỬI API ---
      // Vì Backend (C#) mong đợi trường "Email" hoặc "Sdt",
      // ta sẽ gán giá trị người dùng nhập vào cả 2 trường này (hoặc 1 trong 2)
      // để Backend so sánh.
      const dataToSend = {
        Email: formData.email_sdt, // Gửi giá trị nhập vào field Email của Backend
        Sdt: formData.email_sdt, // Gửi giá trị nhập vào field Sdt của Backend
        MatKhau: formData.matKhau,
        Role: formData.role,
      };
      // gọi api
      const response = await API.post("Auth/dangnhap", dataToSend);

      // Xử lý thành công
      // Lưu token vào localStorage để biết ai đang đăng nhập và ko cần đăng nhập lại khi f5 phù hợp viết api
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user)); // lưu thông tin token vào user
        
      }

      // 2. Thông báo và chuyển về trang chủ
      showthongbao("Đăng nhập thành công!", "success");
      // Lấy role từ kết quả server trả về cho chính xác nhất
      const userRole = response.data.user ? response.data.user.role : formData.role;

      // 2. Đợi 1.5 giây (1500ms) rồi mới chuyển hướng
      setTimeout(() => {
        // Lấy role từ kết quả server (hoặc form)
        const userRole = response.data.user ? response.data.user.role : formData.role;

        // Logic chuyển hướng
        if (userRole === "nguoithue") {
          setLoading(true);
          navigate("/");
        } else if (userRole === "chutro") {
          setLoading(true);
          navigate("/Chutro");
        } else {
          setLoading(true);
          navigate("/Admin");
        }
      }, 3100); // đợi thông báo tắt r ms chuyển trang
    } catch (err) {
      // Xử lý khi đăng nhập thất bại
      // 5. Xử lý lỗi
      const loi =
        err.response && err.response.data
          ? typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.message
          : "Không thể kết nối đến máy chủ.";

      showthongbao(loi, "error");
    } finally {
      setLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  return (
    <div className="form-card">
       {loading && <Loading />}
      {/* Nội dung tab "Tạo tài khoản mới" */}
      <div>
        <h2 className="TieuDe">Đăng Nhập</h2>
        <form onSubmit={handleSubmit}>
          {/* Họ tên */}
          <div className="form-group">
            <input
              className=""
              type="text"
              placeholder="Email hoặc SDT"
              name="email_sdt" //  Định danh trường
              value={formData.email_sdt} //  Gắn giá trị từ state
              onChange={handleChange} // Sự kiện cập nhật
              required
            ></input>
          </div>

          {/* Mật khẩu */}
          <div className="form-group">
            <input
              className=""
              type="password"
              placeholder="Mật khẩu"
              name="matKhau"
              value={formData.matKhau}
              onChange={handleChange}
              required
            ></input>
          </div>

          {/* Loại tài khoản (Radio buttons) */}
          <div className="form-group radio-group">
            <label className="radio-label">Loại tài khoản: </label>
            <div className="radio-options">
              <label className="custom-radio">
                <input
                  type="radio"
                  name="role"
                  value="chutro"
                  checked={formData.role === "chutro"}
                  onChange={handleChange}
                />
                <span>Chủ trọ</span>
              </label>
              <label className="custom-radio">
                <input
                  type="radio"
                  name="role"
                  value="nguoithue"
                  checked={formData.role === "nguoithue"} // Kiểm tra state
                  onChange={handleChange} // Gắn hàm
                />
                <span>Ngươi thuê</span>
              </label>
            </div>
          </div>

          <button type="submit" className="submit-button">
            Đăng Nhập
          </button>
        </form>
        <div className="chuyentrang-dangky">
          <Link to="/Dangky" className="chuyentrang" href="#">
            Đăng ký
          </Link>
        </div>
      </div>

      <p className="terms-text">
        Qua việc đăng nhập hoặc tạo tài khoản, bạn đồng ý với các{" "}
        <span>quy định sử dụng</span>
        cũng như <span>chính sách bảo mật</span>
        của chúng tôi
      </p>
      <p className="copyright-text">Bản quyền © 2025 Káto.com</p>
    </div>
  );
}

export default Dangnhap;

// ghi chú
// Khởi tạo dữ liệu (useState):
// Bạn tạo biến formData chứa mọi thông tin cần thiết (hoTen, email, sdt, role...).
// Tên các biến này (hoTen, email...) PHẢI trùng khớp 100% với tên thuộc tính trong Class C# CDangKy (hoặc UserDTO) ở Backend. 
// Nếu Backend viết là HoTen thì Frontend gửi hoTen vẫn được (JSON thường không phân biệt hoa thường ở ký tự đầu), nhưng tốt nhất là nên chuẩn.
// Thu thập dữ liệu (handleChange):
// Khi người dùng gõ phím, hàm handleChange chạy. Nó lấy name của ô input (ví dụ "email") và value (nội dung gõ) để cập nhật vào formData.
// Gửi yêu cầu (handleSubmit - Quan trọng nhất):
// Validation: Trước khi gọi API, code kiểm tra độ dài SĐT, check mật khẩu nhập lại.
// Gọi API: Dòng await API.post("/Auth/dangky", formData); sẽ đóng gói toàn bộ formData thành JSON và bắn sang Backend.
// Lúc này, Backend (C#) sẽ nhận được, chạy hàm check trùng lặp mà ta vừa viết.
// Xử lý kết quả (try...catch):
// Nếu thành công (HTTP 200): Hiện thông báo xanh (showthongbao), rồi chuyển trang (Maps).
// Nếu thất bại (HTTP 400/500): Code nhảy vào catch.
// Dòng err.response.data.message chính là cái dòng chữ "Email hoặc Số điện thoại đã tồn tại..." 
// mà bạn đã viết trong BadRequest("...") ở C#. Nó sẽ hiện lên cho người dùng biết tại sao lỗi.