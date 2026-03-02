//file context chứa dữ liệu/chức năng dùng chung cho toàn ứng dụng, không phải giao diện.
// vd: thông báo, user, giỏ hàng, theme...
// là logic không phải UI

import { createContext, useState } from "react";
import "/src/styles/context/thongbao.css"; // Import file CSS

// là một hàm của React. export const có nghĩa là hằng (constant)
// ThongbaoContext này được xuất ra (export) để có thể sử dụng trong các
// file JavaScript khác. dùng để truyền giao diện
export const Thongbaocontext = createContext();

// 2. Tạo Provider (component bọc app, cung cấp value cho toàn app)
//Provider này sẽ cung cấp dữ liệu cho các component con thông qua context ThongbaoContext.
function Thongbao({ children }) {
  // children đại diện cho các component con mà nó bọc. (giao diện bên trong là các router)
  const [message, setMessage] = useState(null); // state để lưu trữ tin nhắn thông báo
  const [type, setType] = useState("success"); // state để lưu trữ loại thông báo

  // Hàm để hiển thị thông báo
  const showthongbao = (msg, t = "success") => {
    // nhận msg là nội dung thông báo
    setMessage(msg); // Cập nhật tin nhắn
    setType(t); // Cập nhật loại thông báo
    // Tự động ẩn sau 2 giây
    setTimeout(() => {
      setMessage(null); // ẩn thông báo
      setType("success"); // reset về mặc định
    }, 3000);
  };

  return (
    //Điều này có nghĩa là tất cả các component con được bọc bởi Thongbao đều có thể truy cập
    //  vào hàm showthongbao thông qua useContext(ThongbaoContext).
    <Thongbaocontext.Provider value={{ showthongbao }}>
      {" "}
      {/* cung cấp hàm showthongbao cho toàn app*/}
      {children}
      {message && (
        <div className="page-thongbao" 
        //chặn click xuyên qua khi thông báo xuất hiện ko clich vào đâu đc cá
        onMouseDown={(e) => e.stopPropagation()}>

          <div className="thongbao-popup">
            <div className="thongbao-icon">
              {type === "error" && ( // nếu là lỗi
                <dotlottie-wc
                  src="/animations/error.lottie"
                  style={{ width: "100px", height: "100px" }}
                  autoplay
                // loop="true"
                ></dotlottie-wc>
              )}
              {type === "success" && ( // nếu là thành công
                <dotlottie-wc
                  src="/animations/success.lottie"
                  style={{ width: "100px", height: "100px" }}
                  autoplay
                // loop
                ></dotlottie-wc>
              )}
            </div>
            <div className="thongbao-message">
              <h3>Thông báo</h3>
              <p>{message}</p>
            </div>
          </div>
        </div>
      )}
    </Thongbaocontext.Provider>
  );
}

export default Thongbao;
