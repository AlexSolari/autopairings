import IdentityProvider from '../providers/identityProvider.js'

export default class Table {
    constructor(players) {
        this.Id = IdentityProvider.newId();
        this.Players = players;
        this.MatchOver = false;
        this.Winner = null;
    }
}
