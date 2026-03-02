import React, { useRef, useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "/src/styles/chutro/dangtin.css";
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "sub-vn";
import { Thongbaocontext } from "../../context/thongbao";
import API from "/src/services/api.jsx";
import Popupthanhtoan from "/src/pages/chutro/popupthanhtoan.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import Loading from "/src/components/UI/loading.jsx";

const BASE_URL = "https://localhost:7072"; // Cấu hình đường dẫn ảnh server

function Suabaidang() {
  //--------------------------thông báo loading--------------------
  const [loading, setLoading] = useState(false);
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);

  const { id } = useParams();
  const navigate = useNavigate();

  // --- REF ---
  const khuvucRef = useRef(null);
  const thongtinRef = useRef(null);
  const hinhanhRef = useRef(null);
  const mapRef = useRef(null);
  const hopdongRef = useRef(null); // [MỚI] Ref cho hợp đồng

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --- STATE DỮ LIỆU ---
  const [ProvinceId, setProvinceId] = useState("");
  const [DistrictId, setDistrictId] = useState("");
  const [WardId, setWardId] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [SoNha, setSoNha] = useState("");
  const [TieuDe, setTieuDe] = useState("");
  const [MoTa, setMoTa] = useState("");
  const [GiaThue, setGiaThue] = useState("");
  const [DienTich, setDienTich] = useState("");
  const [SoNguoi, setSoNguoi] = useState("");
  const [SoLuongPhong, setSoLuongPhong] = useState("");

  const [HinhAnh, setHinhAnh] = useState([]); // Ảnh mới (File)
  const [oldImages, setOldImages] = useState([]); // Ảnh cũ (URL lấy từ server)

  // --- [MỚI] STATE CHO PDF ---
  const [HopDongPDF, setHopDongPDF] = useState(null); // File mới chọn
  const [oldPdfUrl, setOldPdfUrl] = useState(""); // URL file cũ từ DB

  // --- 1. INIT TỈNH ---
  useEffect(() => {
    setProvinces(getProvinces());
  }, []);

  // --- 2. LOAD DỮ LIỆU CŨ TỪ API ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await API.get(`BaiDang/chitietbaidang/${id}`);
        const data = res.data;
        console.log("Dữ liệu cũ:", data);

        // 2.1 Đổ dữ liệu text
        setTieuDe(data.tieuDe || data.TieuDe || "");
        setMoTa(data.moTa || data.MoTa || "");
        setGiaThue(data.giathue || data.giaThueBaiDang || "");
        setDienTich(data.dientich || data.dienTich || "");
        setSoLuongPhong(data.soluongphong || data.soLuongPhong || "");
        setSoNguoi(data.songuoi || "");
        setSoNha(data.sonha || data.SoNha || "");

        // 2.2 Xử lý địa lý
        const maTinh = data.tinhthanh || data.TinhThanh;
        const maHuyen = data.quanXa || data.QuanHuyen;
        const maXa = data.phuongXa || data.PhuongXa;

        if (maTinh) {
          setProvinceId(maTinh);
          setDistricts(getDistrictsByProvinceCode(maTinh));
        }
        if (maHuyen) {
          setDistrictId(maHuyen);
          setWards(getWardsByDistrictCode(maHuyen));
        }
        if (maXa) {
          setWardId(maXa);
        }

        // 2.3 Xử lý ảnh cũ
        if (data.anhPhongTros && Array.isArray(data.anhPhongTros)) {
          setOldImages(data.anhPhongTros);
        }

        // 2.4 [MỚI] Xử lý Hợp đồng PDF cũ
        // Kiểm tra xem trong data trả về có thông tin HopDongMau ko
        if (data.hopDong && data.hopDong.filePdf) {
          setOldPdfUrl(data.hopDong.filePdf);
        } else if (data.HopDong && data.HopDong.FilePdf) {
          setOldPdfUrl(data.HopDong.FilePdf);
        }
      } catch (err) {
        console.error(err);
        showthongbao("Lỗi tải thông tin bài đăng", "error");
      }
    };
    if (id) fetchDetail();
  }, [id]);

  // --- XỬ LÝ ĐỊA LÝ ---
  const handleProvinceChange = (e) => {
    const proCode = e.target.value;
    setProvinceId(proCode);
    setDistrictId("");
    setWardId("");
    setDistricts(getDistrictsByProvinceCode(proCode));
    setWards([]);
  };

  const handleDistrictChange = (e) => {
    const disCode = e.target.value;
    setDistrictId(disCode);
    setWardId("");
    setWards(getWardsByDistrictCode(disCode));
  };

  const handleWardChange = (e) => setWardId(e.target.value);

  const getFullAddress = () => {
    const p = provinces.find((item) => item.code === ProvinceId);
    const d = districts.find((item) => item.code === DistrictId);
    const w = wards.find((item) => item.code === WardId);
    let parts = [];
    if (SoNha) parts.push(SoNha);
    if (w) parts.push(w.name);
    if (d) parts.push(d.name);
    if (p) parts.push(p.name);
    return parts.join(", ");
  };

  // --- XỬ LÝ ẢNH ---
  // --- XỬ LÝ FILE (Giới hạn chung 50MB) ---
  const handleFileChange = (e) => {
    // Kiểm tra nếu người dùng hủy chọn file
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const validFiles = [];
    
    // CẤU HÌNH: 50MB = 50 * 1024 * 1024 bytes
    const MAX_SIZE = 30 * 1024 * 1024; 

    files.forEach((file) => {
      // Kiểm tra dung lượng chung cho tất cả
      if (file.size > MAX_SIZE) {
        showthongbao(`File video quá lớn. Tối đa 30MB được phép.`, "error");
      } else {
        validFiles.push(file);
      }
    });

    // Cập nhật state với danh sách file hợp lệ
    if (validFiles.length > 0) {
      setHinhAnh(validFiles);
    } else {
      // Nếu tất cả file đều quá nặng -> Reset input để chọn lại từ đầu
      e.target.value = null; 
      setHinhAnh([]);
    }
  };

  // --- [MỚI] XỬ LÝ PDF CHANGE ---
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showthongbao("Chỉ cho phép file PDF", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showthongbao("File PDF tối đa 5MB", "error");
      return;
    }
    setHopDongPDF(file);
  };

  // Hàm xóa ảnh cũ
  const handleDeleteOldImage = async (imageId) => {
    const ok = await showxacnhan("Bạn có chắc chắn muốn xóa ảnh này?");
    if (!ok) return;
    try {
      await API.delete(`AnhPhongTro/xoa-anh/${imageId}`);
      setOldImages((prev) => prev.filter((img) => img.anhId !== imageId));
      showthongbao("Đã xóa ảnh thành công!", "success");
    } catch (error) {
      showthongbao("Lỗi xóa ảnh", "error");
    }
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!ProvinceId || !DistrictId || !WardId) {
      showthongbao("Vui lòng chọn địa chỉ! ", "error");
      return;
    }
    if (!TieuDe || !GiaThue || !DienTich) {
      showthongbao("Vui lòng nhập đầy đủ thông tin!", "error");
      return;
    }

    if (GiaThue <= 0) {
      showthongbao("Giá thuê phải lớn hơn 0.", "error");
      return;
    }

    if (DienTich <= 0) {
      showthongbao("Diện tích phải lớn hơn 0.", "error");
      return;
    }

    // if (DienTich.includes(".")) {
    //   showthongbao('Diện tích phần dư ngăn cách bằng dấu "," ', "error");
    //   return;
    // }

    if (SoLuongPhong <= 0) {
      showthongbao("Số lượng phòng phải lớn hơn 0.", "error");
      return;
    }

    if (SoNguoi <= 0) {
      showthongbao("Số người phải lớn hơn 0.", "error");
      return;
    }

    if (HinhAnh.length + oldImages.length > 10) {
      showthongbao("Tối đa 10 ảnh.", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const userStr = localStorage.getItem("user");
      const userId = userStr ? JSON.parse(userStr).userId : 0;
      formData.append("UserId", userId);

      formData.append("TieuDe", TieuDe);
      formData.append("MoTa", MoTa || "");
      formData.append("GiaThueBaiDang", GiaThue);
      formData.append("DienTich", Number(DienTich) || 0);
      formData.append("SoLuongPhong", Number(SoLuongPhong) || 1);
      formData.append("SoNguoi", Number(SoNguoi) || 0);
      formData.append("TinhThanh", ProvinceId);
      formData.append("QuanHuyen", DistrictId);
      formData.append("PhuongXa", WardId);
      formData.append("SoNha", SoNha);

      // Ảnh mới
      HinhAnh.forEach((file) => {
        formData.append("HinhAnh", file);
      });

      // [MỚI] Hợp đồng PDF mới
      if (HopDongPDF) {
        formData.append("HopDongPDF", HopDongPDF);
      }

      console.log("Đang cập nhật...");

      await API.put(`BaiDang/suabaidang/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showthongbao("Cập nhật thành công!", "success");
      // Sau khi cập nhật thành công, có thể reload lại trang hoặc fetch lại detail
      // window.location.reload();
    } catch (err) {
      console.error("Lỗi đăng tin:", err);
      if (err.response && err.response.data) {
        let msg = err.response.data.message; // 1. Ưu tiên message chung nếu có

        // 2. Nếu không có message, kiểm tra xem có danh sách lỗi chi tiết (Validation) không
        if (!msg && err.response.data.errors) {
          // Lấy tất cả thông báo lỗi trong object 'errors', gộp lại và xuống dòng
          msg = Object.values(err.response.data.errors).flat().join('\n');
        }

        // 3. Nếu vẫn chưa có, lấy title hoặc fallback về JSON
        if (!msg) {
          msg = err.response.data.title || JSON.stringify(err.response.data);
        }

        showthongbao(msg, "error");
      } else {
        showthongbao("Lỗi kết nối đến máy chủ!", "error");
      }
    } finally {
      // --- TẮT LOADING TẠI ĐÂY ---
      setLoading(false);
    }
  };

  const [ison_off_thanhtoan, seton_off_thanhtoan] = useState(false);
  const on_off_thanhtoan = () => {
    seton_off_thanhtoan((prev) => !prev);
  };


  // Hàm kiểm tra xem đường dẫn có phải là video hay không
  const checkIsVideo = (url) => {
    if (!url) return false;
    // Kiểm tra các đuôi video phổ biến (mp4, webm, ogg, mov)
    // 'i' để không phân biệt hoa thường (MP4 vẫn nhận)
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  return (
    <div className="page-dangtin">
      {ison_off_thanhtoan && <Popupthanhtoan onClose={on_off_thanhtoan} />}
      {loading && <Loading />}

      <div className="content">
        <p className="p-content">Chỉnh sửa bài đăng (ID: {id})</p>
        <div className="menu-ghim">
          <div tabIndex="0" onClick={() => scrollToSection(khuvucRef)}>
            Khu vực
          </div>
          <div tabIndex="0" onClick={() => scrollToSection(mapRef)}>
            Map
          </div>
          <div tabIndex="0" onClick={() => scrollToSection(thongtinRef)}>
            Thông tin
          </div>
          <div tabIndex="0" onClick={() => scrollToSection(hinhanhRef)}>
            Hình ảnh
          </div>
          {/* [MỚI] Thêm menu cuộn tới Hợp đồng */}
          <div tabIndex="0" onClick={() => scrollToSection(hopdongRef)}>
            Hợp đồng
          </div>
        </div>
      </div>

      <div className="page-dt">
        {/* KHU VỰC - Giữ nguyên */}
        <div ref={khuvucRef} className="dangtin">
          <h3>Khu vực</h3>
          {/* ... (Code phần khu vực giữ nguyên như cũ) ... */}
          <div className="khuvuc">
            <div className="dt-left">
              <div className="tinh-tp">
                <p>
                  Tỉnh/Thành phố <span className="ko-bt">(*)</span>
                </p>
                <select
                  className="dt-select-kv"
                  value={ProvinceId}
                  onChange={handleProvinceChange}
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="phuong-xa">
                <p>Phường/Xã</p>
                <select
                  className="dt-select-kv"
                  value={WardId}
                  onChange={handleWardChange}
                  disabled={!DistrictId}
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards?.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="dt-right"
              style={{ width: "100%", marginLeft: "20px" }}
            >
              <div className="quan-huyen">
                <p>
                  Quận/Huyện <span className="ko-bt">(*)</span>
                </p>
                <select
                  className="dt-select-kv"
                  value={DistrictId}
                  onChange={handleDistrictChange}
                  disabled={!ProvinceId}
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sonha">
                <p>Số nhà</p>
                <input
                  className="input-kv"
                  type="text"
                  value={SoNha}
                  onChange={(e) => setSoNha(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="diachi">
            <p>Địa chỉ</p>
            <input
              className="input-kv"
              type="text"
              value={getFullAddress()}
              readOnly
            />
          </div>
        </div>

        {/* MAP - Giữ nguyên */}
        <div ref={mapRef} className="dangtin">
          <h3>Map</h3>
          <div className="map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d47689…LCBWaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1763560668328!5m2!1svi!2s"
              width="100%"
              height="400px"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* THÔNG TIN - Giữ nguyên */}
        <div ref={thongtinRef} className="dangtin">
          <h3>Thông tin mô tả</h3>
          {/* ... (Code phần thông tin giữ nguyên như cũ) ... */}
          <div className="diachi">
            <p>
              Tiêu đề <span className="ko-bt">(*)</span>
            </p>
            <textarea
              className="textarea-td"
              value={TieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
            />
            {TieuDe.length > 30 && TieuDe.length <= 200 ? (
              <span className="dt-ghichu" style={{ color: "green" }}>
                {TieuDe.length}/200{" "}
              </span>
            ) : (
              <span className="dt-ghichu" style={{ color: "red" }}>
                {TieuDe.length}/200
              </span>
            )}
            <span className="dt-ghichu">
              (Tối thiểu 30 ký tự và tối đa 200 ký tự)
            </span>

          </div>
          <div className="diachi">
            <p>
              Mô tả <span className="ko-bt">(*)</span>
            </p>
            <textarea
              className="textarea-mt"
              value={MoTa}
              onChange={(e) => setMoTa(e.target.value)}
            />
            {MoTa.length > 50 && MoTa.length <= 5000 ? (
              <span className="dt-ghichu" style={{ color: "green" }}>
                {MoTa.length}/5000{" "}
              </span>
            ) : (
              <span className="dt-ghichu" style={{ color: "red" }}>
                {MoTa.length}/5000
              </span>
            )}
            <span className="dt-ghichu">
              (Tối thiểu 50 ký tự và tối đa 5000 ký tự)
            </span>
          </div>

          <div className="khuvuc">
            <div className="dt-left">
              <div>
                <p>
                  Giá thuê <span className="ko-bt">(*)</span>
                </p>
                <input
                  type="number"
                  className="input-gt"
                  placeholder="Nhập giá thuê"
                  value={GiaThue}
                  onChange={(e) => setGiaThue(e.target.value)}
                />
                <span>đồng/tháng</span>
              </div>
              <span className="dt-ghichu">
                (Vd: 2tr rưỡi - 2500000)
              </span>
              <div>
                <p>Ở được bao nhiêu người</p>
                <input
                  type="number"
                  className="input-kv"
                  placeholder="Nhập số người ở"
                  value={SoNguoi}
                  onChange={(e) => setSoNguoi(e.target.value)}
                />
              </div>
            </div>
            <div className="dt-right">
              <div>
                <p>
                  Diện tích <span className="ko-bt">(*)</span>
                </p>

                <input
                  type="number"
                  className="input-dt"
                  placeholder="Nhập diện tích"
                  value={DienTich}
                  onChange={(e) => setDienTich(e.target.value)}
                />
                <span>m²</span>

              </div>
              <span className="dt-ghichu">
                (Diện tích nhập dấu "," vd: 1,5)
              </span>
              <div>
                <p>Số lượng phòng</p>
                <input
                  type="number"
                  className="input-kv"
                  value={SoLuongPhong}
                  readOnly={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* HÌNH ẢNH */}
        <div ref={hinhanhRef} className="dangtin">
          <h3>Hình ảnh</h3>
          {/* ... (Code phần hiển thị ảnh giữ nguyên như cũ) ... */}
          {oldImages.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <p>Ảnh hiện có:</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {oldImages.map((img, idx) => {
                  return (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        width: "100px",
                        height: "100px",
                      }}
                    >
                      {/* KIỂM TRA: NẾU LÀ VIDEO THÌ HIỆN VIDEO, NGƯỢC LẠI HIỆN ẢNH */}
                      {checkIsVideo(img.url) ? (
                        <video
                          src={`${BASE_URL}${img.url}`}
                          controls // Cho phép play/pause
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover", // Giữ khung hình vuông vắn
                            borderRadius: "5px",
                            backgroundColor: "#000", // Nền đen cho video
                          }}
                        >
                          Trình duyệt không hỗ trợ video.
                        </video>
                      ) : (
                        <img
                          src={`${BASE_URL}${img.url}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                          alt="Ảnh phòng"
                          onError={(e) => {
                            e.target.style.display = 'none'; // Ẩn ảnh nếu lỗi
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteOldImage(img.anhId)}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "red",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        X
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <label className="lable-ha" htmlFor="input-file">
            <div className="upload-ha">
              <div className="camera-icon">
                <i className="bx bx-camera-alt"></i>
              </div>
              <p>Thêm ảnh và video mới từ thiết bị</p>
            </div>
          </label>
          <input
            type="file"
            id="input-file"
            hidden
            multiple
            onChange={handleFileChange}
          />

          {/* HIỂN THỊ ẢNH MỚI CHỌN */}
          <ul className="ghichu-ha">
            {HinhAnh.length + oldImages.length > 0 && HinhAnh.length + oldImages.length <= 10 ? (
              <li style={{ color: "green" }}>Đã chọn {HinhAnh.length + oldImages.length} ảnh và video</li>
            ) : HinhAnh.length + oldImages.length > 10 ? (
              <li style={{ color: "red" }}>Đã chọn {HinhAnh.length + oldImages.length} ảnh và video</li>
            ) : (
              <li>Chưa chọn ảnh hoặc video nào</li>
            )}
            <li>Tải tối đa 10 ảnh và video trong 1 bài đăng</li>
            <li>Dung lượng ảnh và video tối đa 30MB</li>
            <li>Hình ảnh liên quan đến phòng trọ</li>
            <li>Không chèn SDT, văn bản quảng cáo lên ảnh</li>
          </ul>
        </div>

        {/* [MỚI] KHU VỰC HỢP ĐỒNG PDF */}
        <div ref={hopdongRef} className="dangtin">
          <h3>
            Hợp đồng <span className="ko-bt">(*)</span>
          </h3>

          {/* Hiển thị file cũ nếu có */}
          {oldPdfUrl ? (
            <div
              style={{
                marginBottom: "15px",
                padding: "10px",
                border: "1px dashed #ccc",
              }}
            >
              <p style={{ fontWeight: "bold", color: "#333" }}>
                <i
                  className="bx bxs-file-pdf"
                  style={{ color: "red", marginRight: "5px" }}
                ></i>
                File hợp đồng hiện tại:
              </p>
              <a
                href={`${BASE_URL}${oldPdfUrl}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                Xem chi tiết hợp đồng cũ
              </a>
              <p style={{ fontSize: "12px", color: "gray", marginTop: "5px" }}>
                (Chọn file mới bên dưới để thay thế file này)
              </p>
            </div>
          ) : (
            <p style={{ color: "orange" }}>Chưa có hợp đồng mẫu.</p>
          )}

          {/* Nút upload file mới */}
          <label className="lable-ha" htmlFor="input-PDF">
            <div className="upload-ha">
              <div className="camera-icon">
                <i className="bx bx-file-detail"></i>
              </div>
              <p>{oldPdfUrl ? "Thay đổi file PDF" : "Tải file PDF mới"}</p>
            </div>
          </label>
          <input
            type="file"
            id="input-PDF"
            accept="application/pdf"
            hidden
            onChange={handlePdfChange}
          />

          {/* Ghi chú hiển thị tên file mới */}
          <ul className="ghichu-ha">
            {HopDongPDF ? (
              <li style={{ color: "green", fontWeight: "bold" }}>
                Đã chọn file mới: {HopDongPDF.name}
              </li>
            ) : (
              <li>Chưa chọn file mới</li>
            )}
            <li>Chỉ tải file PDF</li>
            <li>Dung lượng tối đa 5MB</li>
          </ul>
        </div>

        <div>
          <button className="btn-dt" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang xử lý..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Suabaidang;