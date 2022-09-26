import Table from "../entities/table.js";
import InputDataProvider from "../providers/inputDataProvider.js"

export default class PairingService {
    constructor() {
        this.Players = [];
        this.Stats = [];
        this.InputDataProvider = new InputDataProvider();
    }

    initialize(players) {
        this.Players = players;
    }

    recalculateStats(){
        this.Stats = [];
        this.Players.forEach((p1) => {
                let p1Opps = this.Players.filter(x => p1.Opponents.indexOf(x.Id) >= 0);
                let p1OppsWR = 0;
                let p1WR = 0;

                if (p1Opps.length != 0){
                    p1OppsWR = p1Opps.map(x => x.GamesWon).reduce((a, b) => a+b) / p1Opps.map(x => x.GamesPlayed).reduce((a, b) => a+b);
                    p1WR = p1.GamesWon / p1.GamesPlayed;
                }

                if (this.Stats.map(x => x.Id).indexOf(p1.Id) == -1)
                    this.Stats.push({
                            Id: p1.Id,
                            Name: p1.Name,
                            Points: p1.Points,
                            OWR: p1OppsWR.toFixed(2),
                            WR: p1WR.toFixed(2),
                            Seed: p1.SeededPosition
                        });
            });
    }

    makeTables() {
        const chunk = (arr, len) => {

            var chunks = [],
                i = 0,
                n = arr.length;

            while (i < n) {
                chunks.push(arr.slice(i, i += len));
            }

            return chunks;
        };

        this.Stats = [];
        const targetPlayerCountPerTable = parseInt(this.InputDataProvider.getInputValue("#playersPerTable"));
        const orderedPlayers = this.Players
            .sort((p1, p2) => Math.random() > 0.5 ? -1 : 1) //shuffle
            .sort((p1, p2) => {
                const pointsDiff = p2.Points - p1.Points;
                const seedPosDiff = p1.SeededPosition - p2.SeededPosition;
                let oppMWDiff = 0;
                let gameMWDiff = 0; 

                const p1Opps = this.Players.filter(x => p1.Opponents.indexOf(x.Id) >= 0);
                const p2Opps = this.Players.filter(x => p2.Opponents.indexOf(x.Id) >= 0);
                let p1OppsWR = 0;
                let p2OppsWR = 0;
                let p1WR = 0;
                let p2WR = 0;

                if (p1Opps.length != 0){

                    p1OppsWR = p1Opps.map(x => x.GamesWon).reduce((a, b) => a+b) / p1Opps.map(x => x.GamesPlayed).reduce((a, b) => a+b);
                    p2OppsWR = p2Opps.map(x => x.GamesWon).reduce((a, b) => a+b) / p2Opps.map(x => x.GamesPlayed).reduce((a, b) => a+b);
                    oppMWDiff = p2OppsWR - p1OppsWR;

                    p1WR = p1.GamesWon / p1.GamesPlayed;
                    p2WR = p2.GamesWon / p2.GamesPlayed;
                    gameMWDiff = p2WR - p1WR;
                }

                if (pointsDiff != 0)
                    return pointsDiff;
                else if (oppMWDiff != 0)
                    return oppMWDiff;
                else if (gameMWDiff != 0)
                    return gameMWDiff;
                else
                    return seedPosDiff;
            }); //sort
        const playerGroups = chunk(orderedPlayers, targetPlayerCountPerTable);
        const tables = playerGroups.map(group => new Table(group));

        this.recalculateStats();

        return tables;
    }
}