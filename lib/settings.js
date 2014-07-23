var $s = {
    port: 3000,
    wsFreq: 1.0,
    moveSlowSpeed: 1.5,
    moveFastSpeed: 3.0,
    mouseSensitivity: 1,
    spectateHeight: 20.0,
    camera: {
        height: 1.0,
        fov: 75,
        near: 0.1,
        far: 1000,
    },
    map: {
        wallHeight: 3,
        wallWidth: 1.0,
        wallThick: 0.1,
        wallColor: 0x999999,
        seedMax: 1 << 20,
        roomMin: 5,
        roomMax: 10,
        roomHole: 2,
    },
};

exports._ = $s;
