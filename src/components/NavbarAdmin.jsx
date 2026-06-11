import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/logoclean.png";
import "../styles/NavbarAdmin.css";

function NavbarAdmin() {

  const location = useLocation();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setAdmin(userData);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) =>
    location.pathname.startsWith(path) ? "nav-active" : "";


  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar-admin">

      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <i className="bi bi-list"></i>
      </button>

      <div className="nav-left">

        <div className="nav-brand">
          <img src={logo} alt="logo" />
          <span>Sistem Pelaporan Sampah Lingkungan</span>
        </div>

        <div className={`nav-menu ${sidebarOpen ? "show" : ""}`}>

        <div className="sidebar-header">
          <img src={logo} alt="logo" />
          <span>Admin</span>
        </div>

          <Link
            to="/admin/dashboard"
            className={isActive("/admin/dashboard")}
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-columns-gap"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/laporan"
            className={isActive("/admin/laporan")}
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-file-earmark-text"></i>
            <span>Laporan</span>
          </Link>

          <Link
            to="/admin/artikel-edukasi"
            className={isActive("/admin/artikel-edukasi")}
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-check2-square"></i>
            <span>Artikel Edukasi</span>
          </Link>

        </div>
      </div>

      <div className="user-section" ref={dropdownRef}>

        <div
          className="user-name"
          onClick={() => setOpenProfile(!openProfile)}
        >
          <i className="bi bi-person-circle"></i>

          {admin?.nama || "Admin"}

          <i
            className={`bi bi-chevron-down dropdown-icon ${
              openProfile ? "rotate" : ""
            }`}
          ></i>
        </div>

        <div
          className={`profile-dropdown ${
            openProfile ? "show" : ""
          }`}
        >
          <div className="profile-header">

            <div className="profile-avatar">
              <span>{admin?.nama?.charAt(0)}</span>
            </div>

            <div>
              <strong>{admin?.nama}</strong>
              <p>{admin?.email}</p>
            </div>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>

        </div>

      </div>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    </nav>
  );
}

export default NavbarAdmin;