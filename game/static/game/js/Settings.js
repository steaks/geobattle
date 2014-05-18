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
        SELECTOR_SETTINGS_REGION_SELECTION_WRAPPER = ".settings-region-selection-wrapper",
        SELECTOR_SETTINGS_ERRORS = ".settings-errors",

        CLASS_HIDDEN = "hidden",
        
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
        	if (GeoBattle.toggles.worldAvailable) {
        		this.setupRegionDropdown();
        	}
        	else {
        		$(SELECTOR_SETTINGS_REGION_SELECTION_WRAPPER).addClass(CLASS_HIDDEN);
        	}
            $(SELECTOR_SUBMIT_SETTINGS_BUTTON).on(EVENT_CLICK, function () {
                GeoBattle.settings.submit();
            });

            $(SELECTOR_SETTINGS_TEAM).on(INPUT, function (e) {
                var inputNode = $(e.currentTarget),
                    teamName = inputNode.prop(VALUE),
                    existingTeam = GeoBattle.teamManager.getTeamByName(teamName),
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
        var regionSelection = GeoBattle.toggles.worldAvailable 
        						? $(SELECTOR_SETTINGS_REGION_SELECTION).attr(DATA_REGION_SELECTION)
        						: "unitedStates",
            minutes = parseInt($(SELECTOR_SETTINGS_MINUTES).val(), 10),
            seconds = parseInt($(SELECTOR_SETTINGS_SECONDS).val(), 10),
            activeDuration = parseInt($(SELECTOR_SETTINGS_ACTIVE_DURATION).val(), 10),
            breakDuration = parseInt($(SELECTOR_SETTINGS_BREAK_DURATION).val(), 10),
            teamInputs = $(SELECTOR_SETTINGS_TEAM_WRAPPER).map(function (i, w) {
	            var wrapper = $(w),
	                name = wrapper.find(SELECTOR_SETTINGS_TEAM).prop(VALUE),
	                scoreNode = wrapper.find(SELECTOR_SETTINGS_TEAM_SCORE),
	                isScoreUserInput = scoreNode.attr(DATA_USER_INTPUT) === TRUE,
	                scoreInput = scoreNode.prop(VALUE) || 0,
	                score = isScoreUserInput ? parseInt(scoreInput, 10) : null;
	            
	            return { name: name, score: score };
	        }),
	        teams = $.grep(teamInputs, function (ti) {
	        	if (ti.name) {
	        		return ti;
	        	}
	        }),
	        teamNames = $.map(teams, function (t) { return t.name; }),
	        teamScores = $.map(teams, function (t) { return t.score; }),	        
	        errors = this._validate(minutes, seconds, activeDuration, breakDuration, teamScores),
	        region,
	        game;
        
        if (errors.length !== 0) {
        	this._displayErrors(errors);
        	return;
        }
        
        region = GeoBattle.regions[regionSelection];

        game = new GeoBattle.Game({
            activeDuration: activeDuration * 1000,
            breakDuration: breakDuration * 1000,
            minutes: minutes,
            seconds: seconds,
            region: region,
        });
                
        GeoBattle.Controller.setupHistory(region);
        $.each(teams, function (i, t) { GeoBattle.teamManager.getOrCreateTeam(t.name, t.score); })
        GeoBattle.teamManager.hideNotIncludedTeams(teamNames);
        $.magnificPopup.close();
        GeoBattle.gameManager.startGame(game);
    };
    
    Settings.prototype._displayErrors = function (errors) {
    	var errorMessages = $.map(errors, function (e) { return "<span class='settings-error'>" + e + "</span>"; });
    	$(SELECTOR_SETTINGS_ERRORS).html(errorMessages);
    };
    
    Settings.prototype._clearErrors = function () {
    	$(SELECTOR_SETTINGS_ERRORS).html("");
    };
    
    Settings.prototype._validate = function (minutes, seconds, activeDuration, breakDuration, teamScores) {
    	var errors = [];
    	if (isNaN(minutes) || isNaN(seconds) || isNaN(activeDuration) || isNaN(breakDuration)) {
    		errors.push("Please only use numbers for time entries.");
    	}
    	if ($.grep(teamScores, function (s) { return isNaN(s); }).length !== 0) {
    		errors.push("Please only use numbers for team scores.");
    	}
    	
    	return errors;
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
        this._clearErrors();
        $.magnificPopup.open({
            items: {
                src: SELECTOR_SETTINGS,
                type: INLINE
            }
        });
    };

    GeoBattle.settings = new Settings();
})();