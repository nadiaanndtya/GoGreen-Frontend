import { useEffect, useState } from "react";
import axios from "axios";
import NavbarAdmin from "../components/NavbarAdmin";
import "../styles/admin.css";
import { useNavigate } from "react-router-dom";
import gambar from "../assets/ilustrasi-hero-admin.png";
import BuatArtikel from "./BuatArtikel";
import { getImageUrl } from "../utils/imageUrls";

function ArtikelEdukasi() {

  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const openDelete = (item) => {
    setSelectedDelete(item);
    setShowDeleteModal(true);
  };

  const closeDelete = () => {
    setShowDeleteModal(false);
    setSelectedDelete(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, category, articles]);

  useEffect(() => {
    if (showModal || showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, showDeleteModal]);

  const fetchData = async () => {
    try {
      const articleRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/articles`);
      setArticles(articleRes.data);

      const categoryRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
      setCategories(categoryRes.data);

    } catch (err) {
      console.error("ERROR FETCH:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let data = [...articles];

    if (search) {
      data = data.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      data = data.filter(a => a.category_id === Number(category));
    }

    setFiltered(data);
  };

  const handleDelete = async () => {
    if (!selectedDelete) return;

    try {
      setLoadingDelete(true);

      const token = localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/articles/${selectedDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setDeleteSuccess(true);

      setTimeout(() => {
        setDeleteSuccess(false);
        closeDelete();
        fetchData();
      }, 1500);

    } catch (err) {
      console.error("ERROR DELETE:", err);
      alert("Gagal menghapus artikel");
    } finally {
      setLoadingDelete(false);
    }
  };

  const getCategoryClass = (name) => {
    if (!name) return "badge-default";

    const kategori = name.toLowerCase();

    if (kategori.includes("pemilahan"))
      return "badge-hijau";

    if (kategori.includes("daur"))
      return "badge-biru";

    if (kategori.includes("pengurangan"))
      return "badge-orange";

    return "badge-default";
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">

      <NavbarAdmin />

      <div className="admin-content">

        <div className="admin-hero-card">

          <div className="admin-hero-content">
            <h2>Manajemen Edukasi</h2>
            <p>
              Kelola artikel edukasi untuk memberikan informasi kepada warga
              tentang pengelolaan sampah dan lingkungan.
            </p>

            <button
              className="btn-add desktop-btn"
              onClick={() => setShowModal(true)}
            >
              + Artikel Edukasi
            </button>
          </div>

          <div className="admin-hero-image">
            <img src={gambar} alt="admin" />
          </div>

          <button
            className="btn-add mobile-btn"
            onClick={() => setShowModal(true)}
          >
            + Artikel Edukasi
          </button>

        </div>

        <div className="filter-bar">

          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Cari artikel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="edukasi-grid">

          {filtered.length === 0 && (
            <p className="empty-text">Tidak ada artikel</p>
          )}

          {filtered.map(item => (
            <div className="edukasi-card" key={item.id}>

              <img
                src={getImageUrl(item.thumbnail)}
                alt="thumb"
              />

              <div className="edukasi-body">

                <h4>{item.title}</h4>

                <span
                  className={`badge-kategori ${getCategoryClass(item.category?.name)}`}
                >
                  {item.category?.name}
                </span>

                <p className="date">
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <div className="aksi">

                  <i
                    className="bi bi-pencil-square"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditData(item);
                      setShowModal(true);
                    }}
                  ></i>

                  <i
                    className="bi bi-trash"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDelete(item);
                    }}
                  ></i>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

      {showModal && (
        <BuatArtikel
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }}
          onSuccess={() => {
            fetchData();
            setShowModal(false);
            setEditData(null);
          }}
          articleData={editData} 
        />
      )}

      {showDeleteModal && (
        <div className="delete-overlay">
          <div className="delete-modal">

            {deleteSuccess && (
              <div className="notif-center success">
                <div className="notif-content">
                  <i className="bi bi-check-circle-fill"></i>
                  <p>Artikel berhasil dihapus</p>
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
                <p>Artikel akan dihapus secara permanen.</p>
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

export default ArtikelEdukasi;