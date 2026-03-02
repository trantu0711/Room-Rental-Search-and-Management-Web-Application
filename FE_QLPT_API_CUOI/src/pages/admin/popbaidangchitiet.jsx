import React, { useState, useRef, useEffect, useContext } from "react";
import "/src/styles/admin/popbaidangchitiet.css";
import Avatar from "/src/assets/avatar.png";
import Img from "/src/assets/image.png";
import API from "/src/services/api.jsx";
import { getProvinces, getDistrictsByProvinceCode } from "sub-vn";
import { Thongbaocontext } from "/src/context/thongbao";
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import Macdinh from "/src/assets/Macdinh_01.png";
import { useDelayLoading } from "/src/hooks/useDelayLoading";
const MAX_THUMB = 6;
const BASE_URL = "https://localhost:7072";

function Popbaidangchitiet({ id, onClose, onSuccess }) {
  // ================= STATE =================
  const [loading, setLoading] = useState(false);
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);
  const shouldShowLoading = useDelayLoading(loading, 70);
  // --- State cho Slide ảnh ---
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phong, setPhong] = useState(null);

  // --- State cho Popup TỪ CHỐI ---
  const [showTuChoiForm, setShowTuChoiForm] = useState(false); // Ẩn/Hiện form nhập lý do
  const [lyDo, setLyDo] = useState(""); // Lưu nội dung lý do

  const thumbRef = useRef(null);

  // ================= HELPERS =================
  const getTenTinh = (code) => {
    const tinh = getProvinces().find((t) => t.code == code);
    return tinh ? tinh.name : "";
  };

  const getTenQuan = (provinceCode, districtCode) => {
    if (!provinceCode || !districtCode) return "";
    const districts = getDistrictsByProvinceCode(provinceCode);
    const quan = districts?.find((d) => d.code == districtCode);
    return quan ? quan.name : "";
  };

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

  const scrollThumbnails = (dir) => {
    if (!thumbRef.current) return;
    const itemWidth = 100;
    thumbRef.current.scrollLeft += dir * itemWidth;
  };

  // ================= API CALLS =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const resDetail = await API.get(`BaiDang/chitietbaidang/${id}`);
      setPhong(resDetail.data);

      if (
        resDetail.data.anhPhongTros &&
        resDetail.data.anhPhongTros.length > 0
      ) {
        const imgUrls = resDetail.data.anhPhongTros.map(
          (a) => `${BASE_URL}${a.url}`
        );
        setImages(imgUrls);
        setSelectedImage(imgUrls[0]);
        setCurrentIndex(0);
      } else {
        setImages([Macdinh]);
        setSelectedImage(Macdinh);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // ================= HANDLERS =================

  // 1. Phê duyệt (Giữ nguyên)
  const handleDuyet = async (baiDangId) => {
    const ok = await showxacnhan("Bạn chắc chắn muốn duyệt tin này!");
    if (!ok) return;
    try {
      await API.put(`Admin/duyet/${baiDangId}`);
      showthongbao("Đã duyệt thành công!", "success");
      onSuccess?.();
    } catch {
      showthongbao("Lỗi khi duyệt tin!", "error");
    }
  };

  // 2. Từ chối - BƯỚC 1: Mở form nhập lý do
  const handleMoFormTuChoi = () => {
    setLyDo(""); // Reset lý do cũ
    setShowTuChoiForm(true); // Hiện popup nhập
  };

  // 3. Từ chối - BƯỚC 2: Gọi API xác nhận
  const handleSubmitTuChoi = async () => {
    if (!lyDo.trim()) {
      showthongbao("Vui lòng nhập lý do từ chối!", "warning");
      return;
    }

    setLoading(true);
    try {
      // Gọi API kèm lý do
      await API.put(
        `Admin/tuchoi/${phong?.baiDangId}?lyDo=${encodeURIComponent(lyDo)}`
      );

      showthongbao("Đã từ chối tin thành công!", "success");
      setShowTuChoiForm(false); // Đóng form lý do
      onSuccess?.(); // Đóng popup chính và load lại trang
    } catch (err) {
      showthongbao("Lỗi khi từ chối tin!", "error");
    } finally {
      setLoading(false);
    }
  };

   // Hàm kiểm tra xem đường dẫn có phải là video hay không
  const checkIsVideo = (url) => {
    if (!url) return false;
    // Kiểm tra các đuôi video phổ biến (mp4, webm, ogg, mov)
    // 'i' để không phân biệt hoa thường (MP4 vẫn nhận)
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  // ================= RENDER =================
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="page-bdct" onClick={(e) => e.stopPropagation()}>
        {shouldShowLoading && <Loading />}

        {/* ==================== POPUP NHẬP LÝ DO (MỚI) ==================== */}
        {showTuChoiForm && (
          <div
            className="tuchoi-overlay"
            onClick={() => setShowTuChoiForm(false)}
          >
            <div className="tuchoi-box" onClick={(e) => e.stopPropagation()}>
              <h3>Từ chối bài đăng</h3>

              <label>Lý do từ chối:</label>
              <textarea
                placeholder="Ví dụ: Hình ảnh mờ, thông tin sai lệch..."
                value={lyDo}
                onChange={(e) => setLyDo(e.target.value)}
                autoFocus
              ></textarea>

              <div className="tuchoi-actions">
                <button
                  className="btn-huy-bo"
                  onClick={() => setShowTuChoiForm(false)}
                >
                  Hủy bỏ
                </button>
                <button className="btn-dong-y" onClick={handleSubmitTuChoi}>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ================================================================= */}

        <div className="h3-bdct">
          <h3>Thông tin chi tiết</h3>
        </div>

        <div className="body-bdct">
          {/* ... (Phần hiển thị thông tin bài đăng GIỮ NGUYÊN KHÔNG ĐỔI) ... */}
          <div className="tt-ha">
            <div className="tt-bdct">
              <div className="bdct-ha">
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
                <button className="nav-btn prev" onClick={goPrev}>
                  &#10094;
                </button>
                <button className="nav-btn next" onClick={goNext}>
                  &#10095;
                </button>
                <span className="image-counter">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>

              <div className="thumbnail-wrapper">
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
                {images.length > MAX_THUMB && (
                  <button
                    className="thumb-nav next"
                    onClick={() => scrollThumbnails(1)}
                  >
                    &#10095;
                  </button>
                )}
              </div>
              <hr />

              <div className="bdct-td">
                <span className="span-bdct-td">{phong?.tieuDe}</span>
                <br />
                <span className="span-bdct-gia">
                  {phong?.giathue.toLocaleString("vi-VN")} đ/tháng
                </span>
                <div className="div-bdct-dc">
                  <i className="bxr bx-globe-oceania"></i> địa chỉ:{" "}
                  {phong?.sonha}, {getTenQuan(phong?.tinhthanh, phong?.quanXa)},{" "}
                  {getTenTinh(phong?.tinhthanh)}
                </div>
                <div className="div-bdct-dt">
                  <i className="bxr bx-move-horizontal"></i> Diện tích:{" "}
                  {phong?.dientich} m²
                </div>
                <div className="div-bdct-dt">
                  <i className="bxr bx-door-open"></i> Số lượng phòng:{" "}
                  {phong?.soluongphong}
                </div>
              </div>
            </div>
            <hr />
            <div className="bdct-mt">
              <p className="p-bdct-mt">Mô tả chi tiết</p>
              <div className="div-bdct-mt">{phong?.moTa}</div>
            </div>
          </div>

          <div className="tt-lh">
            <div className="bdct-us-lh">
              <div className="bdct-us">
                <div className="bdct-us-img">
                  <img
                    src={`${BASE_URL}${phong?.avatar}` || Avatar}
                    alt="avatar"
                  />
                </div>
                <div className="bdct-us-name">
                  <h3>{phong?.nguoiDang}</h3>
                  <div>
                    <i className="bxr bx-home-heart"></i>
                    <span> Chủ trọ</span>
                  </div>
                </div>
              </div>

              <div className="bdct-us-bv">
                <span className="bdct-us-bd">10 bài đăng</span>
                <span>Tham gia từ: 21/11/2025</span>
              </div>

              {/* ---------- NÚT DUYỆT / TỪ CHỐI --------------- */}
              <div className="bdct-btn">
                <button
                  className="bdct-btn-dc"
                  onClick={() => handleDuyet(phong?.baiDangId)}
                >
                  <i className="bxr bx-check"></i> Phê duyệt
                </button>

                {/* Sửa sự kiện onClick ở đây để mở form */}
                <button className="bdct-btn-lh" onClick={handleMoFormTuChoi}>
                  <i className="bxr bx-x"></i> Từ chối
                </button>
              </div>
            </div>
            <hr />
            <div className="bdct-cm">
              <span>Bình luận</span>
              <div className="bdct-cm-nd">
                <i className="bxr bx-message-circle-x"></i>
                <div>Chưa có bình luận nào</div>
              </div>
              <div className="bdct-cm-nt">
                <i className="bxr bx-message-dots"></i>
                <input
                  className="input-cm-nt-bdct"
                  type="text"
                  placeholder="Bình luận..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Popbaidangchitiet;