import React, { useState, useEffect, useContext } from "react";
import "/src/styles/chutro/dstindang.css"; // Import file CSS
import Img from "/src/assets/image.png";
import { Thongbaocontext } from "/src/context/thongbao";
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import API from "/src/services/api.jsx";
import { getProvinces, getDistricts } from "sub-vn";
import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import Popupthanhtoan from "/src/pages/chutro/popupthanhtoan.jsx";
import "/src/styles/chutro/dangtin.css"; // Import file CSS
import Macdinh from "/src/assets/Macdinh_01.png";
import { useDelayLoading } from "/src/hooks/useDelayLoading";

function Dstindang() {
  //--------------------------thông báo loading--------------------
  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);

  const { showxacnhan } = useContext(Xacnhancontext);
  const shouldShowLoading = useDelayLoading(loading, 50);
  //-------------------------------------------------------------------------------

  // lấy dữ liệu từ toke khi đăng nhập
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  //-------------------------------------------------hiển thị ds bai dang ra-----------------------------------
  const [dsbaidang, setdsbaidang] = useState([]); //setdsphong tên hàm cập nhật dsphong, ng dùng định nghĩa
  // Dùng hàm useEffect để gọi API 1 lần duy nhất khi component được tải

  useEffect(() => {
    // Tạo một hàm async có tên là fetData để gọi API

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await API.get(
          `BaiDang/dsbaidang_chutro/${user.userId}`
        ); // await đợi kq trả về trước khi tiếp tục

        // axios trả dữ liệu về dạng response.data, setdsphong hàm lưu dữ liệu vào state
        setdsbaidang(response.data);

        // (Nếu bạn có API thứ 2 cho "Top Posts", hãy gọi nó ở đây)
        // const topResponse = await axios.get('http://localhost:7255/api/phongtro/top-rated');
        // setTopPosts(topResponse.data);
      } catch (err) {
        // Bắt lỗi nếu gọi API thất bại - dùng showthongbao thay vì setError (không tồn tại)
        const loi =
          err.response && err.response.data
            ? typeof err.response.data === "string"
              ? err.response.data
              : err.response.data.message
            : err.message || "Không thể kết nối đến máy chủ.";

        showthongbao(loi, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Gọi hàm
  }, []); // [] (mảng rỗng) = "Chỉ chạy 1 lần duy nhất"

  // 2. THÊM: State lưu danh sách địa lý để tra cứu
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);

  // --- Khởi tạo dữ liệu địa lý (Chạy 1 lần) ---
  useEffect(() => {
    setProvinces(getProvinces()); // Lấy toàn bộ tỉnh
    setDistricts(getDistricts()); // Lấy toàn bộ quận (dạng phẳng, không lồng)
  }, []);

  const getTenTinh = (idTinh) => {
    if (!idTinh) return "Chưa cập nhật";
    // Thư viện dùng 'code' thay vì 'Id'
    const tinh = provinces.find((item) => item.code == idTinh);
    // Thư viện dùng 'name' thay vì 'Name'
    return tinh ? tinh.name : idTinh;
  };

  const getTenQuan = (idQuan) => {
    if (!idQuan) return "";
    // Vì getDistricts() trả về danh sách phẳng nên ta tìm trực tiếp luôn
    // Không cần vòng lặp lồng nhau phức tạp như cũ
    const quan = districts.find((item) => item.code == idQuan);
    return quan ? quan.name : idQuan;
  };

  //-------------------------------xử lý sửa ----------------------
  // 2. Khai báo hook điều hướng
  const navigate = useNavigate();
  // 3. Hàm xử lý khi bấm nút Sửa
  const handleEditRedirect = (e, idBaiDang) => {
    e.preventDefault(); // Chặn thẻ Link chuyển trang
    e.stopPropagation(); // Chặn sự kiện lan ra ngoài

    navigate(`/Chutro/SuaBaiDang/${idBaiDang}`);
  };

  const handleAnBaiDang = async (e, idBaiDang) => {
    e.preventDefault(); // Chặn thẻ Link chuyển trang
    e.stopPropagation(); // Chặn sự kiện lan ra ngoài

    try {
      // Gọi API để cập nhật trạng thái (Giả sử bạn có API PUT/POST để ẩn)
      // Ví dụ: API.put(`BaiDang/anbaidang/${idBaiDang}`)
      await API.put(`BaiDang/Anbaidang/${idBaiDang}`, {
        trangthai: "Đã ẩn",
      });
      // Ở đây mình ví dụ gọi API, bạn sửa đường dẫn cho đúng Backend nhé

      showthongbao("Đã cập nhật trạng thái bài đăng!", "success");

      // Cập nhật lại danh sách ngay lập tức để giao diện thay đổi
      setdsbaidang((prev) =>
        prev.map((item) =>
          item.maBaiDang === idBaiDang
            ? { ...item, trangthai: "Đã ẩn" } // Cập nhật state cục bộ
            : item
        )
      );
    } catch (err) {
      showthongbao("Lỗi khi ẩn bài đăng", "error");
    }
  };
  const handleMoBaiDang = async (e, idBaiDang) => {
    e.preventDefault(); // Chặn thẻ Link chuyển trang
    e.stopPropagation(); // Chặn sự kiện lan ra ngoài

    try {
      // Gọi API để cập nhật trạng thái (Giả sử bạn có API PUT/POST để ẩn)
      // Ví dụ: API.put(`BaiDang/anbaidang/${idBaiDang}`)
      await API.put(`BaiDang/Mobaidang/${idBaiDang}`, {
        trangthai: "Đã ẩn",
      });
      // Ở đây mình ví dụ gọi API, bạn sửa đường dẫn cho đúng Backend nhé

      showthongbao("Đã cập nhật trạng thái bài đăng!", "success");

      // Cập nhật lại danh sách ngay lập tức để giao diện thay đổi
      setdsbaidang((prev) =>
        prev.map((item) =>
          item.maBaiDang === idBaiDang
            ? { ...item, trangthai: "Đang đăng" } // Cập nhật state cục bộ
            : item
        )
      );
    } catch (err) {
      showthongbao("Lỗi khi ẩn bài đăng", "error");
    }
  };
  // 4. Hàm xử lý nút Xóa (Tạm thời chỉ chặn click)
  const handleDelete = (e, idBaiDang) => {
    e.preventDefault();
    e.stopPropagation();
    // Gọi logic xóa ở đây (ví dụ hiện popup xác nhận)
    showthongbao("Chức năng xóa đang phát triển", "error");
  };

  //-------------------------------------mở thanh toán ---------------------------------
  const [ison_off_thanhtoan, seton_off_thanhtoan] = useState(false);

  // Hàm để bật/tắt popup

  const [idBaidang, setidBaidang] = useState(null);

  //hàm bật tắt popup
  const openthanhtoan = (id) => {
    setidBaidang(id);
    seton_off_thanhtoan(true);
  };

  // hàm tắt popup
  const closethanhtoan = () => {
    seton_off_thanhtoan(false);
    setidBaidang(null);
  };

  // lấy đường dẫn file hình ra trước
  const filePdfPath = dsbaidang.hinhANH;


  // Hàm kiểm tra xem đường dẫn có phải là video hay không
  const checkIsVideo = (url) => {
    if (!url) return false;
    // Kiểm tra các đuôi video phổ biến (mp4, webm, ogg, mov)
    // 'i' để không phân biệt hoa thường (MP4 vẫn nhận)
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  return (
    <div className="body-dstindang">
      {shouldShowLoading && <Loading />}

      {/*--------------- nơi popup hiện ra -----------------*/}
      {/* DÙNG HIỂN THỊ CÓ ĐIỀU KIỆN */}
      {ison_off_thanhtoan && (
        <Popupthanhtoan onClose={closethanhtoan} baidangid={idBaidang} />
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

      {/* ------------------phần ruột------------- */}

      <div className="page-ds">
        {loading && <Loading />}
        {dsbaidang &&
          dsbaidang.length === 0 && ( // kiểm tra nếu mảng rỗng
            <div className="ds-macdinh"

            >
              <i class='bxr  bx-folder-x'></i>

              <span>Không tìm thấy tin nào!</span>
            </div>
          )}
        <div className="list-ds">
          {dsbaidang.map((ds) => {
            // lấy đường dẫn file hình ra trước
            const filePdfPath = ds.hinhAnh;
            return (
              <div className="card-ds">
                <Link to={`/Chutro/Dsphong/${ds.maBaiDang}`} key={ds.maBaiDang}>
                  <div className="card-img">
                    {checkIsVideo(filePdfPath) ? (
                      <video
                        className="main-img"
                        src={filePdfPath ? (`https://localhost:7072${filePdfPath}`) : Macdinh}
                        controls
                        autoPlay // Tự động chạy khi bấm vào
                        style={{ backgroundColor: "black", objectFit: "contain" }} // Video nên có nền đen
                      >
                        Trình duyệt không hỗ trợ video.
                      </video>
                    ) : (

                      <img
                        src={filePdfPath ? (`https://localhost:7072${filePdfPath}`) : Macdinh}
                        alt="Hình ảnh"
                      />
                    )}
                  </div>

                  <div className="card-td">
                    <p>{ds.tieude || "Không có tiêu đề"}</p>
                  </div>

                  <div className="div-nd">
                    <div className="div-ma">
                      <p className="p-ma">
                        <i class="bxr  bx-key"></i>Mã tin: {ds.maBaiDang}
                      </p>
                      <p
                        className="p-trangthai"
                        style={{
                          color:
                            ds.trangthai === "Đang đăng"
                              ? "green"
                              : ds.trangthai === "Chờ duyệt" ||
                                ds.trangthai === "Chưa thanh toán"
                                ? "#d4a017"
                                : "red",
                        }}
                      >
                        {ds.trangthai}
                      </p>
                    </div>

                    <div className="card-gia">
                      <p className="p-gia">
                        {ds.gia.toLocaleString("vi-VN")} đ/Tháng
                      </p>
                      <p className="p-dt">{ds.dientich} m2</p>
                    </div>

                    <div className="card-dc">
                      <i className="bxrds bx-location"></i>
                      {/* {`${getTenTinh(ds.tinhthanh)}`},  */}
                      {`${getTenQuan(ds.quanhuyen)}`}
                    </div>

                    <div className="card-dc">
                      <i class='bxr  bx-calendar-alt-2'></i>
                      <p className="p-ngayhh"> Ngày hết hạn: {ds.ngayhethan}</p>
                    </div>
                  </div>
                </Link>
                <div className="btn-ds">
                  <button
                    className="btn-ds-sua"
                    onClick={(e) => handleEditRedirect(e, ds.maBaiDang)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn-ds-xoa"
                    onClick={(e) => handleDelete(e, ds.maBaiDang)}
                  >
                    Xóa
                  </button>
                </div>
                {ds.trangthai === "Chưa thanh toán" ? (
                  <button
                    className="btn-ds-thanhtoan"
                    onClick={() => openthanhtoan(ds.maBaiDang)}
                  >
                    Thanh toán ngay
                  </button>
                ) : ds.trangthai === "Đang đăng" || ds.trangthai === "Đã ẩn" ? (
                  <div className="btn-ds-anmo">
                    {ds.trangthai === "Đang đăng" ? (
                      <button
                        className="btn-ds-thanhtoan"
                        onClick={(e) => handleAnBaiDang(e, ds.maBaiDang)}
                      >
                        Ẩn
                      </button>
                    ) : (
                      <button
                        className="btn-ds-thanhtoan"
                        onClick={(e) => handleMoBaiDang(e, ds.maBaiDang)}
                      >
                        Mở
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="btn-ds-anmo">
                    {ds.trangthai === "Đang đăng" ? (
                      <button
                        className="btn-ds-thanhtoan"
                        onClick={(e) => handleAnBaiDang(e, ds.maBaiDang)}
                        disabled={true}
                      >
                        Ẩn
                      </button>
                    ) : (
                      <button
                        className="btn-ds-thanhtoan"
                        onClick={(e) => handleMoBaiDang(e, ds.maBaiDang)}
                        disabled={true}
                      >
                        Mở
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {/* ------------------------------------------ */}
        </div>

        {/* <div className="btn-ds-xt">
          <button>xem thêm</button>
        </div> */}
      </div>
      {/* ----------------------------hết phần ruột------------------------------ */}

      {/* ---------------------------------------------------------- */}
    </div>
  );
}

export default Dstindang;
