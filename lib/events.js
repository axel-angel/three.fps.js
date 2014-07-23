"use strict";

// game state
var state = { players: {} };
var mMap = {};
var mPlayers = {}; // player models

var wsDispatch = {
    init: function (data) {
        console.log(['ws init', data]);
        ws._id = data.id;
        $$.loadMap(data.map);
    },
    state: function (nState) {
        onStateUpdate(nState);
        state = nState;
    },
    playerMode: function (data) {
        console.log(['ws playerMode', data]);
        onPlayerMode(data.mode, data.position);
    },
    joinTeam: function (data) {
        console.log(['ws join', data]);
        onPlayerJoinTeam(data.player, data.team);
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
            onPlayerJoin(pid, nState.players[pid]);
        }

        var p = nState.players[pid];
        if (p.state == 'player') { // update non-ghost
            onPlayerUpdate(pid, p);
        }
    }
};

function onPlayerJoin(pid, p) {
    console.log(['player joined', pid]);
    if (p.state == 'player')
        loadPlayerModel(pid, p.team);
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
    if (!(pid in mPlayers)) {
        console.error('player model not loaded: '+ pid);
        return;
    }

    // update model features
    var model = p.model;
    var mp = mPlayers[pid];
    mp.position.fromArray(model.position);
    mp.position.add($$.vec(0, -$s.camera.height, 0)); // camera-body offset
    mp.rotation.set(0, 0, 0);
    mp.rotation.y = model.rotation[1]; // only orientation
};

function onTickUpdate(delta) {
    controls.mouseLook(delta);
    var xz = controls.cameraMove(delta);
    if (!$$.hasPlayerMapCollision($$.vec(xz[0], camera.y, xz[1]))) {
        camera.position.x = xz[0];
        camera.position.z = xz[1];
    }

    if (selfBody)
        $$.updateSelfBodyCamera(selfBody, camera);

    for (var pid in state.players) {
        if (pid == ws._id) continue; // skip ourself

        if (state.players[pid].state == 'player') {
            updatePredictiveOthers(delta, pid);
        }
    }
};

// Predict position of other player (smooth moves)
function updatePredictiveOthers(delta, pid) {
    var p = state.players[pid];
    var mp = mPlayers[pid];

    var eul = new THREE.Euler();
    eul.fromArray(p.model.rotation);

    var dir = $$.vec();
    dir.fromArray(p.model.dirVec);
    dir.applyEuler(eul);
    dir.y = 0; // we don't predict height
    dir.normalize();

    var vfactor = -delta * $s.movementSpeed;
    var vdelta = dir.multiply($$.vec1to3(vfactor));
    mp.position.add(vdelta);
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

function loadPlayerModel(pid, team) {
    // change/load model
    var m = mTeams[team].clone();
    if (pid == ws._id) { // ourself
        scene.remove(selfBody);
        selfBody = m;
        selfBody.rotation.set(0, 0, 0);
    }
    else { // other players
        if (pid in mPlayers) scene.remove(mPlayers[pid]);
        mPlayers[pid] = m;
    }
    scene.add(m);
};

function onPlayerJoinTeam(pid, team) {
    console.log(['onPlayerJoinTeam', pid, team]);
    loadPlayerModel(pid, team);
};

function onKeyDown(key) {
    if (key == '1') {
        console.log('joining red');
        ws.event('joinTeam', 'red');
    }
    else if (key == '2') {
        console.log('joining blue');
        ws.event('joinTeam', 'blue');
    }
};

function onKeyUp(key) {
};

function onMouseDown(key) {
};

function onMouseUp(key) {
};
