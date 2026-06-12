import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/updateStatus.css";
import { getImageUrl } from "../utils/imageUrls";

import {
  MapPin,
  Calendar,
  ThumbsUp,
  CheckCircle,
  UploadCloud,
  X,
} from "lucide-react";

function UpdateStatus({ show, onClose, data, onSuccess }) {

  const [status, setStatus] = useState("terkirim");
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const inputRef = useRef();

  useEffect(() => {
    if (data) {
      setStatus(data.status);
      setFoto(null);
      setPreview(null);
    }
  }, [data]);

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

  const isFinal = data.status === "selesai";

  const handleFile = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ukuran gambar maksimal 5MB");

      setTimeout(() => {
        setErrorMessage("");
      }, 3000);

      return;
    }

    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setFoto(null);
    setPreview(null);
  };

  // drag events
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {

    if (data.status === "selesai")
      return alert("Laporan sudah selesai");

    if (status === "selesai" && !foto) {
      setErrorMessage("Foto bukti wajib diupload sebelum laporan ditandai selesai");

      setTimeout(() => {
        setErrorMessage("");
      }, 3000);

      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("status", status);

      if (foto)
        formData.append("foto_selesai", foto);

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/laporan/${data.id_laporan}/status`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      onSuccess();
      setUpdateSuccess(true);

      setTimeout(() => {
        setUpdateSuccess(false);
        onClose();
      }, 1500);

    } catch (err) {
      alert("Gagal update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-modal-overlay">

      <div className="update-modal-card">

        {updateSuccess && (
          <div className="notif-center success">
            <div className="notif-content">
              <i className="bi bi-check-circle-fill"></i>
              <p>Status laporan berhasil diperbarui</p>
            </div>
          </div>
        )}

        <div className="update-header">
          <h2>Update Status Laporan</h2>
              <button className="update-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
        </div>

        <div className="update-scroll-content">

          {!isFinal ? (

            <div className="update-laporan-card">

              <img
                src={getImageUrl(data.foto)}
                alt=""
              />

              <div className="update-laporan-info">

                <h4>{data.judul}</h4>

                <div className="info-grid">

                  <div className="info-item">
                    <MapPin size={18}/>
                    <div>
                      <span>Lokasi</span>
                      <strong>{data.lokasi}</strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <Calendar size={18}/>
                    <div>
                      <span>Tanggal</span>
                      <strong>
                        {new Date(data.tanggal_laporan).toLocaleDateString("id-ID")}
                      </strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <ThumbsUp size={18}/>
                    <div>
                      <span>Dukungan</span>
                      <strong>{data.total_dukungan} warga</strong>
                    </div>
                  </div>

                </div>

              </div>

              <span className={`badge-solid ${data.status}`}>
                {data.status}
              </span>

            </div>

          ) : (

            <div className="laporan-card vertical">

              <div className="modal-image-wrapper selesai">

                <div className="update-image-box">
                  <img
                    src={getImageUrl(data.foto)}
                    alt="laporan"
                  />
                </div>

                {data.foto_selesai && (
                  <div className="update-image-box">
                    <img
                      src={getImageUrl(data.foto_selesai)}
                      alt="bukti"
                    />

                    <div className="image-tag">
                      📷 Bukti Pembersihan oleh Admin
                    </div>
                  </div>
                )}

              </div>

              <div className="update-laporan-info">

                <h4>{data.judul}</h4>

                <div className="info-grid">

                  <div className="info-item">
                    <MapPin size={18}/>
                    <div>
                      <span>Lokasi</span>
                      <strong>
                        {data.lokasi}, {data.kecamatan}
                      </strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <Calendar size={18}/>
                    <div>
                      <span>Tanggal</span>
                      <strong>
                        {new Date(data.tanggal_laporan)
                          .toLocaleDateString("id-ID")}
                      </strong>
                    </div>
                  </div>

                  <div className="info-item">
                    <ThumbsUp size={18}/>
                    <div>
                      <span>Dukungan</span>
                      <strong>
                        {data.total_dukungan} warga
                      </strong>
                    </div>
                  </div>

                </div>

                <span className="badge-solid selesai">
                  Selesai
                </span>

              </div>

            </div>

          )}

          <hr />

          {!isFinal && (
            <div className="form-group">
              <label>Status Laporan</label>

              <select
                className="update-status-dropdown"
                value={status}
                onChange={(e)=>setStatus(e.target.value)}
              >
                <option value="terkirim">Terkirim</option>
                <option value="proses">Proses</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          )}

          {!isFinal && status === "selesai" && (
            <>
              <div className="info-success">
                <CheckCircle size={18}/>
                Laporan akan ditandai sebagai selesai dan warga akan melihat bukti penyelesaian.
              </div>

              <div className="upload-title">
                Tambah Bukti Foto <span>WAJIB</span>
              </div>

              <p className="upload-desc">
                Upload foto sampah yang sudah dibersihkan sebagai bukti penyelesaian.
              </p>

              {errorMessage && (
                <div className="upload-error">
                  <X size={16}/>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div
                className={`update-upload-area ${dragActive ? "drag" : ""}`}
                onClick={() => !preview && inputRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                {preview ? (
                  <div className="upload-preview-wrapper">

                    <img
                      src={preview}
                      alt="preview"
                      className="upload-preview-image"
                    />

                    {!updateSuccess && (
                      <button
                        type="button"
                        className="upload-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto();
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}

                    <div className="upload-file-name">
                      {foto?.name}
                    </div>

                  </div>
                ) : (
                  <>
                    <UploadCloud size={32}/>
                    <p>Klik untuk upload foto</p>
                    <small>atau drag & drop ke sini</small>
                    <span className="upload-limit">
                      Maksimal ukuran 5MB
                    </span>
                    <span className="upload-format">
                      (PNG, JPG, JPEG)
                    </span>
                  </>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>
            </>
          )}

          {isFinal && (
            <div className="final-status">
              <span className="check-icon">✓</span>
              Laporan ini sudah final dan tidak dapat diubah lagi
            </div>
          )}

        </div>

        <div className="update-modal-actions">

          {!isFinal && (
            <button
              className="btn-save"
              onClick={handleSubmit}
              disabled={loading}
            >
              {status === "selesai"
                ? "Simpan & Tandai Selesai"
                : "Simpan"}
            </button>
          )}

        </div>

      </div>
    </div>
  );
}

export default UpdateStatus;