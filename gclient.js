class GClient {
    constructor(socket, game, mapbutton) {
        this.socket = socket;
        this.game = new game();
        this.tiles = null;
        
        // GUI
        this.resize();
        this.rownum = 4;
        this.columnnum = 5;
        
        this.mapshown = false;
        this.mapbutton = createButton('Map');
        var obj = this;
        this.mapbutton.mouseClicked(function(){obj.showhidemap()});
        this.mapbutton.position(20, 20);
        this.mapbutton.size(80, 40);
        
        this.newroundbutton = createButton('New round');
        this.newroundbutton.mouseClicked(this.newround);
        this.newroundbutton.position(20, 80);
        this.newroundbutton.size(80, 40);

        
        this.tiles = [];
        for (var i = 0; i < this.game.card_num; i++) {
            this.tiles[i] = new GTile(this, i);
        }
    }
    
    update(game) {
        for (var i = 0; i < this.game.card_num; i++) {
            if (this.game.cards[i].picid !== game.cards[i].picid) {
                this.tiles[i].loadPic();
            }
        }
        this.game.update(game);
        this.redraw();
    }
    
    redraw() {        
        //console.log("Redrawing...");
        background(200);
        for (var i = 0; i < this.game.card_num; i++) {
            if (this.tiles[i].selected === false) this.tiles[i].drawTile();
        }
        for (var i = 0; i < this.game.card_num; i++) {
            if (this.tiles[i].selected === true) this.tiles[i].drawTile();
        }
        
        rectMode(CENTER);
        if (this.game.turn === 0) fill(255,0,0);
        else fill(0,0,255);
        stroke(255);
        rect(windowWidth*0.02, windowHeight/2, 40, 40, 5);
        stroke(0);
    }
    
    resize() {
        this.padding = {
            x: windowWidth*0.01,
            y: windowHeight*(-0.1)
        };
        if (this.tiles != null) {
            for (var i = 0; i < this.game.card_num; i++) {
                this.tiles[i].resize();
            }
        }
    }
    
    insidetile(pos) {
        for (var i = 0; i < this.game.card_num; i++) {
            if (this.tiles[i].selected === true && this.tiles[i].inside(pos) === true) {
                return i;
            }
        }
        for (var i = 0; i < this.game.card_num; i++) {
            if (this.tiles[i].selected === true && this.tiles[i].inside(pos) === false) {
                this.tiles[i].select(false);
                break;
            }
        }
        for (var i = 0; i < this.game.card_num; i++) {
            if (this.tiles[i].selected === false && this.tiles[i].inside(pos) === true) {
                this.tiles[i].select(true);
                return i;
            }
        }
        return null;
    }
    
    choose(id) {
        this.game.unveil(id);
        console.log("Picture number " + id + " choosed and event sent to server");
        this.socket.emit('picchoosed', id);
    }
    
    showhidemap() {
        //console.log(gclient.mapshown ? "Hide map" : "Show map");
        gclient.mapshown = !gclient.mapshown;
        gclient.redraw();
    }
    
    newround() {
        console.log("Request new round");
        gclient.socket.emit('newround');
    }
}

class GTile {
    constructor(gclient, i) {
        this.gclient = gclient;
        this.pos = {
            x: (windowWidth-this.gclient.padding.x*2.0)/(this.gclient.columnnum+1)*(i%this.gclient.columnnum+1) + this.gclient.padding.x,
            y: (windowHeight-this.gclient.padding.y*2.0)/(this.gclient.rownum+1)*(floor(i/this.gclient.columnnum)+1)+this.gclient.padding.y
        };
        this.selected = false;
        this.id = i;
        this.resize();
        
        this.scallingmode = "FIT";
        
        this.pic = createImage(0,0);
        this.picpath = '';
        this.loadPic();
    }
    
    getpos () {
        var pos = { x : this.pos.x, y : this.pos.y };
        if (this.selected) {
            if (this.pos.x + this.tilesize_large / 2 > this.windowWidth) {
                var pos = { x : this.pos.x - (this.pos.x + this.tilesize_large / 2), y : pos.y };
            }
            else if (this.pos.x - this.tilesize_large / 2 < 0) {
                var pos = { x : this.pos.x+this.pos.x - this.tilesize_large / 2 , y : pos.y };
            }
            if (this.pos.y + this.tilesize_large / 2 > this.windowHeight) {
                var pos = { x : pos.x, y : pos.y - (this.pos.y + this.tilesize_large / 2) };
            }
            else if (this.pos.y - this.tilesize_large / 2 < 0) {
                var pos = { x : pos.x, y : pos.y + (this.pos.y - this.tilesize_large / 2) };
            }
        }
        else {
            var pos = { x : this.pos.x, y : this.pos.y };
        }
        return pos;
    }
    
