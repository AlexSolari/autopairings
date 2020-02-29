import Table from "../entities/table.js";
import InputDataProvider from "../providers/inputDataProvider.js"

export default class PairingService {
    constructor() {
        this.Players = [];
        this.InputDataProvider = new InputDataProvider();
    }

    initialize(players) {
        this.Players = players;
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

        const targetPlayerCountPerTable = parseInt(this.InputDataProvider.getInputValue("#playersPerTable"));
        const orderedPlayers = this.Players
            .sort((p1, p2) => Math.random() > 0.5 ? -1 : 1) //shuffle
            .sort((p1, p2) => p2.Points - p1.Points); //sort
        const playerGroups = chunk(orderedPlayers, targetPlayerCountPerTable);
        const tables = playerGroups.map(group => new Table(group));

        let fullTables = tables.filter(x => x.Players.length == targetPlayerCountPerTable);
        let invalidTables = tables.filter(x => x.Players.length <= 2);
        let tries = 0;
        while (invalidTables.length != 0 || tries >= 10) {
            tries++;

            let playerToMove = fullTables.reverse()[0].Players.pop();
            invalidTables[0].Players.push(playerToMove);

            fullTables = tables.filter(x => x.Players.length == targetPlayerCountPerTable);
            invalidTables = tables.filter(x => x.Players.length <= 2);

        }

        return tables;
    }
}