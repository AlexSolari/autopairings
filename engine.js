import Player from './entities/player.js'
import PairingService from './services/pairingService.js'
import RenderService from './services/renderService.js'
import InputDataProvider from './providers/inputDataProvider.js';

export default class TournamentEngine {
    constructor() {
        this.Players = [];
        this.Tables = [];
        this.PairingService = new PairingService();
        this.RenderService = new RenderService();
        this.InputProvider = new InputDataProvider();
        this.WinnerPoints = 3;
        this.LoserPoints = 1;
        this.Stage = 0;
        this.TournamentInProgress = true;
    }

    get isRoundInProgress() {
        let tablesPlaying = this.Tables.filter(t => t.MatchOver == false);

        return tablesPlaying.length > 0;
    }

    processPlayerNameInput(event) {
        if (event.keyCode == 13) {
            this.addPlayer();
        }
    }

    addPlayer() {
        let name = this.InputProvider.getInputValue("#playerName");
        let newPlayer = new Player(name);

        this.Players.push(newPlayer);
        this.updateUi();
        this.InputProvider.resetAndRefocusOnInput("#playerName");
    }

    nextRound() {
        this.PairingService.initialize(this.Players);
        this.Tables = this.PairingService.makeTables();

        this.updateUi();
    }

    updatePoints() {
        let winner = parseInt(this.InputProvider.getInputValue("#winner"));
        let losers = parseInt(this.InputProvider.getInputValue("#loser"));

        this.usePoints(winner, losers);
    }

    usePoints(winner, losers) {
        this.WinnerPoints = winner;
        this.LoserPoints = losers;

        this.updateUi();
        this.setStage(3);
    }

    playerWon(playerId, tableId) {
        let targetTable = this.Tables.find(t => t.Id == tableId);
        let winner = targetTable.Players.find(p => p.Id == playerId);
        let losers = targetTable.Players.filter(p => p.Id != winner.Id);

        winner.Points += this.WinnerPoints;
        losers.forEach(p => {
            p.Points += this.LoserPoints;
        });

        targetTable.Winner = winner;
        targetTable.MatchOver = true;

        let players = this.Tables.map(x => x.Players);
        this.Players = [].concat.apply([], players);

        this.updateUi();
    }

    finish() {
        this.updateUi();
        this.TournamentInProgress = false;

        this.RenderService.showResultsScreen()

        this.clearState();
    }

    updateUi() {
        if (!this.TournamentInProgress)
            return;

        let getClassFor = (player, table) => {
            let result = "";

            if (table.MatchOver && player.Id == table.Winner.Id)
                result = "winner";

            return result;
        };

        this.saveState();

        let tablesHtml = "";
        this.Tables.forEach(table => {
            tablesHtml += this.RenderService.render("tableTemplate", table, true)
        });

        this.RenderService.updateElement("#tables", tablesHtml || "<em>Start round to get pairings...</em>");

        this.Tables.forEach(table => {
            let tablePlayersHtml = "";

            let templateName = table.MatchOver ? "tableRowFinishedTemplate" : "tableRowTemplate";
            table.Players.forEach(player => {
                tablePlayersHtml += this.RenderService.render(templateName, { tableId: table.Id, rowClass: getClassFor(player, table), ...player });
            });

            this.RenderService.updateElement(`#table-${table.Id}`, tablePlayersHtml)
        });

        let stagingHtml = "";
        this.Players.sort((p1, p2) => p2.Points - p1.Points).forEach((player, index) => {
            stagingHtml += this.RenderService.render("stagingRowTemplate", { place: index + 1, ...player });
        });

        this.RenderService.updateElement("#staging", stagingHtml || "<p>No players were added...</p>");

        this.RenderService.toggleButton("#nextRoundButton", this.isRoundInProgress);
        this.RenderService.toggleButton("#tournamentEndButton", this.isRoundInProgress);
    }

    saveState() {
        let state = {
            WinnerPoints: this.WinnerPoints,
            LoserPoints: this.LoserPoints,
            Players: this.Players,
            Tables: this.Tables,
        }

        localStorage.setItem("state", JSON.stringify(state));
    }

    loadState() {
        let state = JSON.parse(localStorage.getItem("state"));

        this.WinnerPoints = state.WinnerPoints;
        this.LoserPoints = state.LoserPoints;
        this.Players = state.Players;
        this.Tables = state.Tables;
    }

    clearState() {
        localStorage.removeItem("state");
    }

    checkState() {
        let state = JSON.parse(localStorage.getItem("state"));
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
        else{
            this.setStage(1);
        }
    }

    setStage(stage) {
        this.Stage = stage;
        this.RenderService.showStageScreen(this.Stage);
    }

    load() {
        this.loadState();
        this.updateUi();
        this.setStage(3);
    }

    skipLoading() {
        this.updateUi();
        this.setStage(2);
    }
}