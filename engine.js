import Player from './entities/player.js'
import PairingService from './services/pairingService.js'
import RenderService from './services/renderService.js'
import InputDataProvider from './providers/inputDataProvider.js';
import StateManagementService from './services/stateManagementService.js';

export default class TournamentEngine {
    constructor() {
        this.BackupPlayers = [];
        this.Players = [];
        this.Tables = [];
        this.PairingService = new PairingService();
        this.RenderService = new RenderService();
        this.InputProvider = new InputDataProvider();
        this.StateManagementService = new StateManagementService();
        this.Stats = [];
        this.WinnerPoints = 3;
        this.LoserPoints = 1;
        this.Stage = 0;
        this.TournamentInProgress = false;
        this.CustomMatchingEditing = false;
    }

    get isRoundInProgress() {
        const tablesPlaying = this.Tables.filter(t => t.MatchOver == false);

        return tablesPlaying.length > 0;
    }

    processPlayerNameInput(event) {
        if (event.keyCode == 13) {
            this.addPlayer();
        }
    }

    addPlayer() {
        const name = this.InputProvider.getInputValue("#playerName");

        if (name) {
            const newPlayer = new Player(name);

            this.Players.push(newPlayer);
            this.Stats.push({
                Id: newPlayer.Id,
                Name: newPlayer.Name,
                Points: newPlayer.Points,
                OWR: 0,
                WR: 0
            });

            if (!this.CustomMatchingEditing)
                this.RenderService.show("#reorder");
            else {
                this.useCustomMatching();
            }

            this._updateUi();
        }

        this.InputProvider.resetAndRefocusOnInput("#playerName");
    }

    nextRound() {
        this.CustomMatchingEditing = false;
        this.TournamentInProgress = true;
        this.BackupPlayers = this.Players;
        this.PairingService.initialize(this.Players);
        this.Tables = this.PairingService.makeTables();
        this.Tables.forEach(t =>
            t.Players.forEach(p => {
                let oppsIds = t.Players.filter(x => x != p).map(x => x.Id);

                p.Opponents = [...new Set(p.Opponents.concat(oppsIds))];
            })
        );
        this.Stats = this.PairingService.Stats;

        this.RenderService.hide("#reorder");
        this.RenderService.hide("#custom-matching-reminder");
        this.RenderService.hide("button.player-reorder");
        this._updateUi();
    }

    updatePoints() {
        const winner = parseInt(this.InputProvider.getInputValue("#winner"));
        const losers = parseInt(this.InputProvider.getInputValue("#loser"));

        this.usePoints(winner, losers);
    }

    usePoints(winner, losers) {
        this.WinnerPoints = winner;
        this.LoserPoints = losers;

        this._updateUi();
        this._setStage(3);
    }

    playerWon(playerId, tableId) {
        const targetTable = this.Tables.find(t => t.Id == tableId);
        const winner = targetTable.Players.find(p => p.Id == playerId);
        const losers = targetTable.Players.filter(p => p.Id != winner.Id);

        winner.Points += this.WinnerPoints;
        winner.GamesWon += 1;
        winner.GamesPlayed += 1;
        losers.forEach(p => {
            p.Points += this.LoserPoints;
            p.GamesPlayed += 1;
            p.GamesLost += 1;
        });

        targetTable.Winner = winner;
        targetTable.MatchOver = true;

        const players = this.Tables.map(x => x.Players);
        this.Players = [].concat.apply([], players);

        this.PairingService.initialize(this.Players);
        this.PairingService.recalculateStats();
        this.Stats = this.PairingService.Stats;

        this._updateUi();
    }

    finish() {
        this._updateUi();
        this.TournamentInProgress = false;

        this.RenderService.showResultsScreen();
        this.StateManagementService.clearState();
    }

    checkState() {
        const state = this.StateManagementService.loadState();
        let canLoad = false;

        if (state) {
            canLoad = true;
            if (state.Players.length == 0) {
                canLoad = false;
            }
        }

        if (!canLoad) {
            this.skipLoading();
        }
        else {
            this._setStage(1);
        }
    }

    load() {
        this.StateManagementService.loadState();
        this._updateUi();
        this._setStage(3);
    }

    skipLoading() {
        this._updateUi();
        this._setStage(2);
    }

