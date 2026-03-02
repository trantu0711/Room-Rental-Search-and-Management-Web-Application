import React, { useRef, useEffect, useContext, useState } from "react";
import "/src/styles/chutro/popupthanhtoan.css";
// import Avatar from "/src/assets/avatar.png"; // Không dùng thì có thể bỏ
// import { Link, useNavigate } from "react-router-dom"; 
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "/src/context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";
import "/src/styles/popupttcn.css";
import API from "/src/services/api.jsx";
import "/src/styles/chutro/popuphopdong.css";

const BACKEND_URL = "https://localhost:7072";

function Popupxemchitiethopdong({ onClose, phongId }) {
    const [loading, setLoading] = useState(false);
    const { showthongbao } = useContext(Thongbaocontext);
    // const { showxacnhan } = useContext(Xacnhancontext); // Chưa dùng có thể bỏ

    const dropdownRef = useRef(null);

    // --- XỬ LÝ CLICK NGOÀI ĐỂ ĐÓNG POPUP ---
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    // --- GỌI API ---
    const [cthopdong, setcthopdong] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Gọi API theo đúng đường dẫn trong Swagger
                const response = await API.get(`HopDong/xemhopdong/${phongId}`);
                const data = response.data;
                console.log("Dữ liệu chi tiết hợp đồng", data);
                setcthopdong(response.data);
            } catch (err) {
                const loi = err.response && err.response.data
                    ? typeof err.response.data === "string"
                        ? err.response.data
                        : err.response.data.message
                    : err.message || "Không thể kết nối đến máy chủ.";
                showthongbao(loi, "error");
                onClose(); // Nếu lỗi thì đóng popup luôn
            } finally {
                setLoading(false);
            }
        };

        if (phongId) {
            fetchData();
        }
    }, [phongId]); // Thêm phongId vào dependency để nếu ID đổi thì gọi lại

    // --- LOGIC XỬ LÝ DỮ LIỆU (Chỉ chạy khi có dữ liệu) ---
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    // Chuẩn bị biến để hiển thị
    let hienThiTrangThai = "";
    let mauSac = "orange";
    let pdfUrl = null;

    if (cthopdong) {
        // 1. Xử lý logic trạng thái
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ngayKetThuc = new Date(cthopdong.ngayKetThuc);
        ngayKetThuc.setHours(0, 0, 0, 0);

        const isHetHan = ngayKetThuc < today;

        hienThiTrangThai = cthopdong.trangThaiHopDong; // Lấy mặc định từ DB

        if (cthopdong.trangThaiHopDong === "Đang hiệu lực") {
            if (isHetHan) {
                hienThiTrangThai = "Đã kết thúc (Hết hạn)";
                mauSac = "#dc3545"; // Màu đỏ báo động
            } else {
                mauSac = "#28a745"; // Màu xanh lá
            }
        } else if (cthopdong.trangThaiHopDong === "Đã kết thúc") {
            mauSac = "#6c757d"; // Màu xám
        }

        // 2. Xử lý Link PDF
        if (cthopdong.noiDungHopDong) {
            // Kiểm tra xem đường dẫn có phải file pdf không (tuỳ chọn)
            pdfUrl = `${BACKEND_URL}${cthopdong.noiDungHopDong}`;
        }
    }

    // --- RENDER ---
    // Nếu đang loading thì hiện Loading component
    if (loading) return <Loading />;

    // Nếu không có dữ liệu (và không loading) thì không hiện gì hoặc hiện thông báo
    if (!cthopdong) return null;

    return (
        <div className="popup-overlay">
            {/* Thêm ref vào đây để bắt sự kiện click outside */}
            <div className="form-pop-tt" ref={dropdownRef}>
                <h2 className="tt-tieude">Xem chi tiết hợp đồng</h2>

                {/* Thông tin người thuê */}
                <div className="thd-tkh">
                    <label>Người thuê:</label>
                    <div style={{ fontWeight: "bold", fontSize: "16px", color: "#333" }}>
                        {cthopdong.tenKhach}{" "}
                        <span style={{ fontWeight: "normal", color: "#666" }}>
                            - {cthopdong.sdtKhach}
                        </span>
                    </div>
                </div>

                {/* Ngày bắt đầu - kết thúc */}
                <div className="thd-ngaythang" style={{ display: "flex", gap: "20px" }}>
                    <div className="thd-bd" style={{ flex: 1 }}>
                        <label>Ngày bắt đầu:</label>
                        <input
                            type="text"
                            value={formatDate(cthopdong.ngayBatDau)}
                            readOnly
                            disabled
                            className="input-readonly" // Nên thêm class CSS để style đẹp hơn
                        />
                    </div>
                    <div className="thd-bd" style={{ flex: 1 }}>
                        <label>Ngày kết thúc:</label>
                        <input
                            type="text"
                            value={formatDate(cthopdong.ngayKetThuc)}
                            readOnly
                            disabled
                            className="input-readonly"
                        />
                    </div>
                </div>

                {/* Trạng thái hợp đồng */}
                <div className="thd-file">
                    <label>Trạng thái:</label>
                    <div
                        style={{
                            color: mauSac,
                            fontWeight: "bold",
                            fontSize: "15px",
                            border: `1px solid ${mauSac}`,
                            padding: "8px",
                            borderRadius: "5px",
                            textAlign: "center",
                            backgroundColor: `${mauSac}1a` // Thêm độ trong suốt cho nền
                        }}
                    >
                        {hienThiTrangThai}
                        {/* Đã sửa: Dùng biến hienThiTrangThai cục bộ, không phải cthopdong.hienThiTrangThai */}
                    </div>
                </div>

                {/* Link tải PDF
                {pdfUrl && (
                    <div className="form-group" style={{ marginTop: "15px" }}>
                        <label>File đính kèm:</label>
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-download"
                            style={{
                                display: "block",
                                textAlign: "center",
                                padding: "10px",
                                backgroundColor: "#007bff",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "4px"
                            }}
                        >
                            <i className="fa fa-download"></i> Tải/Xem Hợp Đồng PDF
                        </a>
                    </div>
                )} */}

                {/* Nút đóng modal */}
                {/* <div className="modal-actions">
                    <button onClick={onClose} className="btn-cancel">
                        Đóng
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default Popupxemchitiethopdong;