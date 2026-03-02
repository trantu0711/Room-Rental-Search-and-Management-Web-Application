import "/src/styles/layout/banner.css"; // Import file CSS
import React, { useContext, useState } from "react";
import banner from "/src/assets/banner_07.png";
import Popuploc from "../UI/popuploc.jsx";
import { Link, useNavigate } from "react-router-dom";
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "/src/context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";

// Nhận prop onOpenFilter từ cha
function Banner({ toggleDropdown }) {
  // lấy dữ liệu từ toke khi đăng nhập
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  //===============================show thông báo và loading=========================
  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);

  const navigate = useNavigate();

  const handleDangTin = async () => {
    // TRƯỜNG HỢP 1: Chưa đăng nhập
    if (!user) {
      const confirm = await showxacnhan("Bạn cần đăng nhập để đăng tin. Đến trang đăng nhập ngay?");
      if (confirm) navigate("/Dangnhap");
      return;
    }

    // TRƯỜNG HỢP 2: Là Người thuê
    if (user.role === "nguoithue") {
      const confirm = await showxacnhan(
        "Bạn cần tài khoản Chủ trọ để đăng tin. Đổi tài khoản ngay?"
      );

      if (confirm) {
        // Xử lý đăng xuất
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showthongbao("Đã đăng xuất. Vui lòng đăng nhập tài khoản Chủ trọ!", "success");
        navigate("/Dangnhap");
      }
      return;
    }

    // TRƯỜNG HỢP 3: Là Chủ trọ (hoặc Admin)
    if (user.role === "chutro" || user.role === "admin") {
      navigate("/Chutro/Dangtin");
    }
  };

  return (
    <div className="page-banner">
      <div>
        <span className="bn-nd-den">
          Tìm phòng trọ dễ dàng, <span className="bn-nd-hl">nhanh chóng </span>
          và tiện lợi.
        </span>
        <br />
        <span className="">
          Nền tảng hỗ trợ tìm kiếm phòng trọ uy tín nhất, cập nhật liên tục, phù
          hợp mọi nhu cầu của bạn.
        </span>
        <br />
        <div className="bn-btn">
          <button
            className="button-bn-tim"
            onClick={toggleDropdown}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Tìm phòng ngay
          </button>

          <button className="button-bn-dang" onClick={handleDangTin}>Đăng tin cho thuê</button>


        </div>
      </div>
      <div className="bn-img">
        <img className="bn-animation" src={banner}></img>
      </div>
    </div>
  );
}

export default Banner;
