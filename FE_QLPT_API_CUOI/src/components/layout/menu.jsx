import "/src/styles/layout/menu.css"; // Import file CSS
import React, { useState, useContext } from "react";
import Logo from "/src/assets/logo_01.png";
import Popuploc from "../UI/popuploc.jsx";
import Popupuser from "../UI/popupuser.jsx";
import { Link, useNavigate } from "react-router-dom";
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";

function Menu({ isDropdownOpen, toggleDropdown, onFilter, onSearch }) {
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [ison_of_user, seton_off_user] = useState(false);

  //===============================show thông báo và loading=========================
  const [loading, setLoading] = useState(false);
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);
  //-------------------------------------------------------------------------------

  //-------------------------xử lý tìm kiếm----------------------------------
  // ================= 2. THÊM STATE TỪ KHÓA TÌM KIẾM =================
  const [tuKhoa, setTuKhoa] = useState("");

  // ================= 3. HÀM XỬ LÝ NHẤN PHÍM ENTER =================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
        // Kiểm tra xem onSearch có tồn tại không trước khi gọi để tránh lỗi
        if (onSearch) {
            onSearch(tuKhoa);
        }
    }
  };

  //------------------------------------------------------------------------------------
  const on_off_user = () => {
    const user = localStorage.getItem("user");
    // Nếu cửa sổ bật lên hiện đang đóng, hãy kiểm tra đăng nhập trước khi mở.
    if (!ison_of_user) {
      if (!user) {
        showthongbao("Bạn chưa đăng nhập!", "error");
        return;
      }
      seton_off_user(true);
      return;
    }

    // Nếu cửa sổ bật lên đang mở, chỉ cần đóng nó mà không cần kiểm tra localStorage
    seton_off_user(false);
  };

  // ================= LẤY USER =================
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  //===========================đăng xuất=============================
  const navigate = useNavigate();

  const handleLogout = async () => {
    const oke = await showxacnhan("Bạn chắc chắn muốn đăng xuất không?");
    if (oke) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div className="menu">
      <div className="logo">
        <Link to="/">
          <img src={Logo}></img>
        </Link>
      </div>
      <div className="loc">
        <button
          className="button-loc"
          onClick={toggleDropdown}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {" "}
          {/* dùng onMouseDown để ngăn chặn sự kiện nổi bọt (bubbling)  click lại vào nút sẽ không làm kích hoạt listener mousedown trên document (ở trong Popuploc) trước khi React xử lý onClick */}
          <i className="icon" class="bxrds  bx-location"></i>
          <span> Lọc Theo Địa Chỉ</span>
          <i className="icon" class="bxr  bxs-caret-down"></i>
        </button>
        {/*--------------- nơi popup hiện ra -----------------*/}
        {/* DÙNG HIỂN THỊ CÓ ĐIỀU KIỆN */}
        {isDropdownOpen && (
          <Popuploc
            onClose={toggleDropdown}
            onApplyFilter={onFilter} // Truyền hàm xuống
          />
        )}
        {/* Toán tử && có nghĩa là: 
            "Nếu isDropdownOpen là true, thì render component <LocationDropdown />"
            
            Chúng ta truyền hàm toggleDropdown vào prop 'onClose' 
            để component con có thể tự đóng chính nó.
          */}
        {/* ------------------------------------------------------ */}
      </div>

      <div className="timkiem">
        <i class="bxr  bx-scan-search"></i>
        <input
          className="input-timkiem"
          type="text"
          placeholder="Thứ bạn cần là gì..."
          value={tuKhoa}                          // Liên kết với state
          onChange={(e) => setTuKhoa(e.target.value)} // Cập nhật state khi gõ
          onKeyDown={handleKeyDown}               // Bắt sự kiện nhấn phím
        />
      </div>
      {user ? (
        <div className="dangnhap">
          <button className="button-dangnhap" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      ) : (
        <div className="dangnhap">
          <Link to="/Dangnhap">
            <button className="button-dangnhap">Đăng Nhập</button>
          </Link>
        </div>
      )}

      <div className="btn-dangtin">
        {user && user?.role === "chutro" ? (
          <Link to="/Chutro/Dangtin">
            <button className="button-dangtin">Đăng Tin</button>
          </Link>
        ) : (
          // ) : user && user?.role === "nguoithue" ? (
          //   <Link>
          //     <button className="button-dangtin">Tin đã lưu</button>
          //   </Link>
          // ): null}
          <Link>
            <button className="button-dangtin">Tin đã lưu</button>
          </Link>
        )}
      </div>

      <div className="user">
        <button className="button-user" onClick={on_off_user}>
          <i className="icon" class="bxr  bx-user"></i>
          <span className="user-name">Tài Khoản</span>
        </button>

        {/*--------------- nơi popup hiện ra -----------------*/}
        {/* DÙNG HIỂN THỊ CÓ ĐIỀU KIỆN */}
        {ison_of_user && <Popupuser onClose={on_off_user} />}
        {/* Toán tử && có nghĩa là: 
            "Nếu isDropdownOpen là true, thì render component <LocationDropdown />"
            
            Chúng ta truyền hàm toggleDropdown vào prop 'onClose' 
            để component con có thể tự đóng chính nó.
          */}
        {/* ------------------------------------------------------ */}
      </div>
    </div>
  );
}

export default Menu;