    removePlayer(id) {
        if (confirm("Delete this player?")) {
            if (this.TournamentInProgress) {
                this.Players = this.BackupPlayers.filter(p => p.Id != id);

                this.nextRound();
            }
            else {
                this.Players = this.Players.filter(p => p.Id != id);

                this.Tables.forEach(table => {
                    table.Players = table.Players.filter(p => p.Id != id);
                });

                this.PairingService.initialize(this.Players);
                this.PairingService.recalculateStats();
                this.Stats = this.PairingService.Stats;
            }
        }

        this._updateUi();
    }

    useCustomMatching() {
        this.CustomMatchingEditing = true;

        this.Players.forEach((player, index) => {
            player.SeededPosition = index;
        });

        this.RenderService.hide("#reorder");
        this.RenderService.show("button.player-reorder");
        this.RenderService.show("#custom-matching-reminder");
        this.RenderService.finanizeUpdates();
    }

    moveUp(id) {
        const player = this.Players.find(p => p.Id == id);
        const currentIndex = this.Players.indexOf(player);
        const upPlayer = this.Players[currentIndex - 1];

        if (upPlayer) {
            this._swapPlayers(player, upPlayer);
        }
    }

    moveDown(id) {
        const player = this.Players.find(p => p.Id == id);
        const currentIndex = this.Players.indexOf(player);
        const downPlayer = this.Players[currentIndex + 1];

        if (downPlayer) {
            this._swapPlayers(player, downPlayer);
        }
    }

    /// Internals

    _setStage(stage) {
        this.Stage = stage;
        this.RenderService.showStageScreen(this.Stage);
    }

    _updateUi() {
        if (this.TournamentInProgress)
            this.RenderService.hide(".remove-at-start");

        const getClassFor = (player, table) => {
            let result = "";

            if (table.MatchOver && player.Id == table.Winner.Id)
                result = "winner";

            return result;
        };

        this.StateManagementService.saveState(
            this.WinnerPoints,
            this.LoserPoints,
            this.Players,
            this.Tables,
            this.Stats
        );

        let tablesHtml = "";
        this.Tables.forEach(table => {
            tablesHtml += this.RenderService.render("tableTemplate", table, true)
        });

        this.RenderService.updateElement("#tables", tablesHtml || "<em>Start round to get pairings...</em>");

        this.Tables.forEach(table => {
            let tablePlayersHtml = "";

            const templateName = table.MatchOver ? "tableRowFinishedTemplate" : "tableRowTemplate";
            table.Players.forEach(player => {
                tablePlayersHtml += this.RenderService.render(templateName, { tableId: table.Id, rowClass: getClassFor(player, table), ...player });
            });

            this.RenderService.updateElement(`#table-${table.Id}`, tablePlayersHtml)
        });

        let stagingHtml = "";
        this.Stats.sort((p1, p2) => {
            var pDiff = p2.Points - p1.Points;
            var owrDiff = p2.OWR - p1.OWR;
            var wrDiff = p2.WR - p1.WR;

            if (pDiff != 0)
                return pDiff;
            else if (owrDiff != 0)
                return owrDiff;
            else if (wrDiff != 0)
                return wrDiff;
            else
                return p1.Seed - p2.Seed;
        }).forEach((player, index) => {
            stagingHtml += this.RenderService.render("stagingRowTemplate", { place: index + 1, ...player });
        });

        this.RenderService.updateElement("#staging", stagingHtml || "<p>No players were added...</p>");
        const targetPlayerCountPerTable = parseInt(this.InputProvider.getInputValue("#playersPerTable"));

        const canStartRound = this.Players.length >= targetPlayerCountPerTable;
        const canProceedWithTournament = !this.isRoundInProgress && canStartRound;

        this.RenderService.toggleButton("#tournamentEndButton", canProceedWithTournament);
        this.RenderService.toggleButton("#nextRoundButton", canProceedWithTournament);

        if (this.CustomMatchingEditing) {
            this.RenderService.hide("#reorder");
            this.RenderService.show("button.player-reorder");
            this.RenderService.show("#custom-matching-reminder");
        }

        this.RenderService.finanizeUpdates();
    }

    _swapPlayers(player1, player2) {
        const temp = player1.SeededPosition;
        player1.SeededPosition = player2.SeededPosition;
        player2.SeededPosition = temp;

        this.Players = this.Players.sort((p1, p2) => p1.SeededPosition - p2.SeededPosition);
        this.Players.forEach((player, index) => {
            player.SeededPosition = index;
        });

        this.PairingService.initialize(this.Players);
        this.PairingService.recalculateStats();
        this.Stats = this.PairingService.Stats;

        this._updateUi();
    }
}