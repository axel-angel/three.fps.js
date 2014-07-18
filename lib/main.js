// game state
var state = {};

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

// player
var player = $$.player({ color: 0x0000ff });
player.position.set(0, 0.2, 3.5);
scene.add(player);

// self-body (player)
var selfBody = $$.player({ color: 0x0000ff });
scene.add(selfBody);

// websocket
var ws = new WebSocket("ws://127.0.0.1:8080");
var wsid;
var wsFreq = 1;
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
        data: [camera.position.x, camera.position.y, camera.position.z],
    });
};
ws.onmessage = function (ev) {
    var m = JSON.parse(ev.data);
    switch (m.type) {
        case 'id':
            wsid = m.data
            break;
        case 'state':
            state = m.data;
            break;
    }
    console.log(['ws recv', m]);
};

// rendering / update
var clock = new THREE.Clock();
var t = 0;

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
    selfBody.position.add($$.vec(0, -1, 0.2));

    if (t - wsLast >= wsFreq) {
        wsSendState();
        wsLast = t;
    }

    controls.update(delta);
    renderer.render(scene, camera);
    t += delta;
}
render();
