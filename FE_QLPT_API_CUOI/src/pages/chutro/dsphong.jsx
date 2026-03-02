// con của tin đăng vd tin đăng có sl phòng là 3 thì hiện 3 phòng
import React, { useRef, useState, useContext, useEffect } from "react"; // <-- Thêm useRef
import "/src/styles/chutro/dsphong.css";
import Thanhgat3nac from "../../components/UI/thanhgat3nac";
import { Link, Outlet, useParams } from "react-router-dom";
import API from "/src/services/api.jsx";
import Popuphopdong from "./popuphopdong";
import Popupxemchitiethopdong from "./xemchitiethopdong";
import { Xacnhancontext } from "../../context/xacnhan";
import Loading from "/src/components/UI/loading.jsx";
import { Thongbaocontext } from "../../context/thongbao";

function Dsphong({ }) {
  const [dsphong, setdsphong] = useState([]); //setdsphong tên hàm cập nhật dsphong, ng dùng định nghĩa
  const { id } = useParams(); // Lấy ID từ URL
   //==========================thông báo và loading===========================
  
    //--------------------------thông báo loading--------------------
    const [loading, setLoading] = useState(false);
    const { showthongbao } = useContext(Thongbaocontext);
    const { showxacnhan } = useContext(Xacnhancontext);
  

  // Thêm state để quản lý lỗi (error)
  const [error, setError] = useState(null); // khỏi tạo vs tên error để bắt lỗi gtri ban đầu là null setError cập nhật khi xảy ra lỗi


    // Tạo một hàm async có tên là fetData để gọi API
    const fetchData = async () => {
      try {
        const response = await API.get(`PhongTro/theobaidang/${id}`); // await đợi kq trả về trước khi tiếp tục

        // axios trả dữ liệu về dạng response.data, setdsphong hàm lưu dữ liệu vào state
        setdsphong(response.data);

        const dataWithStatus = response.data.map((p) => ({
          ...p,
          status: mapTrangThaiToNumber(p.trangThaiPhong),
        }));

        setdsphong(dataWithStatus);

        // (Nếu bạn có API thứ 2 cho "Top Posts", hãy gọi nó ở đây)
        // const topResponse = await axios.get('http://localhost:7255/api/phongtro/top-rated');
        // setTopPosts(topResponse.data);
      } catch (err) {
        // Bắt lỗi nếu gọi API thất bại
        setError(err.message); // thuộc tính js ném ra khi có lỗi
      }
    };


  useEffect(() => {
    fetchData();
  }, []);

  //------------------- xử lý trạng thái phòng

  const mapTrangThaiToNumber = (trangThai) => {
    switch (trangThai) {
      case "Còn trống":
        return 0;
      case "Đã thuê":
        return 1;
      case "Sửa chữa":
        return 2;
      default:
        return 0;
    }
  };
  const mapNumberToString = (num) => {
    switch (num) {
      case 0:
        return "Còn trống";
      case 1:
        return "Đã thuê";
      case 2:
        return "Sửa chữa";
      default:
        return "Còn trống";
    }
  };
  const handleChangeStatus = async (phongTroId, newStatus) => {
    // A. Cập nhật giao diện NGAY LẬP TỨC (Optimistic UI)
    setdsphong((prev) =>
      prev.map((p) =>
        p.phongTroId === phongTroId ? { ...p, status: newStatus } : p
      )
    );

    // B. Gọi API Backend để lưu
    try {
      // SỬA LỖI Ở ĐÂY: Phải dùng hàm mapNumberToString
      const textTrangThai = mapNumberToString(newStatus);

      // Gọi API PUT
      await API.put(
        `PhongTro/trangthai/${phongTroId}?trangthaimoi=${encodeURIComponent(
          textTrangThai
        )}`
      );

      console.log(`Đã lưu phòng ${phongTroId} thành: ${textTrangThai}`);
    } catch (err) {
      console.error("Lỗi lưu trạng thái:", err);
      // Nếu cần kỹ hơn, chỗ này nên revert lại state cũ nếu lỗi mạng
    }
  };

  //-------------------------------------mở hơp đồng  ---------------------------------
  const [ison_off_hopdong, seton_off_hopdong] = useState(false);
  const [Id_phong, setId_phong] = useState(null);
// Hàm để bật/tắt popup
  const on_off_hopdong = () => {
    seton_off_hopdong((prev) => !prev);
    // Khi đóng popup, bạn có thể reset ID về null nếu muốn (không bắt buộc)
    if (ison_off_hopdong) setId_phong(null);
  };

  // --- HÀM XỬ LÝ KHI CLICK NÚT SỬA ---
  const handleOpenPopup = (phongId) => {
    setId_phong(phongId); // Lưu ID phòng
    seton_off_hopdong(true);     // Mở popup
  };

    //-------------------------------------mở chi tiết hơp đồng  ---------------------------------
  const [ison_off_cthopdong, seton_off_cthopdong] = useState(false);
  const [Id_ctphong, setId_ctphong] = useState(null);
// Hàm để bật/tắt popup
  const on_off_cthopdong = () => {
    seton_off_cthopdong((prev) => !prev);
    // Khi đóng popup, bạn có thể reset ID về null nếu muốn (không bắt buộc)
    if (ison_off_cthopdong) setId_ctphong(null);
  };

  // --- HÀM XỬ LÝ KHI CLICK NÚT SỬA ---
  const handleOpenPopupct = (phongId) => {
    setId_ctphong(phongId); // Lưu ID phòng
    seton_off_cthopdong(true);     // Mở popup
  };


  return (
    <div className="dsphong-card">
      {/*--------------- nơi popup hiện ra -----------------*/}
      {/* DÙNG HIỂN THỊ CÓ ĐIỀU KIỆN */}
      {ison_off_hopdong && (
        <Popuphopdong onClose={on_off_hopdong} phongId={Id_phong} onSuccess={fetchData} />
      )}
      {/* Toán tử && có nghĩa là: 
                  "Nếu isDropdownOpen là true, thì render component <LocationDropdown />"
                  
                  Chúng ta truyền hàm toggleDropdown vào prop 'onClose' 
                  để component con có thể tự đóng chính nó.
                */}
      {/* ------------------------------------------------------ */}

      {/*--------------- nơi popup cthopdong hiện ra -----------------*/}
      {/* DÙNG HIỂN THỊ CÓ ĐIỀU KIỆN */}
      {ison_off_cthopdong && (
        <Popupxemchitiethopdong onClose={on_off_cthopdong} phongId={Id_ctphong} />
      )}
      {/* Toán tử && có nghĩa là: 
                  "Nếu isDropdownOpen là true, thì render component <LocationDropdown />"
                  
                  Chúng ta truyền hàm toggleDropdown vào prop 'onClose' 
                  để component con có thể tự đóng chính nó.
                */}
      {/* ------------------------------------------------------ */}

      {/* css kế thừa từ dangtin */}
      <div className="content-ds">
        <p className="p-content-ds">Danh sách tin đăng</p>
        <div className="menu-ghim">
          {/* tabindex="0" thuộc tính HTML giúp một phần tử có thể nhận focus */}
          <div>Tất cả</div>
        </div>
        {/* thanh tìm kiếm */}
        {/* <div className="page-ds-tk">
          <i class="bxr  bx-scan-search"></i>
          <input
            className="input-timkiem"
            type="text"
            placeholder="Thứ bạn cần là gì..."
          />
        </div> */}
        {/* ------------------------ */}
      </div>
      <br />
      <div className="dsp-data">
        <table className="table-dsp-data">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên phòng</th>
              <th>Giá</th>
              <th>Số người</th>
              <th>Diện tích</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          {/* ----------------------------------- */}
          <tbody>
            {dsphong.map((ds) => {
              return (
                <tr>
                  <td>{ds.phongTroId}</td>
                  <td>{ds.tenPhong}</td>
                  <td>{ds.giaThue}</td>
                  <td>{ds.soNguoi}</td>
                  <td>{ds.dienTich}</td>
                  <td>
                    <div className="dsp-tg">
                      <Thanhgat3nac
                        value={ds.status}
                        onChange={(newValue) =>
                          handleChangeStatus(ds.phongTroId, newValue)
                        }
                      />
                      <span className="tt">
                        {ds.status === 0 && "Trống"}
                        {ds.status === 1 && "Đã thuê"}
                        {ds.status === 2 && "Sửa chữa"}
                      </span>
                    </div>
                  </td>
                  <td>
                    {ds.status === 0 ? (
                    <button className="bd-btn-duyet" onClick={() => handleOpenPopup(ds.phongTroId)}>
                      <i class='bxr  bx-pen-draw'></i>
                    </button>
                    ) : (
                    <button className="bd-btn-duyet" onClick={() => handleOpenPopupct(ds.phongTroId)}>
                      xem
                    </button>
                    )}
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

export default Dsphong;
