import React from "react";
import "/src/styles/UI/thanhgat3nac.css";

// Nó nhận vào:
// - value: trạng thái hiện tại (0, 1, hoặc 2)
// - onChange: hàm xử lý khi thay đổi trạng thái
// - disabled: (tùy chọn) có cho phép thay đổi hay không
const Thanhgat3nac = ({ value = 0, onChange, disabled = false }) => {
  const handleClick = () => {
    if (disabled) return; // nếu disabled thì không làm gì
    const nextValue = (value + 1) % 3; // 0 → 1 → 2 → 0 tăng lên 1 nếu vượt quá 2 thì quay lại 0
    // 0 + 1 = 1 % 3 → 1
    // 1 + 1 = 2 % 3 → 2
    // 2 + 1 = 3 % 3 → 0

    onChange(nextValue); // gọi hàm onChange để component cha biết trạng thái mới.
  };

  return (
    <div
      className={`switch3 ${disabled ? "disabled" : ""} state-${value}`}  //điều_kiện ? "nếu đúng" : "nếu sai"
      onClick={handleClick}
    >
      <div className="slider3"></div>
    </div>
  );
};

export default Thanhgat3nac;
