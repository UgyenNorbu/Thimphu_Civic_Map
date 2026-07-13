import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDh8kX9spU-0S9zYHAnBal0hDauNj4M2Ec",
    authDomain: "thimphu-civic-map.firebaseapp.com",
    projectId: "thimphu-civic-map",
    storageBucket: "thimphu-civic-map.firebasestorage.app",
    messagingSenderId: "505477775013",
    appId: "1:505477775013:web:b6f57623890d975807174c"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const map = L.map("map").setView([27.45, 89.63], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
}).addTo(map);

document.getElementById("info-btn").addEventListener("click", function () {
  document.getElementById("info-overlay").classList.add("visible");
});

document.getElementById("info-close").addEventListener("click", function () {
  document.getElementById("info-overlay").classList.remove("visible");
});

let pendingLatLng = null;

map.on("click", function (e) {
  pendingLatLng = e.latlng;
  document.getElementById("issue-desc").value = "";
  document.getElementById("issue-type").value = "road/footpath";
  document.getElementById("modal-overlay").classList.add("visible");
});

document.getElementById("modal-cancel").addEventListener("click", function () {
  document.getElementById("modal-overlay").classList.remove("visible");
  pendingLatLng = null;
});

document.getElementById("modal-submit").addEventListener("click", async function () {
  const description = document.getElementById("issue-desc").value.trim();
  const issueType = document.getElementById("issue-type").value;

  if (!description) {
    alert("Please add a short description.");
    return;
  }

  try {
    await addDoc(collection(db, "pins"), {
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
      type: issueType,
      description: description,
      createdAt: serverTimestamp()
    });
    console.log("Pin saved to Firestore!");
  } catch (error) {
    console.error("Error saving pin:", error);
  }

  document.getElementById("modal-overlay").classList.remove("visible");
  pendingLatLng = null;
});

const pinsQuery = query(collection(db, "pins"));

onSnapshot(pinsQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const pin = change.doc.data();
      const marker = L.marker([pin.lat, pin.lng]).addTo(map);
      marker.bindPopup(`<strong>${pin.type}</strong><br>${pin.description}`);
    }
  });
});

document.getElementById('locate-btn').addEventListener('click', function () {
  // setView requires zoom too, but locate() can auto-zoom based on GPS accuracy
  map.locate({ setView: true, maxZoom: 20 });
});

// Fires automatically if locate() succeeds
map.on('locationfound', function (e) {
  L.marker(e.latlng).addTo(map)
    .bindPopup("You are here").openPopup();
});

// Fires automatically if the user denies permission, or location isn't available
map.on('locationerror', function (e) {
  alert("Could not get your location: " + e.message);
});