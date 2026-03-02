import React, { useRef, useEffect, useContext, useState } from "react";
import "/src/styles/UI/popupuser.css";
import DefaultAvatar from "/src/assets/avatar.png"; // Đổi tên để tránh trùng biến state
import { Link, useNavigate } from "react-router-dom";
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "/src/context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";
import "/src/styles/nguoithue/popupxemhd.css";
import API from "/src/services/api.jsx";

// Giả sử URL gốc của ảnh (cần khớp với cấu hình server của bạn)
// Nếu API.js đã có baseURL thì bạn có thể dùng trực tiếp hoặc nối chuỗi
const BASE_IMG_URL = "https://localhost:7072"; // Thay bằng port server của bạn

function Popupxemhd({ onClose, phong }) {
  const [loading, setLoading] = useState(false);
  const { showthongbao } = useContext(Thongbaocontext);

  // Lấy user từ local storage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return null;

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

  // lấy đường dẫn 
  const filePdfPath = phong?.hopDong?.filePdf;

  return (
    <div class="popup-overlay">
      <div className="form-pop-xemhd" ref={dropdownRef}>
        {loading && <Loading />}
        <div className="xemhd-container">
          <div className="xemhd-form">
            <h2>Xem trước hợp đồng</h2>
            <span>
              * (Lưu ý bản hợp đồng này chỉ xem trước, không có giá trị pháp lý)
            </span>
            {filePdfPath ? (
              <iframe
                src={`${BASE_IMG_URL}${filePdfPath}#toolbar=0&navpanes=0&zoom=page-width`}
                title="Xem hợp đồng"
              />
            ) : (
              <div className="hd-trong">
                <i class='bxr  bx-file-x'></i> 
                <span>Không có bản xem trước</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Popupxemhd;
