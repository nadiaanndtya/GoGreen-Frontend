import logo from "../assets/logoclean.png";
import { useNavigate, NavLink, useLocation} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import NotificationBell from "./NotificationBell";

function Navbar() {

  const [mobileMenu, setMobileMenu] = useState(false);
  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [formPass, setFormPass] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const location = useLocation();
  
  const dropdownRef = useRef();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 

  const [errors, setErrors] = useState({});

  const [showPass, setShowPass] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const closeModal = () => {
    setShowChangePass(false);

    // reset semua state
    setFormPass({
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    });

    setErrors({});
    setMessage("");
  };

  const togglePassword = (field) => {
    setShowPass((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, []);

  useEffect(() => {
    if (showChangePass) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, [showChangePass]);

  useEffect(() => {
    if (mobileMenu) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, [mobileMenu]);

  useEffect(() => {
    if (mobileMenu) {
      setOpenProfile(false);
    }
  }, [mobileMenu]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenProfile(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleChangePassword = async () => {

    const newErrors = {};

    if (!formPass.oldPassword) {
      newErrors.oldPassword = "Password lama wajib diisi";
    }

    if (formPass.newPassword.length < 8) {
      newErrors.newPassword = "Password minimal 8 karakter";
    }

    if (formPass.newPassword === formPass.oldPassword) {
      newErrors.newPassword = "Password baru tidak boleh sama dengan password lama";
    }

    if (formPass.newPassword !== formPass.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak sama";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formPass.oldPassword,
          newPassword: formPass.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Password berhasil diubah");
        setMessageType("success");

        setFormPass({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });

        setErrors({}); 

        setTimeout(() => {
          setShowChangePass(false);
          setMessage("");
        }, 1500);

      } else {
        setErrors({
          oldPassword: data.message || "Password lama salah"
        });
      }

    } catch (err) {
      console.error(err);
      setMessage("Server error");
      setMessageType("error");
    }
  };

  const handleChangePass = (e) => {
    const { name, value } = e.target;

    setFormPass((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const toggleProfile = () => {
    if (mobileMenu) return;
    setOpenProfile(!openProfile);
  };

  return (
     <>
    <nav className="navbar-custom">

      <div className="navbar-container">

        <button
          className="mobile-menu-btn"
          onClick={() => {
            setMobileMenu(!mobileMenu);
            setOpenProfile(false);
          }}
        >
          <i
            className={
              mobileMenu
                ? "bi bi-x-lg"
                : "bi bi-list"
            }
          ></i>
        </button>

        <div className="navbar-brand">
          <img src={logo} alt="logo" />
          <span>GoGreen</span>
        </div>

        <div
          className={`navbar-menu ${
            mobileMenu ? "mobile-open" : ""
          }`}
        >

          <div className="mobile-sidebar-top">

              <div className="mobile-logo">
                <img src={logo} alt="logo" />
                <span>GoGreen</span>
              </div>

              <button
                className="close-menu-btn"
                onClick={() => setMobileMenu(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>

            </div>

          <NavLink
            to="/Dashboard-warga"
            onClick={() => setMobileMenu(false)}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <i className="bi bi-map"></i>
            Peta TPS
          </NavLink>

          <NavLink
            to="/laporan-warga"
            onClick={() => setMobileMenu(false)}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <i className="bi bi-megaphone"></i>
            Laporan Warga
          </NavLink>

          <NavLink
            to="/edukasi-sampah"
            onClick={() => setMobileMenu(false)}
            className={() => {
              const isActive =
                location.pathname === "/edukasi-sampah" ||
                location.pathname.startsWith("/edukasi/");
              return isActive ? "menu-item active" : "menu-item";
            }}
          >
            <i className="bi bi-book"></i>
            Edukasi Sampah
          </NavLink>

          <NavLink
            to="/riwayat-saya"
            onClick={() => setMobileMenu(false)}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <i className="bi bi-clock-history"></i>
            Riwayat Saya
          </NavLink>

        </div>

        {/* USER */}
        <div
          className={`user-section ${
            mobileMenu ? "disabled-profile" : ""
          }`}
          ref={dropdownRef}
        >

          <NotificationBell />

          <div className="user-name" onClick={toggleProfile}>

            <i className="bi bi-person-circle"></i>

            <span className="user-label">
              {user?.nama || "User"}
            </span>

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
                {user?.nama?.charAt(0)}
              </div>

              <div>
                <strong>{user?.nama}</strong>
                <p>{user?.email}</p>
              </div>

            </div>


            <div className="profile-info">

              <div className="profile-item">
                <span>No HP</span>
                <p>{user?.no_hp || "-"}</p>
              </div>

              <div className="profile-item">
                <span>Alamat</span>
                <p>{user?.alamat || "-"}</p>
              </div>

            </div>

            <div className="profile-actions">

            <div
              className="action-card"
              onClick={() => setShowChangePass(true)}
            >
              <i className="bi bi-lock"></i>
              <span>Ubah Password</span>
            </div>

            <div
              className="action-card danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </div>

            </div>
          </div>

        </div>

      </div>
    </nav>

    {mobileMenu && (
      <div
        className="mobile-overlay"
        onClick={() => setMobileMenu(false)}
      />
    )}

    {/* modal ubah pass */}       
    {showChangePass && (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-card change-password-modal" onClick={(e) => e.stopPropagation()}>

            {/* notif di dalam modal */}
            {message && messageType === "success" && (
              <div className={`notif-center ${messageType}`}>
                <div className="notif-content">
                  <i className="bi bi-check-circle-fill"></i>
                  <p>{message}</p>
                </div>
              </div>
            )}

          <div className="modal-header">
            <h2>Ubah Password</h2>
          </div>

          <div className="modal-body">

            {message && messageType === "error" && (
              <div className="alert-box error">
                {message}
              </div>
            )}

            <div className="input-group floating">
              <div className="password-wrapper">

                <input
                  type={showPass.old ? "text" : "password"}
                  name="oldPassword"
                  placeholder=" "
                  value={formPass.oldPassword}
                  onChange={handleChangePass}
                />

                <label>Password Lama</label>

                <button
                  type="button"
                  className="modal-toggle-password"
                  onClick={() => togglePassword("old")}
                >
                  <i className={showPass.old ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>

              </div>

              {errors.oldPassword && (
                <div className="error-text">{errors.oldPassword}</div>
              )}
            </div>

            <div className="input-group floating">
              <div className="password-wrapper">

                <input
                  type={showPass.new ? "text" : "password"}
                  name="newPassword"
                  placeholder=" "
                  value={formPass.newPassword}
                  onChange={handleChangePass}
                />

                <label>Password Baru</label>

                <button
                  type="button"
                  className="modal-toggle-password"
                  onClick={() => togglePassword("new")}
                >
                  <i className={showPass.new ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>

              </div>

              {errors.newPassword && (
                <div className="error-text">{errors.newPassword}</div>
              )}
            </div>

            <div className="input-group floating">
              <div className="password-wrapper">

                <input
                  type={showPass.confirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder=" "
                  value={formPass.confirmPassword}
                  onChange={handleChangePass}
                />

                <label>Konfirmasi Password</label>

                <button
                  type="button"
                  className="modal-toggle-password"
                  onClick={() => togglePassword("confirm")}
                >
                  <i className={showPass.confirm ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>

              </div>

              {errors.confirmPassword && (
                <div className="error-text">{errors.confirmPassword}</div>
              )}
            </div>

          </div>

          <div className="modal-actions">

            <button
              className="btn-cancel"
              onClick={closeModal}
            >
              Batal
            </button>

            <button
              className="btn-save"
              disabled={!formPass.oldPassword || !formPass.newPassword || !formPass.confirmPassword}
              onClick={handleChangePassword}
            >
              Simpan
            </button>

          </div>

        </div>
      </div>
    )}
  </>    
  );
}

export default Navbar;