import noImage from "../assets/no-image.jpeg";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  ThumbsUp,
  CalendarDays,
  MapPin,
  ArrowUpRight,
  X,
  Clock,
  User,
  FileText,
  Pencil
} from "lucide-react";

function DetailLaporanModal({ show, onClose, data, onEdit }) {

  const [showMenu, setShowMenu] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [userLogin, setUserLogin] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setUserLogin(user);
  }, []);
  
  useEffect(() => {
    if (!show) {
      setShowMenu(false);
      setShowConfirmDelete(false);
      setShowSuccess(false);
    }
  }, [show]);

  if (!show || !data) return null;

  const isOwner = userLogin?.id === data?.id_user;

  const getImageUrl = (foto) => {
    return foto ? `${import.meta.env.VITE_API_URL}/uploads/${foto}` : noImage;
  };

  const handleDelete = async () => {
    try {
      setLoadingDelete(true);

      await axios.delete(`${import.meta.env.VITE_API_URL}/api/laporan/${data.id_laporan}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setShowConfirmDelete(false);

      setShowSuccess(true);

    } catch (error) {
      console.error(error.response?.data?.message || "Gagal menghapus laporan");
    } finally {
      setLoadingDelete(false);
    }
  };

  const stepIndex = {
    terkirim: 0,
    proses: 1,
    selesai: 2
  };

  const currentStep = stepIndex[data.status] ?? 0;

  const steps = ["Terkirim", "Diproses", "Selesai"];

  const statusLabel = {
    terkirim: "Dilaporkan",
    proses: "Diproses",
    selesai: "Selesai"
  };

  const statusMessage = {
    terkirim: "Laporan telah diterima dan menunggu tindakan petugas.",
    proses: "Petugas sedang menangani laporan ini.",
    selesai: "Masalah sudah ditangani dengan baik."
  };

  const statusIcon = {
    terkirim: "bi-info-circle-fill",
    proses: "bi-brush",        
    selesai: "bi-check-circle-fill"
  };

  const statusClass = {
    terkirim: "info-default",
    proses: "info-proses",
    selesai: "info-selesai"
  };

  const openMap = () => {
    if (data.latitude == null || data.longitude == null) {
      alert("Lokasi tidak tersedia");
      return;
    }

    const url = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className="detail-overlay">

      <div className="detail-modal">

      <div className="detail-header">

        {isOwner && data.status === "terkirim" && (
          <div className={`detail-menu-wrapper ${showMenu ? "active" : ""}`}>
            <button
              className="detail-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <i className="bi bi-three-dots-vertical"></i>
            </button>

            {showMenu && (
              <div
                className="detail-menu-dropdown"
                onClick={(e) => e.stopPropagation()}
              >

                  <button 
                    className="detail-menu-item"
                    onClick={() => {
                      onClose();
                      onEdit(data);
                    }}
                  >
                    <i className="bi bi-pencil"></i> Edit
                  </button>

                  <button
                    className="detail-menu-item text-danger"
                    onClick={() => setShowConfirmDelete(true)}
                    disabled={loadingDelete}
                  >
                    <i className="bi bi-trash"></i>
                    {loadingDelete ? "Menghapus..." : "Hapus"}
                  </button>

                </div>
              )}
            </div>
          )}

          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>

          <h5 className="detail-title">
            Detail Laporan
          </h5>

          <button className="close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>

           </div>
            <div className="detail-scroll">

          <div
            className={`detailwarga-image-wrapper ${
              data.status === "selesai" ? "selesai" : ""
            }`}
          >

            <div className="image-box">
              <span className={`status-tag status-${data.status}`}>
                {statusLabel[data.status]}
              </span>

              <div className="card-image-wrapper">
                <img
                  src={getImageUrl(data.foto)}
                  onClick={() => setPreviewImg(getImageUrl(data.foto))}
                  className="clickable-image"
                  onError={(e) => (e.target.src = noImage)}
                  alt="foto laporan"
                />
              </div>

            </div>

            {data.status === "selesai" && (
              <div className="image-box selesai-box">

                {/* OVERLAY */}
                <div className="overlay-selesai">
                  <i className="bi bi-check-circle-fill"></i>
                  Bukti Pembersihan oleh Petugas
                </div>

                <div className="card-image-wrapper">
                  <img
                    src={getImageUrl(data.foto_selesai)}
                    onClick={() => setPreviewImg(getImageUrl(data.foto_selesai))}
                    className="clickable-image"
                    onError={(e) => (e.target.src = noImage)}
                    alt="foto selesai"
                  />
                </div>

              </div>
            )}
          </div>

          <div className="detail-content">

            <h6 className="fw-bold">{data.judul}</h6>

            <div className="detail-info-group">

              <div className="detail-info-card lokasi-card">

                <div className="detail-info-icon lokasi">
                  <MapPin size={18} strokeWidth={2.3} />
                </div>

                <div className="detail-info-text lokasi-text">
                  <small>Lokasi Laporan</small>

                  <span>
                    {data.lokasi}, {data.kecamatan}
                  </span>
                </div>

                {data.latitude != null && data.longitude != null && (
                  <button className="lihat-maps-btn" onClick={openMap}>
                    <ArrowUpRight size={14} />
                    Lihat di Maps
                  </button>
                )}

              </div>

              <div className="detail-info-card">
                <div className="detail-info-icon calendar">
                  <CalendarDays size={18} strokeWidth={2.3} />
                </div>

                <div className="detail-info-text">
                  <small>Tanggal Laporan</small>

                  <span>
                    {new Date(data.tanggal_laporan).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="detail-info-card">
                <div className="detail-info-icon support">
                  <ThumbsUp size={18} strokeWidth={2.3} />
                </div>

                <div className="detail-info-text">
                  <small>Dukungan Warga</small>
                  <span>{data.total_dukungan} warga mendukung</span>
                </div>
              </div>

            </div>

            <p className="detail-deskripsi">
              {data.deskripsi}
            </p>

            <div className={`timeline active-${currentStep}`}>

              {steps.map((step, index) => {

                let stepClass = "";

                if (index < currentStep) stepClass = "completed";
                else if (index === currentStep) stepClass = "active";

                return (
                  <div
                    key={index}
                    className={`timeline-step ${stepClass}`}
                  >

                  <div
                    className={`circle ${
                      index <= currentStep ? "active" : ""
                    }`}
                  >
                    {index <= currentStep && (
                      <i className="bi bi-check-lg"></i>
                    )}
                  </div>

                  <span>{step}</span>

                </div>

              )})}

            </div>

            <p className="status-info">
              Status saat ini :
              <b> {steps[currentStep]}</b>
            </p>

            <div className={`petugas-info ${statusClass[data.status]}`}>
              <i className={`bi ${statusIcon[data.status]}`}></i>
              <span>{statusMessage[data.status]}</span>
            </div>
          </div>

        </div>
      </div>

            {showConfirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-modal">

            <div className="confirm-icon">
              <i className="bi bi-exclamation-lg"></i>
            </div>

            <h5>Anda Yakin Ingin Menghapus?</h5>
            <p>Laporan warga akan dihapus secara permanen.</p>

            <div className="confirm-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowConfirmDelete(false)}
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

            <button
              className="confirm-close"
              onClick={() => setShowConfirmDelete(false)}
            >
              <i className="bi bi-x"></i>
            </button>

          </div>
        </div>
      )}

      {showSuccess && (
        <div className="confirm-overlay">
          <div className="confirm-modal">

            <div className="confirm-icon success">
              <i className="bi bi-check-lg"></i>
            </div>

            <h5>Berhasil</h5>
            <p>Laporan berhasil dihapus.</p>

            <div className="confirm-actions">
              <button
                className="btn-delete"
                onClick={() => {
                  setShowSuccess(false);
                  onClose();
                  window.location.reload();
                }}
              >
                OK
              </button>
            </div>

          </div>
        </div>
      )}

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

export default DetailLaporanModal;