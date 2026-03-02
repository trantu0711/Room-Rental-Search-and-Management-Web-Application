import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/404.css"; // Import file CSS
import Gif from "../assets/404.gif";

function NotFound() {
  return (
    <div className="notfound">
      <span className="sos">404</span>
      <img src={Gif} alt="404 Not Found" className="gif" />
      <span className="text">Look like you're lost!</span>
      <span className="text-sub">
        the page you are looking for is not available!
      </span>
      <div className="notfound-btn-div">
        <Link to="/Index">
          <button className="notfound-btn">Go to Home</button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
