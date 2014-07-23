"use strict";


/* -- imports -- */
var $s = require('./lib/settings.js')._
  , $m = require('./lib/map.js')._
  , util = require('util')
  , http = require('http')
  , nstatic = require('node-static')
  , WebSocketServer = require('ws').Server
;


/* -- constants -- */
var NEXTID = 0
  , map = $m.genMap(Math.floor($s.map.seedMax * Math.random()))
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
function wsEventAll(tpe, d) {
    for (var i in wss.clients) {
        wsEvent(wss.clients[i], tpe, d);
    }
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

    wsEvent(ws, 'init', {
        id: ws._id,
        map: map,
    });
    wsEvent(ws, 'playerMode', {
        mode: 'spectate',
        position: [0, $s.spectateHeight, 0]
    });

    ws.on('close', function () {
        console.log(['close', ws._id]);
        delete state.players[ws._id];
    });

    ws.on('message', function(m_) {
        var m = JSON.parse(m_);
        if (m.type in wsDispatch) {
            wsDispatch[m.type](ws, ws._id, m.data);
        }
        else {
            console.log(['ws unknown', ws._id, m.type, m]);
        }
    });

    ++NEXTID;
});

setInterval(function () {
    wsEventAll('state', state);
}, $s.wsFreq*1000);

var wsDispatch = {
    move: function (ws, pid, data) {
        state.players[pid].model = data;
    },
    joinTeam: function (ws, pid, team) {
        if (['red', 'blue'].indexOf(team) == -1) return;

        var p = state.players[pid];
        p.state = 'player';
        p.team = team;
        wsEventAll('joinTeam', { player: pid, team: team  });
        wsEvent(ws, 'playerMode', {
            mode: 'player',
            position: [0, $s.camera.height, 0]
        });
    },
    bullet: function (ws, pid, data) {
        // TODO: check validity, do damage
        wsEventAll('bullet', data);
    },
};
