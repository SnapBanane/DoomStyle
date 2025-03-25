export function setupPlayerControls(scene, player, camera) {
    // Enable Babylon.js built-in collisions
    player.checkCollisions = true;
    player.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

    // Movement variables
    const speed = 0.1;
    const keys = {};

    // Detect keyboard inputs
    scene.onKeyboardObservable.add((kbInfo) => {
        const key = kbInfo.event.key.toLowerCase();
        if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
            keys[key] = true;
        } else if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYUP) {
            keys[key] = false;
        }
    });

    // Move the player in the render loop with collisions
    scene.onBeforeRenderObservable.add(() => {
        const forward = new BABYLON.Vector3(
            Math.sin(camera.rotation.y) * Math.cos(camera.rotation.x),
            -Math.sin(camera.rotation.x),
            Math.cos(camera.rotation.y) * Math.cos(camera.rotation.x)
        );
        const right = new BABYLON.Vector3(
            Math.sin(camera.rotation.y + Math.PI / 2),
            0,
            Math.cos(camera.rotation.y + Math.PI / 2)
        );

        let movement = new BABYLON.Vector3(0, 0, 0);
        if (keys["w"]) movement.addInPlace(forward.scale(speed)); // Forward
        if (keys["s"]) movement.addInPlace(forward.scale(-speed)); // Backward
        if (keys["a"]) movement.addInPlace(right.scale(-speed)); // Left
        if (keys["d"]) movement.addInPlace(right.scale(speed)); // Right

        // Save previous position
    let previousPosition = player.position.clone();

    // Move player with collisions
    player.moveWithCollisions(movement);

    // Check if movement was blocked
    if (!player.position.equalsWithEpsilon(previousPosition, 0.001)) {
        console.log("Collision detected!");
        // Do something, like stop movement, play a sound, etc.
    }
    });
}
