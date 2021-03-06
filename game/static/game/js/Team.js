(function () {
    var CLASS_BUBBLE_TOOLTIP_TIP = "bubbletooltip_tip";

    function Team(name, score, id) {
        this.name = name;
        this.score = Number(score) || 0;
        this.id = id;
    }

    Team.template = "<div class=\"team-wrapper team-{teamId}\"><input type=\"submit\" class=\"team\" value=\"{teamName}\"/><span class=\"team-score\">{score}</span></div>"

    Team.prototype.addPoint = function () {
        this.score = this.score + 1;
        this._setScoreDisplay();
    };

    Team.prototype.subtractPoint = function () {
        this.score = this.score - 1;
        this._setScoreDisplay();
    };

    Team.prototype.setScore = function (score) {
        this.score = Number(score);
        this._setScoreDisplay();
    };

    Team.prototype._setScoreDisplay = function () {
        var teamSelector = ".team-" + this.id;
        $(teamSelector).find(".team-score").text(this.score);
    };

    Team.prototype.getDisplay = function () {
        return Team.template.replace("{teamId}", this.id)
                            .replace("{teamName}", this.name)
                            .replace("{score}", this.score);
    };

    Team.prototype.registerScoreHandlers = function () {
        var teamSelector = ".team-" + this.id;
        $(teamSelector).on("click", function (e) {
            if (e.shiftKey) {
                this.subtractPoint();
            }
            else {
                this.addPoint();
            }
        }.bind(this));
    };

    Team.prototype.hide = function () {
        var teamSelector = ".team-" + this.id;
        $(teamSelector).addClass("hidden");
        this.hidden = true;
    };

    Team.prototype.show = function () {
        var teamSelector = ".team-" + this.id;
        $(teamSelector).removeClass("hidden");
        this.hidden = false;
    };

    GeoBattle.Team = Team;

    function TeamManager() {
        this.teams = [];
    }

    TeamManager.prototype.getOrCreateTeam = function (name, score) {
        var existingTeam = this.getTeamByName(name), newTeam, teamSelector;
        if (existingTeam) {
            if (!isNaN(score) && isFinite(score) && score !== null) {
                existingTeam.setScore(score);
            }
            existingTeam.show();
        }
        else {
            newTeam = new Team(name, score, this.teams.length);
            teamSelector = ".team-" + newTeam.id;
            this.teams.push(newTeam);
            $(".teams").append(newTeam.getDisplay());
            newTeam.registerScoreHandlers();
            $(teamSelector).tooltipsy({
                className: CLASS_BUBBLE_TOOLTIP_TIP,
                content: "Click to add a point.  SHIFT + Click to subtract a point.",
                offset: [0, 10],
                delay: 2000,
                show: function (e, $el) {
                    $el.fadeIn(100);
                },
                hide: function (e, $el) {
                    $el.fadeOut(500);
                }
            });
        }
    };

    TeamManager.prototype.getTeamByName = function (name) {
        var existingTeam;
        $.each(this.teams, function (i, t) {
            if (t.name === name) {
                existingTeam = t;
            }
        });
        return existingTeam;
    };

    TeamManager.prototype.getActiveTeams = function (index) {
        var activeTeams = [];
        $.each(this.teams, function (i, team) {
            if (!team.hidden) {
                activeTeams.push(team);
            }
        });
        return activeTeams;
    };

    TeamManager.prototype.hideNotIncludedTeams = function (teamNames) {
        $.each(this.teams, function (i, t) {
            if (teamNames.indexOf(t.name) === -1) {
                t.hide();
            }
        });
    };

    GeoBattle.teamManager = new TeamManager();
})();