(function () {
    var //SELECTORS
        SELECTOR_PAUSE_GAME = ".pause-game",
        SELECTOR_STOP_GAME = ".stop-game",
        SELECTOR_SINGLE_BUTTON = ".single-button",
        //EVENTS
        EVENT_CLICK = "click",

        //CLASSES
        CLASS_START_NEW_GAME_BUTTON = "start-new-game-button",
        CLASS_STOP_GAME_BUTTON = "stop-game-button",

        VALUE = "value",
        DATA_VALUE = "data-value",
        STOP_GAME = "Stop Game",
        START_NEW_GAME = "Start a new game",
        PAUSE_GAME = "Pause game",
        UNPAUSE_GAME = "Unpause game",

        StopButtonState = {
            startNewGame: "startNewGame",
            stopGame: "stopGame"
        };

    $(document).ready(function () {

        $(SELECTOR_PAUSE_GAME).on(EVENT_CLICK, function (e) {
            var game = GeoBattle.gameManager.getCurrentGame();
            if (!game || game.status === GeoBattle.Game.statusOptions.stopped) {
                return;
            }

            if(game.status === GeoBattle.Game.statusOptions.running) {
                game.pause();
                $(e.currentTarget).prop(VALUE, UNPAUSE_GAME);
            }
            else if (game.status === GeoBattle.Game.statusOptions.paused) {
                game.resume();
                $(e.currentTarget).prop(VALUE, PAUSE_GAME);
            }
        });

        $(SELECTOR_STOP_GAME).on(EVENT_CLICK, function (e) {
            var game = GeoBattle.gameManager.getCurrentGame(),
                buttonState = $(e.currentTarget).attr(DATA_VALUE);
            if (game) {
                game.requestStop();
                $(SELECTOR_PAUSE_GAME).prop(VALUE, PAUSE_GAME);
            }
            if (buttonState === StopButtonState.startNewGame) {
                GeoBattle.settings.open();
            }
        });

        $(document).on(GeoBattle.Game.events.stopRequested, function () {
            var stopButton = $(SELECTOR_STOP_GAME);
            stopButton.prop(VALUE, START_NEW_GAME);
            stopButton.closest(SELECTOR_SINGLE_BUTTON).addClass(CLASS_START_NEW_GAME_BUTTON).removeClass(CLASS_STOP_GAME_BUTTON);
            stopButton.attr(DATA_VALUE, StopButtonState.startNewGame);
        });

        $(document).on(GeoBattle.Game.events.started, function () {
            var stopButton = $(SELECTOR_STOP_GAME);
            stopButton.prop(VALUE, STOP_GAME);
            stopButton.closest(SELECTOR_SINGLE_BUTTON).addClass(CLASS_STOP_GAME_BUTTON).removeClass(CLASS_START_NEW_GAME_BUTTON);
            stopButton.attr(DATA_VALUE, StopButtonState.stopGame);
        });
    });


}());