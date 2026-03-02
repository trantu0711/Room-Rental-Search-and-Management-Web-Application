import React, { useState, useEffect, useContext } from "react";
import "/src/styles/admin/baidang.css";
import "/src/styles/admin/commentcam.css";
import { Thongbaocontext } from "/src/context/thongbao";
import { Xacnhancontext } from "../../context/xacnhan"; // Import context xác nhận
import API from "/src/services/api.jsx";
import Loading from "/src/components/UI/loading.jsx";

function TuCam() {
  //-------------------------- State & Context --------------------
  const [loading, setLoading] = useState(false);
  const { showthongbao } = useContext(Thongbaocontext);
  const { showxacnhan } = useContext(Xacnhancontext); // Dùng để hỏi "Bạn chắc chắn muốn xóa?"

  const [dsTuCam, setDsTuCam] = useState([]);
  const [tuMoi, setTuMoi] = useState(""); // State lưu từ khóa đang nhập

  //-------------------------- Lấy dữ liệu ------------------------
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await API.get("TuCam/danhsachtucam");
      const data = response.data;
      console.log("Dữ liệu từ cấm:", data);
      const dataDaSapXep = response.data.sort((a, b) => a.tuCamId - b.tuCamId);

      setDsTuCam(dataDaSapXep);
    } catch (err) {
      const loi = err.response?.data || "Không thể tải danh sách.";
      showthongbao(typeof loi === "string" ? loi : loi.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //-------------------------- Xử lý Thêm Từ Cấm ------------------
  const handleThem = async () => {
    if (!tuMoi.trim()) {
      showthongbao("Vui lòng nhập từ khóa!", "error");
      return;
    }

    try {
      // Backend nhận [FromBody] CTuCam => Gửi object JSON { noiDung: "..." }
      await API.post("TuCam/them", { noiDung: tuMoi });

      showthongbao("Thêm từ cấm thành công!", "success");
      setTuMoi(""); // Xóa ô nhập sau khi thêm
      fetchData(); // Load lại danh sách
    } catch (err) {
      const loi = err.response?.data || "Lỗi khi thêm từ.";
      showthongbao(typeof loi === "string" ? loi : loi.message, "error");
    }
  };

  //-------------------------- Xử lý Xóa Từ Cấm -------------------
  const handleXoa = async (id) => {
    // Hỏi xác nhận trước khi xóa
    const ok = await showxacnhan("Bạn chắc chắn muốn xóa từ khóa này?");
    if (!ok) return;

    try {
      await API.delete(`TuCam/xoa/${id}`);
      showthongbao("Đã xóa thành công!", "success");
      fetchData(); // Load lại danh sách
    } catch (err) {
      const loi = err.response?.data || "Lỗi khi xóa.";
      showthongbao(typeof loi === "string" ? loi : loi.message, "error");
    }
  };

  //-------------------------- Render -----------------------------
  return (
    <div className="page">
      {loading && <Loading />}
      <div className="tucam-content">
        <div><h2>Quản lý Từ Cấm</h2></div>

        <div
          className="tc-input"
        >
          <input
            type="text"
            placeholder="Nhập từ cấm cần thêm..."
            value={tuMoi}
            onChange={(e) => setTuMoi(e.target.value)}
            className="input-dt"
            style={{
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              flex: 1,
            }}
          />
          <button
            onClick={handleThem}
            style={{
              padding: "8px 15px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            <i className="bx bx-plus"></i> Thêm
          </button>
        </div>

      </div>

      <div className="user-data">
        <table
          className="tc-table"
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Từ khóa</th>
              <th className="tc-th-hanhdong">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {dsTuCam.map((tc) => (
              <tr key={tc.tuCamId}>
                <td>{tc.tuCamId}</td>
                {/* Hiển thị noiDung (theo C#) hoặc tuKhoa nếu backend cũ */}
                <td >
                  {tc.noiDung}
                </td>
                <td className="tc-td-hanhdong">
                  <button className="btn-xoa" onClick={() => handleXoa(tc.tuCamId)}>
                    <i className="bx bx-trash"></i>

                  </button>
                </td>
              </tr>
            ))}

            {dsTuCam.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Chưa có từ cấm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TuCam;