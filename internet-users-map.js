function InternetUsersMap() {
    this.name = 'World Internet Usage Map';
    this.id = 'internet-users-map';
    
    this.map = null;
    this.countryData = {};
    this.loaded = false;

    this.preload = function () {
        console.log("Preloading data...");
        let self = this;

        this.data = loadTable(
            './data/internet_users/internet_users.csv',
            'csv',
            'header',
            function () {
                console.log('Internet users data loaded successfully.');
                self.checkDataLoaded();
            }
        );

        this.populousCountriesData = loadTable(
            './data/internet_users/world_population.csv',
            'csv',
            'header',
            function () {
                console.log('World population data loaded successfully.');
                self.checkDataLoaded();
            }
        );
    };

    this.checkDataLoaded = function () {
        if (this.data && this.populousCountriesData) {
            this.loaded = true;
            console.log("All data successfully loaded.");
        }
    };

    this.setup = function () {
        let mapContainer = document.getElementById("mapid");

        if (!mapContainer) {
            console.error("Error: #mapid not found. Waiting for DOM...");
            setTimeout(() => this.setup(), 100);
            return;
        }

        // Make the map visible
        mapContainer.style.display = "block";

        // Remove any existing Leaflet instance to prevent duplication
        if (this.map) {
            this.map.remove();
        }

        console.log("Creating new Leaflet map...");
        this.map = L.map('mapid').setView([20, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        console.log("Leaflet map initialized.");
        this.loadCountryData();
        this.addLegend();
    };

    this.loadCountryData = function () {
        for (let i = 0; i < this.data.getRowCount(); i++) {
            let country = this.data.getString(i, 'Location');
            if (country === "United States") country = "United States of America"; // Fix to match the csv files
            let rate = this.data.getString(i, 'Rate (WB)');
            this.countryData[country] = rate;
        }
        console.log("Country data loaded:", this.countryData);

        // Load GeoJSON
        fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
            .then(response => response.json())
            .then(geojsonData => {
                console.log("GeoJSON loaded.");

                // Clear previous layers if any
                if (this.map.hasOwnProperty('_layers')) {
                    Object.values(this.map._layers).forEach(layer => {
                        if (layer._path !== undefined) {
                            this.map.removeLayer(layer);
                        }
                    });
                }

                L.geoJson(geojsonData, {
                    style: (feature) => {
                        let country = feature.properties.name;
                        let usage = this.countryData[country];
                        let color = usage ? getColor(usage) : '#ccc';
                        return { color: '#333', fillColor: color, fillOpacity: 0.6 };
                    },
                    onEachFeature: (feature, layer) => {
                        let country = feature.properties.name;
                        let usage = this.countryData[country];
                        if (usage) {
                            layer.bindTooltip(`${country}: ${usage}% Internet Users`, { permanent: false, direction: 'right' });
                        }
                    }
                }).addTo(this.map);
            })
            .catch(error => console.error("Error loading GeoJSON:", error));
    };

    this.draw = function () {
        if (!this.map) {
            console.log("Map not initialized yet. Running setup...");
            this.setup();
        }
    };

    this.destroy = function () {
        console.log("Hiding map...");
        let mapContainer = document.getElementById("mapid");
        if (mapContainer) {
            mapContainer.style.display = "none";
        }
    };

    function getColor(usage) {
        usage = parseFloat(usage);
        return usage > 80 ? '#1a9850' :
               usage > 60 ? '#66bd63' :
               usage > 40 ? '#a6d96a' :
               usage > 20 ? '#fdae61' :
                            '#d73027';
    }

    // Function to add a legend to the map
this.addLegend = function () {
    let labels = ["> 80%", "60-80%", "40-60%", "20-40%", "< 20%"];
    let colors = ['#1a9850', '#66bd63', '#a6d96a', '#fdae61', '#d73027'];

    // Create a Leaflet control for the legend
    let legend = L.control({ position: 'bottomright' });

    // Add the legend content
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        
        // Iterate over the colors and labels and create the HTML for each one
        for (let i = 0; i < labels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '; width: 18px; height: 18px; border-radius: 3px; display: inline-block; margin-right: 5px;"></i> ' +  // Color box styles
                labels[i] + '<br>';
        }

        return div;
    };

    // Add the legend to the map
    legend.addTo(this.map);
    };
}

