import React, { useState, useRef, useEffect, useContext } from "react";
import "/src/styles/admin/baidang.css"; // Import file CSS
import { Link } from "react-router-dom";
import Popbaidangchitiet from "../admin/popbaidangchitiet";
import { Thongbaocontext } from "/src/context/thongbao";
import Loading from "/src/components/UI/loading.jsx";
import API from "/src/services/api.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import { useDelayLoading } from "/src/hooks/useDelayLoading";

function Baidang() {

  //--------------------------thông báo loading--------------------
  // thêm state loading
  const [loading, setLoading] = useState(false);


  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);

  const { showxacnhan } = useContext(Xacnhancontext);
  // 2. SỬ DỤNG HOOK
  // Truyền state loading gốc vào, và set thời gian chờ là 300ms (hoặc 500ms tùy ý)
  // Biến shouldShowLoading này sẽ chỉ true khi loading gốc > 300ms
  const shouldShowLoading = useDelayLoading(loading, 50);

  //---------------------------------hiện popup--------------------------------
  const [ison_of_xembdct, seton_off_xembdct] = useState(false);
  const [idBaidang, setidBaidang] = useState(null);

  //hàm bật tắt popup
  const openChitet = (id) => {
    setidBaidang(id);
    seton_off_xembdct(true);
  };
  // hàm tắt popup
  const closeChitiet = () => {
    seton_off_xembdct(false);
    setidBaidang(null);
  };

  //---------------------------------------------lấy dữ liệu-------------------------------------

  const [dsBaidang, setBaidang] = useState([]);

  // Tạo hàm fetchData ở scope component để có thể gọi lại từ nhiều nơi (ví dụ onSuccess)
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await API.get("Admin/choduyet");
      setBaidang(response.data);
    } catch (err) {
      const loi =
        err.response && err.response.data
          ? typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.message
          : "Không thể kết nối đến máy chủ.";

      showthongbao(loi, "error");
    } finally {
      setLoading(false);
    }
  };

  // Gọi 1 lần khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  //---------------------------------------duyet và cho duyet-------------------------------------------
  const handleDuyet = async (id) => {
    const ok = await showxacnhan("Bạn chắc chắn muốn duyệt tin này!");
    if (!ok) return;
    try {
      await API.put(`Admin/duyet/${id}`);

      showthongbao("Đã duyệt thành công!", "success");
      fetchData();
    } catch {
      showthongbao("Lỗi khi duyệt tin!", "error");
    }
  };

  const handleTuchoi = async (id) => {
    const ok = await showxacnhan("Bạn chắc chắn muốn từ chối tin này!");
    if (!ok) return;
    try {
      await API.put(`Admin/tuchoi/${id}`);
      showthongbao("Đã từ chối tin!", "success");
      fetchData();
    } catch {
      showthongbao("Lỗi khi từ chối tin!", "error");
    }
  };

  return (
    <div className="page">
      {shouldShowLoading && <Loading />}
      <div className="user-content">
        <div>
          <h2>Quản lý bài đăng</h2>
        </div>
      </div>
      <div className="user-data">
        <table className="table-data">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Người đăng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          {/* ----------------------------------- */}
          <tbody className="tbody-dsbd">
            {dsBaidang.map((bd) => {
              return (
                <tr key={bd.baiDangId}>
                  <td>{bd.baiDangId}</td>
                  <td>{bd.tieuDe}</td>
                  <td>{bd.nguoiDang}</td>
                  <td>
                    <div className="td-bt-cd">
                      <i class="bxr  bx-alarm"></i>
                      <span>Chờ duyệt</span>
                    </div>
                  </td>
                  <td>
                    <div className="bd-btn">
                      <button
                        className="bd-btn-xem"
                        onClick={() => openChitet(bd.baiDangId)}
                      // Lấy id bài đăng vào
                      >
                        <i class="bxr  bx-eye"></i>
                      </button>
                      <button className="bd-btn-duyet" onClick={() => handleDuyet(bd.baiDangId)}>
                        <i class="bxr  bx-check"></i>
                      </button>
                      <button className="bd-btn-xem" onClick={() => handleTuchoi(bd.baiDangId)}>
                        <i class="bxr  bx-x"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* <tr>
              <td>01</td>
              <td>
                Phòng Trọ Tách Bếp Riêng Biệt Phòng Ngủ - Cửa Sổ - 35m2 - Ngay
                Cầu Kiệu - ĐH ISB - Chợ Tân Định
              </td>
              <td>Trần tú</td>
              <td>
                <div className="td-bt-cd">
                  <i class="bxr  bx-alarm"></i>
                  <span>Chờ duyệt</span>
                </div>
              </td>
              <td>
                <div className="bd-btn">
                  <button className="bd-btn-xem">
                    <i class="bxr  bx-eye"></i>
                  </button>
                  <button className="bd-btn-duyet">
                    <i class="bxr  bx-check"></i>
                  </button>
                  <button className="bd-btn-xem">
                    <i class="bxr  bx-x"></i>
                  </button>
                </div>
              </td>
            </tr>

            <tr>
              <td>02</td>
              <td>
                {" "}
                Phòng Trọ Tách Bếp Riêng Biệt Phòng Ngủ - Cửa Sổ - 35m2 - Ngay
                Cầu Kiệu - ĐH ISB - Chợ Tân Định
              </td>
              <td>Khánh Hòa</td>
              <td>
                <div className="td-bt-dd">
                  <i class="bxr  bx-check-circle"></i>
                  <span>Đã duyệt</span>
                </div>
              </td>
              <td>
                <button className="bd-btn-xem">Xem chi tiết</button>
              </td>
            </tr>

            <tr>
              <td>03</td>
              <td>
                {" "}
                Phòng Trọ Tách Bếp Riêng Biệt Phòng Ngủ - Cửa Sổ - 35m2 - Ngay
                Cầu Kiệu - ĐH ISB - Chợ Tân Định
              </td>
              <td>Thái Hùng</td>
              <td>
                <div className="td-bt-tc">
                  <i class="bxr  bx-x-circle"></i>
                  <span>Từ chối</span>
                </div>
              </td>
              <td>
                <button className="bd-btn-xem" onClick={openChitet}>
                  Xem chi tiết
                </button>
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>
      {/*--------------- nơi popup hiện ra -----------------*/}
      {/* DÙNG HIỂN THỊ CÓ ĐIỀU KIỆN */}
      {ison_of_xembdct && (
        <Popbaidangchitiet
          id={idBaidang}
          onClose={closeChitiet}
          onSuccess={() => {
            fetchData(); // ✅ reload danh sách khi phê duyệt
            seton_off_xembdct(false); // ✅ đóng popup
          }}
        />
      )}{" "}
      {/*truyền vào id */}
      {/* Toán tử && có nghĩa là: 
            "Nếu isDropdownOpen là true, thì render component <LocationDropdown />"
            
            Chúng ta truyền hàm toggleDropdown vào prop 'onClose' 
            để component con có thể tự đóng chính nó.
          */}
      {/* ------------------------------------------------------ */}
    </div>
  );
}

export default Baidang;
