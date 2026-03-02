import "/src/styles/layout/footer.css"; // Import file CSS
import React, { useState } from "react";
import Logo from "/src/assets/logo_01.png"; // Ảnh logo

function Footer() {
  return (
    <div className="page-footer">
      <div className="footer-info">
        <div className="footer-contact">
          <div className="icon-footer">
            <i class="bxr  bx-user-voice"></i>
          </div>
          <div className="footer-contact-text">
            <span className="footer-contact-text-1">
              Có bất kỳ câu hỏi nào không? Hãy nhắn cho chúng tôi bất cứ lúc
              nào.
            </span>
            <br/>
            <span className="footer-contact-text-2">
              Hãy liên hệ chúng tôi bất cứ lúc nào trong ngày hay đêm, chúng tôi
              phục vụ 24h.
            </span>
          </div>
          <div className="footer-contact-phone">
            <span>Zalo ( 0909090909 )</span>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-link-logo">
            <img src={Logo}></img>
          </div>
          <div className="footer-mxh">
            <div className="mxh">
              <i class="bi bi-facebook"></i>
            </div>
            <div className="mxh">
              <i class="bi bi-tiktok"></i>
            </div>
            <div className="mxh">
              <i class="bi bi-youtube"></i>
            </div>
            <div className="mxh">
              <i class="bi bi-envelope-at"></i>
            </div>
          </div>
        </div>
        <hr className="hr-footer" />
        <div className="footer-banquyen">
          <div className="banquyen">
            <span>© Copyright 2025</span>
          </div>
          <div className="chinhsach">
            <div>Về Káto </div>
            <div>Chính sách bảo mật </div>
            <div>Điều khoản sử dụng </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Footer;
