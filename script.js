import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


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

const map = L.map("map").setView([27.45, 89.63], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
}).addTo(map);

map.on("click", async function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    const description = prompt("Describe the issue (e.g.'Pothole blocking one lane')");

    if (!description) {
        return; // exits the function early, skips the rest
    }

    try {
        await addDoc(collection(db, "pins"), {
            lat: lat,
            lng: lng,
            description: description,
            createdAt: new Date().toISOString()
        });
        
        console.log("Pin saved to Firestore!");
    } catch (error) {
        console.error("Error saving pin:", error);
    }    
});

const pinsQuery = query(collection(db, "pins"));

onSnapshot(pinsQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const pin = change.doc.data();
      const marker = L.marker([pin.lat, pin.lng]).addTo(map);
      marker.bindPopup(pin.description);
      //marker.bindPopup(`Lat: ${pin.lat.toFixed(5)}, Lng: ${pin.lng.toFixed(5)}`);
    }
  });
});