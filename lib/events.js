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

        if (!(pid in state.players)) { // player appears
            onPlayerJoin(pid);
        }

        var p = nState.players[pid];
        if (p.state == 'player') { // update non-ghost
            onPlayerUpdate(pid, nState.players[pid]);
        }
    }
};

function onPlayerJoin(pid) {
    console.log(['player joined', pid]);
};

function onPlayerQuit(pid) {
    console.log(['player quited', pid]);

    // unload model if necessary
    if (pid in mPlayers) {
        scene.remove(mPlayers[pid]);
        delete mPlayers[pid];
    }
};

function onPlayerUpdate(pid, p) {
    // create model if necessary
    if (!(pid in mPlayers)) {
        var m = mPlayerBlue.clone();
        mPlayers[pid] = m;
        scene.add(m);
    }

    // update model features
    var pos = p.position;
    var rot = p.rotation;
    var mp = mPlayers[pid];
    mp.position.fromArray(pos);
    mp.rotation.fromArray(rot);
};

function onTickUpdate(delta) {
    for (var pid in state.players) {
        if (pid == ws._id) continue; // skip ourself

        if (state.players[pid].state == 'player') {
            updatePredictiveOthers(delta, pid);
        }
    }
};

// Predict position of other player (smooth moves)
function updatePredictiveOthers(delta, pid) {
    var dir = new THREE.Vector3();
    dir.fromArray(state.players[pid].dirVec);
    var vfactor = delta * $s.movementSpeed;
    var vdelta = dir.multiply($$.vec1to3(vfactor));
    // TODO: use orientation for dirVec!
    mPlayers[pid].position.add(vdelta);
}
