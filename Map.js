(function () {
    var BODY_ID = "body",
    	CHART_DIV_ID = "chart_div",
    	EXTRAS_HEIGHT = 185,
    	CHART_WIDTH_TO_HEIGHT_RATIO = 1.8;

    function Map() {
        this.chartOptions = {
            legend: "none",
            tooltip: {
                trigger: "none"
            },
            region: GeoBattle.toggles.worldAvailable ? GeoBattle.regions.world.code : GeoBattle.regions.unitedStates.code,
            resolution: GeoBattle.toggles.worldAvailable ? GeoBattle.Region.resolutions.countries : GeoBattle.Region.resolutions.provinces
        };
        this.region = GeoBattle.toggles.worldAvailable ? GeoBattle.regions.world : GeoBattle.regions.unitedStates;
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
			chartWidth = chartHeight * CHART_WIDTH_TO_HEIGHT_RATIO,			
			chartDiv = document.getElementById(CHART_DIV_ID),
			body = document.getElementById(BODY_ID);
	
		chartDiv.style.height = chartHeight + "px";
		chartDiv.style.width = chartWidth + "px"; 
		body.style.width = chartWidth + 100 + "px";
		
	    this.chart = new google.visualization.GeoChart(document.getElementById(CHART_DIV_ID));
	    this.draw(this.region, this.activeCountry);
    };

    GeoBattle.map = new Map();
})();