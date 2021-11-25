import IdentityProvider from '../providers/identityProvider.js'

export default class Player{
    constructor(name){
        this.Id = IdentityProvider.newId();
        this.Name = name;
        this.Points = 0;
        this.GamesWon = 0;
        this.GamesLost = 0;
        this.GamesPlayed = 0;
        this.Opponents = [];
    }
}
