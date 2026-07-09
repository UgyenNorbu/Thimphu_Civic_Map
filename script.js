const map = L.map("map").setView([27.45, 89.63], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxzoom: 19,
}).addTo(map);