import { createContext, useContext, useState } from "react";
import "/src/styles/context/xacnhan.css"; // Import file CSS


export const Xacnhancontext = createContext();

// children đại diện cho các component con mà nó bọc. (giao diện bên trong là các router)
function Xacnhan({ children }) {
  const [state, setState] = useState({
    open: false, //popup mở hay chưa mặc định đóng
    message: "", // nội dung hiển thị
    resolve: null, //hàm trả kết quả true/false cho nơi gọi
  });

  // Hàm confirm dùng toàn hệ thống
  const showxacnhan = (message) => {
    //nhận vào thông báo
    // Promise là một đối tượng đại diện cho một giá trị có thể chưa có sẵn tại thời điểm tạo Promise.
    // Nó thường được dùng cho các tác vụ bất đồng bộ.
    return new Promise((resolve) => {
      // khỏi tạo promise trả về gtrij réolve true hoặc false
      setState({
        // cập nhật trạng thái
        open: true, // mở hộp thoại
        message, // truyền tin nhắn nhận đc vào state
        resolve, // cập nhật resolve xem ng dùng xác nhận hay từ chối
      });
    });
  };

  // javascript
  // confirm("Bạn có chắc chắn muốn xóa mục này?").then((result) => {
  //   if (result) {
  //     // Thực hiện xóa nếu người dùng đồng ý
  //     console.log("Đã xóa");
  //   } else {
  //     // Hủy xóa nếu người dùng không đồng ý
  //     console.log("Đã hủy");
  //   }
  // });

  // Khi người dùng bấm "Xác nhận"
  const handleConfirm = () => {
    state.resolve(true); // trả kq true về nơi gọi hàm showxacnhan
    setState({ ...state, open: false }); // đóng thông báo
  };

  // Khi người dùng bấm "Huỷ"
  const handleCancel = () => {
    state.resolve(false);
    setState({ ...state, open: false });
  };

  return (
    <Xacnhancontext.Provider value={{ showxacnhan }}>
      {children}
      {state.open && (
        <div className="page-xacnhan">
          <div className="xacnhan-popup">
            <div className="xacnhan-nd">
              <div className="xacnhan-icon">
                <dotlottie-wc
                  src="/animations/warning.lottie"
                  style={{ width: "120px", height: "120px" }}
                  autoplay
                  loop
                ></dotlottie-wc>
              </div>
              <div className="xacnhan-message">
                <h3>Thông báo</h3>
                <p>{state.message}</p>
                <div className="xacnhan-btn">
                  <button className="btn-xn-huy" onClick={handleCancel}>
                    Huỷ
                  </button>
                  <button className="btn-xn-xacnhan" onClick={handleConfirm}>
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Xacnhancontext.Provider>
  );
}

export default Xacnhan;

// cách dùng
// const handleDelete = async () => {
//   const ok = await showxacnhan("Bạn có chắc muốn xóa bài này?");

//   if (!ok) return;

//   await API.delete(...);
//   showthongbao("Đã xóa thành công", "success");
// };
