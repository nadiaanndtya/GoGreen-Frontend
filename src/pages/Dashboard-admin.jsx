import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../components/NavbarAdmin.jsx";
import "../styles/admin.css";
import foto from "../assets/admin.png";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";

function DashboardAdmin() {

  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccessAndFetch();
  }, []);

  const checkAccessAndFetch = async () => {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || user.role !== "admin" || !token) {
      navigate("/");
      return;
    }

    try {

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.data) {
        throw new Error("Response kosong");
      }

      setStats(res.data);

    } catch (error) {

      console.error("ERROR AMBIL STATS:", error);

      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }

      if (error.response?.status === 403) {
        navigate("/");
      }

    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="loading">Loading dashboard...</div>;
  }

  console.log("STATS:", stats);
  console.log("WEEKLY RAW:", stats.laporan_per_minggu);
  console.log("STATUS RAW:", stats.status_distribusi);

  const weeklyData = [];

  if (Array.isArray(stats.laporan_per_minggu)) {

    const map = {};

    stats.laporan_per_minggu.forEach(item => {
      const [year, week] = item.minggu.split("-");
      const key = `Minggu ${week}`;

      if (!map[key]) {
        map[key] = {
          minggu: key,
          terkirim: 0,
          proses: 0,
          selesai: 0
        };
      }

      map[key][item.status] = Number(item.total);
    });

    Object.values(map).forEach(val => weeklyData.push(val));
  }

  const statusData = Array.isArray(stats.status_distribusi)
    ? stats.status_distribusi.map(item => {

        if (!item.status || isNaN(item.total)) {
          console.warn("DATA STATUS RUSAK:", item);
        }

        return {
          name: item.status,
          value: Number(item.total) || 0
        };
      })
    : [];

  const COLORS = {
    terkirim: "#9CA3AF",  
    proses: "#F97316",    
    selesai: "#22C55E"  
  };

  return (
    <div className="admin-container">

      <NavbarAdmin />

      <div className="admin-content">

        <div className="admin-hero-card">

          <div className="admin-hero-content">
            <h2>Dashboard Admin</h2>
            <p>
              Terus pantau dan kelola laporan lingkungan untuk kota yang lebih bersih.
            </p>
          </div>

          <div className="admin-hero-image">
            <img src={foto} alt="admin" />
          </div>

        </div>

        <div className="admin-cards">

          <StatCard title="Total Laporan" value={stats.total_laporan || 0} icon="bi bi-clipboard-data" />
          <StatCard title="Terkirim" value={stats.terkirim || 0} icon="bi bi-send-fill" />
          <StatCard title="Proses" value={stats.proses || 0} icon="bi bi-arrow-repeat" />
          <StatCard title="Selesai" value={stats.selesai || 0} icon="bi bi-check-circle" />
          <StatCard title="Dukungan Warga" value={stats.dukungan || 0} icon="bi bi-people" />

        </div>

        <div className="chart-grid">

          <div className="chart-box">
            <h3 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "4px"
            }}>
              Grafik Laporan Mingguan
            </h3>

            <p style={{
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "18px"
            }}>
              Statistik jumlah laporan warga berdasarkan status setiap minggu
            </p>

            {weeklyData.length === 0 ? (
              <p className="empty-text">Tidak ada data laporan mingguan</p>
            ) : (
              <ResponsiveContainer
                  width="100%"
                  height={window.innerWidth < 768 ? 220 : 300}
                >
              <BarChart data={weeklyData}>
                <XAxis dataKey="minggu" />
                <YAxis />
                <Tooltip />

                <Legend 
                  iconType="circle"
                  formatter={(value) => {
                    if (value === "terkirim") return "Terkirim";
                    if (value === "proses") return "Diproses";
                    if (value === "selesai") return "Selesai";
                    return value;
                  }}
                />

                <Bar dataKey="terkirim" stackId="a" fill="#9CA3AF" barSize={20} radius={[4, 4, 0, 0]} />
                <Bar dataKey="proses" stackId="a" fill="#F97316" barSize={20} radius={[4, 4, 0, 0]} />
                <Bar dataKey="selesai" stackId="a" fill="#22C55E" barSize={20} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className="chart-box">
            <h3 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "4px"
            }}>
              Distribusi Status Laporan
            </h3>

            <p style={{
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "18px"
            }}>
              Persentase kondisi laporan yang sedang ditangani saat ini
            </p>

            {statusData.length === 0 ? (
              <p className="empty-text">Tidak ada data status</p>
            ) : (
              <ResponsiveContainer
                  width="100%"
                  height={window.innerWidth < 768 ? 220 : 300}
                >
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    iconType="circle"
                    formatter={(value) => {
                      if (value === "terkirim") return "Terkirim";
                      if (value === "proses") return "Diproses";
                      if (value === "selesai") return "Selesai";
                      return value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="admin-card">
      <div className="card-icon">
        <i className={icon}></i>
      </div>
      <div>
        <p
          className="card-title fw-bold"
          style={{
            fontSize: "17px",
            color: "#065f46" 
          }}
        >
          {title}
        </p>
        <h1 className="card-value">{value}</h1>
      </div>
    </div>
  );
}

export default DashboardAdmin;