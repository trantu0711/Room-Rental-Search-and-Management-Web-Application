// Tạo file mới tên là LocationDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import "/src/styles/UI/popuploc.css"; //
import {
  getProvinces,
  getDistrictsByProvinceCode,
  getWardsByDistrictCode,
} from "sub-vn";

// Component này nhận 1 prop tên là 'onClose' mà chúng ta đã truyền từ cha
function LocationDropdown({ onClose, onApplyFilter }) {
  // State để quản lý tab (TPHCM, Hà Nội, Đà Nẵng)
  // const [activeTab, setActiveTab] = useState('tphcm');

  const dropdownRef = useRef(null);

  // Xử lý click ra ngoài để đóng popuploc
  useEffect(() => {
    function handleClickOutside(event) {
      // Nếu click TRONG popup thì KHÔNG đóng
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return;
      }

      // Click ngoài thì ĐÓNG
      onClose();
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  //--------------------------------------------------
  // Địa lý
  const [ProvinceId, setProvinceId] = useState(""); // lưu mã tỉnh / tp
  const [DistrictId, setDistrictId] = useState(""); // mã huyện / quận
  const [WardId, setWardId] = useState(""); // mã phường xã
  // Danh sách (Lấy từ thư viện)
  const [provinces, setProvinces] = useState([]); // lấy Danh sách tỉnh từ thư viện dùng thư viện sub-vn
  const [districts, setDistricts] = useState([]); // Danh sách huyện
  const [wards, setWards] = useState([]); // xã
  // Thông tin chi tiết lấy thông tin tư ô nhập liệu

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
    setProvinceId(proCode); // lấy mã tỉnh từ select
    setDistrictId(""); // Reset huyện cũ
    setWardId([]); // reset xã cũ
    // Dùng hàm của thư viện để lấy huyện theo mã tỉnh
    // Lưu ý: proCode là string, thư viện xử lý tốt
    const districtList = getDistrictsByProvinceCode(proCode); // lấy ds huyện thuộc tỉnh
    setDistricts(districtList); // rander lại ds huyện
  };

  // xử lý khi chọn huyện
  const handleDistrictChange = (e) => {
    const disCode = e.target.value;
    setDistrictId(disCode); // lây mã huyện

    // Reset cấp con
    setWardId(""); // Reset Phường khi đổi Quận

    // Lấy danh sách phường theo mã quận
    const wardList = getWardsByDistrictCode(disCode);
    setWards(wardList); // rander quận huyện
  };

  //  Hàm xử lý khi chọn Phường không có cấp con
  const handleWardChange = (e) => {
    setWardId(e.target.value);
  };

  // 1. Tạo state lưu giá trị các ô chọn
  const [filters, setFilters] = useState({
    dienTich: "",
    mucGia: "",
  });

  // 2. Hàm xử lý khi người dùng chọn option
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 3. Xử lý khi nhấn nút ÁP DỤNG
// 3. Xử lý khi nhấn nút ÁP DỤNG
  const handleApply = () => {
    // Tạo object dữ liệu cuối cùng để gửi đi
    const dataFilter = {
      ...filters,           // Lấy dienTich và mucGia từ state filters
      tinhThanh: ProvinceId, // Lấy từ state ProvinceId
      quanHuyen: DistrictId, // Lấy từ state DistrictId
      phuongXa: WardId       // Lấy từ state WardId
    };

    console.log("Dữ liệu lọc gửi đi:", dataFilter);
    
    // Gọi hàm từ Index truyền xuống để lọc
    onApplyFilter(dataFilter);

    // Đóng popup
    onClose();
  };
  return (
    <div className="dropdown-panel" ref={dropdownRef}>
      <div className="section-khuvuc">
        <i class="bxrds  bx-piggy-bank"></i>
        <h3>Tìm theo kích thước & giá</h3>
      </div>
      <div>
        <div className="dropdown-select-list1">
          <select className="select-loc1"
           name="dienTich" 
            onChange={handleChange}
          >
            <option value="0">Chọn kích thước</option>
            <option value="duoi20">Nhỏ hơn 20m²</option>
            <option value="20-30">20m² - 30m²</option>
            <option value="30-50">30m² - 50m²</option>
            <option value="tren50">Lớn hơn 50m²</option>
          </select>

          <select className="select-loc1"
          name="mucGia" 
            onChange={handleChange}
          >
            <option value="">Chọn mức giá</option>
            <option value="duoi2">Dưới 2 triệu</option>
            <option value="2-4">2 triệu - 4 triệu</option>
            <option value="4-6">4 triệu - 6 triệu</option>
            <option value="tren6">Trên 6 triệu</option>
          </select>
        </div>
      </div>

      {/*Tìm theo khu vực */}
      <div className="dropdown-section">
        <div className="section-khuvuc">
          <i class="bxrds  bx-building-house"></i>
          <h3>Tìm theo khu vực</h3>
        </div>

        {/* Các ô chọn */}
        <div className="dropdown-select-list">
          <div>
            <select
              className="select-loc"
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

          {/* ----------------- */}
          <div>
            <select
              className="select-loc"
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

          {/* ----------------- */}
          <div>
            <select
              className="select-loc"
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
      </div>

      {/* Phần 3: Footer có 2 nút */}
      <div className="dropdown-footer">
        <button className="btn-apply" onClick={handleApply}>Áp dụng</button>
      </div>
    </div>
  );
}

export default LocationDropdown;
