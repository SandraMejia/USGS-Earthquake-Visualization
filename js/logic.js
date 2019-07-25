// -----------------------------------------
// | Code for Visualization of Earthquakes |
// | Past 7 days                           |
// | Magnitude 4.5+ Earthquakes            |
// |                                       |
// | Sandra Mejia Avendaño                 |
// -----------------------------------------


// Information Retrieval
// All earthquakes during last day from USGS
url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
// Tectonic plates boundaries
plates_url = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'


// Function to color earthquake markers according to magnitude
var getColor = function (magnitude) {
    var color = "";
    if (magnitude < 1) {
        color = "#33cc33";
    } else if (magnitude >= 1 && magnitude < 2) {
        color = "#99ff33";
    } else if (magnitude >= 2 && magnitude < 3) {
        color = "#ffff00";
    } else if (magnitude >= 3 && magnitude < 4) {
        color = "#ff9933";
    } else if (magnitude >= 4 && magnitude < 5) {
        color = "#ff6600";
    } else if (magnitude > 5) {
        color = "#ff0000";
    }
    return color;
};

// --------------------
// | Earthquake Layer |
// --------------------

// Initialize Earthquake Layer that will contain all eathquake markers
var earthquakeLayer = new L.layerGroup();
// Obtain details on each eathquake and add them to Earthquake Layer
d3.json(url).then(response => {
    var earthquakes = response.features;

    for (let i = 0; i < earthquakes.length; i++) {
        var magnitude = earthquakes[i].properties.mag;
        var coordinates = [earthquakes[i].geometry.coordinates[1], earthquakes[i].geometry.coordinates[0]];
        var date = new Date(earthquakes[i].properties.time);
        var type = earthquakes[i].properties.type;
        var place = earthquakes[i].properties.place;
        var tsunami = earthquakes[i].properties.tsunami;
        var alert = ""
        if (tsunami === 0) { alert = "No Tsunami Alert" }
        else { alert = "Tsunami alert" };

        L.circle(coordinates, {
            fillOpacity: 0.75,
            color: getColor(magnitude),
            fillColor: getColor(magnitude),
            radius: magnitude * 50000
        }).bindPopup(`<h4>${type}</h4>${place}<br>${date}<br>${alert}`).addTo(earthquakeLayer);
    }
})

// ------------------
// | Tectonic Layer |
// ------------------

// Initialize Plates Layer that will contain all tectonic plate boundaries
var plateLayer = new L.layerGroup();
// Obtain details on each eathquake and add them to Earthquake Layer
d3.json(plates_url).then(response => {
    var plates = response.features;
    L.geoJson(plates, {
        color: '#ff9933'
    }).addTo(plateLayer)
})


// -----------------------
// | Base Layers         |
// | Light and Satellite |
// -----------------------

// Satellite Layer
var satelliteLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});
// Light Layer
var lightLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
});

// --------------
// | Create Map |
// --------------

// Create Base Maps object
var baseMaps = {
    "Satellite": satelliteLayer,
    "Light": lightLayer
};

// Create Overlays object
var overlays = {
    "Tectonic Plates": plateLayer,
    "Earthquakes": earthquakeLayer
};

// Create map
var myMap = new L.Map('myMap', {
    center: new L.LatLng(35, -70),
    zoom: 3,
    dragging: true,
    scrollWheelZoom: false,
    doubleClickZoom: true,
    zoomControl: true,
    layers: [satelliteLayer, earthquakeLayer, plateLayer]
});

// Layer control
L.control.layers(baseMaps, overlays, {
    collapsed: false
}).addTo(myMap);


// ------------------------
// |Add Legend Box to map |
// ------------------------
var legend = L.control({position: 'bottomleft'});
legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend'),
    background = 'white';
        grades = [0.5,1.5,2.5,3.5,4.5,5.5]
        labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

    // loop through intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '">&nbsp;&nbsp;&nbsp;&nbsp;</i> ' +
            labels[i] + '<br>';
    }
    return div;
};
legend.addTo(myMap);