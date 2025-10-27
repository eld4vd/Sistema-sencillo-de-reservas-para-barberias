import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingWhatsappButton from "../common/FloatingWhatsappButton";

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#070707] text-white">
      <Navbar />
      <Outlet />
      <FloatingWhatsappButton />
      <Footer />
    </div>
  );
};

export default Layout;
