import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa"; 
import "../styles/EdukasiSampah.css";
import edukasiImg from "../assets/edukasi.png";

function EdukasiSampahWarga() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resArtikel, resKategori] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/articles`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/categories`),
      ]);

      setArticles(resArtikel.data);
      setCategories(resKategori.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles =
    active === "Semua"
      ? articles
      : articles.filter((item) => item.category?.name === active);

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">

        <div className="hero-card">

          <div className="hero-text">
            <h2>
              Edukasi <span>Sampah</span>
            </h2>

            <p>
              Pelajari cara mengelola sampah dengan benar mulai dari
              pemilahan, daur ulang, hingga pengurangan sampah untuk
              menciptakan lingkungan yang lebih bersih dan sehat.
            </p>
          </div>

          <div className="hero-image">
            <img src={edukasiImg} alt="Edukasi Sampah" />
          </div>

        </div>

        <div className="filter-wrapper">
          <div className="filter-container">
            <div className="filter-tabs">

              <button
                className={active === "Semua" ? "active" : ""}
                onClick={() => setActive("Semua")}
              >
                Semua
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={active === cat.name ? "active" : ""}
                  onClick={() => setActive(cat.name)}
                >
                  {cat.name}
                </button>
              ))}

            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ marginTop: "20px" }}>Loading...</p>
        ) : (
          <div className="article-list">

            {filteredArticles.length === 0 ? (
              <p>Tidak ada artikel</p>
            ) : (
              filteredArticles.map((item) => (
                <div className="article-card" key={item.id}>

                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${item.thumbnail}`}
                    alt={item.title}
                  />

                  <div className="article-content">

                    <h3>{item.title}</h3>

                   <p className="date">
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                    <p>{stripHtml(item.content).substring(0, 120)}...</p>

                    <button onClick={() => navigate(`/edukasi/${item.slug}`)}>
                      <FaBookOpen className="icon-book" />
                      Baca Selengkapnya
                    </button>

                  </div>

                </div>
              ))
            )}

          </div>
        )}

      </div>
    </>
  );
}

export default EdukasiSampahWarga;