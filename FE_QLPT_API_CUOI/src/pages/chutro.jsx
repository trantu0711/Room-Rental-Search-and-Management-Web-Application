import React, { useState, useEffect, useContext } from "react";
import "../styles/chutro.css"; // Import file CSS
import Avatar from "/src/assets/avatar.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import API from "/src/services/api.jsx";
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "/src/context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";

function Chutro() {
  // lấy dữ liệu từ toke khi đăng nhập
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  //-------------------------------------------
  // Thêm state này để đánh dấu hành động đăng xuất
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  //===============================show thông báo và loading=========================
  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);

  const navigate = useNavigate();

  // Chuyển logic kiểm tra user vào useEffect để đảm bào chỉ ktra lần đầu vào trang
  // 1. Logic kiểm tra đăng nhập
  useEffect(() => {
    // Chỉ hiện thông báo lỗi nếu: User không có VÀ Không phải đang thực hiện hành động đăng xuất
    if (!user && !isLoggingOut) {
      showthongbao("Bạn chưa đăng nhập", "error");
      navigate("/dangnhap");
    }
  }, [user, navigate, showthongbao, isLoggingOut]);
  // ====================================

    useEffect(() => {
    // Chỉ hiện thông báo lỗi nếu: User không có VÀ Không phải đang thực hiện hành động đăng xuất
    if (user.role == "nguoithue") {
      showthongbao("Bạn đang đăng nhập bằng người thuê", "error");
      navigate("/");
    }
  }, [user, navigate, showthongbao, isLoggingOut]);

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

  //===========================đăng xuất=============================

  const handleLogout = async () => {
    const oke = await showxacnhan("Bạn chắc chắn muốn đăng xuất không?");
    if (oke) {
      // BẬT CỜ ĐĂNG XUẤT LÊN TRƯỚC
      setIsLoggingOut(true);

      // Xóa dữ liệu
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Chuyển trang
      navigate("/dangnhap");
    }
  };


  return (
    <div className="page-chutro">
      {loading && <Loading />}
      <div className="admin-container">
        <div className="admin-header">
          <div className="chutro-avatar">
            <img
              src={
                nguoidung?.avatar
                  ? `https://localhost:7072${nguoidung.avatar}` // Nếu có avatar thì ghép link
                  : Avatar // Nếu null/rỗng thì dùng ảnh mặc định
              }
              alt="avatar"
            />
          </div>
          <div className="admin-title">
            <h4>{nguoidung?.hoTen}</h4>
            <p>{nguoidung?.sdt}</p>
            <p className="ct-email">{nguoidung?.email}</p>
          </div>
        </div>
        <hr></hr>
        <div className="admin-menu">
          <ul className="chutro-menu-list">
            <Link to="/">
              {/* tabindex="0" thuộc tính HTML giúp một phần tử có thể nhận focus */}
              <li tabindex="0" className="active">
                <i class="bxrds  bx-home-alt"></i> Home
              </li>
            </Link>
            <Link to="Dangtin">
              <li tabindex="0">
                <i class="bxr  bx-message-bubble-plus"></i> Đăng tin mới
              </li>
            </Link>
            <Link to="Dstindang">
              <li tabindex="0">
                <i class="bxrds  bx-layout-minus"></i> Tất cả tin đăng
              </li>
            </Link>
            <Link to="">
              <li tabindex="0">
                <i class="bxr  bx-eye-alt"></i> Đang hiển thị
              </li>
            </Link>
            <Link to="">
              <li tabindex="0">
                <i class="bxr  bx-eye-slash"></i> Đã ẩn
              </li>
            </Link>

            <li tabindex="0" onClick={handleLogout} className="ct-dangxuat">
              <i class="bxr  bx-arrow-out-right-square-half"></i> Đăng xuất
            </li>

          </ul>
        </div>
      </div>
      <div className="chutro-container-right">
        {/* nơi hiện components */}
        <Outlet />
      </div>
    </div>
  );
}

export default Chutro;
