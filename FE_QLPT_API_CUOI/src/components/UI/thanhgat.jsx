import React from 'react';
import '/src/styles/UI/thanhgat.css'; // File CSS cho nút gạt

// Nó nhận vào:
// - isChecked: trạng thái bật/tắt (true/false)
// - onChange: hàm xử lý khi gạt
// - disabled: (tùy chọn) có cho phép gạt hay không
const Thanhgat = ({ isChecked, onChange, disabled = false }) => {
  return (
    <label className={`switch ${disabled ? 'disabled' : ''}`}>
      <input 
        type="checkbox" 
        checked={isChecked} 
        onChange={disabled ? null : onChange} // Nếu disabled thì không gọi onChange
        disabled={disabled}
      />
      <span className="slider round"></span>
    </label>
  );
};

export default Thanhgat;