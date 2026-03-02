import "/src/styles/layout/gioithieu.css"; // Import file CSS
import React, { useState } from "react";


function Gioithieu() {
    return (
        <div className="page-gioithieu">
            <span className="gt-td">Tính năng nổi bật</span>
            <div className="gt-list">
                <div className="div-gt">
                    <i class='bxr  bx-home-heart'></i> 
                    <p>Hàng ngàn phòng trọ</p>
                    <span>Cập nhật liên tục, đa dạng giá và khu vực.</span>
                </div>
                <div className="div-gt">
                    <i class='bxr  bx-scan-search'></i> 
                    <p>Tìm kiếm thông minh</p>
                    <span>Lọc theo giá, vị trí, tiện ích, và hơn thế nữa.</span>
                </div>
                <div className="div-gt">
                    <i class='bxr  bx-bolt'></i> 
                    <p>Kết nối nhanh chóng</p>
                    <span>Liên hệ trực tiếp chủ trọ chỉ với 1 chạm.</span>
                </div>
            </div>
        </div>

    )
}

export default Gioithieu;