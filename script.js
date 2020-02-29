import Player from './player.js'
import Table from './table.js'
import PairingService from './pairingService.js'
import RenderService from './renderService.js'

export default class TournamentEngine{
    constructor(){
        this.Players = [];
        this.Tables = [];
        this.PairingService = new PairingService();
        this.RenderService = new RenderService();
        this.WinnerPoints = 3;
        this.LoserPoints = 1;
        this.Stage = 1;
        this.TournamentInProgress = true;
    }

    get isRoundInProgress(){
        let tablesPlaying = this.Tables.filter(t => t.MatchOver == false);

        return tablesPlaying.length > 0;
    }

    processPlayerNameInput(event){
        if (event.keyCode == 13){
            this.addPlayer();
        }
    }

    addPlayer(){
        let name = document.querySelector("#playerName").value;
        let newPlayer = new Player(name);

        this.Players.push(newPlayer);
        this.updateUi();
        let input = document.querySelector("#playerName");
        input.value = "";
        input.focus();
    }
    
    nextRound(){
        this.PairingService.initialize(this.Players);
        this.Tables = this.PairingService.makeTables();

        this.updateUi();
    }

    updatePoints(){
        this.WinnerPoints = parseInt(document.querySelector("#winner").value);
        this.LoserPoints = parseInt(document.querySelector("#loser").value);
        
        this.updateUi();
        this.setStage(3);
    }

    playerWon(playerId, tableId){
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

    finish(){
        this.updateUi();
        this.TournamentInProgress = false;

        let nodes = Array.from(document.querySelectorAll(".remove-at-end"));
        nodes.forEach(n => n.remove());

        let playersTable = document.querySelector(".players");
        playersTable.className = "players col-md-12";

        this.clearState();
    }

    updateUi(){
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
                tablePlayersHtml += this.RenderService.render(templateName, {tableId: table.Id, rowClass: getClassFor(player, table), ...player});
            });

            this.RenderService.updateElement(`#table-${table.Id}`, tablePlayersHtml)
        });

        let stagingHtml = "";
        this.Players.sort((p1, p2) => p2.Points - p1.Points).forEach((player, index) => {
            stagingHtml += this.RenderService.render("stagingRowTemplate", {place: index+1, ...player});
        });

        this.RenderService.updateElement("#staging", stagingHtml || "<p>No players were added...</p>");
        
        let nextRoundButton = document.querySelector("#nextRoundButton");
        nextRoundButton.disabled = this.isRoundInProgress ? "disabled" : undefined;

        let tournamentEndButton = document.querySelector("#tournamentEndButton");
        tournamentEndButton.disabled = this.isRoundInProgress ? "disabled" : undefined;
    }

    saveState(){
        let state = {
            WinnerPoints: this.WinnerPoints,
            LoserPoints: this.LoserPoints,
            Players: this.Players,
            Tables: this.Tables,
        }

        localStorage.setItem("state", JSON.stringify(state));
    }

    loadState(){
        let state = JSON.parse(localStorage.getItem("state"));

        this.WinnerPoints = state.WinnerPoints;
        this.LoserPoints = state.LoserPoints;
        this.Players = state.Players;
        this.Tables = state.Tables;
    }

    clearState(){
        localStorage.removeItem("state");
    }

    checkState(){
        let state = JSON.parse(localStorage.getItem("state"));
        let canLoad = false;

        if (state){
            canLoad = true;
            if (state.Players.length == 0){
                canLoad = false;
            }
        }

        if (!canLoad){
            this.skipLoading();
        }
    }

    setStage(stage){
        this.Stage = stage;

        let sections = Array.from(document.querySelectorAll("section"));
        sections.forEach(s => s.className = "hidden");

        document.querySelector(`#screen${this.Stage}`).className = "";
    }

    load(){
        this.loadState();
        this.updateUi();
        this.setStage(3);
    }

    skipLoading(){
        this.updateUi();
        this.setStage(2);
    }
}