import { useEffect, useState } from "react";
import axios from "axios";
import NavbarAdmin from "../components/NavbarAdmin";
import "../styles/admin.css";
import foto from "../assets/admin.png";
import DetailLaporanAdmin from "../components/DetailLaporanAdmin"; 
import UpdateStatus from "../components/UpdateStatus";
import { getImageUrl } from "../utils/imageUrls";

function LaporanAdmin() {

  const [data, setData] = useState([]);
  const [status, setStatus] = useState("semua");
  const [kecamatan, setKecamatan] = useState("semua");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("terbaru");
  const [selectedLaporan, setSelectedLaporan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const openUpdate = (laporan) => {
    setSelectedUpdate(laporan);
    setShowUpdateModal(true);
  };

  const closeUpdate = () => {
    setShowUpdateModal(false);
    setSelectedUpdate(null);
  };

  const openDetail = (laporan) => {
    setSelectedLaporan(laporan);
    setShowModal(true);
  };

  const closeDetail = () => {
    setShowModal(false);
    setSelectedLaporan(null);
  };

  const openDelete = (laporan) => {
    setSelectedDelete(laporan);
    setShowDeleteModal(true);
  };

  const closeDelete = () => {
    setShowDeleteModal(false);
    setSelectedDelete(null);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // delay 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    fetchLaporan();
  }, [status, kecamatan, sort, debouncedSearch]);

  const fetchLaporan = async () => {

    const token = localStorage.getItem("token");

    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/laporan`, {
      params: {
        status,
        kecamatan,
        search: debouncedSearch,
        sort
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setData(res.data);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString("id-ID");
  };

  const statusBadge = (status) => {
    if (status === "terkirim") return "badge gray";
    if (status === "proses") return "badge orange";
    if (status === "selesai") return "badge green";
  };

  const handleDelete = async () => {
    if (!selectedDelete) return;

    try {
      setLoadingDelete(true);

      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/laporan/${selectedDelete.id_laporan}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setDeleteSuccess(true); 

      setTimeout(() => {
        setDeleteSuccess(false);
        closeDelete();
        fetchLaporan();
      }, 1500); 

    } catch (error) {
      console.error(error);
      alert("Gagal menghapus laporan");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="admin-container">

      <NavbarAdmin />

      <div className="admin-content">

        {/* HEADER */}
        <div className="admin-hero-card">
          <div className="admin-hero-content">
            <h2>Daftar Laporan</h2>
            <p>Kelola laporan sampah dari warga</p>
          </div>

          <div className="admin-hero-image">
            <img src={foto} alt="laporan" />
          </div>
        </div>

        <div className="filter-bar">

          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              value={search}
              placeholder="Cari laporan berdasarkan judul, lokasi..."
              onChange={(e)=>setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">

            <select value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="semua">Semua Status</option>
              <option value="terkirim">Terkirim</option>
              <option value="proses">Diproses</option>
              <option value="selesai">Selesai</option>
            </select>

            <select value={kecamatan} onChange={(e)=>setKecamatan(e.target.value)}>
              <option value="semua">Semua Kecamatan</option>
              <option>Soreang</option>
              <option>Bacukiki</option>
              <option>Bacukiki Barat</option>
              <option>Ujung</option>
            </select>

            <select value={sort} onChange={(e)=>setSort(e.target.value)}>
              <option value="terbaru">Terbaru</option>
              <option value="terlama">Terlama</option>
              <option value="dukungan_terbanyak">Dukungan ↑</option>
              <option value="dukungan_tersedikit">Dukungan ↓</option>
            </select>

          </div>

        </div>


        <div className="table-wrapper">
          <table className="laporan-table">

            <thead>
              <tr>
                <th>Foto</th>
                <th>Judul</th>
                <th>Lokasi</th>
                <th>Waktu</th>
                <th>Dukungan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>

              {data.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                      Tidak ada laporan ditemukan
                    </td>
                  </tr>
                ) : (
                  data.map((item)=>(
                    <tr key={item.id_laporan}
                      className="row-clickable"
                      onClick={() => openDetail(item)}>

                  <td>
                    <img
                      src={getImageUrl(item.foto)}
                      className="foto-laporan"
                    />
                  </td>

                  <td>
                    <strong>{item.judul}</strong>
                    <p>{item.deskripsi?.slice(0,80)}...</p>
                  </td>

                  <td>{item.lokasi}, {item.kecamatan}</td>

                  <td>{formatTime(item.tanggal_laporan)}</td>

                  <td className="dukungan">
                    {item.total_dukungan} Dukungan
                  </td>

                  <td>
                    <span className={statusBadge(item.status)}>
                      {item.status}
                    </span>
                  </td>

                  <td className="aksi">
                    <i
                      className="bi bi-pencil-square"
                      onClick={(e)=>{
                        e.stopPropagation();
                        openUpdate(item);
                      }}
                    ></i>

                    <i
                      className="bi bi-trash"
                      onClick={(e)=>{
                        e.stopPropagation();
                        openDelete(item);
                      }}
                    ></i>
                  </td>
                </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

      </div>

      <DetailLaporanAdmin
        show={showModal}
        onClose={closeDetail}
        data={selectedLaporan}
      />

      <UpdateStatus
        show={showUpdateModal}
        onClose={closeUpdate}
        data={selectedUpdate}
        onSuccess={fetchLaporan}
      />

      {showDeleteModal && (
        <div className="delete-overlay">
          <div className="delete-modal">

            {deleteSuccess && (
              <div className="notif-center success">
                <div className="notif-content">
                  <i className="bi bi-check-circle-fill"></i>
                  <p>Laporan berhasil dihapus</p>
                </div>
              </div>
            )}

            {!deleteSuccess && (
              <button className="close-btn" onClick={closeDelete}>
                ×
              </button>
            )}

            {!deleteSuccess && (
              <div className="delete-icon">
                <i className="bi bi-exclamation-lg"></i>
              </div>
            )}

            {!deleteSuccess && (
              <>
                <h3>Anda Yakin Ingin Menghapus?</h3>
                <p>Laporan warga akan dihapus secara permanen.</p>
              </>
            )}

            {!deleteSuccess && (
              <div className="delete-actions">
                <button
                  className="btn-cancel"
                  onClick={closeDelete}
                  disabled={loadingDelete}
                >
                  Batal
                </button>

                <button
                  className="btn-delete"
                  onClick={handleDelete}
                  disabled={loadingDelete}
                >
                  {loadingDelete ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default LaporanAdmin;