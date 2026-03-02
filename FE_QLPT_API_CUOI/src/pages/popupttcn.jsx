import React, { useRef, useEffect, useContext, useState } from "react";
import "/src/styles/UI/popupuser.css";
import DefaultAvatar from "/src/assets/avatar.png"; // Đổi tên để tránh trùng biến state
import { Link, useNavigate } from "react-router-dom";
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "/src/context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";
import "/src/styles/popupttcn.css";
import API from "/src/services/api.jsx";

// Giả sử URL gốc của ảnh (cần khớp với cấu hình server của bạn)
// Nếu API.js đã có baseURL thì bạn có thể dùng trực tiếp hoặc nối chuỗi
const BASE_IMG_URL = "https://localhost:7072"; // Thay bằng port server của bạn

function Popupttcn({ onClose }) {
  const [loading, setLoading] = useState(false);
  const { showthongbao } = useContext(Thongbaocontext);

  // Lấy user từ local storage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return null;

  // --- STATE QUẢN LÝ FORM ---
  // Không dùng mảng, dùng object để dễ binding dữ liệu
  const [formData, setFormData] = useState({
    hoTen: "",
    sdt: "",
    email: "",
    cccd: "",
    diaChi: "",
    avatar: "" // Đường dẫn ảnh từ DB
  });

  // State lưu file ảnh mới người dùng chọn (để gửi lên server)
  const [fileAnhMoi, setFileAnhMoi] = useState(null);
  // State lưu ảnh preview (để hiện lên màn hình ngay khi chọn)
  const [previewUrl, setPreviewUrl] = useState(DefaultAvatar);

  // --- 1. LẤY DỮ LIỆU USER ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await API.get(`NguoiDung/thongtinnguoidung/${user.userId}`);
        const data = response.data;

        // Đổ dữ liệu vào state
        setFormData({
          hoTen: data.hoTen || "",
          sdt: data.sdt || "",
          email: data.email || "", // Email thường không cho sửa, nhưng cứ hiện
          cccd: data.cccd || "",
          diaChi: data.diaChi || "",
          avatar: data.avatar || ""
        });

        // Xử lý hiển thị ảnh avatar cũ
        if (data.avatar) {
          // Kiểm tra xem avatar có phải link full (google) hay link nội bộ
          if (data.avatar.startsWith("http")) {
            setPreviewUrl(data.avatar);
          } else {
            setPreviewUrl(`${BASE_IMG_URL}${data.avatar}`);
          }
        }
      } catch (err) {
        showthongbao("Không tải được dữ liệu.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. XỬ LÝ NHẬP TEXT ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- 3. XỬ LÝ CHỌN ẢNH (PREVIEW) ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAnhMoi(file); // Lưu file vào state để tí gửi đi
      setPreviewUrl(URL.createObjectURL(file)); // Tạo link ảo để hiện ảnh ngay lập tức
    }
  };

  // --- 4. GỬI FORM (QUAN TRỌNG) ---
  const handleSave = async () => {
    setLoading(true);
    try {
      // Tạo đối tượng FormData để gửi dữ liệu multipart/form-data
      const dataToSend = new FormData();

      // Append các trường text (Tên key phải khớp với Model C# CDangKy)
      dataToSend.append("HoTen", formData.hoTen);
      dataToSend.append("SDT", formData.sdt);
      dataToSend.append("CCCD", formData.cccd);
      dataToSend.append("DiaChi", formData.diaChi);

      // Append file ảnh (nếu có chọn ảnh mới)
      // Tên key "FileHinh" phải khớp với property trong C# Model: public IFormFile? FileHinh { get; set; }
      if (fileAnhMoi) {
        dataToSend.append("HinhAnh", fileAnhMoi);
      }

      // Gọi API PUT
      // Lưu ý: Content-Type của axios thường tự động nhận diện FormData
      await API.put(`NguoiDung/suathongtin/${user.userId}`, dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showthongbao("Cập nhật thông tin thành công!", "success");

      // (Tuỳ chọn) Cập nhật lại localStorage nếu tên đổi
      // const updatedUser = { ...user, hoTen: formData.hoTen };
      // localStorage.setItem("user", JSON.stringify(updatedUser));

      onClose(); // Đóng popup
    } catch (error) {
      if (err.response && err.response.data) {
        const msg =
          err.response.data.message || JSON.stringify(err.response.data);
        showthongbao(msg, "error");
      } else {
        showthongbao("Lỗi kết nối đến máy chủ!", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ CLICK NGOÀI ---
  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="form-pop-ttcn" ref={dropdownRef}>
      {/* {loading && <Loading />} */}
      <div className="thongtincanhan-container">
        <div className="thongtincanhan-form">

          {/* --- PHẦN AVATAR --- */}
          <label htmlFor="input-file" style={{ cursor: "pointer" }}>
            <div className="form-ttcn-img">
              {/* Hiển thị ảnh preview */}
              <img src={previewUrl || Avatar} alt="Avatar" style={{ objectFit: "cover" }} />
              <div className="ttcn-camera-icon">
                <i className="bx bx-camera"></i>
              </div>
              <div>
                {/* Input file ẩn, gắn hàm onChange */}
                <input
                  type="file"
                  id="input-file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </label>

          {/* --- PHẦN TEXT --- */}
          <div className="form-us-name">
            <h3>Chào {formData.hoTen}</h3>
          </div>
          <hr />

          <div className="form-ttcn-info">
            <div className="div-ttcn">
              <p>Họ và tên</p>
              <input
                className="input-ttcn"
                type="text"
                name="hoTen" // Quan trọng: name phải khớp key trong state formData
                value={formData.hoTen}
                onChange={handleInputChange} // Phải có để gõ được chữ
              />
            </div>

            <div className="div-ttcn">
              <p>SDT</p>
              <input
                className="input-ttcn"
                type="text"
                name="sdt"
                value={formData.sdt}
                onChange={handleInputChange}
              />
            </div>

            <div className="div-ttcn">
              <p>Email</p>
              <input
                className="input-ttcn"
                type="text"
                value={formData.email}
                readOnly // Email thường không cho sửa, set readOnly
                style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
              />
            </div>

            <div className="div-ttcn">
              <p>CCCD</p>
              <input
                className="input-ttcn"
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={handleInputChange}
              />
            </div>

            <div className="div-ttcn">
              <p>Địa chỉ</p>
              <input
                className="input-ttcn"
                type="text"
                name="diaChi"
                value={formData.diaChi}
                onChange={handleInputChange}
              />
            </div>

            <div className="div-ttcn-btn">
              {/* Gắn hàm gửi form vào nút */}
              <button className="button-ttcn-save" onClick={handleSave}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Popupttcn;