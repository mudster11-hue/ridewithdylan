document.addEventListener('DOMContentLoaded', () => { //makes sure html file loads first
    // 1. Initialize the map (Focused on your routes)

    const map = L.map('map', {
        zoomControl: false // by putting false here I override where the zoom in and zoom out is
    }).setView([39.32, -111.09], 6); //starts map rendering over the state of utah

    // Add Zoom control to the bottom right so it doesn't hit our cards might move this later
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 2. Add the background layer (Dark mode looks great with orange/green)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
    const previewBox = document.getElementById('route-photo-preview');
    const previewImg = document.getElementById('preview-img');

    // 3. Fetch your GeoJSON data
    fetch('map.geojson')
        .then(response => response.json())
        .then(data => {

            // 4. Create the layer
            let geoJsonLayer = L.geoJSON(data, {
                // Default style: Faded so the map looks clean
                style: function (feature) {
                    return { color: "#ff5722", weight: 4, opacity: 0.4 };
                },

                // 5. Interaction: When you hover over the lines on the map
                onEachFeature: function (feature, layer) {
                    var title = feature.properties.title || feature.properties.name || "route";
                    var desc = feature.properties.description || "No description provided.";

                    // layer.bindPopup("<strong>" + title + "</strong><br>" + desc);

                    layer.on('mouseover', function (e) {
                        var currentRouteName = feature.properties.title || feature.properties.name;
                        const previewBox = document.getElementById('route-photo-preview');
                        const previewImg = document.getElementById('preview-img');

                        // 1. Highlight ALL segments of this route on the map
                        geoJsonLayer.eachLayer(function (piece) {
                            if ((piece.feature.properties.title || piece.feature.properties.name) === currentRouteName) {
                                piece.setStyle({ color: "#ff0000", opacity: 1.0, weight: 8 });
                            }
                        });

                        // 2. Find the HTML card and tell it to "Open"
                        const matchingCard = document.querySelector(`.route-item[data-route="${currentRouteName}"]`);
                        if (matchingCard) {
                            matchingCard.classList.add('highlight-card');
                        }

                    });

                    layer.on('mouseout', function (e) {
                        // Reset Map
                        geoJsonLayer.setStyle({ color: "#ff5722", opacity: 0.4, weight: 4 });

                        // Reset Cards (Closes them)
                        document.querySelectorAll('.route-item').forEach(card => {
                            card.classList.remove('highlight-card');
                        });
                        previewBox.classList.remove('show-photo');

                    });
                }
            }).addTo(map);

            // 6. Perfect Fit: Auto-zoom the map to show all your routes
            map.fitBounds(geoJsonLayer.getBounds(), { padding: [50, 50] });
            map.setMinZoom(map.getZoom() - 1); // Let them zoom out just a tiny bit
            // --- SIDEBAR TO MAP SYNC ---
            // This listens for mouse movement on the HTML cards
            const cards = document.querySelectorAll('.route-item');

            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    const routeName = card.getAttribute('data-route');

                    // Search the map for the matching route
                    geoJsonLayer.eachLayer(layer => {
                        const featureName = layer.feature.properties.title || layer.feature.properties.name;

                        if (featureName === routeName) {
                            layer.setStyle({
                                color: "#ff0000",
                                opacity: 1.0,
                                weight: 10
                            });
                            layer.bringToFront();
                            // Optional: layer.openPopup(); // Uncomment if you want the popup to pop too!
                            // 2. NEW: The "Fly To" Logic
                            // We get the 'bounds' (the box that fits that specific line)
                            const bounds = layer.getBounds();

                            // We tell the map to fly to those bounds with a smooth animation
                            map.flyToBounds(bounds, {
                                padding: [100, 100], // Keeps the line away from the edges
                                duration: 1.5,        // Animation length in seconds
                                maxZoom: 14  // <--- Add this! Lower numbers = further away.
                            });
                        }
                    });
                   
                });

                card.addEventListener('mouseleave', () => {
                    // Reset the map lines when you stop hovering over the card
                    geoJsonLayer.setStyle({
                        color: "#ff5722",
                        opacity: 0.4,
                        weight: 4,

                    });
                    // Fly the camera back to show all routes in Utah
                    map.flyToBounds(geoJsonLayer.getBounds(), {
                        padding: [50, 50],
                        duration: 1.2

                    });

                });
            });
        })
        .catch(err => console.error("Could not load map.geojson. Make sure the file name is correct!", err));

    // --- 7. UI INTERACTION (The "Fly To" Logic) ---
    // This makes the map move when you hover over the HTML cards
    const routeCards = document.querySelectorAll('.route-item');

    // Select your elements
  // Grab Route 1 elements
// --- MY IMAGE POPUP LOGIC (SAFE ZONE) ---
    
    // 1. Grab the Route 1 elements
    const trigger1 = document.getElementById('route1');
    const image1 = document.getElementById('image1');

    // 2. Add Hover for Route 1 (Only if they exist!)
    if (trigger1 && image1) {
        trigger1.addEventListener('mouseenter', () => {
            image1.style.display = 'block';
        });
        trigger1.addEventListener('mouseleave', () => {
            image1.style.display = 'none';
        });
    }

    // 3. Grab the Route 2 elements
    const trigger2 = document.getElementById('route2');
    const image2 = document.getElementById('image2');

    // 4. Add Hover for Route 2 (Only if they exist!)
    if (trigger2 && image2) {
        trigger2.addEventListener('mouseenter', () => {
            image2.style.display = 'block';
        });
        trigger2.addEventListener('mouseleave', () => {
            image2.style.display = 'none';
        });
    }
    
    // --- END OF IMAGE LOGIC ---
});