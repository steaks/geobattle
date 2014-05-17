(function () {
    var //SELECTORS
        SELECTOR_PAUSE_GAME = ".pause-game",
        SELECTOR_START_OR_STOP_GAME = ".start-or-stop-game",
        SELECTOR_SINGLE_BUTTON = ".single-button",
        SELECTOR_GAME_EXPLANATION = "#game-explanation",
        SELECTOR_HISTORY_LINK = ".history-link",
        SELECTOR_HISTORY = "#history",
        SELECTOR_HISTORY_LIST_TITLE = ".history-list-title",
        SELECTOR_HISTORY_LIST = ".history-list",
        //EVENTS
        EVENT_CLICK = "click",
        
        //COOKIES
        COOKIE_NUM_VISITS = "numVisits",

        //CLASSES
        CLASS_START_NEW_GAME_BUTTON = "start-new-game-button",
        CLASS_STOP_GAME_BUTTON = "stop-game-button",
        CLASS_HIDDEN = "hidden",

        VALUE = "value",
        DATA_VALUE = "data-value",
        STOP_GAME = "Stop Game",
        START_NEW_GAME = "Start a new game",
        PAUSE_GAME = "Pause game",
        UNPAUSE_GAME = "Unpause game",
        INLINE = "inline",

        StopButtonState = {
            startNewGame: "startNewGame",
            stopGame: "stopGame"
        };
    
    function Controller() {
	
	    $(document).ready(function () {
	    	if(GeoBattle.toggles.gameExplanation){
	        	var numVisits = Number($.cookie(COOKIE_NUM_VISITS));
	        	if (!isNaN(numVisits) && isFinite(numVisits)) {
	        		numVisits = numVisits + 1;
	            }
	        	else {
	        		numVisits = 1;
	        	}
	        	$.cookie(COOKIE_NUM_VISITS, numVisits, { expires: 30 });
	        	
	        	if(numVisits < 5) {
	        		$.magnificPopup.open({
	                    items: {
	                        src: SELECTOR_GAME_EXPLANATION,
	                        type: INLINE
	                    }
	                });
	        	}
	    	}
	    	
	        $(SELECTOR_PAUSE_GAME).on(EVENT_CLICK, this._onPause.bind(this));
	
	        $(SELECTOR_START_OR_STOP_GAME).on(EVENT_CLICK, function (e) {
	            var game = GeoBattle.gameManager.getCurrentGame(),
	                buttonState = $(e.currentTarget).attr(DATA_VALUE);
	            if (game && game.status !== GeoBattle.Game.statusOptions.stopped) {
	                game.requestStop();
	                $(SELECTOR_PAUSE_GAME).prop(VALUE, PAUSE_GAME);
	            }
	            if (buttonState === StopButtonState.startNewGame) {
	                GeoBattle.settings.open();
	            }
	        });
	
	        $(document).on(GeoBattle.Game.events.stopRequested, function () {
	            var stopButton = $(SELECTOR_START_OR_STOP_GAME);
	            stopButton.prop(VALUE, START_NEW_GAME);
	            stopButton.closest(SELECTOR_SINGLE_BUTTON).addClass(CLASS_START_NEW_GAME_BUTTON).removeClass(CLASS_STOP_GAME_BUTTON);
	            stopButton.attr(DATA_VALUE, StopButtonState.startNewGame);
	        });
	
	        $(document).on(GeoBattle.Game.events.started, function () {
	            var stopButton = $(SELECTOR_START_OR_STOP_GAME);
	            stopButton.prop(VALUE, STOP_GAME);
	            stopButton.closest(SELECTOR_SINGLE_BUTTON).addClass(CLASS_STOP_GAME_BUTTON).removeClass(CLASS_START_NEW_GAME_BUTTON);
	            stopButton.attr(DATA_VALUE, StopButtonState.stopGame);
	        });
	        
	        if(GeoBattle.toggles.history) {
	        	$(SELECTOR_HISTORY_LINK).removeClass(CLASS_HIDDEN);
	        }
	        $(SELECTOR_HISTORY_LINK).click(function (e) {
	        	this._onPause(e);
	    		$.magnificPopup.open({
	                items: {
	                    src: SELECTOR_HISTORY,
	                    type: INLINE
	                },
                    callbacks: {
                    	close: this._onPause.bind(this)
                    }
	            });        	
	        }.bind(this));
	    }.bind(this));
    }
    
    Controller.prototype._onPause = function () {
    	var game = GeoBattle.gameManager.getCurrentGame(),
    		pauseButton = $(SELECTOR_PAUSE_GAME);
        if (!game || game.status === GeoBattle.Game.statusOptions.stopped) {
            return;
        }

        if(game.status === GeoBattle.Game.statusOptions.running) {
            game.pause();
            pauseButton.prop(VALUE, UNPAUSE_GAME);
        }
        else if (game.status === GeoBattle.Game.statusOptions.paused) {
            game.resume();
            pauseButton.prop(VALUE, PAUSE_GAME);
        }
    };
    
    Controller.prototype.setupHistory = function (region) {
    	var historyLinkText = region.resolution === "countries" ? "previous countries" : "previous states";
    	$(SELECTOR_HISTORY_LINK).text(historyLinkText);
        $(SELECTOR_HISTORY_LIST_TITLE).text(historyLinkText + ":");
        $(SELECTOR_HISTORY_LIST).html("");
    }
    
    GeoBattle.Controller = new Controller();
}());