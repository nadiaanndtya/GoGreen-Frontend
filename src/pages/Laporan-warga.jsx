import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { getImageUrl } from "../utils/imageUrls";
import rumput from "../assets/gambar.png";
import BuatLaporan from "./BuatLaporan";
import DetailLaporanModal from "../components/DetailLaporanModal";
import { ThumbsUp } from "lucide-react";

function LaporanWarga() {

  const [laporan, setLaporan] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("terbaru");
  const [showModal, setShowModal] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState(null);

  const token = localStorage.getItem("token");

  const [editData, setEditData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingDukungan, setLoadingDukungan] = useState({});

  const statusConfig = {
  terkirim: {
    label: "Terkirim",
    class: "bg-primary",
    icon: "bi-send-fill" 
  },
  proses: {
    label: "Proses",
    class: "bg-warning text-dark",
    icon: "bi-hourglass-split"
  },
  selesai: {
    label: "Selesai",
    class: "bg-success",
    icon: "bi-check-circle-fill"
  }
};

  const getLaporan = async (isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/laporan`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          search: search
        }
      });

      setLaporan(res.data);

    } catch (err) {
      console.log(err);
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  }

  useEffect(() => {
    getLaporan(true); 

    const interval = setInterval(() => {
      getLaporan(false); 
    }, 2000);

    return () => clearInterval(interval);
  }, [search]);

  const filtered = laporan
    .filter((item) =>
      status ? item.status === status : true
    )
    .sort((a, b) => {
      if (sort === "terbaru") {
        return new Date(b.tanggal_laporan) - new Date(a.tanggal_laporan);
      }
      if (sort === "terlama") {
        return new Date(a.tanggal_laporan) - new Date(b.tanggal_laporan);
      }
      if (sort === "dukungan") {
        return b.total_dukungan - a.total_dukungan;
      }
      return 0;
    });

  const toggleDukungan = async (id_laporan) => {

    if (loadingDukungan[id_laporan]) return;

    setLoadingDukungan(prev => ({
      ...prev,
      [id_laporan]: true
    }));

    setLaporan((prev) =>
      prev.map((item) =>
        item.id_laporan === id_laporan
          ? {
              ...item,
              sudah_dukung: !item.sudah_dukung,
              total_dukungan: item.sudah_dukung
                ? Number(item.total_dukungan) - 1
                : Number(item.total_dukungan) + 1
            }
          : item
      )
    );

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/dukungan`,
        { id_laporan },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

    } catch (err) {
      console.log(err);

      getLaporan(true);
      
  } finally {

    setLoadingDukungan(prev => ({
      ...prev,
      [id_laporan]: false
    }));

  }
};

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
              Daftar <span>Laporan Warga</span>
            </h2>

            <p>
              Lihat laporan masalah sampah di sekitar kota dan dukung
              agar segera ditangani.
            </p>

            <div className="hero-image">
              <img src={rumput} />
            </div>

            <button
              className="btn btn-success btn-buat-laporan"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-lg"></i> Buat Laporan
            </button>

          </div>

        </div>


        <div className="map-card">

          <div className="row g-3 align-items-center">

            <div className="col-md-6">

              <div className="search-wrapper">
                <i className="bi bi-search search-icon"></i>

                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari laporan berdasarkan judul, lokasi, atau kecamatan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

            </div>

            <div className="col-md-3">

              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >

                <option value="">Semua Status</option>
                <option value="terkirim">Terkirim</option>
                <option value="proses">Proses</option>
                <option value="selesai">Selesai</option>

              </select>

            </div>

            <div className="col-md-3">

              <select
                className="form-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >

                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="dukungan">Dukungan Terbanyak</option>

              </select>

            </div>

          </div>

        </div>

        <div className="row mt-4">

          {initialLoading && (
            <div className="text-center mt-4">
              <div className="spinner-border text-success" />
              <p>Memuat data laporan...</p>
            </div>
          )}

          {!initialLoading && filtered.length === 0 && (
            <div className="text-center mt-4 text-muted">
              Tidak ada laporan ditemukan
            </div>
          )}

          {filtered.map((item) => (

            <div className="col-12 col-sm-6 col-lg-3 mb-4" key={item.id_laporan}>

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
                  alt="foto laporan"
                  className="img-fluid rounded mb-3"
                  style={{
                    height: "160px",
                    objectFit: "cover",
                    width: "100%"
                  }}
                />

                <h6 className="laporan-title">{item.judul}</h6>

                <p className="text-muted small mb-1">
                  <i className="bi bi-geo-alt-fill me-1 icon-green"></i>
                  {item.lokasi}, {item.kecamatan}
                </p>

                <p className="small">
                  <i className="bi bi-hand-thumbs-up-fill me-1 icon-green"></i>
                  {item.total_dukungan} warga mendukung laporan ini
                </p>

                <div className="d-flex justify-content-between align-items-center">

                  <div className={`status-badge ${item.status}`}>
                    <i className={`bi ${statusConfig[item.status]?.icon}`}></i>
                    {statusConfig[item.status]?.label}
                  </div>

                  <button
                    className={`dukung-btn ${item.sudah_dukung ? "active" : ""}`}
                    disabled={loadingDukungan[item.id_laporan]}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDukungan(item.id_laporan);
                    }}
                  >
                    <ThumbsUp size={18} strokeWidth={2.5} />
                  </button>

                </div>

                <div className="lihat-timeline">
                  Lihat Detail
                  <i className="bi bi-arrow-right"></i>
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

      <BuatLaporan
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditData(null); 
        }}
        onSuccess={getLaporan}
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

export default LaporanWarga;