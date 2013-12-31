(function () {
    function Game(config) {
        this.activeDuration = config.activeDuration;
        this.breakDuration = config.breakDuration;
        this.minutes = config.minutes;
        this.seconds = config.seconds;
        this.region = config.region;
        this.status = Game.statusOptions.stopped;
    };
    Game.statusOptions = {
        stopped: "stopped",
        running: "running",
        paused: "paused"
    };

    Game.events = {
        stopped: "stopped",
        started: "started",
        stopRequested: "stopRequested"
    };

    Game.prototype.start = function () {
        if (this.status === Game.statusOptions.stopped) {
            this.status = Game.statusOptions.running;
            GeoBattle.timer.start(this.minutes, this.seconds);
            $.event.trigger(Game.events.started);
            this._play();
        }
        else {
            throw "You're probably not calling start at the right time because status is: " + this.status;
        }
    };
    Game.prototype._play = function (activeCountry) {
        if (this.status === Game.statusOptions.stopped) {
            $.event.trigger(Game.events.stopped);
            return;
        }
        if (this.status === Game.statusOptions.paused) {
            setTimeout(function () { this._play(activeCountry); }.bind(this), this.breakDuration);
            return;
        }
        if (activeCountry) {
            GeoBattle.map.draw(activeCountry.renderRegion, activeCountry);
            setTimeout(this._play.bind(this), this.activeDuration);
        }
        else {
            GeoBattle.map.draw(this.region);
            setTimeout(function () {
                var countryToActivate = this.region.getRandomCountry();
                this._play(countryToActivate);
            }.bind(this), this.breakDuration);
        }
    };

    Game.prototype.resume = function () {
        this.status = Game.statusOptions.running;
        GeoBattle.timer.resume();
    };

    Game.prototype.pause = function () {
        this.status = Game.statusOptions.paused;
        GeoBattle.timer.pause();
    };
    Game.prototype.requestStop = function () {
        this.status = Game.statusOptions.stopped;
        GeoBattle.map.draw(GeoBattle.regions.world);
        $.event.trigger(Game.events.stopRequested);
        GeoBattle.timer.stop(/*suppressEvent*/true);
    };

    GeoBattle.Game = Game;

    function GameManager() {
        if (arguments.callee._singletonInstance) {
            return arguments.callee._singletonInstance;
        }
        arguments.callee._singletonInstance = this;

        $(document).on(GeoBattle.Timer.events.stopped, function () {
            var game = this.getCurrentGame();
            game.requestStop();
        }.bind(this));
    }

    GameManager.prototype.startGame = function (game) {
        if (this.getCurrentGame() && this._currentGame.status !== Game.statusOptions.stopped) {
            this.getCurrentGame().requestStop();
            $(document).on(Game.events.stopped, function () {
                this._currentGame = game;
                this._currentGame.start();
            });
        }
        else {
            this._currentGame = game;
            this._currentGame.start();
        }
    };

    GameManager.prototype.getCurrentGame = function () {
        return this._currentGame;
    };

    GeoBattle.gameManager = new GameManager();
})();