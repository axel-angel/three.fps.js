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
    playerMode: function (data) {
        console.log(['ws playerMode', data]);
        onPlayerMode(data.mode, data.position);
    },
    join: function (data) {
        console.log(['ws join', data]);
        onPlayerJoin(data.player, data.team);
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
    var model = p.model;
    var mp = mPlayers[pid];
    mp.position.fromArray(model.position);
    mp.rotation.fromArray(model.rotation);
};

function onTickUpdate(delta) {
    controls.mouseLook(delta);
    controls.cameraMove(delta);

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
    dir.fromArray(state.players[pid].model.dirVec);
    var vfactor = delta * $s.movementSpeed;
    var vdelta = dir.multiply($$.vec1to3(vfactor));
    // TODO: use orientation for dirVec!
    mPlayers[pid].position.add(vdelta);
};

function onPlayerMode(state, position) {
    // switch the camera
    cameraModes[camera.mode].unset();

    var mode;
    if (state == 'player')
        mode = 'player';
    if (state == 'spectate')
        mode = 'top';

    if (mode in cameraModes) {
        cameraModes[mode].set(position);
        camera.mode = mode;
    }
    else
        console.error('no camera mode for state: '+ state);
};

function onPlayerJoin(pid, team) {
    // change/load model

    var m = (team == 'red' ? mPlayerRed : mPlayerBlue).clone();
    if (pid == ws._id) { // ourself
        scene.remove(selfBody);
        selfBody = m;
        scene.add(selfBody);
    }
    else { // other players
        if (pid in mPlayers) scene.remove(mPlayers[pid]);
        mPlayers[pid] = m;
    }
};

function onKeyDown(key) {
    if (key == '1') {
        console.log('joining red');
        ws.event('join', 'red');
    }
    else if (key == '2') {
        console.log('joining blue');
        ws.event('join', 'blue');
    }
};

function onKeyUp(key) {
};

function onMouseDown(key) {
};

function onMouseUp(key) {
};
