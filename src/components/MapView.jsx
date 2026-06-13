import { useEffect, useRef } from "react";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

function MapView() {

  const mapRef = useRef(null);

  useEffect(() => {

    if (mapRef.current) return;

    const map = L.map("map").setView([-4.0167, 119.6236], 13);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OpenStreetMap" }
    ).addTo(map);

    const DLH_COORDS = [-3.9884196361122606, 119.6521610943085];
    const TPA_PAREPARE_COORDS = [-3.9766188359154477, 119.66376310938612];

    const dlhIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const dlhMarker = L.marker(DLH_COORDS, { icon: dlhIcon })
      .addTo(map)
      .bindPopup("<b>Dinas Lingkungan Hidup Parepare</b>");

    dlhMarker.bindTooltip(
      `<div style="min-width:160px">
        <div style="font-weight:700">DLH Parepare</div>
      </div>`,
      { direction: "top", sticky: true, opacity: 0.95, offset: [0, -10], className: "tps-tooltip" }
    );

    const redTPAIcon = L.icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const tpaMarker = L.marker(TPA_PAREPARE_COORDS, { icon: redTPAIcon })
      .addTo(map)
      .bindPopup("<b>TPA Kota Parepare</b><br>Titik Akhir Pembuangan Sampah");

    tpaMarker.bindTooltip(
      `<div style="min-width:160px">
        <div style="font-weight:700">TPA Kota Parepare</div>
        <div>Titik Akhir Pembuangan</div>
      </div>`,
      { direction: "top", sticky: true, opacity: 0.95, offset: [0, -10], className: "tps-tooltip" }
    );

    mapRef.current = map;

    loadMarkers(map);

  }, []);

  const loadMarkers = async (map) => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tempat_sampah`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const tpsTrashPinSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72">
  <defs>
    <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.2" flood-opacity=".35"/>
    </filter>
    <linearGradient id="pinG" x1="14" y1="8" x2="50" y2="60" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#34d399"/>
      <stop offset="1" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="innerG" x1="18" y1="14" x2="46" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="binG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#111827"/>
      <stop offset="1" stop-color="#0b1220"/>
    </linearGradient>
  </defs>
  <g filter="url(#ds)">
    <path d="M32 3
             C19.7 3 9.8 12.9 9.8 25.2
             c0 15.4 18.1 35.7 21 39.1
             c.6.7 1.8.7 2.4 0
             c2.9-3.4 21-23.7 21-39.1
             C54.2 12.9 44.3 3 32 3z"
          fill="url(#pinG)"/>
    <path d="M32 3
             C19.7 3 9.8 12.9 9.8 25.2
             c0 15.4 18.1 35.7 21 39.1
             c.6.7 1.8.7 2.4 0
             c2.9-3.4 21-23.7 21-39.1
             C54.2 12.9 44.3 3 32 3z"
          fill="none" stroke="#0f172a" stroke-opacity=".18" stroke-width="1"/>
    <circle cx="32" cy="26" r="15.3" fill="url(#innerG)" stroke="#0f172a" stroke-opacity=".12"/>
    <rect x="24" y="18" width="16" height="4.3" rx="2.2" fill="url(#binG)"/>
    <rect x="28.3" y="15.7" width="7.4" height="3.2" rx="1.6" fill="#111827"/>
    <path d="M25.6 22.8h12.8l-1.2 15.6c-.1 1.1-1 2-2.2 2H29c-1.2 0-2.1-.9-2.2-2l-1.2-15.6z"
          fill="url(#binG)"/>
    <rect x="29.2" y="26" width="1.8" height="12.2" rx="0.9" fill="#e5e7eb" opacity=".55"/>
    <rect x="31.9" y="26" width="1.8" height="12.2" rx="0.9" fill="#e5e7eb" opacity=".55"/>
    <rect x="34.6" y="26" width="1.8" height="12.2" rx="0.9" fill="#e5e7eb" opacity=".55"/>
    <circle cx="43.8" cy="37.5" r="6.1" fill="#22c55e" stroke="#ffffff" stroke-width="2"/>
    <path d="M41.6 37.8l1.1-2.1 2.2 1.2M45.1 37.2l-1.1 2.1-2.2-1.2"
          fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`.trim();

      const tpsIcon = L.icon({
        iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(tpsTrashPinSvg)}`,
        iconSize: [44, 52],
        iconAnchor: [22, 50],
        popupAnchor: [0, -46],
      });


      res.data.forEach((tps) => {

        const marker = L.marker(
          [tps.latitude, tps.longitude],
          { icon: tpsIcon }
        ).addTo(map);

        marker.bindPopup(`
          <div style="font-size:14px">
            <b>${tps.nama_tps}</b><br/>
            ${tps.lokasi}
          </div>
        `);


        marker.on("mouseover", function () {
          this.openPopup();
        });

        marker.on("mouseout", function () {
          this.closePopup();
        });

      });

    } catch (err) {
      console.log(err);
    }
  };

  return <div id="map"></div>;
}

export default MapView;