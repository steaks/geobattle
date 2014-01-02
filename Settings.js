(function () {
    var SELECTOR_SETTINGS = "#settings",
        SELECTOR_SUBMIT_SETTINGS_BUTTON = ".submit-settings-button",
        SELECTOR_SETTINGS_REGION_SELECTION = ".settings-region-selection",
        SELECTOR_SETTINGS_MINUTES = ".settings-minutes",
        SELECTOR_SETTINGS_SECONDS = ".settings-seconds",
        SELECTOR_SETTINGS_ACTIVE_DURATION = ".settings-active-duration",
        SELECTOR_SETTINGS_BREAK_DURATION = ".settings-break-duration",
        SELECTOR_SETTINGS_TEAM_WRAPPER = ".settings-team-wrapper",
        SELECTOR_SETTINGS_TEAM = ".settings-team",
        SELECTOR_SETTINGS_TEAM_SCORE = ".settings-team-score",

        DATA_REGION_SELECTION = "data-region-selection",
        DATA_USER_INTPUT = "data-user-input",

        EVENT_CLICK = "click",

        FALSE = "false",
        TRUE = "true",
        INLINE = "inline",
        VALUE = "value"
        INPUT = "input";

    function Settings() {
        $(document).ready(function () {
            this.setupRegionDropdown();
            $(SELECTOR_SUBMIT_SETTINGS_BUTTON).on(EVENT_CLICK, function () {
                GeoBattle.settings.submit();
            });

            $(SELECTOR_SETTINGS_TEAM).on(INPUT, function (e) {
                var inputNode = $(e.currentTarget),
                    teamName = inputNode.prop(VALUE),
                    existingTeam = GeoBattle.teamManager.getTeam(teamName),
                    scoreInputNode = inputNode.closest(SELECTOR_SETTINGS_TEAM_WRAPPER)
                                              .find(SELECTOR_SETTINGS_TEAM_SCORE),
                    score = existingTeam ? existingTeam.score : "";
                if (scoreInputNode.attr(DATA_USER_INTPUT) !== TRUE) {
                    scoreInputNode.prop(VALUE, score);
                }
            });

            $(SELECTOR_SETTINGS_TEAM_SCORE).on(INPUT, function (e) {
                var inputNode = $(e.currentTarget);
                inputNode.attr(DATA_USER_INTPUT, TRUE);
            });

        }.bind(this));
    }

    Settings.prototype.setupRegionDropdown = function () {
        function DropDown(el) {
            this.dd = el;
            this.initEvents();
        }
        DropDown.prototype = {
            initEvents: function () {
                var obj = this;

                obj.dd.on(EVENT_CLICK   , function (event) {
                    var target = $(event.target),
                        regionSelection = target.attr(DATA_REGION_SELECTION),
                        regionSelectionNode = $(SELECTOR_SETTINGS_REGION_SELECTION);
                    $(this).toggleClass('active');
                    if (target.hasClass("region")) {
                        regionSelectionNode.text(target.text());
                        regionSelectionNode.attr(DATA_REGION_SELECTION, regionSelection);
                    }
                    event.stopPropagation();
                });
            }
        };

        var dd = new DropDown($('#dd'));
    };

    Settings.prototype.submit = function () {
        var regionSelection = $(SELECTOR_SETTINGS_REGION_SELECTION).attr(DATA_REGION_SELECTION),
                minutes = $(SELECTOR_SETTINGS_MINUTES).val(),
                seconds = $(SELECTOR_SETTINGS_SECONDS).val(),
                activeDuration = $(SELECTOR_SETTINGS_ACTIVE_DURATION).val(),
                breakDuration = $(SELECTOR_SETTINGS_BREAK_DURATION).val(),
                region = GeoBattle.regions[regionSelection],
                game = new GeoBattle.Game({
                    activeDuration: Number(activeDuration * 1000),
                    breakDuration: Number(breakDuration * 1000),
                    minutes: Number(minutes),
                    seconds: Number(seconds),
                    region: region
                }),
                teamNames = [];
        $(SELECTOR_SETTINGS_TEAM_WRAPPER).each(function (i, w) {
            var wrapper = $(w),
                name = wrapper.find(SELECTOR_SETTINGS_TEAM).prop(VALUE),
                scoreNode = wrapper.find(SELECTOR_SETTINGS_TEAM_SCORE),
                isScoreUserInput = scoreNode.attr(DATA_USER_INTPUT) === TRUE,
                scoreInput = scoreNode.prop(VALUE) || 0;
            
            if (name) {
                GeoBattle.teamManager.getOrCreateTeam(name, isScoreUserInput ? scoreInput : null);
                teamNames.push(name);
            }
        });

        GeoBattle.teamManager.hideNotIncludedTeams(teamNames);
        $.magnificPopup.close();
        GeoBattle.gameManager.startGame(game);
    };

    Settings.prototype.open = function () {
        var activeTeams = GeoBattle.teamManager.getActiveTeams();
        $(SELECTOR_SETTINGS_TEAM_WRAPPER).each(function (i, w) {
            var wrapper = $(w),
                teamNameInput = wrapper.find(SELECTOR_SETTINGS_TEAM),
                teamScoreInput = wrapper.find(SELECTOR_SETTINGS_TEAM_SCORE),
                team = activeTeams[i],
                name = team ? team.name : "",
                score = team ? team.score : "";
            teamNameInput.prop(VALUE, name);
            teamScoreInput.prop(VALUE, score);
            teamScoreInput.attr(DATA_USER_INTPUT, FALSE);
        });
        $.magnificPopup.open({
            items: {
                src: SELECTOR_SETTINGS,
                type: INLINE
            }
        });
    };

    GeoBattle.settings = new Settings();
})();