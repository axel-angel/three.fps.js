"use strict";

// game state
var state = { players: {} };
var mPlayers = {}; // player models

var wsDispatch = {
    id: function (id) {
        console.log(['ws id', id]);
        ws._id = id;
    },
    state: function (nState) {
        onStateUpdate(nState);
        state = nState;
    },
};

// receive the state (update display)
function onStateUpdate(nState) {
    for (var pid in state.players) {
        if (!(pid in nState.players)) // player vanishes
            onPlayerQuit(pid);
    }

    for (var pid in nState.players) {
        if (pid == ws._id) continue; // skip ourself

        if (!(pid in state.players)) // player appears
            onPlayerJoin(pid);

        onPlayerUpdate(pid, nState.players[pid]);
    }
};

function onPlayerJoin(pid) {
    console.log(['player joined', pid]);

    // load model
    var m = mPlayerBlue.clone();
    mPlayers[pid] = m;
    scene.add(m);
};

function onPlayerQuit(pid) {
    console.log(['player quited', pid]);

    // unload model
    scene.remove(mPlayers[pid]);
    delete mPlayers[pid];
};

function onPlayerUpdate(pid, p) {
    var pos = p.position;
    var rot = p.rotation;
    var mp = mPlayers[pid];
    mp.position.set(pos[0], pos[1], pos[2]);
    mp.rotation.set(rot[0], rot[1], rot[2]);
};

