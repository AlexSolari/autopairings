export default class Player{
    constructor(name){
        let newId = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        this.Id = newId();
        this.Name = name;
        this.Points = 0;
    }

    addPoints(amount){
        this.Points += amount;
    }
}
