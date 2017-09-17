

// Keep track of our socket connection
var socket;
// Game client
var gclient = null;

function setup() {
  console.log("Client started");
  createCanvas(windowWidth, windowHeight);
  background(0);
    
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://192.168.30.2:8080');
  gclient = new GClient(socket, Game);
  // We make a named event called 'mouse' and write an
  // anonymous callback function
  socket.on('update',
    // When we receive data
    function(game) {
      console.log("Updating...");
      gclient.update(game);
    }
  );
  
  socket.on('idpicpath',
    function(data) {
      //console.log("Receiving picpath for tile[" + data.id + "]...");
      //gclient.tiles[data.id].setTilePicPath(data.path);
      //loadImage(data.path, gclient.tiles[data.id].setTilePic); 
      //gclient.tiles[data.id].pic = loadImage(data.path);
      gclient.tiles[data.id].setTilePicPath(data.path);
    }
  );
}

function draw() {
  // Nothing
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gclient.resize();
  gclient.redraw();
}

function mouseMoved() {
        var pos = {
            x: mouseX,
            y: mouseY,
        };
        gclient.insidetile(pos);
}

function mouseClicked() {
        var pos = {
            x: mouseX,
            y: mouseY,
        };
        id = gclient.insidetile(pos);
        
        if (id === null) {}
        else {
            if (gclient.mapshown === true) {}
            else {
                gclient.choose(id);
            }
        }
        
        return true;
}
