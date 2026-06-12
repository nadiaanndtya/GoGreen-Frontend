import { useState, useEffect, useRef } from "react";
import axios from "axios";
import cityImage from "../assets/buatlaporan.png";
import { MapPin } from "lucide-react";
import { getImageUrl } from "../utils/imageUrls";

function BuatLaporan({ show, onClose, onSuccess, editData }) {

  const token = localStorage.getItem("token");

  const [coords, setCoords] = useState({
    latitude: null,
    longitude: null
  });

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    lokasi: "",
    kecamatan: "",
    foto: ""
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notif, setNotif] = useState(null); 
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);

  const isEdit = !!editData;

  useEffect(() => {
    if (show) {
      if (editData) {
        setForm({
          judul: editData.judul || "",
          deskripsi: editData.deskripsi || "",
          lokasi: editData.lokasi || "",
          kecamatan: editData.kecamatan || ""
        });

        setCoords({
          latitude: editData.latitude,
          longitude: editData.longitude
        });

        setPreview(getImageUrl(editData.foto));

      } else {
        setForm({
          judul: "",
          deskripsi: "",
          lokasi: "",
          kecamatan: ""
        });
        setPreview(null);
        setSelectedFile(null);
      }

      setErrors({});
      setNotif(null);
    }
  }, [show, editData]);

  if (!show) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

    setErrors({
      ...errors,
      [e.target.name]: ""
    });

    if (e.target.name === "lokasi") {
      setCoords({
        latitude: null,
        longitude: null
      });
    }
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung lokasi");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log("AKURASI (meter):", accuracy);

        setCoords({
          latitude: lat,
          longitude: lng
        });

        try {
          const res = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat: lat,
                lon: lng,
                format: "json"
              }
            }
          );

          const alamat = res.data.display_name;

          setForm((prev) => ({
            ...prev,
            lokasi: alamat
          }));

        } catch (err) {
          setForm((prev) => ({
            ...prev,
            lokasi: `Lat: ${lat}, Lng: ${lng}`
          }));
        }

        setLoading(false);
      },

      (error) => {
        console.error("ERROR GEO:", error);

        let message = "Gagal mengambil lokasi";

        if (error.code === 1) {
          message = "Izin lokasi ditolak";
        } else if (error.code === 2) {
          message = "Lokasi tidak tersedia";
        } else if (error.code === 3) {
          message = "Timeout mengambil lokasi";
        }

        alert(message);
        setLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({
        ...prev,
        foto: "File harus berupa gambar"
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        foto: "Ukuran maksimal 5MB"
      }));
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));

    setErrors(prev => ({
      ...prev,
      foto: ""
    }));
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFile(file);
  };
  
  const removeFoto = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

    const submitLaporan = async () => {
      let newErrors = {};

      if (!form.judul) newErrors.judul = "Judul wajib diisi";
      if (!form.deskripsi) newErrors.deskripsi = "Deskripsi wajib diisi";
      if (!form.lokasi) newErrors.lokasi = "Lokasi wajib diisi";
      if (!form.kecamatan) newErrors.kecamatan = "Kecamatan wajib dipilih";

      if (!isEdit && !selectedFile) {
        newErrors.foto = "Foto wajib diunggah";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      try {
        setLoading(true);

        const formData = new FormData();
        formData.append("judul", form.judul);
        formData.append("deskripsi", form.deskripsi);
        formData.append("lokasi", form.lokasi);
        formData.append(
          "latitude",
          coords.latitude !== null ? coords.latitude : ""
        );

        formData.append(
          "longitude",
          coords.longitude !== null ? coords.longitude : ""
        );
        formData.append("kecamatan", form.kecamatan);

        if (selectedFile) {
          formData.append("foto", selectedFile);
        }

        if (isEdit) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/laporan/${editData.id_laporan}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/laporan`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        }

        setNotif({
          type: "success",
          message: isEdit
            ? "Laporan berhasil diupdate"
            : "Laporan berhasil dikirim"
        });

        onSuccess && onSuccess();

        setTimeout(() => {
          onClose();
          setNotif(null);
        }, 2000);

      } catch (err) {

          console.log("ERROR:", err);
          console.log("RESPONSE:", err.response);
          console.log("DATA:", err.response?.data);
          
        setNotif({
          type: "error",
          message:
            err.response?.data?.message ||
            "Gagal memproses laporan"
        });
      } finally {
        setLoading(false);
      }
    };

return (
  <div className="modal-overlay">
    <div className="laporan-modal">

      <div className="laporan-header">
        <button className="close-btn" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>

        <h2>{isEdit ? "Edit Laporan" : "Buat Laporan Baru"}</h2>

        <img src={cityImage} className="header-img" />
      </div>

        {notif && (
        <div className={`notif-center ${notif.type}`}>
            <div className="notif-content">
            <i className={`bi ${notif.type === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}></i>
            <p>{notif.message}</p>
            </div>
        </div>
        )}

      <div className="modal-body-custom">

        <div className="form-container">

          <label>Judul Laporan</label>
          <input
            name="judul"
            placeholder="Contoh: Sampah menumpuk di pinggir jalan"
            onChange={handleChange}
            value={form.judul}
          />
          {errors.judul && <small className="error-text">{errors.judul}</small>}

          <div className="form-row">
            <div>
              <label>Kecamatan</label>
              <select name="kecamatan" value={form.kecamatan} onChange={handleChange}>
                <option value="">Pilih Kecamatan</option>
                <option>Ujung</option>
                <option>Soreang</option>
                <option>Bacukiki</option>
                <option>Bacukiki Barat</option>
              </select>
              {errors.kecamatan && <small className="error-text">{errors.kecamatan}</small>}
            </div>

            <div>
              <label>Lokasi</label>
              <div className="lokasi-wrapper">
                <input
                  name="lokasi"
                  value={form.lokasi}
                  onChange={handleChange}
                  placeholder="Contoh: Jl. Industri Kecil..."
                />

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn-lokasi"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <MapPin size={18} />
                  )}
                </button>
              </div>
              {errors.lokasi && (
                <small className="error-text">{errors.lokasi}</small>
              )}
            </div>
          </div>

          <label>Deskripsi</label>
          <textarea
            name="deskripsi"
            value={form.deskripsi}
            rows="3"
            placeholder="Jelaskan masalah secara detail"
            onChange={handleChange}
          />
          {errors.deskripsi && <small className="error-text">{errors.deskripsi}</small>}

          <div
            className={`upload-box ${dragActive ? "active" : ""} ${preview ? "has-preview" : ""}`}
            onDragEnter={(e) => { e.preventDefault(); dragCounter.current++; setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current <= 0) { dragCounter.current = 0; setDragActive(false); } }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); dragCounter.current = 0; setDragActive(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >

            {!preview ? (
              <label className="upload-label">
                <input type="file" hidden accept="image/*" onChange={handleFoto} />
                <div className="upload-content">
                  <i className="bi bi-cloud-arrow-up upload-icon"></i>
                  <p className="upload-main">Klik untuk upload foto</p>
                  <p className="upload-sub">atau drag & drop ke sini</p>
                  <p className="upload-info">Unggah foto terkait masalah sampah. Maksimal ukuran 5MB (PNG, JPG, JPEG)</p>
                </div>
              </label>
            ) : (
              <div className="preview-professional">
                <div className="preview-file-card">
                  <img className="preview-img-full" src={preview} alt="preview" />
                  <div className="preview-bar">
                    <div className="preview-meta">
                        <span className="preview-name">{selectedFile?.name || "foto.jpg"}</span>
                        <span className="preview-size">{selectedFile ? formatSize(selectedFile.size) : ""}</span>
                      </div>
                    
                    <div className="preview-actions">
                      <div className="badge-ok">
                        <i className="bi bi-check-circle-fill"></i> Siap dikirim
                      </div>
                      <label className="btn-change-photo" style={{ cursor: "pointer" }}>
                        <input type="file" hidden accept="image/*" onChange={handleFoto} />
                        <i className="bi bi-arrow-repeat"></i> Ganti
                      </label>
                      <button className="btn-remove-photo" onClick={removeFoto}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {errors.foto && <small className="error-text">{errors.foto}</small>}

          </div>

        </div>

        <div className="modal-footer-custom">

          <div className="footer-info">
            <i className="bi bi-lightbulb"></i>
            <span>
              Pastikan data yang anda isi sudah sesuai dengan kondisi lapangan.
            </span>
          </div>

            <button 
            className="kirim-btn"
            onClick={submitLaporan} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                {isEdit ? "Menyimpan..." : "Mengirim..."}
              </>
            ) : (
              <>
                <i className="bi bi-send-check-fill"></i>
                {isEdit ? "Simpan Perubahan" : "Kirim Laporan"}
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  </div>
);
}

export default BuatLaporan;