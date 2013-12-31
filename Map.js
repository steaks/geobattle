(function () {
    var CHART_DIV_ID = "chart_div",
    	EXTRAS_HEIGHT = 185,
    	CHART_WIDTH_TO_HEIGHT_RATIO = 1.8;

    function Map() {
        this.chartOptions = {
            legend: "none",
            tooltip: {
                trigger: "none"
            },
            region: GeoBattle.regions.world.code,
            resolution: GeoBattle.Region.resolutions.countries
        };
        this.region = GeoBattle.regions.world;
        this.activeCountry = null;
        
        if (!this.isOfflineMode()) {
            google.load('visualization', '1', { 'packages': ['geochart'] });
            google.setOnLoadCallback(function () {
            	this._initialize();
            }.bind(this));
            
            $(window).resize(function () {
            	this._initialize();
            }.bind(this));
        }
    }
    
    Map.prototype.draw = function (region, activeCountry) {
        var activeCountryArray = [['Country', 'Active']], data;
        this.region = region;
        this.activeCountry = activeCountry;
        if (activeCountry) {
            activeCountryArray.push([activeCountry.code, 1]);
        }
        if (!this.isOfflineMode()) {
            data = google.visualization.arrayToDataTable(activeCountryArray);
            this.chartOptions.region = region.code;
            this.chartOptions.resolution = region.resolution;
            this.chart.draw(data, this.chartOptions);
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
    
    Map.prototype._initialize = function () {
    	var windowHeight = $(window).height(),
			chartHeight = windowHeight - EXTRAS_HEIGHT,
			chartDiv = document.getElementById(CHART_DIV_ID);
	
		chartDiv.style.height = chartHeight + "px";
		chartDiv.style.width = chartHeight * CHART_WIDTH_TO_HEIGHT_RATIO + "px";         	
	    this.chart = new google.visualization.GeoChart(document.getElementById(CHART_DIV_ID));
	    this.draw(this.region, this.activeCountry);
    };

    GeoBattle.map = new Map();
})();