    drawTile() {
            //this.tilesize = this.selected ? windowWidth > windowHeight ? windowHeight / 5 *2 : windowWidth / 6 *2: windowWidth > windowHeight ? windowHeight / 5 : windowWidth / 6;
            this.tilesize = this.selected ? this.tilesize_large : this.tilesize_small;
            // this.pos = {
                // x: (windowWidth-this.gclient.padding.x*2.0)/(this.gclient.columnnum+1)*(this.id%this.gclient.columnnum+1) + this.gclient.padding.x,
                // y: (windowHeight-this.gclient.padding.y*2.0)/(this.gclient.rownum+1)*(floor(this.id/this.gclient.columnnum)+1)+this.gclient.padding.y
            // };
            rectMode(CENTER);
            fill(255,255,255,255);
            rect(this.getpos().x, this.getpos().y, this.tilesize.x+this.tilesize.x*0.1, this.tilesize.y+this.tilesize.y*0.1, 10);
            // color frame
            if (this.gclient.game.cards[this.id].unveiled === true || this.gclient.mapshown === true) {
                if (this.gclient.game.cards[this.id].color === 0) fill(255, 255, 0);
                else if (this.gclient.game.cards[this.id].color === 1) fill(0);
                else if (this.gclient.game.cards[this.id].color === 2) fill(255, 0, 0);
                else if (this.gclient.game.cards[this.id].color === 3) fill(0, 0, 255);
                rect(this.getpos().x, this.getpos().y, this.tilesize.x+this.tilesize.x*0.1, this.tilesize.y+this.tilesize.y*0.1, 10);
            }

            // draw picture
            if (this.pic.width === 0 || this.pic.height === 0) {
                fill(150);
                rect(this.getpos().x, this.getpos().y, this.tilesize.x, this.tilesize.y, 10);
                textSize(30);
                fill(0);
                text(str(this.id), this.getpos().x-17, this.getpos().y+10);
            }
            else {
                imageMode(CENTER);
                if (this.scallingmode === 'FIT'){
                    if (this.pic.width > this.pic.height) {
                        var x = this.tilesize.x;
                        var y = this.tilesize.x / this.pic.width * this.pic.height;
                    }
                    else {
                        var x = this.tilesize.y / this.pic.height * this.pic.width;
                        var y = this.tilesize.y
                    }
                    
                    image(this.pic, this.getpos().x,this.getpos().y, x, y);
                }
                else {
                    image(this.pic, this.getpos().x,this.getpos().y, this.tilesize.x, this.tilesize.y);
                }
            }
			
			if (this.gclient.game.cards[this.id].unveiled === true && this.gclient.mapshown === true) {
				var shade = 150;
                if (this.gclient.game.cards[this.id].color === 0) fill(255, 255, 0, shade);
                else if (this.gclient.game.cards[this.id].color === 1) fill(0, 0, 0, shade);
                else if (this.gclient.game.cards[this.id].color === 2) fill(255, 0, 0, shade);
                else if (this.gclient.game.cards[this.id].color === 3) fill(0, 0, 255, shade);
                rect(this.getpos().x, this.getpos().y, this.tilesize.x+this.tilesize.x*0.1, this.tilesize.y+this.tilesize.y*0.1, 10);
                fill(200, 200, 200, 200);
                rect(this.getpos().x, this.getpos().y, this.tilesize.x+this.tilesize.x*0.1, this.tilesize.y+this.tilesize.y*0.1, 10);
            }
            
    }
    
    inside(pos) {
        //console.log("Inside" + this.id);
        return ((abs(pos.x - this.getpos().x) < this.tilesize.x/2) && (abs(pos.y - this.getpos().y) < this.tilesize.y/2));
    }
    
    select(sel) {
        this.selected = sel;
        this.gclient.redraw();
    }
        
    setTilePic(img) {
        //console.log("tile " + this.id);
        this.pic = img;
    }
    
    setTilePicPath(path) {
        this.picpath = path;
        var obj = this;
        loadImage(path, function(img){ obj.setTilePic(img); obj.gclient.redraw() });
    }
    
    loadPic() {
        this.gclient.socket.emit('getpicpath', this.id);
    }
    
    resize() {
        //this.tilesize = windowWidth > windowHeight ? windowHeight / 5 : windowWidth / 6;
        this.tilesize = { x : windowWidth / 7, 
                          y : windowHeight / 5 };
        //this.tilesize = windowWidth > windowHeight ? {x : windowHeight / 5, y : windowHeight / 5} : {x : windowWidth / 6, y : windowWidth / 6};
        this.tilesize_small = { x : this.tilesize.x, 
                                y : this.tilesize.y };
        this.tilesize_large = { x : this.tilesize.x*1.5, 
                                y : this.tilesize.y*1.5 };
    }
}
