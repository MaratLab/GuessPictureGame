class GCard {
    constructor(picid=0) {
        this.unveiled = false;
        // color: 0 - yellow, 1 - black, 2 - red, 3 - blue
        this.color = 0;
        this.picid = picid;
    }
}

class Game {
    
    constructor(picnum=[]) {
        this.card_num = 20;
        this.cards = [];
        this.turn = Math.random()*1; // 0 - red, 1 - blue
        this.gmap = null;
        this.deck = new GDeck(picnum);
        this.newround();
    }
    
    unveil(num) {
        this.cards[num].unveiled = true;
    }
    
    newround() {
        console.log("Starting new round"+" top: "+this.deck.top);
        this.turn = (this.turn === 1 ? 0 : 1);
        this.gmap = new GMap(this.turn);
        
        // shuffle deck if there is not enough cards for new round
        if (this.deck.cards.length - this.deck.top < 20) {
            this.deck.shuffle();
        }
        
        for (var i = 0; i < this.card_num; i++) {
            this.cards[i] = new GCard();
            this.cards[i].color = this.gmap.getcolor(i);
            this.cards[i].picid = this.deck.getCard();
        }
    }
    
    update(game) {
        for (var i = 0; i < this.card_num; i++) {
            this.cards[i] = game.cards[i];
        }
        this.turn = game.turn;
    }
}

class GMap {
    constructor(turn=0, map=[]) {
        this.map = null;
        this.turn = turn;
        this.newmap(turn, map);
    }
    
    newmap(turn=0, map=[]) {
        this.turn = turn;
        if (map.length > 0) this.map = map;
        else {
            var total = 20;
            var ids = [];
            for (var i = 0; i < total; i++) {
                ids[i] = i;
            }
            this.shuffle(ids);
            this.map = ids;
        }
    }
    
    getcolor(id) {
        if (id === this.map[0]) return 1;
        for (var i = 0; i < 4; i++) {
            if (id === this.map[i+1]) return 0;
        }
        for (var i = 0; i < 8; i++) {
            if (id === this.map[i+1+4]) return (this.turn === 0 ? 2 : 3);
        }    
        for (var i = 0; i < 7; i++) {
            if (id === this.map[i+1+4+8]) return (this.turn === 0 ? 3 : 2);
        }   
        
    }
    
    shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }
}

class GDeck {
    constructor(num=0) {
        this.cards = [];
        for (var i = 0; i < num; i++) {
            this.cards.push(i);
        }
        this.top = 0;
        console.log("New deck: top=" + this.top + " number of gards is " + num)
        this.shuffle();
    }
    
    getCard() {
        var top = this.top;
        this.top = this.top === this.cards.length-1 ? 0 : this.top + 1;
        return this.cards[top];
    }
    
    shuffle() {
      console.log("Shuffling deck...");
      var array = this.cards;
      var currentIndex = array.length, temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      //return array;
      this.cards = array;
    }
}

(function(exports){
    exports.GameModule = Game;

})(typeof exports === 'undefined'? this: exports);
