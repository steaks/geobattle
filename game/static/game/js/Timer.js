(function () {
    function Timer() {
        if (arguments.callee._singletonInstance) {
            return arguments.callee._singletonInstance;
        }
        arguments.callee._singletonInstance = this;
        this.minutes = 0;
        this.seconds = 0;
        this.status = Timer.statusOptions.stopped;
    }

    Timer.statusOptions = {
        stopped: "stopped",
        running: "running",
        paused: "paused"
    };

    Timer.events = {
        stopped: "stopped"
    };


    Timer.prototype.start = function (minutes, seconds) {
        var SELECTOR_MINUTES = ".min",
            SELECTOR_SECONDS = ".sec",
            subtractOneSecond = function () {
                if (this.minutes === 0 && this.seconds === 0) {
                    if (this.status === Timer.statusOptions.running) {
                        this.stop();
                    }
                    return;
                }
                if (this.seconds === 0) {
                    this.minutes = this.minutes - 1;
                    this.seconds = 59;
                    return;
                }
                this.seconds = this.seconds - 1;
            },
            drawTimer = function () {
                $(SELECTOR_MINUTES).text(this.minutes);
                $(SELECTOR_SECONDS).text(("0" + this.seconds).slice(-2));
                subtractOneSecond.call(this);
            };
        this.minutes = minutes;
        this.seconds = seconds;
        this.status = Timer.statusOptions.running;
        this.drawTimerId = setInterval(drawTimer.bind(this), 1000);
    };

    Timer.prototype.resume = function () {
        this.start(this.minutes, this.seconds);
    };

    Timer.prototype.pause = function () {
        clearInterval(this.drawTimerId);
        this.status = Timer.statusOptions.paused;
    };

    Timer.prototype.stop = function (suppressEvent) {
        var SELECTOR_MINUTES = ".min",
            SELECTOR_SECONDS = ".sec";
        this.minutes = 0;
        this.seconds = 0;
        clearInterval(this.drawTimerId);
        this.status = Timer.statusOptions.stopped;
        $(SELECTOR_MINUTES).text(this.minutes);
        $(SELECTOR_SECONDS).text(("0" + this.seconds).slice(-2));
        if (!suppressEvent) {
            $.event.trigger(Timer.events.stopped);
        }
    };

    GeoBattle.Timer = Timer;
    GeoBattle.timer = new Timer();
})();