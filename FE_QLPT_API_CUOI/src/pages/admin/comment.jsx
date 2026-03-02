import React, { useRef, useEffect, useContext, useState } from "react";
import "/src/styles/admin/user.css"; // Import file CSS
import Loading from "/src/components/UI/loading.jsx";
import { Xacnhancontext } from "../../context/xacnhan";
import { Thongbaocontext } from "/src/context/thongbao";
import API from "/src/services/api.jsx";

function Comment() {
  //===============================show thông báo và loading=========================
  const [loading, setLoading] = useState(false);

  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext);

  // --------------------------------lấy dữ liệu comment-----------------------

  const [dscomment, setdscomment] = useState(null);
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // 1. Lấy chi tiết phòng hiện tại
        const response = await API.get(`DanhGia/laydsdanhgia`);
        setdscomment(response.data);
      } catch (err) {
        showthongbao("Lỗi tải dữ liệu:", "error");
      } finally {
        setLoading(false);
      }
    };

    // Reset state khi ID thay đổi (quan trọng khi bấm vào phòng tương tự)
    setLoading(true);
    fetchData();
  }, []);

  return (
    <div className="page">
      {loading && <Loading />}
      <div className="user-content">
        <div>
          <h2>Quản lý Người Dùng</h2>
        </div>
      </div>
      <div className="user-data">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>ID Bài đăng</th>
              <th>ND Comment</th>
              <th>Sao</th>
              <th>Ngày Comment</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dscomment?.map((ds) => (
              <tr>
                <td>{ds?.danhgiaid}</td>
                <td>{ds?.hoTen}</td>
                <td>{ds?.baidangid}</td>
                <td>{ds?.comment}</td>
                <td>{ds?.sao}</td>
                <td>{ds?.ngayComment}</td>
                <td className="">
                  {/* <button className="btn-tc">xóa</button>
                  <button className="">sửa</button> */}
                </td>
              </tr>
            ))}

            {/* <tr>
              <td>01</td>
              <td>Phạm Thị Khánh Hòa</td>
              <td>0909090909</td>
              <td>123456789000</td>
              <td>Chủ trọ</td>
              <td>người thuê</td>
              <td className="">
                <button className="btn-tc">xóa</button>
                <button className="">sửa</button>
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Comment;
