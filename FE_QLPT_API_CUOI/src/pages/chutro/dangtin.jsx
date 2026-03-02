import React, { useRef, useState, useContext, useEffect } from "react"; // <-- Thêm useRef
import { Link, Outlet, useNavigate } from "react-router-dom";
import "/src/styles/chutro/dangtin.css"; // Import file CSS
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "sub-vn";
import { Thongbaocontext } from "../../context/thongbao";
import Loading from "/src/components/UI/loading.jsx";
import API from "/src/services/api.jsx";
import Popupthanhtoan from "/src/pages/chutro/popupthanhtoan.jsx";
import { GoogleMap, useJsApiLoader, Marker, LoadScript } from "@react-google-maps/api";
import axios from "axios";
import { Xacnhancontext } from "../../context/xacnhan";


function Dangtin() {  
  const navigate = useNavigate();

  //==========================thông báo và loading===========================

  //--------------------------thông báo loading--------------------
  const [loading, setLoading] = useState(false);
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);

  // -----------------------menu ghim vị trí--------------------------------
  // 1. Tạo các ref cho từng phần
  const khuvucRef = useRef(null);
  const thongtinRef = useRef(null);
  const hinhanhRef = useRef(null);
  const mapRef = useRef(null); // Ref cho bản đồ
  const hopdongRef = useRef(null);

  // 2. Hàm xử lý cuộn **
  const scrollToSection = (ref) => {
    if (ref.current) {
      // behavior: "smooth": Làm cho việc cuộn trở nên mượt mà (lướt đi) thay vì nhảy cái bụp .
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  //-------------------------------------------------------------------------------------------

  //==========================xử lý các địa chỉ dùng=========================

  // Địa lý
  const [ProvinceId, setProvinceId] = useState(""); // lưu mã tỉnh / tp
  const [DistrictId, setDistrictId] = useState(""); // mã huyện / quận
  const [WardId, setWardId] = useState(""); // mã phường xã
  // Danh sách (Lấy từ thư viện)
  const [provinces, setProvinces] = useState([]); // lấy Danh sách tỉnh từ thư viện dùng thư viện sub-vn
  const [districts, setDistricts] = useState([]); // Danh sách huyện
  const [wards, setWards] = useState([]); // xã
  // Thông tin chi tiết lấy thông tin tư ô nhập liệu
  const [SoNha, setSoNha] = useState("");
  const [TieuDe, setTieuDe] = useState("");
  const [MoTa, setMoTa] = useState("");
  const [GiaThue, setGiaThue] = useState("");
  const [DienTich, setDienTich] = useState("");
  const [SoNguoi, setSoNguoi] = useState("");
  const [SoLuongPhong, setSoLuongPhong] = useState("");

  // --- 3. KHỞI TẠO DỮ LIỆU TỈNH ---
  useEffect(() => {
    // lấy dữ liệu tỉnh thành lưu vào state
    // Hàm getProvinces() của thư viện trả về mảng tỉnh thành
    const data = getProvinces();
    setProvinces(data);
  }, []); //Không phụ thuộc state nào Không chạy lại khi re-render

  // --- 4. XỬ LÝ LOGIC ĐỊA LÝ (Dùng sub-vn) ---
  const handleProvinceChange = (e) => {
    const proCode = e.target.value;
    setProvinceId(proCode);
    setDistrictId("");
    setWardId("");
    setWards([]);

    const districtList = getDistrictsByProvinceCode(proCode);
    setDistricts(districtList);

    const p = provinces.find((x) => x.code === proCode);
    if (p && isLoaded) {
      moveMapByAddress(p.name, 11);
    }

  };

  // xử lý khi chọn huyện
  const handleDistrictChange = (e) => {
    const disCode = e.target.value;
    setDistrictId(disCode);
    setWardId("");

    const wardList = getWardsByDistrictCode(disCode);
    setWards(wardList);

    const d = districts.find((x) => x.code === disCode);
    const p = provinces.find((x) => x.code === ProvinceId);

    if (d && p && isLoaded) {
      moveMapByAddress(`${d.name}, ${p.name}`, 14);
    }

  };

  //  Hàm xử lý khi chọn Phường không có cấp con
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    setWardId(wardCode);

    const w = wards.find((x) => x.code === wardCode);
    const d = districts.find((x) => x.code === DistrictId);
    const p = provinces.find((x) => x.code === ProvinceId);

    if (w && d && p && isLoaded) {
      moveMapByAddress(`${w.name}, ${d.name}, ${p.name}`, 16);
    }

  };

  // Hàm hiển thị địa chỉ xem trước
  const getFullAddress = () => {
    // Tìm tên Tỉnh trong danh sách provinces
    const p = provinces.find((item) => item.code === ProvinceId);
    // Tìm tên Huyện trong danh sách districts hiện tại
    const d = districts.find((item) => item.code === DistrictId);
    const w = wards.find((item) => item.code === WardId);
    let parts = [];
    if (SoNha) parts.push(SoNha);
    // Lưu ý: Thư viện dùng key là "name" (chữ thường)
    if (w) parts.push(w.name);
    if (d) parts.push(d.name);
    if (p) parts.push(p.name);

    return parts.length > 0 ? parts.join(", ") : "";
  };

  // Hình ảnh lấy hình ảnh là 1 mảng, up load nhiều hình
  const [HinhAnh, setHinhAnh] = useState([]);

  // --- 5. XỬ LÝ ẢNH & SUBMIT---
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

  const handlePdfChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      showthongbao("Chỉ cho phép file PDF", "error");
      return;
    }

    // Giới hạn dung lượng ví dụ 5MB
    if (file.size > 5 * 1024 * 1024) {
      showthongbao("File PDF tối đa 5MB", "error");
      return;
    }

    setHopDongPDF(file);
  };

  //biến giữ id
  const [id, setid] = useState(null);
  // Hợp đồng PDF (chỉ 1 file)
  const [HopDongPDF, setHopDongPDF] = useState(null);

  // ktra nhập dữ liệu
  const handleSubmit = async () => {
    // Validate
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

    if (!/^\d+$/.test(GiaThue)) {
      showthongbao("Giá thuê phải là số", "error");
      return; // Dừng lại, không gửi API
    }

    if (DienTich <= 0) {
      showthongbao("Diện tích phải lớn hơn 0.", "error");
      return;
    }

    //  if (DienTich.includes('.')) {
    //   showthongbao('Diện tích phần dư ngăn cách bằng dấu "," ', "error");
    //   return;
    // }

    if (SoLuongPhong <= 0) {
      showthongbao("Số lượng phòng phải lớn hơn 0.", "error");
      return;
    }

    if (Number(SoLuongPhong) % 1 !== 0) {
      showthongbao("Số lượng phòng phải là số nguyên!", "error");
      return; // Dừng lại, không gửi API
    }

    // if (!/^\d+$/.test(SoLuongPhong)) {
    //   showthongbao("Số lượng phòng phải là số nguyên", "error");
    //   return;
    // }

    if (SoNguoi <= 0) {
      showthongbao("Số người phải lớn hơn 0.", "error");
      return;
    }

    if (!/^\d+$/.test(SoNguoi)) {
      showthongbao("Số người phải là số", "error");
      return; // Dừng lại, không gửi API
    }

    if (Number(SoNguoi) % 1 !== 0) {
      showthongbao("Vui lòng nhập số nguyên cho số người (không nhập số lẻ)!", "error");
      return; // Dừng lại, không gửi API
    }

    // if (HinhAnh.length <= 0) {
    //   showthongbao("Hình ảnh không được bỏ trống.", "error");
    //   return;
    // }

    if (HinhAnh.length > 10) {
      showthongbao("Tối đa 10 ảnh.", "error");
      return;
    }



    // if (!HopDongPDF) {
    //   showthongbao("Vui lòng tải hợp đồng PDF", "error");
    //   return;
    // }

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      showthongbao("Bạn chưa đăng nhập!", "error");
      navigate("/dangnhap");
      return;
    }

    let userId = 0;
    try {
      const userData = JSON.parse(userStr);
      userId = userData.userId;
    } catch (e) {
      console.error(e);
    }

    if (!userId) {
      showthongbao("Lỗi phiên đăng nhập.", "error");
      return;
    }

    // tạo formData gửi dữ liệu tên GiaThueBaiDang phải trùng vs dto be
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("UserId", parseInt(userId));
      formData.append("TieuDe", TieuDe);
      formData.append("MoTa", MoTa || "");
      formData.append("GiaThueBaiDang", GiaThue.replace(",", "."));
      formData.append("DienTich", Number(DienTich) || 0);
      formData.append("SoLuongPhong", parseInt(SoLuongPhong) || 1);
      formData.append("SoNguoi", parseInt(SoNguoi) || 0);

      // -- Địa chỉ --
      formData.append("TinhThanh", ProvinceId);
      formData.append("QuanHuyen", DistrictId);
      formData.append("PhuongXa", WardId);
      formData.append("SoNha", SoNha);

      // -- Hình ảnh --
      HinhAnh.forEach((file) => {
        formData.append("HinhAnh", file);
      });

      // -- Hợp đồng PDF --
      formData.append("HopDongPDF", HopDongPDF);

      console.log("Đang gửi dữ liệu...");

      const response = await API.post("BaiDang/dangtin", formData, {
        // gọi api và formdata
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("lỗi dữ liêu", response.data);
      if (response.status === 200 || response.status === 201) {
        setid(response.data.baiDangId);
        // lấy mã bài đăng vừa tạo
        on_off_thanhtoan();
        // navigate("/");
      }
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

  //-------------------------------------mở thanh toán ---------------------------------
  const [ison_off_thanhtoan, seton_off_thanhtoan] = useState(false);

  // Hàm để bật/tắt popup
  const on_off_thanhtoan = () => {
    seton_off_thanhtoan((prev) => !prev);
    // Dùng 'prev => !prev' để đảm bảo luôn lấy giá trị mới nhất
  };

  //----------------xử lý gg map-------------------
  const googleMapRef = useRef(null);

  const [mapCenter, setMapCenter] = useState({
    lat: 10.776889,
    lng: 106.700806, // mặc định TP.HCM
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,

  });
  console.log(import.meta.env.VITE_GOOGLE_MAP_KEY);

  const moveMapByAddress = (address, zoom = 14) => {
    if (!isLoaded || !window.google || !googleMapRef.current) {
      console.warn("Map chưa load xong");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;

        setMapCenter({
          lat: location.lat(),
          lng: location.lng(),
        });
        setMapZoom(zoom);

        googleMapRef.current.panTo(location);
        googleMapRef.current.setZoom(zoom);
      } else {
        console.error("Geocode failed:", status);
      }
    });
  };



  const [mapZoom, setMapZoom] = useState(11);

  return (
    <div className="page-dangtin">
      {loading && <Loading />}
      {/*--------------- nơi popup hiện ra -----------------*/}
      {/* DÙNG HIỂN THỊ CÓ ĐIỀU KIỆN */}
      {ison_off_thanhtoan && (
        <Popupthanhtoan onClose={on_off_thanhtoan} baidangid={id} />
      )}
      {/* Toán tử && có nghĩa là: 
            "Nếu isDropdownOpen là true, thì render component <LocationDropdown />"
            
            Chúng ta truyền hàm toggleDropdown vào prop 'onClose' 
            để component con có thể tự đóng chính nó.
          */}
      {/* ------------------------------------------------------ */}
      <div className="content">
        <p className="p-content">Đăng tin cho thuê</p>
        <div className="menu-ghim">
          {/* tabindex="0" thuộc tính HTML giúp một phần tử có thể nhận focus ** */}
          <div tabindex="0" onClick={() => scrollToSection(khuvucRef)}>
            Khu vực
          </div>
          <div tabindex="0" onClick={() => scrollToSection(mapRef)}>
            Map
          </div>
          <div tabindex="0" onClick={() => scrollToSection(thongtinRef)}>
            Thông tin mô tả
          </div>
          <div tabindex="0" onClick={() => scrollToSection(hinhanhRef)}>
            Hình ảnh
          </div>
          <div tabindex="0" onClick={() => scrollToSection(hopdongRef)}>
            Hợp đồng
          </div>
        </div>
      </div>
      <div className="page-dt">
        <div ref={khuvucRef} className="dangtin">
          <h3>Khu vực</h3>
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
                  {/* Lặp qua mảng provinces lấy từ sub-vn */}
                  {provinces.map((item) => (
                    // Lưu ý: Thư viện dùng 'code' và 'name'
                    <option key={item.code} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="phuong-xa">
                <p>
                  Phường/Xã <span className="ko-bt">(*)</span>
                </p>
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

            {/* ------------------------------------------------- */}

            <div>
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
                  {/* Lặp qua mảng districts */}
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
                  placeholder="VD: 123 Đường Nguyễn Huệ"
                  value={SoNha}
                  onChange={(e) => setSoNha(e.target.value)}
                ></input>
              </div>
            </div>
          </div>
          <div className="diachi">
            <p>Địa chỉ</p>
            <input
              className="input-kv"
              type="text"
              placeholder="Địa chỉ"
              value={getFullAddress()}
              readOnly
            ></input>
          </div>
        </div>
        {/* -----------------------page 2---------------------- */}

        <div ref={mapRef} className="dangtin">
          <h3>Map</h3>
          <div className="map">
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "400px" }}
                center={mapCenter}
                zoom={mapZoom}
                onLoad={(map) => (googleMapRef.current = map)}
              >
                <Marker position={mapCenter} />
              </GoogleMap>
            )}
          </div>
        </div>

        {/* -----------------------page 3---------------------- */}

        <div ref={thongtinRef} className="dangtin">
          <h3>Thông tin mô tả</h3>
          <div className="diachi">
            <p>
              Tiêu đề <span className="ko-bt">(*)</span>
            </p>
            <textarea
              className="textarea-td"
              value={TieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
            ></textarea>
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
            ></textarea>
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
              <div className="">
                <p>
                  Giá thuê <span className="ko-bt">(*)</span>
                </p>
                <input
                  type="text"
                  className="input-gt"
                  placeholder="Nhập giá thuê"
                  value={GiaThue}
                  onChange={(e) => setGiaThue(e.target.value)}
                ></input>
                <span>đồng/tháng</span>
              </div>
              <span className="dt-ghichu">
                (Vd: 2tr rưỡi - 2500000)
              </span>

              <div className="sonha">
                <p>
                  Ở được bao nhiêu người<span className="ko-bt">(*)</span>
                </p>
                <input
                  className="input-kv"
                  placeholder="Nhập số người ở"
                  type="text"
                  value={SoNguoi}
                  onChange={(e) => setSoNguoi(e.target.value)}
                ></input>
              </div>
            </div>

            {/* ------------------------------------------------- */}

            <div>
              <div className="">
                <p>
                  Diện tích <span className="ko-bt">(*)</span>
                </p>
                <input
                  className="input-dt"
                  placeholder="Nhập diện tích"
                  type="number"
                  value={DienTich}
                  onChange={(e) => setDienTich(e.target.value)}
                ></input>
                <span>m²</span>
              </div>
              <span className="dt-ghichu">
                (Diện tích nhập dấu "." vd: 1.5)
              </span>

              <div className="diachi">
                <p>
                  Số lượng phòng <span className="ko-bt">(*)</span>
                </p>
                <input
                  className="input-kv"
                  placeholder="Nhập số lượng phòng"
                  type="text"
                  value={SoLuongPhong}
                  onChange={(e) => setSoLuongPhong(e.target.value)}
                ></input>
              </div>
            </div>
          </div>
        </div>

        {/* -----------------------page 4---------------------- */}

        <div ref={hinhanhRef} className="dangtin">
          <h3>
            Hình ảnh <span className="ko-bt">(*)</span>
          </h3>
          {/* lable htmlFor="input-file" cho phép khi nhấn vào nó sẽ tự động focus vài thẻ file */}
          <label className="lable-ha" htmlFor="input-file">
            <div className="upload-ha">
              <div className="camera-icon">
                <i class="bxr  bx-camera-alt"></i>
              </div>
              <p>Tải ảnh và video từ thiết bị</p>
            </div>
          </label>
          {/* ẩn thẻ input này đi */}
          <input
            type="file"
            id="input-file"
            hidden
            multiple
            onChange={handleFileChange}
          ></input>
          <ul className="ghichu-ha">
            {HinhAnh.length > 0 && HinhAnh.length <= 10 ? (
              <li style={{ color: "green" }}>Đã chọn {HinhAnh.length} ảnh và video</li>
            ) : HinhAnh.length > 10 ? (
              <li style={{ color: "red" }}>Đã chọn {HinhAnh.length} ảnh và video</li>
            ) : (
              <li>Chưa chọn ảnh nào</li>
            )}
            <li>Tải tối đa 10 ảnh trong 1 bài đăng</li>
            <li>Dung lượng ảnh và video tối đa 30MB</li>
            <li>Hình ảnh liên quan đến phòng trọ</li>
            <li>Không chèn SDT, văn bản quảng cáo lên ảnh</li>
          </ul>
        </div>

        {/* -----------------------Hợp đồng---------------------- */}
        <div ref={hopdongRef} className="dangtin">
          <h3>
            Hợp đồng
          </h3>
          {/* lable htmlFor="input-file" cho phép khi nhấn vào nó sẽ tự động focus vài thẻ file */}
          <label className="lable-ha" htmlFor="input-PDF">
            <div className="upload-ha">
              <div className="camera-icon">
                <i class="bxr  bx-file-detail"></i>
              </div>
              <p>Tải file PDF</p>
            </div>
          </label>
          {/* ẩn thẻ input này đi */}
          <input
            type="file"
            id="input-PDF"
            accept="application/pdf" // chỉ cho phép file PDF
            hidden
            onChange={handlePdfChange}
          ></input>
          <ul className="ghichu-ha">
            {HopDongPDF ? (
              <li style={{ color: "green" }}>Đã chọn: {HopDongPDF.name}</li>
            ) : (
              <li>Chưa chọn file hợp đồng</li>
            )}
            <li>Chỉ tải file PDF</li>
            <li>Dung lượng tối đa 5MB</li>
          </ul>
        </div>

        <div className="">
          <button className="btn-dt" onClick={handleSubmit}>
            Đăng tin
          </button>
          {/* <button className="btn-dt" onClick={on_off_thanhtoan}>
            Đăng tin
          </button> */}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
    </div>
  );
}

export default Dangtin;
