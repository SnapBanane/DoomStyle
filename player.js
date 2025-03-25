export function setupPlayerControls(scene, player, camera) {
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

    // Move the player in the render loop
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

        if (keys["w"]) player.position.addInPlace(forward.scale(speed)); // Forward
        if (keys["s"]) player.position.addInPlace(forward.scale(-speed)); // Backward
        if (keys["a"]) player.position.addInPlace(right.scale(-speed)); // Left
        if (keys["d"]) player.position.addInPlace(right.scale(speed)); // Right
    });
}