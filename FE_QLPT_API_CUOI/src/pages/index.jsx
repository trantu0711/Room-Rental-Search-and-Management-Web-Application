import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/style.css"; // Import file CSS
import Img from "../assets/image.png";
import Menu from "../components/layout/menu.jsx";
import axios from "axios"; // 1. THÊM: Import thư viện axios
import API from "/src/services/api.jsx";
import Banner from "../components/layout/banner.jsx";
import Gioithieu from "../components/layout/gioithieu.jsx";
import Footer from "../components/layout/footer.jsx";
import Loading from "/src/components/UI/loading.jsx";
import { Thongbaocontext } from "/src/context/thongbao.jsx";
// 1. THAY THẾ: Import từ thư viện sub-vn
import { getProvinces, getDistricts } from "sub-vn";
import Macdinh from "../assets/Macdinh_01.png";

function Index() {


  // (Thêm state cho 'top posts' nếu bạn gọi API thứ 2)
  // const [topPosts, setTopPosts] = useState([]);

  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Thêm state để quản lý lỗi (error)
  const [error, setError] = useState(null); // khỏi tạo vs tên error để bắt lỗi gtri ban đầu là null setError cập nhật khi xảy ra lỗi

  //------------------------thông báo----------------------------
  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);

  //----------hàm---------------- dùng cho nút xem thêm để hiển thị thêm sp, ban đầu 4 phòng, đếm sl sp
  const [XemThemMN, setXemThemMN] = useState(4);

  const [XemThemDG, setXemThemDG] = useState(4);
  // 3. Hàm "Xem thêm", cộng 4 sp mỗi lần nhấn
  const handxemthemMN = () => {
    setXemThemMN((Count) => Count + 4);
  };

  const handxemthemDG = () => {
    setXemThemDG((Count) => Count + 4);
  };

  //----------------------------------------------------xử lý địa chỉ--------------------------------------------------------
  // cài thư viện npm install sub-vn
  // 2. THÊM: State lưu danh sách địa lý để tra cứu
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);

  // --- Khởi tạo dữ liệu địa lý (Chạy 1 lần) ---
  useEffect(() => {
    setProvinces(getProvinces()); // Lấy toàn bộ tỉnh
    setDistricts(getDistricts()); // Lấy toàn bộ quận (dạng phẳng, không lồng)
  }, []);

  // --- 3. SỬA LẠI: Hàm Helper tra cứu tên (Dùng code/name) ---

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

  // -------------------hàm bật tắt popup loc-----------------------
  //  state quản lý việc mở/đóng lọc ở đây
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // hàm bật/tắt popup lọc
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  //-------------------------------------------------hiển thị ds bai dang ra-----------------------------------
  // Tạo state để lưu trữ dữ liệu từ API
  // 'dsphong' sẽ là một mảng rỗng lúc đầu, tên biến
  const [dsphong, setdsphong] = useState([]); //setdsphong tên hàm cập nhật dsphong, ng dùng định nghĩa

  // Dùng hàm useEffect để gọi API 1 lần duy nhất khi component được tải
  useEffect(() => {
    // Tạo một hàm async có tên là fetData để gọi API
    // setLoading(true);
    const fetchData = async () => {
      try {
        const response = await API.get("BaiDang/laydanhsachbaidang"); // await đợi kq trả về trước khi tiếp tục

        // axios trả dữ liệu về dạng response.data, setdsphong hàm lưu dữ liệu vào state
        setdsphong(response.data);
      } catch (err) {
        // Bắt lỗi nếu gọi API thất bại
        setError(err.message); // thuộc tính js ném ra khi có lỗi
        // showthongbao("Không tải được danh sách phòng trọ." , "error")
      }
      // finally {
      //   setLoading(false);
      // }
    };

    fetchData(); // Gọi hàm
  }, []); // [] (mảng rỗng) = "Chỉ chạy 1 lần duy nhất"

  //-------------------------------------------------hiển thị ds đánh giá cao nhât-----------------------------------

  // Tạo state để lưu trữ dữ liệu từ API
  // 'dsphong' sẽ là một mảng rỗng lúc đầu, tên biến
  const [dsphongdg, setdsphongdg] = useState([]); //setdsphong tên hàm cập nhật dsphong, ng dùng định nghĩa

  // Dùng hàm useEffect để gọi API 1 lần duy nhất khi component được tải
  useEffect(() => {
    // Tạo một hàm async có tên là fetData để gọi API
    // setLoading(true);
    const fetchDatadg = async () => {
      try {
        const response = await API.get("BaiDang/lay_ds_bd_danhgia_caonhat"); // await đợi kq trả về trước khi tiếp tục

        // axios trả dữ liệu về dạng response.data, setdsphong hàm lưu dữ liệu vào state
        setdsphongdg(response.data);
      } catch (err) {
        // Bắt lỗi nếu gọi API thất bại
        setError(err.message); // thuộc tính js ném ra khi có lỗi
        // showthongbao("Không tải được danh sách phòng trọ." , "error")
      }
      // finally {
      //   setLoading(false);
      // }
    };

    fetchDatadg(); // Gọi hàm
  }, []); // [] (mảng rỗng) = "Chỉ chạy 1 lần duy nhất"

  //-----------------------------------------------------------
  // --- THÊM: Hàm xử lý lọc dữ liệu ---
  const handleFilter = async (filterParams) => {
    setLoading(true);
    try {
      // Gọi API lọc
      // API lọc GET có kèm params
      // Ví dụ: API.get("TimKiem/loc", { params: filterParams })

      const response = await API.get("TimKiem/loc", {
        params: filterParams,
      });

      // CẬP NHẬT LẠI DANH SÁCH PHÒNG VỚI DỮ LIỆU ĐÃ LỌC
      setdsphong(response.data);

      // Reset lại số lượng xem thêm về mặc định nếu cần
      setXemThemMN(4);
    } catch (err) {
      console.error("Lỗi lọc:", err);
      if (err.response && err.response.data) {
        const msg =
          err.response.data.message || JSON.stringify(err.response.data);
        showthongbao(msg, "error");
      } else {
        showthongbao("Lỗi kết nối đến máy chủ!", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  //-----------------------------------------------------------
  // --- THÊM: Hàm xử lý tìm kiếm dữ liệu ---
  const handleTimKiem = async (keyword) => {
    if (!keyword || keyword.trim() === "") {
      fetchData(); // Nếu rỗng thì load lại tất cả
      return;
    }
    setLoading(true);
    try {
      // Nhớ thay đổi 'query' thành tên tham số đúng của API bạn (ví dụ: 'content', 'search', v.v.)
      const response = await API.get("TimKiem/timkiem", {
        params: { tukhoa: keyword } //tukhoa phải trùng vs tham số đầu vào be
      });
      setdsphong(response.data);
      setXemThemMN(4);
    } catch (err) {
      console.error("Lỗi lọc:", err);
      if (err.response && err.response.data) {
        const msg =
          err.response.data.message || JSON.stringify(err.response.data);
        showthongbao(msg, "error");
      } else {
        showthongbao("Lỗi kết nối đến máy chủ!", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  // -------------------xử lý nhớ vị trí khi vào chi tiết phòng thoát ra vẫn ở chỗ cũ ko rander lại trang-----------------
  // Cờ đánh dấu: đã scroll về vị trí cũ hay chưa
  // để đảm bảo scroll CHỈ CHẠY 1 LẦN khi trả về đúng vị trí cũ r khi bấm nút xem thêm ko chạy lại vtri đó nữa
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);

  // useEffect này chịu trách nhiệm scroll
  // Nó CHỈ chạy khi:
  // - đã có data (dsphong.length > 0)
  // - đã render đủ số lượng bài (XemThemMN)
  // - và CHƯA scroll lần nào
  useEffect(() => {
    // Nếu đã scroll rồi thì dừng, không làm gì nữa
    if (hasRestoredScroll) return;
    // Nếu chưa có dữ liệu bài đăng thì chưa scroll được
    if (dsphong.length === 0 && dsphongdg.length === 0) return;
    // Lấy ID bài đăng mà user đã click trước đó có lưu tiền tố mn or dg
    const postIdStr = sessionStorage.getItem("lastPostId");
    if (!postIdStr) return;

    // Đợi browser render xong DOM
    const timer = setTimeout(() => {
      // Tìm đúng cái ID duy nhất đó
      const el = document.getElementById(postIdStr);

      if (el) {
        el.scrollIntoView({
          behavior: "auto",
          block: "center",
        });
        setHasRestoredScroll(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [dsphong, dsphongdg, XemThemMN, XemThemDG, hasRestoredScroll]);

  // khôi phục số lượng bài đăng
  useEffect(() => {
    // Lấy số lượng bài đã lưu khi user click vào chi tiết  
    const savedMN = sessionStorage.getItem("XemThemMN");
    const savedDG = sessionStorage.getItem("XemThemDG");
    // Nếu có dữ liệu thì set lại số lượng render
    if (savedMN) setXemThemMN(Number(savedMN));
    if (savedDG) setXemThemDG(Number(savedDG));
  }, []);

  // ---------------------------------------------------------
  //
  // Hàm kiểm tra xem đường dẫn có phải là video hay không
  const checkIsVideo = (url) => {
    if (!url) return false;
    // Kiểm tra các đuôi video phổ biến (mp4, webm, ogg, mov)
    // 'i' để không phân biệt hoa thường (MP4 vẫn nhận)
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  return (
    <div className="index-page">
      {loading && <Loading />}
      <div className="body">
        <div className="menu">
          {/* 3. Truyền state và hàm xuống cho Menu */}
          <Menu
            //* ------xử lý đóng mở popup lọc----------------------------*/
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            onFilter={handleFilter}
            // gọi api tìm kiếm
            onSearch={handleTimKiem}
          />
        </div>
        <div className="banner">
          {/* ------xử lý đóng mở popup lọc---------*/}
          {/* 4. Truyền hàm xuống cho Banner để nút bấm gọi được */}
          <Banner toggleDropdown={toggleDropdown} />
        </div>
        {/* -------------------------------------------------------------- */}
        <div className="form">
          <div className="card-dm">
            <h3>Bài Viết Mới Nhất</h3>
            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div style={{ textAlign: "center", color: "black" }}>
                Không tải được dữ liệu từ server!
              </div>
            )}
            {dsphong &&
              dsphong.length === 0 && ( // kiểm tra nếu mảng rỗng
                <div
                  style={{
                    width: "100%",
                    margin: "auto",
                    color: "black",
                    textAlign: "center",
                  }}
                >
                  Chưa có dữ liệu!
                </div>
              )}
          </div>

          {/* Dùng .map() để lặp qua mảng 'posts' trong state */}
          <div className="list-sp">
            {/* Lặp qua từng phần tử 'ds' trong mảng 'dsphong' */}
            {dsphong.slice(0, XemThemMN).map(
              (
                ds //hàm map của mảng để lấy từ phần tử, slice cắt mảng
              ) => (
                // 'key' dùng để định danh cho từng sp và gán id cho bài đăng

                <div
                  className="card-sp"
                  key={ds.maBaiDang}
                  id={`post-MN-${ds.maBaiDang}`}
                >
                  <Link
                    to={`/Thongtinphong/${ds.maBaiDang}`}
                    onClick={() => {
                      // Lưu ID bài đăng vừa click
                      sessionStorage.setItem("lastPostId", `post-MN-${ds.maBaiDang}`);
                      // Lưu số lượng bài đang render
                      sessionStorage.setItem("XemThemMN", XemThemMN);
                      sessionStorage.setItem("XemThemDG", XemThemDG);
                    }}
                  >
                    <div className="card-img">
                      {/* 1. Kiểm tra có dữ liệu ds.hinhAnh không? */}
                      {ds.hinhAnh ? (
                        // 2. Nếu có, kiểm tra xem đó là Video hay Ảnh?
                        checkIsVideo(ds.hinhAnh) ? (
                          // === NẾU LÀ VIDEO ===
                          <video
                            width="100%"
                            height="100%"
                            controls // Hiện nút play/pause
                            muted // Tắt tiếng mặc định để không gây ồn
                            style={{ objectFit: "cover" }} // Cắt video cho vừa khung đẹp như ảnh
                          >
                            <source src={`https://localhost:7072${ds.hinhAnh}`} type="video/mp4" />
                            Trình duyệt không hỗ trợ thẻ video.
                          </video>
                        ) : (
                          // === NẾU LÀ ẢNH ===
                          <img
                            src={`https://localhost:7072${ds.hinhAnh}`}
                            alt="Ảnh phòng trọ"
                           
                          />
                        )
                      ) : (
                        // 3. Nếu ds.hinhAnh là null/rỗng -> Hiện ảnh mặc định
                        <img src={Macdinh} alt="Mặc định" />
                      )}
                    </div>

                    <div className="card-td">
                      <p>{ds.tieude}</p>
                    </div>

                    <div className="card-gia">
                      <p className="gia">
                        {ds.gia.toLocaleString("vi-VN")} đ/Tháng
                      </p>
                      <p className="dt">{ds.dientich}m²</p>
                    </div>

                    <div className="card-dc">
                      <i class="bxrds bx-location"></i>

                      {`${getTenTinh(ds.tinhthanh)}`}
                    </div>
                  </Link>
                </div>
              )
            )}
          </div>
          <div className="btn-xemthem">
            {XemThemMN < dsphong.length && (
              <button onClick={handxemthemMN}>xem thêm</button>
            )}
          </div>
        </div>

        {/* ----------------------------------------------------------bai dang đánh giá cao ------------------------------------------------------- */}

        <div className="form2">
          <div className="card-dm">
            <h3>Bài Viết Đánh Giá Cao Nhất</h3>
            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div style={{ textAlign: "center", color: "black" }}>
                Không tải được dữ liệu từ server!
              </div>
            )}
            {dsphong &&
              dsphong.length === 0 && ( // kiểm tra nếu mảng rỗng
                <div
                  style={{
                    width: "100%",
                    margin: "auto",
                    color: "black",
                    textAlign: "center",
                  }}
                >
                  Chưa có dữ liệu!
                </div>
              )}
          </div>

          {/* Dùng .map() để lặp qua mảng 'posts' trong state */}
          <div className="list-sp">
            {/* Lặp qua từng phần tử 'ds' trong mảng 'dsphong' */}

            {dsphongdg.slice(0, XemThemDG).map(
              (
                ds //hàm map của mảng để lấy từ phần tử, slice cắt mảng
              ) => (
                // 'key' dùng để định danh cho từng sp
                <div
                  className="card-sp"
                  key={ds.maBaiDang}
                  id={`post-DG-${ds.maBaiDang}`}
                >
                  <Link
                    to={`/Thongtinphong/${ds.maBaiDang}`}
                    onClick={() => {
                      // Lưu ID bài đăng vừa click
                      sessionStorage.setItem("lastPostId", `post-DG-${ds.maBaiDang}`);
                      // Lưu số lượng bài đang render
                      sessionStorage.setItem("XemThemMN", XemThemMN);
                      sessionStorage.setItem("XemThemDG", XemThemDG);
                    }}
                  >
                    <div className="card-img">
                      {/* API hình ảnh
                       */}
                      <img src={ds.hinhAnh ? (`https://localhost:7072${ds.hinhAnh}`) : Macdinh}></img>
                    </div>

                    <div className="card-td">
                      <p>{ds.tieude}</p>
                    </div>

                    <div className="card-gia">
                      <p className="gia">
                        {ds.gia.toLocaleString("vi-VN")} đ/Tháng
                      </p>
                      <p className="dt">{ds.dientich}m²</p>
                    </div>

                    <div className="card-dc">
                      <i class="bxrds bx-location"></i>

                      {`${getTenTinh(ds.tinhthanh)}`}
                    </div>
                  </Link>
                </div>
              )
            )}
          </div>
          <div className="btn-xemthem">
            {XemThemDG < dsphongdg.length && (
              <button onClick={handxemthemDG}>xem thêm</button>
            )}
          </div>
        </div>
        {/* -----------------------giới thiệu------------------------------- */}
        <div>
          <Gioithieu />
        </div>
      </div>
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
}

export default Index;
