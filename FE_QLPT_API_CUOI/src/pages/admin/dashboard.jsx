import React, { useState, useRef, useEffect, useContext } from "react";
import "/src/styles/admin/baidang.css"; // Import file CSS
import "/src/styles/admin/dashboard.css";
import { Link } from "react-router-dom";
import Popbaidangchitiet from "../admin/popbaidangchitiet";
import { Thongbaocontext } from "/src/context/thongbao";
import Loading from "/src/components/UI/loading.jsx";
import API from "/src/services/api.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import { useDelayLoading } from "/src/hooks/useDelayLoading";


function Dashboard() {

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



    //---------------------------------------------lấy dữ liệu-------------------------------------

    const [thongke, setThongke] = useState([]);

    // Tạo hàm fetchData ở scope component để có thể gọi lại từ nhiều nơi (ví dụ onSuccess)
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await API.get("Admin/thongke-tongquat");
            setThongke(response.data);
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
    // thanh toans
    const [thanhtoan, setThanhtoan] = useState([]);
    const fetchDatatt = async () => {
        setLoading(true);
        try {
            const response = await API.get("Admin/laydanhsachthanhtoan");
            setThanhtoan(response.data);
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
        fetchDatatt();
    }, []);

    return (
        <div className="page">
            {shouldShowLoading && <Loading />}
            <div className="user-content">
                <div>
                    <h2>Dashboard</h2>
                    
                </div>
            </div>
            <div className="db-thongke">
                <div className="bd-div-thongke">
                    <div className="bd-div-tbd">
                        <i class='bxr  bx-pencil-square'></i>

                        <span>Tổng bài đăng</span>
                        <h3>{thongke.tongBaiDang}</h3>
                    </div>
                </div>
                <div className="bd-div-thongke">
                    <div className="bd-div-tbd">
                        <i class='bx bx-key'></i>

                        <span>Tổng chủ trọ</span>
                        <h3>{thongke.tongChuTro}</h3>
                    </div>
                </div>
                <div className="bd-div-thongke">
                    <div className="bd-div-tbd">
                        <i class='bx bx-search-alt'></i>

                        <span>Tổng người thuê</span>
                        <h3>{thongke.tongNguoiThue}</h3>
                    </div>
                </div>
                <div className="bd-div-thongke">
                    <div className="bd-div-tbd">
                        <i class='bxr  bx-piggy-bank'></i>

                        <span>Tổng doanh thu</span>
                        <h3>{thongke.tongDoanhThu}</h3>
                    </div>
                </div>

            </div>

            <div className="db-ds-thongke">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Mã giao dịch</th>
                            <th>Phương thức</th>
                            <th>Số tiền</th>
                            <th>ID chủ trọ</th>
                            <th>Bài đăng</th>
                            <th>Trạng thái</th>
                            <th>Ngày thanh toán</th>
                        </tr>
                    </thead>
                    {/* ----------------------------------- */}
                    <tbody>
                        {thanhtoan.map((u) => {
                            return (
                                <tr >
                                    <td>{u.maGiaoDich}</td>
                                    <td>{u.phuongThuc}</td>
                                    <td>{u.soTien}</td>
                                    <td>{u.userId}</td>
                                    <td>{u.baiDangId}</td>
                                    <td>{u.trangThai}</td>

                                    <td>{u.ngayThanhToan}</td>


                                </tr>
                            );
                        })}
                    </tbody>
                </table>


            </div>

        </div>
    );
}

export default Dashboard;


// {/* Select Tháng */}
//                         <select 
//                             className="input-filter"
//                             style={{padding: "5px 10px", borderRadius: "5px", border: "1px solid #ccc"}}
//                             value={selectedMonth}
//                             onChange={(e) => setSelectedMonth(e.target.value)}
//                         >
//                             <option value="">-- Tất cả tháng --</option>
//                             {[...Array(12)].map((_, i) => (
//                                 <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
//                             ))}
//                         </select>

//                         // --- 2. CẬP NHẬT HÀM GỌI API ĐỂ NHẬN THAM SỐ ---
//     const fetchDatatt = async () => {
//         setLoading(true);
//         try {
//             // Tạo object params để gửi kèm
//             const params = {};
            
//             // Nếu có chọn tháng thì thêm vào params
//             if (selectedMonth !== "") {
//                 params.thang = selectedMonth;
//             }
//             // Nếu có chọn năm thì thêm vào params
//             if (selectedYear !== "") {
//                 params.nam = selectedYear;
//             }

//             // Gọi API với params (Axios sẽ tự chuyển thành ?thang=...&nam=...)
//             const response = await API.get("Admin/laydanhsachthanhtoan", { params: params });
//             setThanhtoan(response.data);

//         } catch (err) {
//             const loi = err.response && err.response.data
//                 ? typeof err.response.data === "string" ? err.response.data : err.response.data.message
//                 : "Không thể kết nối đến máy chủ.";
//             showthongbao(loi, "error");
//         } finally {
//             setLoading(false);
//         }
//     };