import React, { useRef, useEffect, useContext, useState } from "react";
import "/src/styles/chutro/popupthanhtoan.css";
import Avatar from "/src/assets/avatar.png";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "/src/context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";
import "/src/styles/popupttcn.css"; // Import file CSS
import API from "/src/services/api.jsx";

function Popupthanhtoan({ onClose, baidangid }) {
  //===============================show thông báo và loading=========================
  // thêm state loading
  const [loading, setLoading] = useState(false);

  // Lấy hàm hiển thị thông báo từ context
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);

  // ================= LẤY USER =================
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // chặn rander khi chưa đăng nhập
  if (!user) {
    return null;
  }

  // ================= XỬ LÝ CLICK NGOÀI  =================
  const dropdownRef = useRef(null);

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

  //===================gủi dữ liệu xử lý cho be=================
  const [soTien, setSoTien] = useState(null);
  const navigate = useNavigate();
  const handleThanhToan = async () => {
    if (soTien === null || soTien < 0) {
      showthongbao("Vui lòng chọn gói thanh toán", "error");
      return;
    }

    // ================== XỬ LÝ GÓI MIỄN PHÍ (0đ) ==================
    if (soTien === 0) {
      setLoading(true); // Bật loading
      try {
        // --- BƯỚC QUAN TRỌNG: GỌI API CẬP NHẬT TRẠNG THÁI ---

        // CÁCH 1: Nếu backend có API riêng cho gói miễn phí
        // await API.post("ThanhToan/KichHoatGoiMienPhi", {
        //   BaiDangId: baidangid,
        //   UserId: user.userId
        // });

        // CÁCH 2: Nếu backend dùng API cập nhật trạng thái chung
        // Giả sử trạng thái 1 là "Chờ duyệt"
        // Bạn cần thay đổi đường dẫn "BaiDang/CapNhatTrangThai" theo đúng API của bạn
        const res = await API.put(`BaiDang/capnhattt_choduyet/${baidangid}`);

        // Nếu API trả về thành công
        if (res.status === 200) {
          showthongbao("Đăng ký gói miễn phí thành công! Bài viết đang chờ duyệt.", "success");

          // Đóng popup
          onClose();

          // Chuyển trang sau 3,1 giây
          setTimeout(() => {
            navigate("/Chutro/Dstindang");
            window.location.reload();
          }, 3100);
        }

      } catch (error) {
        console.log(error);
        showthongbao("Lỗi khi cập nhật trạng thái bài đăng", "error");
      } finally {
        setLoading(false); // Tắt loading
      }

      return; // Kết thúc hàm, không chạy xuống phần VNPay
    }

    const baiDangId = baidangid;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("PhuongThuc", "Vnpay");
      formData.append("SoTien", soTien.toString());
      formData.append("BaiDangId", baidangid.toString());
      formData.append("UserId", user.userId);

      const response = await API.post("ThanhToan/Thanhtoan_vnpay", formData);

      if (response.data?.url) {
        window.location.href = response.data.url; // rời khỏi trang và truy cập vào đường link thanh toán
      } else {
        showthongbao("Không lấy được link thanh toán", "error");
      }
    } catch (error) {
      showthongbao(
        error.response?.data?.message || "Lỗi kết nối cổng thanh toán",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  //=====================gán gtri vào phần thông tin------------------------
  // 1. CẤU HÌNH GÓI DỊCH VỤ (Để tra cứu thông tin)
  const PACKAGES = {
    0: { label: "Miễn phí", days: 7 },
    15000: { label: "Vip 1 Tuần", days: 7 },
    30000: { label: "Vip 2 Tuần", days: 14 },
    50000: { label: "Vip 1 Tháng", days: 30 },
    90000: { label: "Vip 2 Tháng", days: 60 },
    // 100000: { label: "3 Tháng", days: 90 },
  };

  // 2. Hàm format tiền tệ (VD: 10000 => 10.000 ₫)
  const formatCurrency = (value) => {
    if (!value) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // 3. Hàm format ngày (VD: 28/12/2025)
  const formatDate = (date) => {
    return date.toLocaleDateString("vi-VN");
  };

  // 4. Tính toán thông tin hiển thị dựa trên soTien đang chọn
  const selectedPackage = PACKAGES[soTien]; // Lấy thông tin gói từ PACKAGES
  const today = new Date(); // Ngày bắt đầu (hôm nay)

  // Tính ngày kết thúc
  let endDate = new Date(today);
  if (selectedPackage) {
    endDate.setDate(today.getDate() + selectedPackage.days);
  }

  // ================= RENDER =================
  return (
    <div class="popup-overlay">
      <div className="form-pop-tt" ref={dropdownRef}>
        {loading && <Loading />}
        <h2 className="tt-tieude">Trang Thanh Toán</h2>
        <div className="page-tt">
          <div className="tt-form-chon">
            <h3 className="tt-h3">Gói miễn phí</h3>
            <div className="form-chon-tg">
              {/* sử dụng for và id để lk input vs table */}
              <input
                className="check-tt"
                id="1t"
                type="radio"
                name="tt-goi"
                value="0"
                onChange={(e) => setSoTien(Number(e.target.value))}
              ></input>
              <div className="tt-theotuan">
                <label for="1t" className="lable-theotuan">
                  <div>
                    <div className="div-tgian">
                      <div>1 tuần</div>
                      <div className="tt-gia">
                        0đ <i class="bxr  bx-currency-notes"></i>
                      </div>
                    </div>
                    <span>Khuyên dùng</span>
                  </div>
                </label>
              </div>
            </div>
            <p className="p-gch">Tin đăng sẽ phải chờ duyệt trước khi hiển thị</p>

            {/*------------------------------------------------------*/}
            <h3 className="tt-h3">Gói Vip</h3>
            <div className="form-chon-tg">
              {/* sử dụng for và id để lk input vs table */}
              <input
                className="check-tt"
                id="1tv"
                type="radio"
                name="tt-goi"
                value="15000"
                onChange={(e) => setSoTien(Number(e.target.value))}
              ></input>
              <div className="tt-theotuan">
                <label for="1tv" className="lable-theotuan">
                  <div>
                    <div className="div-tgian">
                      <div>1 tuần</div>
                      <div className="tt-gia">
                        15.000đ <i class="bxr  bx-currency-notes"></i>
                      </div>
                    </div>
                    <span>Khuyên dùng</span>
                  </div>
                </label>
              </div>

              <input
                className="check-tt"
                id="2tv"
                type="radio"
                name="tt-goi"
                value="30000"
                onChange={(e) => setSoTien(Number(e.target.value))}
              ></input>
              <div className="tt-theotuan">
                <label for="2tv" className="lable-theotuan">
                  <div>
                    <div className="div-tgian">
                      <div>2 tuần</div>
                      <div className="tt-gia">
                        30.000đ <i class="bxr  bx-currency-notes"></i>
                      </div>
                    </div>
                    <span>Khuyên dùng</span>
                  </div>
                </label>
              </div>

              <input
                className="check-tt"
                id="1thv"
                type="radio"
                name="tt-goi"
                value="50000"
                onChange={(e) => setSoTien(Number(e.target.value))}
              ></input>
              <div className="tt-theotuan">
                <label for="1thv" className="lable-theotuan">
                  <div>
                    <div className="div-tgian">
                      <div>1 tháng</div>
                      <div className="tt-gia">
                        50.000đ <i class="bxr  bx-currency-notes"></i>{" "}
                      </div>
                    </div>
                    <span>Khuyên dùng</span>
                  </div>
                </label>
              </div>

              <input
                className="check-tt"
                id="2thv"
                type="radio"
                name="tt-goi"
                value="90000"
                onChange={(e) => setSoTien(Number(e.target.value))}
              ></input>
              <div className="tt-theotuan">
                <label for="2thv" className="lable-theotuan">
                  <div>
                    <div className="div-tgian">
                      <div>2 tháng</div>
                      <div className="tt-gia">
                        90.000đ <i class="bxr  bx-currency-notes"></i>{" "}
                      </div>
                    </div>
                    <span>Khuyên dùng</span>
                  </div>
                </label>
              </div>
            </div>
            {/* ---------------------------------------------------------------------- */}
            <h3 className="tt-h3">Thông Tin Cá Nhân</h3>
            <div className="form-chon-tg">
              {/* sử dụng for và id để lk input vs table */}
              <div className="">
                <span>Họ Tên</span>
                <input
                  className="tt-input-ttcn"
                  type="text"
                  readOnly
                  value={user.hoten}
                ></input>
              </div>

              <div className="">
                <span>Số Điện Thoại</span>
                <input
                  className="tt-input-ttcn"
                  type="text"
                  readOnly
                  value={user.sdt}
                ></input>
              </div>
            </div>
            {/* -------------------------------------------------------------------- */}
          </div>
          {/* ------------------------------------------------------------------ */}
          <div className="tt-form-ttin">
            <h3 className="tt-h3">Thông Tin Thanh Toán</h3>
            <div className="tt-thanhtoan">
              <div className="tt-goi">
                <p>Gói:</p>
                <p>{selectedPackage ? selectedPackage.label : "Chưa chọn"}</p>
              </div>
              <div className="tt-goi">
                <p>Thời lượng:{" "}</p>
                <p>
                  {selectedPackage ? `${selectedPackage.days} ngày` : "Chưa chọn"}
                </p>
              </div>
              <div className="tt-goi">
                <p>Ngày bắt đầu:{" "}</p>
                <p>{selectedPackage ? formatDate(today) : "..."}</p>
              </div>
              <div className="tt-goi">
                <p>Ngày kết thúc:</p>
                <p>{selectedPackage ? formatDate(endDate) : "..."}</p>
              </div>
            </div>
            <div className="tt-tongcong">
              <hr />
              <div className="tt-goi">
                <p>Tổng cộng: </p>
                <p>{formatCurrency(soTien)}</p>
              </div>
            </div>

            <h3 className="tt-h3">Phương Thức Thanh Toán</h3>
            {/* <div>
              <label class="tt-lable-pt">
                <input type="radio" name="pt" />
                <span class="tt-custom-radio"></span>
                <span class="tt-text">Ví điện tử MoMo</span>
              </label>
            </div> */}
            <div>
              <label class="tt-lable-pt">
                <input type="radio" name="pt" />
                <span class="tt-custom-radio"></span>
                <span class="tt-text">VNPay</span>
              </label>
            </div>
            <div className="tt-btn-thanhtoan">
              <button onClick={handleThanhToan}>Thanh Toán</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Popupthanhtoan;
