import { useState } from "react";
import "../styles/login.css";
import assets from "../assets/logoclean.png";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function LoginWarga() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!email) {
      newErrors.email = "Email tidak boleh kosong";
    }

    if (!password) {
      newErrors.password = "Password tidak boleh kosong";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const startTime = Date.now();

    try {

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/login`,
        {
          email: email,
          password: password
        }
      );

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const elapsed = Date.now() - startTime;
      const remaining = 800 - elapsed;

      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/Dashboard-warga");
      }

    } catch (error) {

      console.error(error);

      if (error.response) {

        setAuthError(
          error.response.data.message || 
          "Email atau password salah"
        );

      } else {

        setAuthError("Server bermasalah, coba lagi");

      }

    }

    setLoading(false);
  };

  return (
    <div className="login-page">

      <div className="bg-image"></div>

      <div className="bg-overlay"></div>

      <div className="login-container">

        <div className="login-left">
          <h1>GoGreen</h1>
          <p>
            Dukung Lingkungan Yang Lebih Bersih dan Sehat.
          </p>
        </div>

        <div className="login-right">

          {/* HEADER LOGIN */}
          <div className="login-header">
            <img src={assets} alt="logo parepare" />

            <div>
              <h2>Masuk ke Sistem</h2>
              <p className="subtitle">
                Gunakan akun Anda untuk melanjutkan
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">

            {authError && (
              <div className="error-box active">
                {authError}
              </div>
            )}

            <div className="input-group floating">
              <div className="password-wrapper">
                <input
                  type="email"
                  autoComplete="off"
                  placeholder=" "
                  value={email}
                  onChange={(e)=>{
                    setEmail(e.target.value);
                    setErrors(prev => ({...prev, email:""}));
                    setAuthError("");
                  }}
                  required
                />
                <label>Email</label>
              </div>

              {errors.email && (
                <div className="error-text">{errors.email}</div>
              )}
            </div>

            <div className="input-group floating">

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder=" "
                  value={password}
                  onChange={(e)=>{
                    setPassword(e.target.value);
                    setErrors(prev => ({...prev, password:""}));
                    setAuthError("");
                  }}
                  required
                />
                <label>Password</label>

                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePassword}
                >
                  <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>
              </div>

              {errors.password && (
                <div className="error-text">{errors.password}</div>
              )}

            </div>

            <button
              className={`login-btn ${loading ? "is-loading" : ""}`}
              disabled={loading}
            >
              {loading ? <div className="spinner"></div> : "Masuk"}
            </button>

          </form>

          <div className="register-link">
            Belum punya akun? <Link to="/register">Daftar</Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default LoginWarga;