document.addEventListener('DOMContentLoaded', () => {
alert("Get ready for awesome!");
// Selecting the elements from your HTML so we can talk to them
const video = document.getElementById('heroVideo');     // Finds your video tag
const btn = document.querySelector('.button');      // Finds the button with your class
const container = document.querySelector('.video-container'); // Finds the main wrapper

const heroBtn = document.querySelector('.scroll-btn');
const contentSection = document.querySelector('#start-content');

heroBtn.addEventListener('click', () => {
  contentSection.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  });
});

// --- 2. THE SCROLL TRIGGER ---
window.addEventListener('scroll', function() {
    let scrollPos = window.scrollY;
    const textElement = document.querySelector('.video-text');

    if (scrollPos > 100) {
        // This adds the solid color class
        textElement.classList.add('is-solid');
    } else {
        // This brings the video stencil back when you scroll to the very top
        textElement.classList.remove('is-solid');
    }
    
    // You can keep your other map/fade logic here too!
});

function scrollToContent() {
    const destination = document.getElementById('start-content');
    destination.scrollIntoView({ 
        behavior: 'smooth' 
    });
}
// this is the section that targets the "about me" text stuff 
window.addEventListener('scroll', function() {
    let scrollPos = window.scrollY;
    
    // We can use document.body to control everything on the page at once
    if (scrollPos > 150) {
        document.body.classList.add('is-scrolled');
    } else {
        document.body.classList.remove('is-scrolled');
    }
});

const noteObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log("Note is in view!"); // This tells you it's working
      entry.target.classList.add('show-note');
    } else {
      console.log("Note is hidden!"); // This confirms the reset
      entry.target.classList.remove('show-note');
    }
  });
}, { 
  threshold: 0.1, // Triggers as soon as 10% of the note shows up
  rootMargin: "0px 0px -50px 0px" // Slight buffer so it doesn't flicker at the very bottom
});

// Select the container and start watching
const note = document.querySelector('.note-container');
if (note) {
  noteObserver.observe(note);
}


// 1. Create the map and attach it to the <div id="map">
// [0, 0] is the starting Latitude/Longitude, and 2 is the zoom level
// 1. Initialize the map
var map = L.map('map').setView([0, 0], 2);

// 2. Add the background layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// 3. Fetch your MapHub data
fetch('map.geojson')
    .then(response => response.json())
    .then(data => {
        
        // 4. Create the layer and store it in geoJsonLayer
        var geoJsonLayer = L.geoJSON(data, {
            // Default faded style
            style: function(feature) {
                return { color: "#3388ff", weight: 5, opacity: 0.3 };
            },

            // 5. THE UPDATED PART: Handle Popups and Sync-Highlighting
            onEachFeature: function (feature, layer) {
                
                // Pull information from MapHub properties
                var title = feature.properties.title || feature.properties.name || "Route";
                var desc = feature.properties.description || "No description provided.";
                
                // Bind the popup. 'autoClose: false' keeps it open when you move the mouse
                layer.bindPopup("<strong>" + title + "</strong><br>" + desc, {
                    autoClose: false, 
                    closeOnClick: true 
                });

                // When mouse enters
                layer.on('mouseover', function (e) {
                    var currentRoute = feature.properties.title || feature.properties.name; 

                    // Highlight all pieces with the same name
                    geoJsonLayer.eachLayer(function(piece) {
                        var pieceName = piece.feature.properties.title || piece.feature.properties.name;
                        if (pieceName === currentRoute) {
                            piece.setStyle({ opacity: 1.0, weight: 8 });
                        }
                    });

                    // Open the popup at the mouse location
                    this.openPopup(e.latlng);
                });

                // When mouse leaves
                layer.on('mouseout', function (e) {
                    // Reset all pieces to faded
                    geoJsonLayer.setStyle({ opacity: 0.3, weight: 5 });
                    // Notice: No closePopup() here, so it stays open!
                });
            }
        }).addTo(map);

        // Zoom to your data
        map.fitBounds(geoJsonLayer.getBounds());
        // keeps from panning sideways
        map.setMaxBounds(geoJsonLayer.getBounds());
        // Set the minZoom to the CURRENT zoom level 
// This prevents them from zooming out further than the "perfect fit"
map.setMinZoom(map.getZoom());
    })
    .catch(err => console.error("Error:", err));
});