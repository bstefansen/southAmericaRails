var map;
var metroLayer;

function init() {
  
  // create map and set center and zoom level
  map = new L.map('mapid');
  map.setView([-28,-62],3);

  var selection;
  var selectedLayer;
  var selectedFeature;

  // create and add osm tile layer
  var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  osm.addTo(map)

  // create stamen osm layer (not adding it to map)
  var stamen = L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a> and contributors, under an <a href="http://www.openstreetmap.org/copyright" title="ODbL">open license</a>. Toner style by <a href="http://stamen.com">Stamen Design</a>'
  });

  // create watercolor layer
  var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // create metro icons
  var metroLowIcon = L.icon({
    iconUrl: 'metro_low.svg',
    iconSize: [25,25]
  });

  var metroMediumIcon = L.icon({
    iconUrl: 'metro_medium.svg',
    iconSize: [25,25]
  });

  var metroHighIcon = L.icon({
    iconUrl: 'metro_high.svg',
    iconSize: [25,25]
  });

  var metroSelected = L.icon({
    iconUrl: 'metro_selected.svg',
    iconSize: [25,25]
  });
            
  // add the metro GeoJSON layer
  var metroLayer = L.geoJson(metroData,{
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {icon: iconByPassday(feature)});
    },
    onEachFeature: metrosOnEachFeature
  });

  metroLayer.addTo(map);

  // define basemap and thematic layers and add layer switcher control
  var basemaps = {
    "OSM": osm,
    "Stamen": stamen,
    "WorldImagery": Esri_WorldImagery
  };

  var overlays = {
    "Metro stations": metroLayer
  };

  L.control.layers(basemaps,overlays).addTo(map);

  // define functions that right icon for a given feature
  function iconByPassday(feature) {
    var icon;
    if (feature.properties.PASSDAY >= 2000000) icon = metroHighIcon;
    else if (feature.properties.PASSDAY >= 1000000) icon = metroMediumIcon;
    else icon = metroLowIcon;

    return icon;
  } 

  // define function to handle click events on metro features
  function metrosOnEachFeature(feature, layer){
    layer.on({
      click: function(e) {
        // reset symbol of old selection
        if (selection) {
          if (selectedLayer === metroLayer) selection.setIcon(iconByPassday(selectedFeature));
        }
                    
        // apply yellow icon to newly selected metro and update selection variables
        e.target.setIcon(metroSelected);
        selection = e.target;
        selectedLayer = metroLayer;
        selectedFeature = feature;
                    
        // using attributes, construct some HTML to write into the page
        var featureName = feature.properties.CITY || 'Unnamed feature';
        var country = feature.properties.COUNTRY || '(Unknown)';
        var year = feature.properties.YEAR || '(Unknown)';
        var passengers = feature.properties.PASSDAY || '(Unknown)';
        var stations = feature.properties.STATIONS || '(Unknown)';
        var length = feature.properties.LENGTHKM || '(Unknown)';
        var link = feature.properties.LINK || 'http://www.wikipedia.org';
        var photoHtml = feature.properties.PHOTO || '<P>Photo not available</P>';
        var titleHtml = '<p style="font-size:18px"><b>' + featureName + '</b></p>';
        var descripHtml = '<p>The ' + featureName + ', ' + country + ' metro opened in ' + year + ' and currently serves ' + passengers + ' passengers a day. The network consists of ' + stations + ' stations spread over ' + length + ' kilometers.</p>';
        var readmoreHtml = '<p><a href="' + link + '">Read more</a></p>';
        document.getElementById('summaryLabel').innerHTML = titleHtml + descripHtml + readmoreHtml;
        document.getElementById('metroImage').innerHTML = photoHtml;

        L.DomEvent.stopPropagation(e); // stop click event from being propagated further
      }
    });
  }

  // define and register event handler for click events to unselect features when clicked anywhere else on the map
  map.addEventListener('click', function(e) {
    if (selection) {
      if (selectedLayer === metroLayer) selection.setIcon(iconByPassday(selectedFeature));

      selection = null;

      document.getElementById('summaryLabel').innerHTML = '<p>Click a metro rail system on the map to get more information.</p>';
      document.getElementById('metroImage').innerHTML = ''
    }
  });

}