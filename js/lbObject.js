/**
 * @classdesc Entry used to create a pair: An entry in the leaderboard
 */
class Entry{
    /**
     * Entry Constructor
     * @constructor 
     * @param {string} Name player name
     * @param {float} Time player score
     */
    constructor(Name,Time){
        this.name=Name;
        this.time=Time;
    }
}
export {Entry}