import Table from "./table.js";

export default class PairingService {
    constructor() {
        this.Players = [];
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

        const targetPlayerCountPerTable = parseInt(document.querySelector("#playersPerTable").value);
        const orderedPlayers = this.Players
            .sort((p1, p2) => Math.random() > 0.5 ? -1 : 1) //shuffle
            .sort((p1, p2) => p2.Points - p1.Points); //sort
        const playerGroups = chunk(orderedPlayers, targetPlayerCountPerTable);
        const tables = playerGroups.map(group => new Table(group));

        return tables;
    }
}