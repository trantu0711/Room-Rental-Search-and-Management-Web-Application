import React, { useState, useContext } from "react";
import "/src/styles/auth/dangky.css"; // Import file CSS
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import API from "/src/services/api.jsx";
import { Thongbaocontext } from "../../context/thongbao";
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "sub-vn";

function Dangky() {
  // Dùng navigate để chuyển trang sau khi đăng ký thành công
  const navigate = useNavigate();

  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);

  const { showxacnhan } = useContext(Xacnhancontext);

  // BƯỚC 2: Tạo state để lưu trữ toàn bộ dữ liệu form
  // Tên các key (hoTen, sdt...) PHẢI KHỚP VỚI API TRONG ẢNH SWAGGER
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    sdt: "",
    matKhau: "",
    diaChi: "", // <-- THÊM MỚI
    cccd: "", // <-- THÊM MỚI
    avatar: "", // <-- THÊM MỚI (có thể để rỗng nếu API cho phép)
    role: "nguoithue",
  });

  // BƯỚC 3: Tạo hàm 'handleChange' để cập nhật state khi người dùng gõ
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Cập nhật gtri mới state 'formData'
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Tạo state riêng cho "Nhập lại mật khẩu" (chỉ để kiểm tra)
  // gán phần nhập lại mk vào
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form tải lại trang

    setLoading(true); // Bật loading khi bắt đầu gửi
    // 0. Kiểm tra số điện thoại đủ 10 ký tự
    if (formData.sdt.length < 10 || formData.sdt.length > 11) {
      showthongbao("Số điện thoại phải đủ 10 ký tự!", "error");
      setLoading(false);
      return;
    }

    // 1. Kiểm tra mật khẩu nhập lại
    if (formData.matKhau !== confirmPassword) {
      // Hiển thị thông báo lỗi
      showthongbao("Mật khẩu nhập lại không khớp!", "error");
      setLoading(false);
      return; // Dừng lại nếu lỗi
    }

    // 2. Kiểm tra xem có chọn Role chưa
    if (!formData.role) {
      showthongbao("Vui lòng chọn loại tài khoản!", "error"); // Hiển thị thông báo lỗi
      setLoading(false);
      return;
    }

    try {
      //goi api
      const response = await API.post("Auth/dangky", formData);

      // 4. Xử lý khi thành công
      showthongbao(
        <div>
          {" "}
          Đăng ký tài khoản thành công! <br /> Vui lòng đăng nhập.{" "}
        </div>,
        "success"
      );

      // đợi thông báo tắt
      setTimeout(() => {
        navigate("/Dangnhap"); // Chuyển sang trang đăng nhập
      }, 3100);

    } catch (err) {
      if (err.response) {
        // Lấy dữ liệu lỗi từ server
        // API C# thường trả về lỗi nằm trực tiếp trong 'err.response.data' nếu là chuỗi
        const loiTuServer = err.response.data;

        // Kiểm tra xem nó là object (có .message) hay là chuỗi văn bản
        const thongBaoLoi =
          typeof loiTuServer === "string"
            ? loiTuServer
            : loiTuServer.message || "Đã có lỗi xảy ra";

        showthongbao(thongBaoLoi, "error");
      } else {
        // Lỗi mạng hoặc không kết nối được server
        showthongbao("Không thể kết nối đến máy chủ.", "error");
      }
      console.error("Lỗi đăng ký:", err);
    } finally {
      setLoading(false); // ✅ TẮT loading dù thành công hay lỗi
    }
  };

  return (
    <div className="page-dangky">
      {loading && <Loading />} {/* Hiển thị loading khi đang tải */}
      <div className="form-card">
        {/* Nội dung tab "Tạo tài khoản mới" */}
        <div>
          <h2 className="TieuDe">Đăng ký</h2>
          <form onSubmit={handleSubmit}>
            {/* Họ tên */}
            <div className="form-group">
              <input
                className=""
                type="text"
                placeholder="Tên đăng nhập"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                required
              ></input>
            </div>

            {/* email */}
            <div className="form-group">
              <input
                className=""
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              ></input>
            </div>

            {/* Số điện thoại */}
            <div className="form-group">
              <input
                className=""
                type="number"
                placeholder="Số điện thoại"
                name="sdt"
                value={formData.sdt}
                onChange={handleChange}
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

            <div className="form-group">
              <input
                className=""
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} // Cập nhật state 'confirmPassword'
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
                    checked={formData.role === "chutro"} // Kiểm tra state
                    onChange={handleChange} // Gắn hàm
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
              Tạo tài khoản
            </button>
          </form>
          <div className="chuyentrang-dangky">
            <Link to="/Dangnhap" className="chuyentrang" href="#">
              Đăng Nhập
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
    </div>
  );
}

export default Dangky;
