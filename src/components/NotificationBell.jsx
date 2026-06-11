import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import DetailLaporanModal from "./DetailLaporanModal";
import BuatLaporan from "../pages/BuatLaporan";

function NotificationBell() {

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [openDropdown, setOpenDropdown] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const dropdownRef = useRef();

  const loadNotifications = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const notifRes =
        await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

      const countRes =
        await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

      setNotifications(notifRes.data);

      setUnreadCount(countRes.data.count);

    } catch (error) {

      console.error(
        "Gagal mengambil notifikasi",
        error
      );

    }

  };

  useEffect(() => {

    loadNotifications();

  }, []);

  useEffect(() => {

    const interval = setInterval(() => {

      loadNotifications();

    }, 3000);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenDropdown(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);

  const handleNotificationClick =
    async (notification) => {

      try {

        const token =
          localStorage.getItem("token");

        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/notifications/read/${notification.id_notification}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const detail =
          await axios.get(
            `${import.meta.env.VITE_API_URL}/api/laporan/${notification.id_laporan}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

        setOpenDropdown(false);

        requestAnimationFrame(() => {
        setSelectedLaporan(detail.data);
        setShowDetail(true);
        });

        setNotifications(prev =>
          prev.map(item =>
            item.id_notification === notification.id_notification
              ? {
                  ...item,
                  is_read: true
                }
              : item
          )
        );

        setUnreadCount(prev =>
          Math.max(prev - 1, 0)
        );

      } catch (error) {

        console.error(error);

      }

    };

  const handleMarkAllRead = async () => {
    try {

        const token =
        localStorage.getItem("token");

        await axios.put(
        `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
        {},
        {
            headers: {
            Authorization: `Bearer ${token}`
            }
        }
        );

        setNotifications(prev =>
        prev.map(item => ({
            ...item,
            is_read: true
        }))
        );

        setUnreadCount(0);

    } catch (error) {
        console.error(error);
    }
 };

 const handleDeleteNotification =
  async (id) => {

    try {

      const token =
        localStorage.getItem("token");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(prev =>
        prev.filter(
          item =>
            item.id_notification !== id
        )
      );

    } catch (error) {

      console.error(error);

    }

  };

  const formatNotificationDate = (dateString) => {

    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return "Baru saja";
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} menit yang lalu`;
    }

    if (diffHours < 24) {
        return `${diffHours} jam yang lalu`;
    }

    if (diffDays === 1) {
        return "Kemarin";
    }

    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long"
        });
    }

    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
 };

  const getIcon = (type) => {

    switch (type) {

      case "laporan_terkirim":
        return "bi-send-check-fill";

      case "laporan_diproses":
        return "bi-hourglass-split";

      case "laporan_selesai":
        return "bi-check-circle-fill";

      case "laporan_didukung":
        return "bi-hand-thumbs-up-fill";

      default:
        return "bi-bell-fill";

    }

  };

  return (
    <>
      <div
        className="notification-wrapper"
        ref={dropdownRef}
      >

        <button
          className="notification-btn"
          onClick={() =>
            setOpenDropdown(!openDropdown)
          }
        >

          <i className="bi bi-bell-fill"></i>

          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount}
            </span>
          )}

        </button>

        {openDropdown && (

          <div className="notification-dropdown">

            <div className="notification-header">

                <h6>Notifikasi</h6>

                {notifications.length > 0 && (
                    <button
                    className="mark-all-btn"
                    onClick={handleMarkAllRead}
                    >
                    Tandai semua dibaca
                    </button>
                )}

            </div>

            {notifications.length === 0 ? (

              <div className="notification-empty">

                Belum ada notifikasi

              </div>

            ) : (

              <div className="notification-list">


                {notifications.map((notif) => (

                    <div
                    key={notif.id_notification}
                    className={`notification-item ${
                        !notif.is_read
                        ? "unread"
                        : ""
                    }`}
                    onClick={() =>
                        handleNotificationClick(notif)
                    }
                    >

                    <div className="notification-icon">

                        <i
                        className={`bi ${getIcon(
                            notif.type
                        )}`}
                        ></i>

                    </div>

                    <div className="notification-content">

                        <strong>
                        {notif.title}
                        </strong>

                        <p>
                        {notif.message}
                        </p>

                        <small>
                        {formatNotificationDate(notif.created_at)}
                        </small>

                        {!notif.is_read && (
                            <span className="notif-click-hint">
                                Klik untuk melihat detail
                            </span>
                        )}

                    </div>

                    <button
                        className="delete-notif-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(
                            notif.id_notification
                            );
                        }}
                    >
                        <i className="bi bi-trash"></i>
                    </button>

                    <div className="notification-arrow">
                        <i className="bi bi-chevron-right"></i>
                    </div>

                    </div>

                ))}

              </div>

            )}

          </div>

        )}

      </div>

      {
        showDetail &&
        createPortal(
            <DetailLaporanModal
            show={showDetail}
            onClose={() => setShowDetail(false)}
            data={selectedLaporan}
            onEdit={(laporan) => {
                setShowDetail(false);
                setEditData(laporan);
                setShowEditModal(true);
            }}
            />,
            document.body
        )
      }

      {
        showEditModal &&
        createPortal(
            <BuatLaporan
            show={showEditModal}
            editData={editData}
            onClose={() => {
                setShowEditModal(false);
                setEditData(null);
            }}
            onSuccess={() => {
                loadNotifications();
            }}
            />,
            document.body
        )
      }

    </>
  );
}

export default NotificationBell;