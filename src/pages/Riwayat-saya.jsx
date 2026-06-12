import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { getImageUrl } from "../utils/imageUrls";
import rumput from "../assets/gambar.png";
import BuatLaporan from "./BuatLaporan";
import DetailLaporanModal from "../components/DetailLaporanModal";
import { ThumbsUp } from "lucide-react";

function RiwayatSaya() {

  const [laporan, setLaporan] = useState([]);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [showModal, setShowModal] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState(null);

  const token = localStorage.getItem("token");

  const [editData, setEditData] = useState(null);

  const statusConfig = {
    terkirim: { label: "Terkirim", icon: "bi-send-fill" },
    proses: { label: "Proses", icon: "bi-hourglass-split" },
    selesai: { label: "Selesai", icon: "bi-check-circle-fill" }
  };

  const filterList = [
    { key: "semua", label: "Semua", icon: "bi-grid-1x2-fill" },
    { key: "terkirim", label: "Dilaporkan", icon: "bi-send-fill" },
    { key: "proses", label: "Diproses", icon: "bi-hourglass-split" },
    { key: "selesai", label: "Selesai", icon: "bi-check-circle-fill" }
  ];

  const laporanFiltered =
    filterStatus === "semua"
      ? laporan
      : laporan.filter((item) => item.status === filterStatus);

  const getLaporanSaya = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/laporan-saya`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLaporan(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleDukungan = async (id_laporan) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/dukungan`,
        { id_laporan },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      getLaporanSaya();
    } catch (err) {
      console.log(err);
    }
  };

  
  useEffect(() => {
    getLaporanSaya();
  }, []);

  useEffect(() => {
    if (showModal || showDetail) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showModal, showDetail]);

  return (
    <>
      <Navbar />

      <div className="dashboard-container">

        {/* HERO */}
        <div className="hero-card">

          <div className="hero-text">

            <h2>
              Riwayat <span>Laporan Saya</span>
            </h2>

            <p>
              Berikut adalah daftar laporan yang telah Anda buat
              dan status perkembangan laporan tersebut.
            </p>

            <div className="hero-image">
              <img src={rumput} alt="hero" />
            </div>

            <button
              className="btn btn-success btn-buat-laporan"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-lg"></i> Buat Laporan
            </button>

          </div>

        </div>

        <div className="filter-container">
          {filterList.map((f, index) => (
            <div key={f.key} className="filter-item-wrapper">

              <button
                className={`filter-chip ${filterStatus === f.key ? "active" : ""}`}
                onClick={() => setFilterStatus(f.key)}
              >
                <i className={`bi ${f.icon}`}></i>
                <span>{f.label}</span>
              </button>

              {index !== filterList.length - 1 && (
                <div className="filter-separator"></div>
              )}

            </div>
          ))}
        </div>

        {/* LIST */}
        <div className="row mt-4">

          {laporanFiltered.length === 0 && (
            <div className="text-center text-muted">
              Belum ada laporan yang dibuat.
            </div>
          )}

          {laporanFiltered.map((item) => {

            const status = statusConfig[item.status] || {
              label: "Status Tidak Dikenal",
              icon: "bi-question-circle"
            };

            return (
             <div
                className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
                key={item.id_laporan}
              >

                <div
                  className="modern-card p-3 h-100 laporan-clickable"
                  onClick={async () => {

                    try {
                      const res = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/laporan/${item.id_laporan}`,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`
                          }
                        }
                      );

                      setSelectedLaporan(res.data);
                      setShowDetail(true);

                    } catch (err) {
                      console.log(err);
                    }

                  }}
                >

                  <img
                    src={getImageUrl(item.foto)}
                    onError={(e) => (e.target.src = noImage)}
                    alt="foto laporan"
                    className="img-fluid rounded mb-3"
                    style={{
                      height: "160px",
                      objectFit: "cover",
                      width: "100%"
                    }}
                  />

                  <h6 className="laporan-title">
                    {item.judul}
                  </h6>

                  <p className="text-muted small mb-1">
                    <i className="bi bi-geo-alt-fill me-1 icon-green"></i>
                    {item.lokasi}, {item.kecamatan}
                  </p>

                  <p className="small">
                    <i className="bi bi-hand-thumbs-up-fill me-1 icon-green"></i>
                    {item.total_dukungan} warga mendukung
                  </p>

                  <div className="d-flex justify-content-between align-items-center">

                    <div className={`status-badge ${item.status}`}>
                      <i className={`bi ${status.icon}`}></i>
                      {status.label}
                    </div>

                    <button
                      className={`dukung-btn ${item.sudah_dukung ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDukungan(item.id_laporan);
                      }}
                    >
                      <ThumbsUp size={18} strokeWidth={2.5} />
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>

      <BuatLaporan
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditData(null);
        }}
        onSuccess={getLaporanSaya}
        editData={editData}
      />

      <DetailLaporanModal
        show={showDetail}
        data={selectedLaporan}
        onClose={() => setShowDetail(false)}
        onEdit={(data) => {
          setEditData(data);
          setShowModal(true);  
        }}
      />
    </>
  );
}

export default RiwayatSaya;