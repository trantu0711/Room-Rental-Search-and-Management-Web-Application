import React, { useState } from "react";
import "../styles/admin.css"; // Import file CSS
import Logo from "/src/assets/logo_01.png";
import { Link, Outlet } from "react-router-dom";

function Admin() {
  return (
    <div className="admin">
      <div className="admin-container">
        <div className="admin-header">
          {/* <div className="admin-logo">
            <img src={Logo}></img>
          </div> */}
          <div className="admin-title">
            <h2>Admin Page</h2>
            <span>Quản lý hệ thống</span>
          </div>
          
        </div>
        <hr/>
        <div className="admin-menu">
          <ul className="admin-menu-list">
            <Link to="/">
              <li className="ad-home">
                <i class="bxrds  bx-home-alt"></i> Home
              </li>
            </Link>
            <Link to="/Admin/Dashboard">
              <li className="ad-tienich">
                <i class='bxr  bx-grid-circle-diagonal-right'></i>   Dashboard
              </li>
            </Link>
            <Link to="/Admin/User">
              <li className="ad-user">
                <i class="bxrds  bx-user bx-invert-opacity "></i> User
              </li>
            </Link>
            <Link to="/Admin/Baidang">
              <li className="ad-baidang">
                <i class="bxrds  bx-layout-minus"></i> Bài đăng
              </li>
            </Link>
            <Link to="/Admin/Comment">
              <li className="ad-comment">
                <i class="bxrds  bx-message-bubble-captions"></i> Comment
              </li>
            </Link>
            <Link to="/Admin/Tucam">
              <li className="ad-comment-ban">
                <i class='bxr  bx-message-circle-x' ></i>    Danh sách từ cấm
              </li>
            </Link>
            
          </ul>
        </div>
      </div>
      <div className="admin-container-right">
        <Outlet/>
      </div>
    </div>
  );
}

export default Admin;
