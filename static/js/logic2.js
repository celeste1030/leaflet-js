// Layer Variables
var earthquakes = new L.LayerGroup();
var tplates = new L.LayerGroup();
// All Month:
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
// All Week:
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

//variables for legend and color function
//original colors:
// var colors = ['#E6E6FA', '#DDA0DD', '#FF00FF', '#9932CC', '#8B008B', '#4B0082']

var colors = ['#99FF99', '#78dedb', '#9590E8', '#CC00FF', '#CC0033', '#93000d']
var range = [-10, 10, 30, 50, 70, 90];

// function to change color by depth

function changeColor(d, earthquakeData) {
    for (var i = 0; i < range.length; i++) {
        if (d < range[i]) {
            return colors[i - 1];
        }
        else if (d > range[range.length - 1]) {
            return colors[range.length - 1];
        }
    }
}


// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    console.log(data.features);
    createFeatures(data.features);



    function createFeatures(earthquakeData) {

        earthquakes = L.geoJSON(earthquakeData, {
            pointToLayer: function (feature, location) {
                return L.circleMarker(location, {
                    radius: feature.properties.mag * 4,
                    fillColor: changeColor(feature.geometry.coordinates[2]),
                    color: "#000",
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 1
                });

            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup("<h3>" + feature.properties.place +
                    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"
                    + "<p>" + "Magnitude: " + feature.properties.mag + "</p>"
                    + "<p>" + "Depth: " + feature.geometry.coordinates[2] + "</p>"

                )
            }
        })
        // Sending our earthquakes layer to the createMap function
        createMap(earthquakes);
    }
})
var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(url2, function(tdata){
    L.geoJSON(tdata, {

    }).addTo(tplates)
    tplates.addTo(myMap)
})

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });



    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite Street Map": streetmap,
        "Light Map": lightmap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        Tectonic: tplates
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
        center: [
            35.09, -95.71
        ],
        zoom: 5,
        minZoom: 2.85,
        layers: [streetmap, earthquakes, lightmap]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = range;

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + changeColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}


