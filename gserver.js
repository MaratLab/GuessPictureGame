module.exports = class GServer {
    constructor(game, socket) {
    this.socket = socket;
    this.fs = require('fs');
    
    // load picture list
    this.pics = [];
    var files = this.fs.readdirSync(__dirname + '/pics');
    for (var i = 0; i < files.length; i++) {
        if (files[i].endsWith('jpeg') || files[i].endsWith('jpg')) {
            this.pics.push(files[i]);
        }
    }
    //console.log("Pics " + this.pics);
    
    
    this.game = new game(this.pics.length);
  }
  
  getpicpath(id)  {
    return '/pics/'+this.pics[this.game.cards[id].picid];
  }
  
}
