var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({port: 8080})
    , wsFreq = 0.05;
;

var NEXTID = 0;
var state = {
    players: {},
};
function wsJson(ws, m_) {
    ws.send(JSON.stringify(m_));
};

wss.on('connection', function(ws) {
    ws._id = NEXTID;
    state.players[ws._id] = {
        position: {},
    };
    wsJson(ws, { type: 'id', data: ws._id });
    console.log(['connection', ws._id]);

    ws.on('close', function () {
        console.log(['close', ws._id]);
        delete state.players[ws._id];
    });

    ws.on('message', function(m_) {
        var m = JSON.parse(m_);
        //console.log(['message', ws._id, m]);
        switch (m.type) {
            case 'position':
                state.players[ws._id].position = m.data;
                break;
        }
    });

    ++NEXTID;
});

setInterval(function () {
    for (var i in wss.clients) {
        wsJson(wss.clients[i], {
            type: 'state',
            data: state,
        });
    }
}, wsFreq*1000);
