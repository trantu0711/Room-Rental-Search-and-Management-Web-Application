import React, { useRef, useEffect, useContext, useState } from "react";
import "/src/styles/chutro/popupthanhtoan.css";
import Avatar from "/src/assets/avatar.png";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "/src/context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";
import "/src/styles/popupttcn.css"; // Import file CSS
import API from "/src/services/api.jsx";
import "/src/styles/chutro/popuphopdong.css"; // Import file CSS

function Popuphopdong({ onClose, phongId, onSuccess }) {
  //===============================show thông báo và loading=========================
  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);

  // ================= LẤY USER =================
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // ================= XỬ LÝ CLICK NGOÀI  =================
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

  const handleTimKhach = async () => {
    if (!sdtKhach) {
      setError("Vui lòng nhập số điện thoại khách!");
      return;
    }
    setLoading(true);
    try {
      const res = await API.get(`NguoiDung/tim-theo-sdt?sdt=${sdtKhach}`);
      if (res.data) {
        setTenKhach(res.data.hoTen);
        setUserIdKhach(res.data.userId);
        setError("");
      }
    } catch (err) {
      setTenKhach("");
      setUserIdKhach(null);
      setError("Không tìm thấy khách hàng với SĐT này!");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIC TẠO HỢP ĐỒNG =================
  const [sdtKhach, setSdtKhach] = useState("");
  const [tenKhach, setTenKhach] = useState("");
  const [userIdKhach, setUserIdKhach] = useState(null);

  const [ngayBatDau, setNgayBatDau] = useState("");
  const [ngayKetThuc, setNgayKetThuc] = useState("");
  const [filePDF, setFilePDF] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!userIdKhach) {
      setError("Vui lòng tìm và chọn khách thuê trước.");
      return;
    }
    if (!ngayBatDau || !ngayKetThuc) {
      setError("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("UserId", userIdKhach);
      formData.append("PhongTroId", phongId);
      formData.append("NgayBatDau", ngayBatDau);
      formData.append("NgayKetThuc", ngayKetThuc);
      formData.append(
        "NoiDungHopDong",
        "Hợp đồng thuê phòng " + phongId.tenPhong
      );

      if (filePDF) {
        formData.append("FileHopDong", filePDF);
      }

      await API.post(`HopDong/taohopdong`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showthongbao("Tạo hợp đồng thành công!", "success");
      onSuccess(); // Load lại danh sách ở trang cha
      onClose(); // Đóng popup
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message;
      setError("Lỗi: " + msg);
    } finally {
      setLoading(false);
    }
  };



  // ================= RENDER =================
  return (
    <div class="popup-overlay">
      <div className="form-pop-tt" ref={dropdownRef}>
        {loading && <Loading />}
        <h2 className="tt-tieude">Làm hợp đồng {phongId}</h2>
        {/* 1. Tìm kiếm khách hàng */}
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label className="thd-td">
            Số điện thoại khách thuê (*)
          </label>
          <div className="thd-tk">
            <input
              type="text"
              className="thd-input-text"
              value={sdtKhach}
              onChange={(e) => setSdtKhach(e.target.value)}
              placeholder="Nhập SĐT khách..."

            />
            <button className="thd-btn-tim"
              onClick={handleTimKhach}

            >
              Tìm
            </button>
          </div>
          {tenKhach && (
            <div
              className="thd-tkh"
            >
             Khách hàng: {tenKhach}
            </div>
          )}
        </div>

        {/* 2. Chọn ngày tháng */}
        <div className="thd-ngaythang">
          <div className="thd-bd" >
            <label className="" >
              Ngày bắt đầu
            </label>
            <input
              type="date"
              className="input-text"
              onChange={(e) => setNgayBatDau(e.target.value)}
            />
          </div>

          <div className="thd-bd" >
            <label >
              Ngày kết thúc
            </label>
            <input
              type="date"
              className="input-text"
              onChange={(e) => setNgayKetThuc(e.target.value)}

            />
          </div>
        </div>

        {/* 3. Upload File */}
        <div className="thd-file">
          <label >
            Hình ảnh
          </label>
          {/* lable htmlFor="input-file" cho phép khi nhấn vào nó sẽ tự động focus vài thẻ file */}
          <label className="lable-ha" htmlFor="input-file">
            <div className="upload-ha">
              <div className="camera-icon">
                <i class="bxr  bx-camera-alt"></i>
              </div>
              <p>Tải ảnh từ thiết bị</p>
            </div>
          </label>
          {/* ẩn thẻ input này đi */}
          <input
            type="file"
            id="input-file"
            hidden
            multiple
            onChange={(e) => setFilePDF(e.target.files[0])}
          ></input>

        </div>

        {/* 4. Hiển thị lỗi
        {error && (
          <div
            style={{
              color: "red",
              backgroundColor: "#ffe6e6",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )} */}

        {/* 5. Nút bấm */}
        <div className="thd-btn">
          <button className="thd-btn-hb"
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button className="thd-btn-xnt"
            onClick={handleSubmit}
          >
            Xác nhận tạo
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popuphopdong;
