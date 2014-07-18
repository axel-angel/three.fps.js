var cam_fov = 75;
var cam_ratio = window.innerWidth / window.innerHeight;
var cam_near = 0.1;
var cam_far = 1000;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(cam_fov, cam_ratio, cam_near, cam_far);
camera.position.set(0, 3, 5);
camera.rotateX(-Math.PI/6);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// shadow map
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFShadowMap;

// ambient light
var ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// down spot light
var light = new THREE.DirectionalLight(0xffffff, 1);
//var light = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2, 1);
light.position.set(0, 25, 0);
light.target.position.set(0, 0, 0);
light.castShadow = true;
light.shadowDarkness = 0.5;
light.shadowCameraRight = 50;
light.shadowCameraLeft = -50;
light.shadowCameraTop = 50;
light.shadowCameraBottom = -50;
light.shadowMapWidth = 1024;
light.shadowMapHeight = 1024;
light.shadowCameraNear = 0.1;
light.shadowCameraFar = 1000;
light.shadowCameraFov = 30;
scene.add(light);

// ground
var ground = $$.box({ x:100, y:1, z:100, color: 0x999999 });
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
//var player = $$.player({ color: 0x0000ff });
//scene.player;

var t = 0;

function render() {
    requestAnimationFrame(render);
    cube.rotation.y += 0.01;
    cube.position.x = 2 * Math.sin(t/50);
    cube.position.y = 2 + 0.5 * Math.sin(t/15);
    renderer.render(scene, camera);
    ++t;
}
render();
