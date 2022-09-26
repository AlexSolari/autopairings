export default class StateManagementService{
    constructor(){
        this.state = {};
    }

    saveState(WinnerPoints, LoserPoints, Players, Tables, Stats) {
        this.state = {
            WinnerPoints,
            LoserPoints,
            Players,
            Tables,
            Stats,
        }

        localStorage.setItem("state", JSON.stringify(this.state));
    }

    loadState() {
        let storedState = JSON.parse(localStorage.getItem("state"));

        if (storedState){
            this.state.WinnerPoints = storedState.WinnerPoints;
            this.state.LoserPoints = storedState.LoserPoints;
            this.state.Players = storedState.Players;
            this.state.Tables = storedState.Tables;
            this.state.Stats = storedState.Stats;

            return this.state;
        }

        return null;
    }

    clearState() {
        localStorage.removeItem("state");
    }
};