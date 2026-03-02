// import React, { useState } from "react";
// import Thanhgat3nac from "./components/UI/thanhgat3nac";


// function Demo() {
//   const [status, setStatus] = useState(0);

//   const getText = () => {
//     switch (status) {
//       case 0:
//         return "Trống";
//       case 1:
//         return "Đã thuê";
//       case 2:
//         return "Sửa chữa";
//       default:
//         return "";
//     }
//   };

//   return (
//     <div>
//       <Thanhgat3nac value={status} onChange={setStatus} />
//       <p className="tt">{getText()}</p>
//     </div>
//   );
// }

// export default Demo;

// import { useConfirm } from "/src/context/xacnhan.jsx";

// function XoaNguoiDung({ id }) {
//   const { confirm } = useConfirm();

//   const handleDelete = async () => {
//     const ok = await confirm("Bạn có chắc chắn muốn xoá người dùng này?");

//     if (!ok) return;

//     // viết API xoá ở đây
//     console.log("Đã xác nhận xoá");
//   };

//   return <button onClick={handleDelete}>Xoá</button>;
// }

import React, { useRef, useEffect, useContext, useState } from "react";
import "/src/styles/UI/popupuser.css";
import Avatar from "/src/assets/avatar.png";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";

function Popupuser({ onClose }) {
  //===============================show thông báo và loading=========================
  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);

  // ================= LẤY USER =================
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // chặn rander khi chưa đăng nhập
  if (!user) {
    return null;
  }

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

  //===========================đăng xuất=============================
  // 3. Hàm Đăng xuất
  const navigate = useNavigate();

  const handleLogout = async () => {
    const oke = await showxacnhan("Bạn chắc chắn muốn đăng xuất không không?");
    if (oke) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      onClose();
      navigate("/Dangnhap");
      window.location.reload(); // Load lại trang để xóa sạch state cũ
    }
    
  };

  // ================= RENDER =================
  return (
    <div className="form-pop-user" ref={dropdownRef}>
      <Link to="Chutro/Thongtincanhan">
        <div className="form-us-img">
          <img src={user.avatar || Avatar} alt="avatar" />
        </div>
      </Link>

      <div className="form-us-name">
        <h3>Chào, {user.hoten}</h3>
      </div>

      <p>Quản lý bài đăng</p>

      <div className="form-us-bd">
        <div className="form-us-ql">
          <Link to="Chutro/Dangtin">
            <div>
              <i className="bxrds bx-arrow-out-up-square-half"></i> Đăng mới
            </div>
          </Link>

          <Link to="Chutro/Dstindang">
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

      <Link to="Chutro/Thongtincanhan">
        <div className="us-qltk">Quản lý tài khoản</div>
      </Link>
      
        <div className="us-qltk" onClick={handleLogout}>
          Đăng xuất
        </div>
    </div>
  );
}

export default Popupuser;
