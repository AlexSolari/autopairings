import IdentityProvider from '../providers/identityProvider.js'

export default class Player{
    constructor(name){
        this.Id = IdentityProvider.newId();
        this.Name = name;
        this.Points = 0;
    }
}
