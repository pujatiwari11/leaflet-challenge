var jsonUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Creating the Leaflet map
var map = L.map('map', { center: [42, -90], zoom: 3 });

// Adding base map layers with options
var baseMaps = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    "Satellite": L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/satellite-v9',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN' // Replace with your Mapbox access token
    }),
    "Topographical": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a> contributors'
    }),
    "Street": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
};

// Adding a tile layer control to the map
L.control.layers(baseMaps).addTo(map);

// Function to get color based on depth
function getColor(depth) {
    if (depth < 10) {
        return 'yellow';
    } else if (depth < 30) {
        return 'lightcoral';  // Light peach color
    } else if (depth < 50) {
        return 'darkorange';  // Dark peach color
    } else if (depth < 70) {
        return 'lightcoral';  // Light red color
    } else if (depth < 90) {
        return 'lightblue';   // Light purple color
    } else {
        return 'darkblue';    // Dark blue color
    }
}

// Fetch earthquake data and visualize it on the map
fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
        // Iterate over the features in the earthquake data
        data.features.forEach(feature => {
            let [longitude, latitude, depth] = feature.geometry.coordinates;

            // Create a marker for earthquakes
            let earthquakeMarker = L.circleMarker([latitude, longitude], {
                radius: feature.properties.mag * 5,
                fillColor: getColor(depth),
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            })
                .bindPopup(`<h1>${feature.properties.title}</h1> <hr> <h3>Magnitude: ${feature.properties.mag}</h3> <h3>Depth: ${depth}</h3>`)
                .addTo(map);
        });

        // Create a legend for earthquake depth
        var earthquakeLegend = L.control({ position: 'bottomright' });
        earthquakeLegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML += '<strong>Earthquake Depth</strong><br>';
            div.innerHTML += '<i style="background: yellow;"></i> -10 to 10<br>';
            div.innerHTML += '<i style="background: lightcoral;"></i> 10 to 30<br>';
            div.innerHTML += '<i style="background: darkorange;"></i> 30 to 50<br>';
            div.innerHTML += '<i style="background: lightcoral;"></i> 50 to 70<br>';
            div.innerHTML += '<i style="background: lightblue;"></i> 70 to 90<br>';
            div.innerHTML += '<i style="background: darkblue;"></i> 90+<br>';
            return div;
        };
        earthquakeLegend.addTo(map);
    })
    .catch(error => {
        console.error('Error fetching earthquake data:', error);
    });

// Fetch tectonic plates data and add it to the map as an overlay
fetch(tectonicPlatesUrl)
    .then(response => response.json())
    .then(tectonicPlatesData => {
        // Creating a GeoJSON layer for tectonic plates
        var tectonicPlatesLayer = L.geoJSON(tectonicPlatesData, {
            style: {
                color: 'green', // Color for tectonic plates
                weight: 2
            }
        });

        // Adding tectonic plates as an overlay to the map with labels
        tectonicPlatesLayer.addTo(map);
        map.addLayer(tectonicPlatesLayer);
        L.control.layers(baseMaps, { 'Tectonic Plates': tectonicPlatesLayer }).addTo(map);

        // Adding labels to tectonic plates layer
        var tectonicPlatesLabel = L.control({ position: 'bottomleft' });
        tectonicPlatesLabel.onAdd = function () {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<strong>Tectonic Plates</strong>';
            return div;
        };
        tectonicPlatesLabel.addTo(map);
    })
    .catch(error => {
        console.error('Error fetching tectonic plates data:', error);
    });
