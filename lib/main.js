var cam_fov = 75;
var cam_ratio = window.innerWidth / window.innerHeight;
var cam_near = 0.1;
var cam_far = 1000;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(cam_fov, cam_ratio, cam_near, cam_far);
camera.position.z = 5;
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ambient light
var ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// down spot light
var directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// ground
var ground = $$.box({ x:100, y:100, z: 1, color: 0x999999 });
ground.position.set(0, 0, 0);
scene.add(ground);

// box
var cube = $$.box({ x:1, y:1, z:1, color: 0x999999 });
cube.position.set(0, 0, 1);
scene.add(cube);

// player
var player = $$.player({ color: 0x0000ff });
scene.player;

var t = 0;

function render() {
    requestAnimationFrame(render);
    cube.rotation.y += 0.01;
    cube.position.y = 0.2*Math.sin(t/15);
    renderer.render(scene, camera);
    ++t;
}
render();
