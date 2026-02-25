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