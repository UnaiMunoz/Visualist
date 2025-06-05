import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const location = useLocation();

  // Páginas donde no queremos mostrar el footer
  const noFooterPages = ["/profile"];

  // Verificar si la página actual está en la lista de páginas sin footer
  const shouldHideFooter = noFooterPages.includes(location.pathname);

  return (
    <div className="layout">
      <Navbar />
      <main className="main">{children}</main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default Layout;
