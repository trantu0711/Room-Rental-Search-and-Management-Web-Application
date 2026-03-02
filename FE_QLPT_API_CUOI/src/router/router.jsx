import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dangky from "../pages/auth/dangky.jsx";
import Dangnhap from "../pages/auth/dangnhap.jsx";
import Index from "../pages/index.jsx";
import Menu from "../components/layout/menu.jsx";
import NotFound from "../pages/404.jsx";
import Admin from "../pages/admin.jsx";
import User from "../pages/admin/user.jsx";
import Comment from "../pages/admin/comment.jsx";
import Popup from "/src/components/UI/popupuser.jsx";
import Chutro from "../pages/chutro.jsx";
import Dangtin from "/src/pages/chutro/dangtin.jsx";
import Thongtinphong from "/src/pages/thongtinphong.jsx";
import Loading from "../components/UI/loading.jsx";
import Dstindang from "../pages/chutro/dstindang.jsx";
import Baidang from "../pages/admin/baidang.jsx";
import Popbaidangchitiet from "../pages/admin/popbaidangchitiet.jsx";
import Banner from "../components/layout/banner.jsx";
import Gioithieu from "../components/layout/gioithieu.jsx";
import Footer from "../components/layout/footer.jsx";

import Thongbao from "../context/thongbao.jsx";
import Dsphong from "../pages/chutro/dsphong.jsx";
// import Demo from "../text.jsx";
import Xacnhan from "../context/xacnhan.jsx";
import Poplienhe from "../pages/nguoithue/poplienhe.jsx";
import Popupttcn from "../pages/popupttcn.jsx";
import Ketquathanhtoan from "../pages/chutro/ketquathanhtoan.jsx";
import Popupthanhtoan from "../pages/chutro/popupthanhtoan.jsx";
import Suabaidang from "../pages/chutro/suabaidang.jsx";
import Popupxemhd from "../pages/nguoithue/popupxemhd.jsx";
import Popuphopdong from "../pages/chutro/popuphopdong.jsx";
import TuCam from "../pages/admin/commentcam.jsx";
import Dashboard from "../pages/admin/dashboard.jsx";


function Router() {
  return (
    <BrowserRouter>
      <Thongbao>
        {/* Bao bọc toàn bộ ứng dụng để cung cấp context thông báo */}
        <Xacnhan>
          <Routes>
            {/* -------------trang thông thường--------------------- */}
            <Route path="/" element={<Index />} />
            <Route path="/Dangnhap" element={<Dangnhap />} />
            <Route path="/Dangky" element={<Dangky />} />
            <Route path="/Index" element={<Index />} />
            <Route path="/Menu" element={<Menu />} />
            <Route path="/Thongtinphong/:id" element={<Thongtinphong />} />
            <Route path="/Loading" element={<Loading />} />
            <Route path="/Banner" element={<Banner />} />
            <Route path="/Gioithieu" element={<Gioithieu />} />
            <Route path="/Footer" element={<Footer />} />
            <Route path="/Dsphong" element={<Dsphong />} />
            <Route path="Popuplienhe" element={<Poplienhe />} />
            {/* <Route path="/Thongtincanhan" element={<ThongTinCaNhan />} /> */}
            <Route path="Popupttcn" element={<Popupttcn />} />
            <Route path="Ketquathanhtoan" element={<Ketquathanhtoan />} />
            <Route path="Popupthanhtoan" element={<Popupthanhtoan />} />
            <Route path="Popupxemhd" element={<Popupxemhd />} />
            <Route path="Popuphopdong" element={<Popuphopdong />} />


            {/* <Route path="/Demo" element={<Demo />} /> */}

            {/* -----------trang admin------------- */}
            <Route path="/Admin" element={<Admin />}>
              {" "}
              {/*router cha */}
              {/* route mặc định khi vào admin */}
              <Route index element={<User />} />
              {/* các router con */}
              <Route path="User" element={<User />} />
              <Route path="Comment" element={<Comment />} />
              <Route path="Baidang" element={<Baidang />} />
              <Route path="Tucam" element={<TuCam/>} />
              <Route path="Dashboard" element={<Dashboard/>} />
              
              <Route path="Popbaidangchitiet" element={<Popbaidangchitiet />} />
            </Route>
            {/* ------------------------------------ */}

            {/* -----------trang chutro------------- */}
            {/*router cha */}
            <Route path="/Chutro" element={<Chutro />}>
              {/* route mặc định khi vào admin */}
              <Route index element={<Dangtin />} />
              {/* các router con */}
              <Route path="Dangtin" element={<Dangtin />} />
              <Route path="Dstindang" element={<Dstindang />} />
              <Route path="Suabaidang/:id" element={<Suabaidang />} />
              
              <Route path="Dsphong/:id" element={<Dsphong />} />
            </Route>
            {/* ------------------------------------ */}

            {/* ---------------trang lỗi--------------------- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Xacnhan>
      </Thongbao>
    </BrowserRouter>
  );
}

export default Router;
