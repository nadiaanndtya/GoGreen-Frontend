import "../styles/DetailLaporanAdmin.css";
import { getImageUrl } from "../utils/imageUrls";
import { useState, useEffect } from "react";  

import {
  X,
  MapPin,
  Clock,
  User,
  ThumbsUp,
  FileText,
  Pencil
} from "lucide-react";

function DetailLaporanAdmin({ show, onClose, data }) {
  
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden"; 
    } else {
      document.body.style.overflow = "auto";   
    }

    return () => {
      document.body.style.overflow = "auto";  
    };
  }, [show]);

  if (!show || !data) return null;

  const formatTime = (date) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status) => {
    if (status === "terkirim") return "badge gray";
    if (status === "proses") return "badge orange";
    if (status === "selesai") return "badge green";
  };

  const openMap = () => {
    if (!data.latitude || !data.longitude) {
      alert("Lokasi tidak tersedia");
      return;
    }

    const url = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className="detail-modal-overlay">

      <div className="detail-modal-container">

        <div className="detail-modal-inner">

            <div className="detail-modal-header">
              <h3 className="detail-header-title">Detail Laporan</h3>
              <button className="detail-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className={`detail-image-wrapper ${data.status === "selesai" ? "selesai" : ""}`}>

              <div className="detail-image-box">
                <img
                  src={getImageUrl(data.foto)}
                  alt="laporan"
                  className="clickable-image"
                  onClick={() => setPreviewImg(getImageUrl(data.foto))}
                />
              </div>

              {data.status === "selesai" && data.foto_selesai && (
                <div className="detail-image-box">
                  <img
                    src={getImageUrl(data.foto_selesai)}
                    alt="bukti selesai"
                    className="clickable-image"
                    onClick={() => setPreviewImg(getImageUrl(data.foto_selesai))}
                  />

                  <div className="detail-image-tag">
                    📷 Bukti Pembersihan oleh Admin
                  </div>
                </div>
              )}
            </div>

            <div className="detail-modal-title">
              <h4 className="detail-title">{data.judul}</h4>
              <span className={`detail-badge ${data.status === "terkirim" ? "detail-gray" : data.status === "proses" ? "detail-orange" : "detail-green"}`}>
                {data.status}
              </span>
            </div>

            <div className="detail-modal-info">

              <div className="info-grid">
                <div className="info-card">
                  <MapPin className="icon" />
                  <div className="info-content">
                    <small>Lokasi</small>
                    <p>{data.lokasi}, {data.kecamatan}</p>
                    {data.latitude && (
                      <button onClick={openMap} className="btn-map-link">Lihat di Maps</button>
                    )}
                  </div>
                </div>

                <div className="info-card">
                  <Clock className="icon" />
                  <div className="info-content">
                    <small>Waktu Laporan</small>
                    <p>{formatTime(data.tanggal_laporan)}</p>
                  </div>
                </div>

                <div className="info-card">
                  <User className="icon" />
                  <div className="info-content">
                    <small>Pelapor</small>
                    <p>{data.User?.nama || "Warga"}</p>
                    <span className="sub-text">{data.User?.no_hp || "-"}</span>
                  </div>
                </div>

                <div className="info-card">
                  <ThumbsUp className="icon" />
                  <div className="info-content">
                    <small>Dukungan Warga</small>
                    <p>{data.total_dukungan} Dukungan</p>
                  </div>
                </div>

                <div className="detail-modal-desc">
                  <div className="detail-desc-title">
                    <FileText className="desc-icon" />
                    <span>Deskripsi Laporan</span>
                  </div>
                  <p>{data.deskripsi}</p>
                </div>

              </div>

            </div>

            {data.status === "selesai" && (
              <div className="final-status">
                <span className="check-icon">✓</span>
                Laporan ini sudah final dan tidak dapat diubah lagi
              </div>
            )}
        </div>
      </div>

      {previewImg && (
        <div
          className="image-preview-overlay"
          onClick={() => setPreviewImg(null)}
        >
          <img src={previewImg} alt="preview" />
        </div>
      )}

    </div>
  );
}

export default DetailLaporanAdmin;