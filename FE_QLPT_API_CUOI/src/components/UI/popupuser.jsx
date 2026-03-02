import React, { useRef, useEffect, useContext, useState } from "react";
import "/src/styles/UI/popupuser.css";
import Avatar from "/src/assets/avatar.png";
import { Link, useNavigate } from "react-router-dom";
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";
import API from "/src/services/api.jsx";

// 1. Import Popup thông tin cá nhân
import Popupttcn from "/src/pages/Popupttcn";
function Popupuser({ onClose }) {
  //===============================show thông báo và loading=========================
  const [loading, setLoading] = useState(false);

  // 2. Thêm state để quản lý việc hiển thị Popupttcn **
  const [showTtcn, setShowTtcn] = useState(false);

  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);

  // ================= LẤY USER =================
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return null;
  }

  // ================= XỬ LÝ CLICK NGOÀI =================
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Nếu Popupttcn đang mở thì KHÔNG đóng Popupuser vội (để Popupttcn tự xử lý)
        // Hoặc nếu muốn click ra ngoài đóng tất cả thì giữ nguyên onClose()
        if (!showTtcn) {
          onClose();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, showTtcn]); // Thêm showTtcn vào dependency

  //===========================đăng xuất=============================
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    const oke = await showxacnhan("Bạn chắc chắn muốn đăng xuất không?");
    if (oke) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      onClose();
      navigate("/");
    }
  };

  // --------------------------------lấy dữ liệu ng dùng-----------------------

  const [nguoidung, setnguoidung] = useState(null);
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // 1. Lấy chi tiết phòng hiện tại
        const response = await API.get(
          `NguoiDung/thongtinnguoidung/${user.userId}`
        );
        setnguoidung(response.data);
      } catch (err) {
        showthongbao("Lỗi tải dữ liệu:", "error");
      } finally {
        setLoading(false);
      }
    };

    // Reset state khi ID thay đổi (quan trọng khi bấm vào phòng tương tự)
    setLoading(true);
    fetchData();
  }, []);

  // ================= RENDER =================
  return (
    <div className="form-pop-user" ref={dropdownRef}>
      {/* {loading && <Loading />} */}
      <div className="form-us-img">
        <img
          src={
            nguoidung?.avatar
              ? `https://localhost:7072${nguoidung.avatar}` // Nếu có avatar thì ghép link
              : Avatar // Nếu null/rỗng thì dùng ảnh mặc định
          }
          alt="avatar"
        />
      </div>

      <div className="form-us-name">
        <h3>Chào, {nguoidung?.hoTen}</h3>
      </div>

      {/* Chỉ hiển thị cho chủ trọ */}
      {user.role === "chutro" && (
        <>
          <p>Quản lý bài đăng</p>

          <div className="form-us-bd">
            <div className="form-us-ql">
              <Link to="Chutro/Dangtin">
                <div>
                  <i className="bxrds bx-arrow-out-up-square-half"></i> Đăng mới
                </div>
              </Link>

              <Link to="/Chutro/Dstindang">
                <div>
                  <i className="bxrds bx-folder-up-arrow"></i> Tất cả
                </div>
              </Link>

              <Link>
                <div>
                  <i className="bxrds bx-clipboard-check"></i> Đang hiển thị
                </div>
              </Link>

              <Link>
                <div>
                  <i className="bxrds bx-eye-slash"></i> Tin ẩn
                </div>
              </Link>
            </div>
          </div>
        </>
      )}

      
      <div className="us-qltk" onClick={() => setShowTtcn(true)}>
        Quản lý tài khoản
      </div>

      <div
        className="us-qltk"
        onClick={handleLogout}
        style={{ cursor: "pointer" }}
      >
        Đăng xuất
      </div>

      {/* --- hiển thị popup --- */}
      {showTtcn && (
        /* Đây là lớp phủ  */
        <div className="popup-overlay">
          {/* Truyền onClose để nút tắt trong Popupttcn hoạt động */}
          <Popupttcn onClose={() => setShowTtcn(false)}
          
          />
        </div>
      )}
    </div>
  );
}

export default Popupuser;
