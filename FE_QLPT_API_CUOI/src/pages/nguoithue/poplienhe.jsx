import React, { useState, useRef, useEffect, useContext } from "react";
import "/src/styles/nguoithue/poplienhe.css";
import API from "/src/services/api.jsx";
import { QRCodeCanvas } from "qrcode.react"; // Thư viện tạo mã QR lệnh npm install qrcode.react
import { Thongbaocontext } from "/src/context/thongbao";
import Loading from "/src/components/UI/loading.jsx";

function Poplienhe({ phong, onClose }) {
  //     const [showQR, setShowQR] = useState(false);

  //   // 1. Hàm xử lý SĐT để đảm bảo link Zalo đúng chuẩn
  //   // Xóa khoảng trắng, dấu chấm, gạch ngang nếu có
  //   const cleanPho ne = phone.replace(/\D/g, '');
  //   const zaloUrl = `https://zalo.me/${cleanPhone}`;
  const zaloUrl = `https://zalo.me/${phong?.sdt}`;

  //   // Toggle ẩn/hiện QR
  //   const handleToggle = () => {
  //     setShowQR(!showQR);
  //   };

  //--------------------------thông báo loading--------------------
  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);
  //-------------------------------------------------------------------------------

  //----------------- xử lý gửi dữ liệu vào form api ----------------------
  //b1 tạo state lưu những dì người dùng gõ
  const [formdata, setformdata] = useState({
    hoTen: "",
    email: "",
    sdt: "",
    noiDung: "",
  });

  // b2 khi ng dùng nhập liệu thì lưu lại
  const handleChange = (e) => {
    const { name, value } = e.target;

    setformdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // gửi dữ liệu cho be
  // chú ý baiDangId ... phải trùng vs class dto be
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Bật loading khi bắt đầu gửi
    setLoading(true);

    if (!formdata.hoTen.trim()) {
      showthongbao("Vui lòng nhập họ tên!", "error");
      setLoading(false);
      return;
    }

    if (!formdata.email.trim()) {
      showthongbao("Vui lòng nhập email", "error");
      setLoading(false);
      return;
    }

    if (formdata.sdt.length < 10) {
      showthongbao("Số điện thoại không hợp lệ!", "error");
      setLoading(false);
      return;
    }

    if (!formdata.noiDung.trim()) {
      showthongbao("Vui lòng nhập nội dung liên hệ!", "error");
      setLoading(false);
      return;
    }

    // Tạo payload đúng model C#
    const payload = {
      baiDangId: phong?.baiDangId,
      userId: phong?.userID,
      hoTen: formdata.hoTen,
      sdt: formdata.sdt,
      email: formdata.email,
      noiDung: formdata.noiDung,
    };

    try {
      const res = await API.post("LienHe/GuiLienHe", payload);

      showthongbao("Gửi liên hệ thành công!", "success");
      setformdata({ hoTen: "", sdt: "", email: "", noiDung: "" }); // reset form
    } catch (err) {
      if (err.response) {
        showthongbao(err.response.data || "Đã xảy ra lỗi!", "error");
      } else {
        showthongbao("Không thể kết nối server!", "error");
      }
    } finally {
      // TẮT loading
      setLoading(false);
    }
  };

  return (
    <div className="popup-lh-overlay" onClick={onClose}>
      <div className="page-lh" onClick={(e) => e.stopPropagation()}>
        {" "}
        {/* Ngăn chặn sự kiện nổi bọt */}
        <h2>Liên hệ với chủ trọ</h2>
        <div className="body-lh">
          <div className="lh-thongtin">
            <div className="lh-tt-nd">
              <label className="lable-tt">Họ và tên</label>
              <br />
              <input
                className="input-tt"
                name="hoTen"
                value={formdata.hoTen}
                onChange={handleChange}
                placeholder="Nhập họ tên..."
                required
              />
            </div>

            <div>
              <label className="lable-tt">Email</label>
              <br />
              <input
                className="input-tt"
                type="email"
                name="email"
                value={formdata.email}
                onChange={handleChange}
                placeholder="Nhập email..."
                required
              />
            </div>

            <div>
              <label className="lable-tt">Số điện thoại</label>
              <br />
              <input
                className="input-tt"
                name="sdt"
                value={formdata.sdt}
                onChange={handleChange}
                placeholder="Nhập số điện thoại..."
                required
              />
            </div>

            <div>
              <label className="lable-tt">Nội dung</label>
              <br />
              <textarea
                className="textarea-tt"
                name="noiDung"
                value={formdata.noiDung}
                onChange={handleChange}
                placeholder="Bạn muốn liên hệ về vấn đề gì?"
                required
              />
            </div>
          </div>
          <div className="lh-qr">
            <p>Quét mã để liên hệ qua Zalo</p>

            {/* thư viện tạo QR */}
            <QRCodeCanvas
              className="lh-qr-code"
              value={zaloUrl} // Giá trị đường dẫn
              size={250} // Kích thước (px)
              level={"H"} // Độ chi tiết (L, M, Q, H)
              // includeMargin={true} // Thêm viền trắng
            />
            <p>{phong?.sdt}</p>
          </div>
        </div>
        <button className="btn-lh-gui" type="submit" onClick={handleSubmit}>
          Gửi yêu cầu
        </button>
        {loading && <Loading />}
      </div>
    </div>
  );
}

export default Poplienhe;
