import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom"; // Dùng useSearchParams để lấy dữ liệu trên URL dễ hơn
import API from "/src/services/api.jsx";
import Loading from "/src/components/UI/loading.jsx";
import "/src/styles/chutro/ketquathanhtoan.css"; // Import file CSS

function Ketquathanhtoan() {
  // Hook để lấy các tham số trên URL (vnp_Amount, vnp_TxnRef...)
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' hoặc 'error'
  const [message, setMessage] = useState("");

  // Lấy thông tin từ URL để hiển thị (tạm thời)
  // Lưu ý: vnp_Amount trả về đã nhân 100 nên phải chia 100
  const amount = searchParams.get("vnp_Amount")
    ? parseInt(searchParams.get("vnp_Amount")) / 100
    : 0;
  const txnRef = searchParams.get("vnp_TxnRef");
  const payDate = searchParams.get("vnp_PayDate"); // Định dạng yyyyMMddHHmmss

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // 1. Lấy toàn bộ query string gửi về server check chữ ký bảo mật
        const query = window.location.search;

        // 2. Gọi API xác thực
        const response = await API.get(`ThanhToan/PaymentCallback${query}`);

        // 3. Xử lý kết quả từ Server trả về
        if (response.data && response.data.code === "00") {
          setStatus("success");
          setMessage("Giao dịch thành công!");
        } else {
          setStatus("error");
          setMessage("Giao dịch thất bại hoặc bị hủy.");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
        setMessage("Lỗi kết nối đến server xác thực.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  // Hàm format tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Hàm format ngày giờ từ chuỗi VNPAY (yyyyMMddHHmmss)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    return `${day}/${month}/${year} - ${hour}:${minute}`;
  };

  // --- RENDER ---
  if (loading) return <Loading />;

  return (
    <div className="page-kq-tt">
      {loading && <Loading />}
      <h2>Kết Quả Thanh Toán</h2>
      <div className="kq-noidung">
        <div>
          <div className="thongbao-icon">
            {status === "error" && ( // nếu là lỗi
              <dotlottie-wc
                src="/animations/error.lottie"
                style={{ width: "100px", height: "100px" }}
                autoplay
                // loop="true"
              ></dotlottie-wc>
            )}
            {status === "success" && ( // nếu là thành công
              <dotlottie-wc
                src="animations/success.lottie"
                style={{ width: "120px", height: "120px" }}
                autoplay
                // loop
              ></dotlottie-wc>
            )}
          </div>
        </div>
        <div className="kq-tieude">
          {/* TIÊU ĐỀ */}
          <h3 style={{ color: status === "success" ? "#28a745" : "#dc3545" }}>
            {message}
          </h3>
        </div>
        <div className="kq-sotien">
          {/* TIÊU ĐỀ */}
          <h2>{formatCurrency(amount)}</h2>
        </div>
        <div className="kq-tgian">
          <p>Thời gian thanh toán:</p>
          <p>{formatDate(payDate)}</p>
        </div>
        <hr className="kq-hr" />
        <div className="kq-tgian">
          <p>Mã giao dịch:</p>
          <p>{txnRef}</p>
        </div>
        <hr className="kq-hr" />
        <div className="kq-tgian">
          <p>Dịch vụ:</p>
          <p>Thanh toán bài đăng</p>
        </div>
        <hr className="kq-hr" />
        <div className="kq-tgian">
          <p>Kết quả:</p>
          <p>{status === "success" ? "Thành công" : "Thất bại"}</p>
        </div>
        <div>
          <Link to={"/Chutro/Dstindang/"}>
            <button className="kq-btn">Tiếp tục</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Ketquathanhtoan;
