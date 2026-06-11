import { useState, useEffect } from "react";
import axios from "axios";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

function BuatArtikel({ show, onClose, onSuccess, articleData }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [dragActive, setDragActive] = useState(false);

  const isEdit = !!articleData;
  const token = localStorage.getItem("token");

  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ header: [1, 2, 3, false] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }]
      ]
    }
  });

  if (!show) return null;

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        const html = quill.root.innerHTML;

        setContent(html);

        if (errors.content) {
          setErrors((prev) => ({
            ...prev,
            content: ""
          }));
        }
      });
    }
  }, [quill, errors]);

  useEffect(() => {
    if (articleData) {
      setTitle(articleData.title || "");
      setContent(articleData.content || "");
      setCategoryId(articleData.category_id || "");

      if (articleData.thumbnail) {
        setThumbnailPreview(
          `${import.meta.env.VITE_API_URL}/uploads/${articleData.thumbnail}`
        );
      }
    }
  }, [articleData]);

  useEffect(() => {
    if (quill && articleData?.content) {
      quill.root.innerHTML = articleData.content;
    }
  }, [quill, articleData]);

  function processFile(file) {
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Hanya file PNG, JPG, dan JPEG yang diperbolehkan");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran maksimal 5MB");
      return;
    }

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function handleSubmit() {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Judul artikel wajib diisi";
    }

    if (!categoryId) {
      newErrors.category = "Kategori wajib dipilih";
    }

    if (!thumbnailPreview) {
      newErrors.thumbnail = "Gambar artikel wajib diupload";
    }

    if (
      !content ||
      content === "<p><br></p>" ||
      content.replace(/<(.|\n)*?>/g, "").trim() === ""
    ) {
      newErrors.content = "Konten artikel wajib diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category_id", categoryId);

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      if (isEdit) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/admin/articles/${articleData.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/articles`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
      }

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onSuccess && onSuccess();

        setTitle("");
        setContent("");
        setCategoryId("");
        setThumbnail(null);
        setThumbnailPreview(null);

        if (quill) quill.setText("");

        onClose();
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan artikel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="laporan-modal">

        {success && (
          <div className="notif-center success">
            <div className="notif-content">
              <i className="bi bi-check-circle-fill"></i>
              <p>
                {isEdit
                  ? "Artikel berhasil diupdate"
                  : "Artikel berhasil dibuat"}
              </p>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="laporan-header">
          <button className="close-btn" onClick={!success ? onClose : undefined}>
            <i className="bi bi-x-lg"></i>
          </button>

          <h2>
            {isEdit ? "Edit Artikel Edukasi" : "Buat Artikel Edukasi"}
          </h2>
        </div>

        {/* BODY */}
        <div className="modal-body-custom">
          <div className="form-container">

            <label>Judul Artikel*</label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);

                if (errors.title) {
                  setErrors((prev) => ({
                    ...prev,
                    title: ""
                  }));
                }
              }}
              placeholder="Masukkan Judul Artikel"
            />

            {errors.title && (
              <p className="field-error">{errors.title}</p>
            )}

            <div className="category-section">
              <label>Kategori*</label>

              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);

                  if (errors.category) {
                    setErrors((prev) => ({
                      ...prev,
                      category: ""
                    }));
                  }
                }}
              >

                <option value="">Pilih Kategori</option>

                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="field-error">{errors.category}</p>
              )}
            </div>

            <div className="upload-section">
              <label>Gambar Artikel*</label>

              <div
                className={`artikel-upload-box ${dragActive ? "drag-active" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!thumbnailPreview) {
                    document.getElementById("artikelThumbnail").click();
                  }
                }}
              >
                <input
                  id="artikelThumbnail"
                  type="file"
                  hidden
                  accept=".png,.jpg,.jpeg"
                  onChange={handleImage}
                />

                {thumbnailPreview ? (
                  <div className="artikel-preview-wrapper">

                    <div className="artikel-preview-box">

                      <img
                        src={thumbnailPreview}
                        alt="preview"
                        className="artikel-preview-image"
                      />

                      {!success && (
                        <button
                          type="button"
                          className="artikel-remove-btn"
                          onClick={(e)=>{
                            e.preventDefault();
                            e.stopPropagation();
                            setThumbnail(null);
                            setThumbnailPreview(null);
                            if (errors.thumbnail) {
                              setErrors((prev) => ({
                                ...prev,
                                thumbnail: ""
                              }));
                            }
                          }}
                        >
                          ×
                        </button>
                      )}

                      <div className="artikel-file-name">
                        {thumbnail?.name}
                      </div>

                    </div>

                  </div>
                  
                ) : (
                  <div className="artikel-upload-content">
                    <i className="bi bi-cloud-arrow-up upload-icon"></i>

                    <p className="artikel-upload-title">
                      Klik untuk upload foto
                    </p>

                    <span className="artikel-upload-sub">
                      atau drag & drop ke sini
                    </span>

                    <small>
                      Maksimal ukuran 5MB
                    </small>

                    <small>
                      PNG, JPG, JPEG
                    </small>
                  </div>
                )}
              </div>

              {errors.thumbnail && (
                <p className="field-error">{errors.thumbnail}</p>
              )}
            </div>

            <label>Konten Artikel*</label>
            <div className="editor-wrapper">
              <div
                ref={quillRef}
                style={{ height: "250px", background: "white" }}
              />
            </div>

            {errors.content && (
              <p className="field-error">{errors.content}</p>
            )}

          </div>

          {/* FOOTER */}
          <div className="modal-footer-custom">

            <button
              className="btn-batal"
              onClick={!success ? onClose : undefined}
            >
              Batal
            </button>

            <button
              className="kirim-btn"
              onClick={handleSubmit}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="bi bi-send-check-fill"></i>
                  {isEdit ? "Update Artikel" : "Buat Artikel"}
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default BuatArtikel;