// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

// GUI
var gui_is_present = false;
try {
    var gui = require('nw.gui');
    gui_is_present = true;
} catch(e) {
    console.error("GUI is not found");
    gui_is_present = false;
};

// Get IP
var os = require('os');
var ifaces = os.networkInterfaces();
var ipaddr = ""
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
      ipaddr = iface.address
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
      ipaddr = iface.address
    }
    ++alias;
  });
});

// HTTP Portion
var http = require('http');
// URL module
var url = require('url');
var path = require('path');

// Using the filesystem module
var fs = require('fs');

// Reading gameconfigs
//var gamecfg = JSON.parse(fs.readFileSync('gamecfg.json', 'utf8'));
var gamecfg = require("./gamecfg.json");
console.log("Read game configuration:\n" + JSON.stringify(gamecfg))
var scalling = true
if (gamecfg.hasOwnProperty('serversidescalling')) {
    scalling = gamecfg['serversidescalling'] == 'true'
}

var server = http.createServer(handleRequest);

server.once('error', function(err) {
    if (err.code == 'EADDRINUSE') {
        server.listen(0);
    }
});
var serverPort = 8080;
server.once('listening', function() {
    serverPort = server.address().port
    console.log('Server started on port '+serverPort);
});

server.listen(gamecfg["defaultport"]);

// Launch game server
var game = require('./game.js').GameModule;
var GServer = require('./gserver.js');
//var game = GameModule;
var gserver = new GServer(game);

function handleRequest(req, res) {
  // What did we request?
  var pathname = req.url;
  
  // If blank let's ask for index.html
  if (pathname == '/') {
    pathname = '/index.html';
  }
  
  // Ok what's our file extension
  var ext = path.extname(pathname);

  // Map extension to file type
  var typeExt = {
    '.html': 'text/html',
    '.js':   'text/javascript',
    '.css':  'text/css'
  };

  // What is it?  Default to plain text
  var contentType = typeExt[ext] || 'text/plain';

  // User file system module
  fs.readFile(__dirname + pathname,
    // Callback function for reading
    function (err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200,{ 'Content-Type': contentType });
      res.end(data);
    }
  );
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
    socket.emit('update', gserver.game);
    
    socket.on('update',
      function() {
        console.log("Update requested");
        socket.emit('update', gserver.game);
      }
    );
  
    socket.on('picchoosed',
      function(num) {
        console.log("Picture choosed: " + num);
        gserver.game.unveil(num);
        
        // Send it to all other clients
        socket.broadcast.emit('update', gserver.game);
        
        // This is a way to send to everyone including sender
        //io.sockets.emit('update', gserver.game);
      }
    );
    
    socket.on('getpicpath',
      function(id) {
        //console.log("Picture requsted for card #" + id + " path is " + gserver.getpicpath(id));
        socket.emit('idpicpath', {id : id, path : gserver.getpicpath(id)});
      }
    );
    
    socket.on('showmap',
      function() {
        console.log("Map requested");
        socket.emit('mapupdate', gserver.game.map);
      }
    );
    
    socket.on('newround',
      function() {
        console.log("New round requested");
        gserver.game.newround();
        io.sockets.emit('update', gserver.game);
      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);

if (gui_is_present) {
    //gui.Shell.openExternal('http://localhost:'+serverPort);
    
    // Create a new window and get it
    nw.Window.open('http://localhost:'+serverPort, {title : ipaddr+":"+serverPort}, function(new_win) {
      // And listen to new window's focus event
      new_win.on('focus', function() {
        console.log('New window is focused');
      });
    });
}

/* gui.App.closeAllWindows();
    gui.App.quit(); */
