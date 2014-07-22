var $s = {
    port: 3000,
    wsFreq: 1.0,
    movementSpeed: 1.0,
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
        roomMax: 5,
    },
};

exports._ = $s;
