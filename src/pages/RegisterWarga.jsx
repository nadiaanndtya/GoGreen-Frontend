import { useState } from "react";
import "../styles/login.css";
import assets from "../assets/logoclean.png";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function RegisterWarga() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_hp: "",
    alamat: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const [success, setSuccess] = useState("");

  const handleChange = (e) => {

    let { name, value } = e.target;

    if (name === "no_hp") {
      value = value.replace(/\D/g, "");
    }

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (form.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password tidak sama";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {

      setLoading(true);

      const { confirmPassword, ...data } = form;

      await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, data);

      setSuccess("Registrasi berhasil! Silakan login.");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {

      if (err.response) {
        setErrors({ email: err.response.data.message });
      } else {
        setErrors({ general: "Terjadi kesalahan server" });
      }

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="login-page">

      <div className="bg-image"></div>
      <div className="bg-overlay"></div>

      <div className="login-container register-mode">

        <div className="login-left">
          <h1>GoGreen</h1>
          <p>
            Dukung Lingkungan Yang Lebih Bersih dan Sehat.
          </p>
        </div>

        <div className="login-right">

          <div className="login-header">
            <img src={assets} alt="logo parepare" />

            <div>
              <h2>Buat Akun</h2>
              <p className="subtitle">
                Daftarkan akun Anda
              </p>
            </div>
          </div>

        <div className="register-content">
          
          {success && (
            <div className="success-box">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>

            <div className="input-group floating">
              <div className="password-wrapper">
                <input
                  type="text"
                  placeholder=" "
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  required
                />
                <label>Nama Lengkap</label>
              </div>
            </div>

            <div className="input-group floating">
              <div className="password-wrapper">
                <input
                  type="email"
                  placeholder=" "
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <label>Email</label>

                {errors.email && (
                  <div className="error-text">{errors.email}</div>
                )}
              </div>
            </div>

            <div className="input-group floating">
              <div className="password-wrapper">
                <input
                  type="tel"
                  placeholder=" "
                  name="no_hp"
                  value={form.no_hp}
                  onChange={handleChange}
                  required
                />
                <label>No HP</label>
              </div>
            </div>

            <div className="input-group floating">
              <div className="password-wrapper">
                <input
                  type="text"
                  placeholder=" "
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  required
                />
                <label>Alamat</label>
              </div>
            </div>

            {/* PASSWORD */}

            <div className="input-group floating">
              <div className="password-wrapper">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />

                <label>Password</label>

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>

              </div>

              {errors.password && (
                <div className="error-text">{errors.password}</div>
              )}
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="input-group floating">

              <div className="password-wrapper">

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />

                <label>Konfirmasi Password</label>

                <button
                  type="button"
                  className="toggle-password"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  <i className={showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>

              </div>

              {errors.confirmPassword && (
                <div className="error-text">{errors.confirmPassword}</div>
              )}

            </div>

            <button
              className={`login-btn ${loading ? "is-loading" : ""}`}
              disabled={loading}
            >
              {loading ? <div className="spinner"></div> : "Daftar"}
            </button>

          </form>

          <div className="register-link">
            Sudah punya akun? <Link to="/">Login</Link>
          </div>
        </div>

        </div>

      </div>

    </div>
  );
}

export default RegisterWarga;