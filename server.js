"use strict";


/* -- imports -- */
var $s = require('./lib/settings.js')._
  , util = require('util')
  , http = require('http')
  , nstatic = require('node-static')
  , WebSocketServer = require('ws').Server
;


/* -- constants -- */
var NEXTID = 0
  , wsFreq = 1
  , state = {
        players: {},
    }
;


/* -- helpers -- */
function wsEvent(ws, tpe, d) {
    ws.send(JSON.stringify({
        type: tpe,
        data: d,
    }));
};


/* -- static server -- */
var server = http.createServer(function (req, res) {
    var folder = new(nstatic.Server)('.');
    folder.serve(req, res);
}).listen($s.port);


/* -- websocket server -- */
var wss = new WebSocketServer({ server: server })

wss.on('connection', function(ws) {
    ws._id = NEXTID;
    state.players[ws._id] = {
        state: 'spectate',
    };
    console.log(['connection', ws._id]);

    wsEvent(ws, 'id', ws._id);
    wsEvent(ws, 'playerMode', { mode: 'spectate', position: [0, 20, 0] });

    ws.on('close', function () {
        console.log(['close', ws._id]);
        delete state.players[ws._id];
    });

    ws.on('message', function(m_) {
        var m = JSON.parse(m_);
        //console.log(['message', ws._id, m]);
        switch (m.type) {
            case 'move':
                state.players[ws._id].model = m.data;
                break;
            default:
                console.log(['ws unknown', ws._id, m]);

        }
    });

    ++NEXTID;
});


/* -- regularly update client state -- */
setInterval(function () {
    for (var i in wss.clients) {
        wsEvent(wss.clients[i], 'state', state);
    }
}, wsFreq*1000);
