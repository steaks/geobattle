(function () {
    function Map() {
        this.chartOptions = {
            legend: "none",
            tooltip: {
                trigger: "focus"
            },
            region: GeoBattle.regions.world.code,
            resolution: GeoBattle.Region.resolutions.countries
        };
    }
    Map.prototype.initialize = function () {
        var CHART_DIV_ID = "chart_div";

        if (!this.isOfflineMode()) {

            google.load('visualization', '1', { 'packages': ['geochart'] });
            google.setOnLoadCallback(function () {
                chart = new google.visualization.GeoChart(document.getElementById(CHART_DIV_ID));
                this.draw(GeoBattle.regions.world);
            }.bind(this));
        }
    };

    Map.prototype.draw = function (region, activeCountry) {
        var activeCountryArray = [['Country', 'Active']], data;
        if (activeCountry) {
            activeCountryArray.push([activeCountry.code, 1]);
        }
        if (!this.isOfflineMode()) {
            data = google.visualization.arrayToDataTable(activeCountryArray);
            this.chartOptions.region = region.code;
            this.chartOptions.resolution = region.resolution;
            chart.draw(data, this.chartOptions);
        }
    };

    Map.prototype.isOfflineMode = function () {
        try {
            var x = google;
            return false;
        }
        catch (e) {
            return true;
        }
    };

    GeoBattle.map = new Map();
})();