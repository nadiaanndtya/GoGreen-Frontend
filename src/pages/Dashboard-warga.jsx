import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MapView from "../components/MapView";
import rumput from "../assets/gambar.png";

function DashboardWarga() {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {

    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!token || userData?.role !== "warga") {
      navigate("/");
      return;
    }

    setUser(userData);

  }, []);

  return (
    <>
      <Navbar />

      <div className="dashboard-container">

        <div className="hero-card">

          <div className="hero-text">

            <h2>
              Selamat datang di <br />
              <span>GoGreen</span>
            </h2>

            <p>
              Laporkan temuan sampah secara online, dukung laporan warga lainnya, dan bantu menjaga kebersihan lingkungan bersama.
            </p>

          </div>

          <div className="hero-image">
            <img src={rumput} />
          </div>

        </div>


      <div className="map-card">

        <div className="map-header">
          <i className="bi bi-geo-alt-fill"></i>
          <h5> <b>Peta Lokasi Tempat Pembuangan Sampah Umum & Tempat Pembuangan Akhir</b> </h5>
        </div>

        <div className="map-content">
          <MapView />
        </div>

      </div>

      </div>

    </>
  );
}

export default DashboardWarga;