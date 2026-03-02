import React, { useState, useRef, useEffect, useContext } from "react";
import "../styles/thongtinphong.css"; // Import file CSS
import Menu from "../components/layout/menu.jsx";
import Avatar from "/src/assets/avatar.png";
import Img from "../assets/image.png";
import { Link, Outlet, useParams } from "react-router-dom";
import API from "/src/services/api.jsx";
import Poplienhe from "./nguoithue/poplienhe.jsx";
import { Thongbaocontext } from "/src/context/thongbao";
import Loading from "/src/components/UI/loading.jsx";
import { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } from "sub-vn";
import Popupxemhd from "/src/pages/nguoithue/popupxemhd.jsx";
import Macdinh from "../assets/Macdinh_01.png";


// const images = [
//   "/src/assets/avatar.png",
//   "/src/assets/image.png",
//   "/src/assets/image.png",
//   "/src/assets/image.png",
//   "/src/assets/image.png",
//   "/src/assets/image.png",
//   "/src/assets/image.png",
//   "/src/assets/image.png",
//   "/src/assets/image.png",
//   // ... thêm nhiều ảnh nữa
// ];

// tối đa 6 hình con 
const MAX_THUMB = 6;
const BASE_URL = "https://localhost:7072";

function Thongtinphong() {
  // --- Helper: Đổi ID Tỉnh/Huyện sang Tên ---
  // Tên tỉnh theo code
  const getTenTinh = (code) => {
    const tinh = getProvinces().find((t) => t.code == code);
    return tinh ? tinh.name : "";
  };

  // Tên huyện theo province + district
  const getTenQuan = (provinceCode, districtCode) => {
    if (!provinceCode) return "";
    if (!districtCode) return "";

    const districts = getDistrictsByProvinceCode(provinceCode);
    const quan = districts?.find((d) => d.code == districtCode);

    return quan ? quan.name : "";
  };

  // Tên xã theo district + ward code
  const getTenXa = (districtCode, wardCode) => {
    if (!districtCode) return "";
    if (!wardCode) return "";

    // Lấy danh sách xã/phường dựa trên mã huyện
    const wards = getWardsByDistrictCode(districtCode);
    // Tìm xã/phường cụ thể
    const xa = wards?.find((w) => w.code == wardCode);

    return xa ? xa.name : "";
  };

  //--------------------------thông báo loading--------------------
  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);
  //-------------------------------------------------------------------------------

  // ---------------------2 nút của hình lớn--------------------------

  const goPrev = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const goNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  // ---------------------2 nút của ds hình nhỏ--------------------------
  const thumbRef = useRef(null);

  const scrollThumbnails = (dir) => {
    if (!thumbRef.current) return;
    const itemWidth = 100; // width approx (thumbnail + gap)
    thumbRef.current.scrollLeft += dir * itemWidth;
  };

  // ---------------------popup liên hệ--------------------------

  const [ison_of_lienhe, seton_off_lienhe] = useState(false);

  //hàm bật tắt popup
  const on_off_lienhe = () => {
    seton_off_lienhe((prevv) => !prevv);
    // Dùng 'prev => !prev' để đảm bảo luôn lấy giá trị mới nhất
  };

  //============================================================================
  //========================chi tiết phòng==============================

  // State quản lý Slide ảnh
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const { id } = useParams(); // Lấy ID từ URL
  const [phong, setPhong] = useState(null); // chưa thông tin phòng
  // --- Gọi API lấy chi tiết phòng ---


  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy chi tiết phòng hiện tại
      const resDetail = await API.get(`BaiDang/chitietbaidang/${id}`);
      console.log("Dữ liệu phòng:", resDetail.data);
      setPhong(resDetail.data);

      // Xử lý ảnh
      if (
        resDetail.data.anhPhongTros &&
        resDetail.data.anhPhongTros.length > 0
      ) {
        const imgUrls = resDetail.data.anhPhongTros.map(
          (a) => `${BASE_URL}${a.url}`
        );
        setImages(imgUrls);
        setSelectedImage(imgUrls[0]);
        setCurrentIndex(0); // Reset về ảnh đầu tiên
      } else {
        // setImages([Macdinh]);
        setSelectedImage(ImgDefault);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // Khi chuyển sang trang chi tiết mới, cuộn lên đầu trang
    window.scrollTo(0, 0);
    // Reset state khi ID thay đổi (quan trọng khi bấm vào phòng tương tự)
    setLoading(true);
    fetchData();
  }, [id]);

  //--------------------phần phòng tương tự--------------------
  const [dsbaidangtt, setdsbdtt] = useState([]); //setdsphong tên hàm cập nhật dsphong, ng dùng định nghĩa

  useEffect(() => {
    // Chỉ chạy khi đã có thông tin phòng hiện tại
    if (phong && phong.quanXa) {
      const fetchDatatt = async () => {
        try {
          const response = await API.get(
            `BaiDang/dsbaidang_tuongtu/${phong.quanXa}`
          );

          const dsGoc = response.data;
          // 2. So sánh với 'id' lấy từ URL (biến id từ useParams) để chắc chắn chính xác
          // 3. Dùng != (2 dấu bằng) để so sánh lỏng (tránh lỗi 1 bên là chuỗi, 1 bên là số)
          //item.maBaiDang là mã của ds phòng tương tự
          const dsDaLoc = dsGoc.filter(
            (item) => item.maBaiDang != id
          );
          // ------------------------

          setdsbdtt(dsDaLoc);

        } catch (err) {
          console.log("Lỗi tải phòng tương tự", err);
        }
      };

      fetchDatatt();
    }
  }, [phong, id]); // Thêm id vào dependency cho chắc

  //--------------------------xử lý comment ----------------------
  const [danhGias, setDanhGias] = useState([]); // Lưu danh sách lấy từ API
  const [noiDung, setNoiDung] = useState(""); // Lưu nội dung đang nhập
  // --- MỚI: State lưu số sao đang chọn (Mặc định 5 sao) ---
  const [soSao, setSoSao] = useState(5);

  // --- MỚI: Hàm hỗ trợ vẽ ngôi sao hiển thị (cho phần lịch sử comment) ---
  const renderStars = (diem) => {
    const stars = [];  // mảng rỗng chứa ngôi sao đã đc tô màu và chưa tô màu (html)
    // Ép kiểu về số thực cho chắc chắn
    const score = parseFloat(diem || 0);

    for (let i = 1; i <= 5; i++) {
      let iconClass = "bxr bxs-star"; // Mặc định là hình ngôi sao chuẩn
      let color = "#ccc";             // Mặc định là màu xám (rỗng)

      if (score >= i) {
        // TRƯỜNG HỢP 1: Điểm >= i -> Sao đầy màu tím
        iconClass = "bxr bxs-star";
        color = "#9c6ade";
      } else if (score >= i - 0.5) {
        // TRƯỜNG HỢP 2: Điểm >= i - 0.5 (Ví dụ: điểm 3.5 thì sao thứ 4 sẽ dính case này) -> Sao nửa
        iconClass = "bxr bxs-star-half";
        color = "#9c6ade";
      }
      // TRƯỜNG HỢP 3: Còn lại là sao rỗng (giữ nguyên mặc định màu xám)
      stars.push( // nhét ngôi sao và mảng stars (push dùng đển đẩy hoặc nhét vào)
        <i
          key={i}
          className={iconClass}
          style={{
            color: color,
            fontSize: "14px",
            marginRight: "2px"
          }}
        ></i>
      );

    }
    return stars;
  };

  // Lấy user hiện tại từ LocalStorage để biết ai đang comment
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  // --- HÀM 1: LẤY DANH SÁCH ĐÁNH GIÁ ---
  const fetchDanhGia = async () => {
    if (!id) return;
    try {
      // Gọi đúng API vừa viết ở Bước 1
      const res = await API.get(`DanhGia/laydsdanhgia/${id}`); // <-- Đảm bảo đường dẫn khớp Backend

      console.log("Dữ liệu bình luận lấy về:", res.data);

      setDanhGias(res.data);
    } catch (err) {
      console.log("Lỗi lấy bình luận:", err);
    }
  };

  // Gọi hàm lấy đánh giá khi trang vừa load
  useEffect(() => {
    if (id) fetchDanhGia();
  }, [id]);

  // --- 3. HÀM GỬI BÌNH LUẬN (Khi nhấn Enter) ---
  const handleGuiBinhLuan = async (e) => {
    if (e.key === "Enter") {
      // Chỉ gửi khi nhấn Enter
      if (!currentUser) {
        showthongbao("Bạn cần đăng nhập để bình luận!", "error");
        return;
      }
      if (!noiDung.trim()) return; // Không gửi nội dung rỗng

      try {
        const payload = {
          userId: currentUser.userId,
          baiDangId: parseInt(id),
          comment: noiDung,
          sao: soSao,

        };

        await API.post("DanhGia/danhgia", payload);

        showthongbao("Đã gửi bình luận!", "success");
        setNoiDung(""); // Xóa ô nhập
        setSoSao(5); // Reset về 5 sao sau khi gửi
        fetchDanhGia(); // Tải lại danh sách ngay lập tức
        fetchData();
      } catch (err) {
        showthongbao("Lỗi gửi bình luận.", "error");
      }
    }
  };

  // Tạo địa chỉ đầy đủ để search trên map
  // encodeURIComponent giúp mã hóa các ký tự đặc biệt và khoảng trắng
  const fullAddress = phong
    ? `${phong.sonha ? phong.sonha : " "}, ${getTenQuan(phong.tinhthanh, phong.quanXa)}, ${getTenTinh(phong.tinhthanh)}`
    : "";

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  //--------------------------mở popup-------------------------------
  // 2. Thêm state để quản lý việc hiển thị Popupttcn **
  const [showhd, setShowhd] = useState(false);

  // Hàm kiểm tra xem đường dẫn có phải là video hay không
  const checkIsVideo = (url) => {
    if (!url) return false;
    // Kiểm tra các đuôi video phổ biến (mp4, webm, ogg, mov)
    // 'i' để không phân biệt hoa thường (MP4 vẫn nhận)
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  return (
    <div className="page-ttp">
      {loading && <Loading />}
      <div>
        <Menu />
      </div>
      <div className="body-ttp">
        <div className="thongtin-ha">
          <div className="thongtin-ttp">
            {/* ----------------------------hình ảnh----------------------------- */}
            <div className="ttp-ha">
              {/* ẢNH LỚN */}
              {/* KHU VỰC HIỂN THỊ ẢNH LỚN HOẶC VIDEO */}
              {checkIsVideo(selectedImage) ? (
                <video
                  className="main-img"
                  src={selectedImage}
                  controls
                  autoPlay // Tự động chạy khi bấm vào
                  style={{ backgroundColor: "black", objectFit: "contain" }} // Video nên có nền đen
                >
                  Trình duyệt không hỗ trợ video.
                </video>
              ) : (
                <img
                  className="main-img"
                  src={selectedImage || Macdinh}
                  alt="main"
                  style={{ objectFit: "contain" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = Macdinh;
                  }}
                />
              )}

              {/* Nút điều hướng */}
              <button className="nav-btn prev" onClick={goPrev}>
                {/* Ký tự &#10094; là mã HTML entity dùng để hiển thị ký tự mũi tên 94 trái 95 phải*/}
                &#10094;
              </button>
              <button className="nav-btn next" onClick={goNext}>
                &#10095;
              </button>

              {/* Bộ đếm ảnh */}
              <span className="image-counter">
                {currentIndex + 1} / {images.length}
              </span>
            </div>

            {/* Danh sách ảnh nhỏ */}
            {/* ---------------- THUMBNAIL ZONE ---------------- */}
            <div className="thumbnail-wrapper">
              {/* Nút PREV (chỉ hiện nếu nhiều hơn 6 ảnh) */}
              {images.length > MAX_THUMB && (
                <button
                  className="thumb-nav prev"
                  onClick={() => scrollThumbnails(-1)}
                >
                  &#10094;
                </button>
              )}

              <div className="thumbnail-list" ref={thumbRef}>
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail-item ${selectedImage === img ? "active" : ""
                      }`}
                    onClick={() => {
                      setSelectedImage(img);
                      setCurrentIndex(index);
                    }}
                  >
                    {checkIsVideo(img) ? (
                      <video
                        src={img}
                        muted // Tắt tiếng ở thumbnail
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          pointerEvents: "none", // Chặn click vào video để sự kiện click của div cha hoạt động
                        }}
                      />
                    ) : (
                      <img src={img} alt={`thumb-${index}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Nút NEXT */}
              {images.length > MAX_THUMB && (
                <button
                  className="thumb-nav next"
                  onClick={() => scrollThumbnails(1)}
                >
                  &#10095;
                </button>
              )}
            </div>

            {/* --------------------------tiêu đề---------- ---------------------- */}
            <div className="ttp-td">
              <span className="span-ttp-td">{phong?.tieuDe}</span>
              <br />
              <span className="span-ttp-gia">
                {phong?.giathue.toLocaleString("vi-VN")} đ/tháng
              </span>
              <div className="div-ttp-dc">
                <i class="bxr  bx-globe-oceania"></i>
                Địa chỉ: {phong?.sonha ? phong?.sonha + "," : " "}
                {getTenXa(phong?.quanXa, phong?.phuongXa)},
                {getTenQuan(phong?.tinhthanh, phong?.quanXa)},
                {getTenTinh(phong?.tinhthanh)}
              </div>
              <div className="div-ttp-dt">
                <i class="bxr  bx-move-horizontal"></i>
                Diện tích: {phong?.dientich} m2
              </div>
              <div className="div-ttp-dt">
                <i class='bxr  bxs-people-heart'></i>
                Số người ở: {phong?.songuoi}
              </div>

              <div className="div-ttp-dt">
                <i class="bxr  bx-door-open"></i>
                Số lượng phòng: {phong?.soluongphong}
              </div>
            </div>
          </div>

          {/* --------------------------mô tả-------------------------------- */}
          <div className="ttp-mt">
            <p className="p-ttp-mt">Mô tả chi tiết</p>
            <div className="div-ttp-mt">{phong?.moTa}</div>
          </div>
          {/* ---------------------------------------------------------- */}

          {/* --------------------------map-------------------------------- */}
          <div className="ttp-mt">
            <p className="p-ttp-mt">Map</p>
            <div className="div-map">
              {fullAddress ? (
                <iframe
                  title="map"
                  src={mapSrc}
                  width="100%"
                  height="400px"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <p>Đang tải bản đồ...</p>
              )}
            </div>
          </div>
          {/* ---------------------------------------------------------- */}
        </div>
        {/* -------------------------page phải------------------------- */}
        <div className="thongtin-lh">
          <div className="ttp-us-lh">
            <div className="ttp-us">
              <div className="ttp-us-img">
                <img
                  src={
                    phong?.avatar
                      ? `https://localhost:7072${phong?.avatar}` // Nếu có avatar thì ghép link
                      : Avatar // Nếu null/rỗng thì dùng ảnh mặc định
                  }
                  alt="avatar"
                />
              </div>

              <div className="ttp-us-name">
                <h3>{phong?.nguoiDang}</h3>
                <div>
                  <i class="bxr  bx-home-heart"></i>
                  <span> Chủ trọ</span>
                </div>
              </div>
            </div>

            <div className="ttp-us-bv">
              <span className="ttp-us-bd">{phong?.slBaidang} bài đăng</span>
              <span>Tham gia từ: {phong?.ngaytao} </span>
            </div>
            {/* ----------nút--------------- */}

            <div className="ttp-btn">
              <button className="ttp-btn-dc" onClick={() => setShowhd(true)}>
                Xem hợp đồng
              </button>
              <button className="ttp-btn-lh" onClick={on_off_lienhe}>
                Liên hệ
              </button>
            </div>
          </div>

          {/* --------------------------------------------------- */}

          {/* ------------------------comment--------------------------- */}

          <div className="ttp-cm">
            <div className="ttp-cm-tieude">
              {phong?.tongluotdanhgia == 0 ? (<div>Bình luận </div>)
                :
                (<>
                  <div>Bình luận <span>({phong?.tongluotdanhgia})</span> </div>
                  <div className="div-ttcm-tb"><span className="">{phong?.diemtrungbinh}</span>
                    <span >{renderStars(phong?.diemtrungbinh || 0)}</span>
                  </div>
                </>
                )}


            </div>

            {/* LOGIC: Nếu có bình luận thì hiện list, không thì hiện icon cũ */}
            {danhGias.length === 0 ? (
              // --- GIAO DIỆN CŨ: KHI CHƯA CÓ COMMENT ---
              <div className="ttp-cm-nd">
                <i className="bx bx-message-x"></i>
                <div>Chưa có bình luận nào</div>
              </div>
            ) : (
              // --- GIAO DIỆN MỚI: KHI ĐÃ CÓ COMMENT (Vẫn dùng style đơn giản) ---
              <div
                className="ttp-cm-list"
              >
                {danhGias.map((dg, index) => (
                  <div
                    key={index}
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "10px 0",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    {/* Ảnh đại diện nhỏ */}
                    <img
                      src={
                        dg.avatar
                          ? `https://localhost:7072${dg.avatar}`
                          : Avatar
                      }
                      alt="avt"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "13px" }}>
                        {dg.hoTen || "Người dùng"}
                      </div>
                      {/* --- MỚI: Hiển thị sao của comment này --- */}
                      <div className="cm-sao-ngthue" style={{ margin: "2px 0" }}>
                        {renderStars(dg.sao || 5)} {/* Nếu data cũ không có rating thì mặc định hiện 5 */}
                      </div>
                      <div style={{ fontSize: "14px", marginTop: "2px" }}>
                        {dg.comment}
                      </div>
                      <div style={{ fontSize: "11px", color: "#999" }}>
                        {new Date(dg.ngayComment).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}



            {/* --- Ô NHẬP LIỆU  --- */}
            <div className="ttp-cm-nt">
              {/* Khu vực chọn sao */}
              <div className="star-select" >
                {[1, 2, 3, 4, 5].map((s) => ( // vòng lập in ra 5 ngôi sao (5 thẻ span và s sẽ giữ gtri tương ứng vd click sao 1 s = 1)
                  <i
                    className="bxr bxs-star"
                    key={s}
                    onClick={() => setSoSao(s)} // Click để set số sao
                    style={{

                      color: s <= soSao ? "#9c6ade" : "#ccc", // ktra gtri s có nhỏ hơn state soáo ko
                      // nếu nhỏ hơn thì màu tím lớn hơn thì xám
                      transition: "color 0.2s"
                    }}
                  ></i>
                ))}
                <span className="cm-sao">
                  ({soSao} sao)
                </span>
              </div>
              <div className="cm-nd">
                <i className="bx bx-message-dots"></i>
                <input
                  className="input-cm-nt"
                  type="text"
                  placeholder="Viết bình luận... (Nhấn Enter để gửi)"
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                  onKeyDown={handleGuiBinhLuan}
                />
              </div>


            </div>
          </div>

          {/* -------------------------------------------------------------- */}
        </div>
      </div>
      {/* -------------------phòng tương tự---------------------------------------- */}
      <div className="page-ttp-ptt">
        <div className="ttp-ptt">
          <div className="card-dm">
            <h3>Phòng gần đó</h3>
            {dsbaidangtt &&
              dsbaidangtt.length === 0 && ( // kiểm tra nếu mảng rỗng
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
            {dsbaidangtt.map(
              (
                ds //hàm map của mảng để lấy từ phần tử, slice cắt mảng
              ) => (
                // 'key' dùng để định danh cho từng sp
                <div className="card-sp" key={ds.maBaiDang}>
                  <Link to={`/Thongtinphong/${ds.maBaiDang}`}>
                    <div className="card-img">
                      {ds.hinhAnh ? (
                        checkIsVideo(ds.hinhAnh) ? (
                          <video
                            src={`https://localhost:7072${ds.hinhAnh}`}
                            muted
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <img
                            src={`https://localhost:7072${ds.hinhAnh}`}
                            alt={ds.tieude}
                          />
                        )
                      ) : (
                        <img src={Macdinh} alt="Mac dinh" />
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

                      {getTenTinh(ds.tinhthanh)}
                    </div>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
        {/*--------------- nơi popup hiện ra -----------------*/}
        {/* DÙNG HIỂN THỊ CÓ ĐIỀU KIỆN */}
        {ison_of_lienhe && (
          <Poplienhe phong={phong} onClose={on_off_lienhe} />
        )}{" "}
        {/*phong={phong} truyền thêm dữ liệu phòng vào popup*/}
        {/* Toán tử && có nghĩa là: 
            "Nếu isDropdownOpen là true, thì render component <LocationDropdown />"
            
            Chúng ta truyền hàm toggleDropdown vào prop 'onClose' 
            để component con có thể tự đóng chính nó.
          */}
        {/* ------------------------------------------------------ */}
        {/* --- hiển thị popup --- */}
        {showhd && (
          /* Đây là lớp phủ  */
          <div className="popup-overlay">
            {/* Truyền onClose để nút tắt trong Popupttcn hoạt động */}
            <Popupxemhd
              onClose={() => setShowhd(false)}
              phong={phong} // truyền đường dân hợp đông
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Thongtinphong;
