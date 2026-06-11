import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginWarga from "./pages/LoginWarga";
import RegisterWarga from "./pages/RegisterWarga";
import DashboardWarga from "./pages/Dashboard-warga";
import LaporanWarga from "./pages/Laporan-warga";
import EdukasiSampah from "./pages/Edukasi-sampah";
import RiwayatSaya from "./pages/Riwayat-saya";
import DashboardAdmin from "./pages/Dashboard-admin";
import LaporanAdmin from "./pages/Laporan-admin";
import ArtikelEdukasi from "./pages/ArtikelEdukasiAdmin"; 
import DetailEdukasi from "./pages/Detail-edukasi";

import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LoginWarga />} />
        <Route path="/register" element={<RegisterWarga />} />

        <Route path="/Dashboard-warga" element={<DashboardWarga />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />

        <Route path="/laporan-warga" element={<LaporanWarga />} />
        <Route path="/edukasi-sampah" element={<EdukasiSampah />} />
        <Route path="/riwayat-saya" element={<RiwayatSaya />} />

        <Route path="/admin/laporan" element={<LaporanAdmin />} />
        <Route path="/admin/artikel-edukasi" element={<ArtikelEdukasi />} />

        <Route path="/edukasi" element={<EdukasiSampah />} />
        <Route path="/edukasi/:slug" element={<DetailEdukasi />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;