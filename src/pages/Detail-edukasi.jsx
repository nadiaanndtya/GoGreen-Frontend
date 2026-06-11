import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/DetailEdukasi.css";

function DetailEdukasi() {
  const { slug } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [slug]);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/articles/${slug}`
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <p>Loading...</p>;

  return (
    <>
      <Navbar />

      <div className="dashboard-container">

        <div className="breadcrumb">
          <Link to="/edukasi-sampah" className="breadcrumb-parent">
            <span className="breadcrumb-back-icon">&#8592;</span>
            <span className="breadcrumb-back-label">Edukasi Sampah</span>
          </Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{data.title}</span>
        </div>

        <div className="detail-card-full">

          <h2 className="title">{data.title}</h2>

          <p className="detail-date">
            Diposting pada{" "}
            {new Date(data.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>

          <div className="article-body">

            <div className="article-image">
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${data.thumbnail}`}
                alt={data.title}
              />
            </div>

            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />

          </div>

        </div>
      </div>
    </>
  );
}

export default DetailEdukasi;