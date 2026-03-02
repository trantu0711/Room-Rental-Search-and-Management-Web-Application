import React, { useState, useRef, useEffect, useContext } from "react";
import "/src/styles/admin/user.css"; // Import file CSS
import Thanhgat from "/src/components/UI/thanhgat.jsx";
import { Thongbaocontext } from "/src/context/thongbao";
import Loading from "/src/components/UI/loading.jsx";
import API from "/src/services/api.jsx";
import { Xacnhancontext } from "../../context/xacnhan";

function User() {
  //--------------------------thông báo loading--------------------
  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);

  const { showxacnhan } = useContext(Xacnhancontext);
  //-------------------------------------------------------------------------------

  const [dsUser, setUser] = useState([]);
  // Dùng hàm useEffect để gọi API 1 lần duy nhất khi component được tải
  useEffect(() => {
    // Tạo một hàm async có tên là fetData để gọi API
    // Bắt đầu tải dữ liệu
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await API.get("Admin/laydanhsachnguoidung"); // await đợi kq trả về trước khi tiếp tục

        // axios trả dữ liệu về dạng response.data, setdsphong hàm lưu dữ liệu vào state
        setUser(response.data);

        // (Nếu bạn có API thứ 2 cho "Top Posts", hãy gọi nó ở đây)
        // const topResponse = await axios.get('http://localhost:7255/api/phongtro/top-rated');
        // setTopPosts(topResponse.data);
      } catch (err) {
        // Bắt lỗi nếu gọi API thất bại lỗi gửi từ be
        const loi =
          err.response && err.response.data
            ? typeof err.response.data === "string"
              ? err.response.data
              : err.response.data.message
            : "Không thể kết nối đến máy chủ.";

        showthongbao(loi, "error");
        // showthongbao("Không tải được danh sách phòng trọ." , "error")
      } finally {
        // 2. Sau khi API chạy xong (dù lỗi hay thành công), tắt loading
        setLoading(false);
      }
    };

    fetchData(); // Gọi hàm
  }, []); // [] (mảng rỗng) = "Chỉ chạy 1 lần duy nhất"

  //-------------------------------trạng thái-----------------------------------------

  const handleToggleTrangThai = async (userId) => {
    // 1. Tìm thông tin user hiện tại trong danh sách
    const userHienTai = dsUser.find((u) => u.userId === userId);
    if (!userHienTai) return;

    // 2. Xác định trạng thái hiện tại (dùng toLowerCase để an toàn)
    const isDangHoatDong = userHienTai.trangThai?.toLowerCase() === "hoạt động";

    // 3. Tạo câu hỏi tùy biến
    const cauHoi = isDangHoatDong
      ? `Bạn chắc chắn muốn KHÓA người dùng không?`
      : `Bạn chắc chắn muốn MỞ KHÓA người dùng không?`;

    try {
      // 4. Hiển thị xác nhận
      const oke = await showxacnhan(cauHoi);

      if (oke) {
        setLoading(true); // Chỉ bật loading sau khi người dùng bấm "Đồng ý"
        await API.put(`Admin/khoa-mo/${userId}`);

        // 5. Cập nhật state nội bộ
        setUser((prev) =>
          prev.map((u) =>
            u.userId === userId
              ? {
                  ...u,
                  trangThai: isDangHoatDong ? "Bị khóa" : "Hoạt Động",
                }
              : u
          )
        );

        // Thông báo thành công cũng nên tùy biến
        const thongBaoThanhCong = isDangHoatDong
          ? "Đã khóa tài khoản"
          : "Đã mở khóa tài khoản";
        showthongbao(thongBaoThanhCong, "success");
      }
    } catch (err) {
      showthongbao("Không thể cập nhật trạng thái", "error");
    } finally {
      setLoading(false);
    }
  };
  //------------------------------------------------------------------------
  return (
    <div className="page">
      {loading && <Loading />} {/* Hiển thị loading khi đang tải */}
      <div className="user-content">
        <div>
          <h2>Quản lý Người Dùng</h2>
        </div>
      </div>
      <div className="user-data">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ Tên</th>
              <th>SDT</th>
              <th>CCCD</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          {/* ----------------------------------- */}
          <tbody>
            {dsUser.map((u) => {
              const isActive = u.trangThai?.toLowerCase() === "hoạt động";

              return (
                <tr key={u.userId}>
                  <td>{u.userId}</td>
                  <td>{u.hoTen}</td>
                  <td>{u.sdt}</td>
                  <td>cccd</td>
                  <td>{u.role}</td>

                  <td>
                    {u.role == "Admin" ? (
                      <span>Không thể khóa</span>
                    ) : (
                      <div className="us-tt">
                        <Thanhgat
                          isChecked={isActive}
                          onChange={() => handleToggleTrangThai(u.userId)}
                        />
                        <span className={isActive ? "active" : "locked"}>
                          {isActive ? "Active" : "Locked"}
                        </span>
                      </div>
                    )}
                  </td>

                  <td>
                    <button className="btn-sua">
                      <i className="bx bx-edit-alt"></i>
                    </button>
                    <button className="btn-xoa">
                      <i className="bx bx-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default User;
