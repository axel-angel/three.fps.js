// game state
var state = { players: {} };
var mPlayers = {};

// camera
var cam_fov = 75;
var cam_ratio = window.innerWidth / window.innerHeight;
var cam_near = 0.1;
var cam_far = 1000;
var camera = new THREE.PerspectiveCamera(cam_fov, cam_ratio, cam_near, cam_far);
camera.position.set(0, 1.1, 5);

// scene renderer
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 1st person controls
controls = new THREE.FirstPersonControls(camera);
controls.sensivitiy = 0.5;
controls.lockCursor = false;
controls.movementSpeed = 2;
controls.noFly = false;
controls.constrainVertical = true;
controls.verticalMin = 0;
controls.verticalMax = 3;
controls.lon = 250;
controls.activeLook = true;

// shadow map
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;

// ambient light
var ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// down spot light
var light = new THREE.DirectionalLight(0xffffff, 1);
//var light = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2, 1);
light.position.set(5, 3, 3);
light.castShadow = true;
light.shadowDarkness = 0.5;
light.shadowCameraRight = 25;
light.shadowCameraLeft = -25;
light.shadowCameraTop = 25;
light.shadowCameraBottom = -25;
light.shadowMapWidth = 1024;
light.shadowMapHeight = 1024;
light.shadowCameraNear = 0.1;
light.shadowCameraFar = 1000;
light.shadowCameraFov = 30;
scene.add(light);

// ground
var ground = $$.box({ x:100, y:0, z:100, color: 0x999999 });
ground.position.set(0, 0, 0);
ground.castShadow = false;
ground.receiveShadow = true;
scene.add(ground);

// box
var cube = $$.box({ x:1, y:1, z:1, color: 0x999999 });
cube.position.set(0, 0, 0);
cube.castShadow = true;
cube.receiveShadow = false;
scene.add(cube);

// player (shared model)
var mPlayerBlue = $$.player({ color: 0x0000ff });
var mPlayerRed  = $$.player({ color: 0xff0000 });

// self-body (player)
var selfBody = mPlayerBlue.clone();
scene.add(selfBody);

// websocket
var ws = new WebSocket("ws://127.0.0.1:8080");
var wsid;
var wsFreq = 0.05;
var wsLast = 0;
ws.onopen = function (ev) {
    console.log(['ws open', ev]);
};
function wsJson(ws, m_) {
    ws.send(JSON.stringify(m_));
};
function wsSendState () {
    wsJson(ws, {
        type: 'position',
        data: [selfBody.position.x, selfBody.position.y, selfBody.position.z],
    });
};
ws.onmessage = function (ev) {
    var m = JSON.parse(ev.data);
    switch (m.type) {
        case 'id':
            console.log(['ws id', m.data]);
            wsid = m.data
            break;
        case 'state':
            //console.log(['ws state', state, m.data]);
            onStateUpdate(m.data);
            state = m.data;
            break;
        default:
            console.log(['ws unknown', m.type, m]);
            break;
    }
};

// rendering / update
var clock = new THREE.Clock();
var t = 0;

function onStateUpdate(nState) {
    // remove old player models
    for (var key in state.players) {
        if (!(key in nState.players)) {
            console.log(['rem model', key]);
            scene.remove(mPlayers[key]);
            delete mPlayers[key];
        }
    }
    // update positions or load new player models
    for (var key in nState.players) {
        if (key == wsid) continue; // skip ourself
        if (!(key in state.players)) {
            console.log(['add model', key]);
            var m = mPlayerBlue.clone();
            mPlayers[key] = m;
            scene.add(m);
        }
        else {
            var p = state.players[key];
            var pos = p.position;
            mPlayers[key].position.set(pos[0], pos[1], pos[2]);
        }
    }
};

function render() {
    var delta = clock.getDelta();
    requestAnimationFrame(render);

    cube.rotation.y += 0.01;
    cube.position.x = 2 * Math.sin(t);
    cube.position.y = 2 + 0.5 * Math.sin(t*3);

    selfBody.traverse(function (o) {
        o.rotation.y = camera.rotation.y;
    });
    selfBody.position.copy(camera.position);
    selfBody.position.add($$.vec(0, -1.2, 0.2));

    controls.update(delta);
    if (t - wsLast >= wsFreq) {
        wsSendState();
        wsLast = t;
    }

    renderer.render(scene, camera);
    t += delta;
}
render();
