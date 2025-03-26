export function setupPlayerControls(scene, player, camera) {
    const playerBody = player.physicsBody; // FIX: Correct way to get physics body
    const moveForce = 5;
    let keys = { w: false, a: false, s: false, d: false };

    if (!playerBody) {
        console.error("Player body is undefined!");
        return;
    }

    // Prevent rolling
    playerBody.setMassProperties({ inertia: BABYLON.Vector3.Zero() });
    playerBody.setAngularVelocity(BABYLON.Vector3.Zero()); // Stop spinning
    playerBody.setAngularDamping(1); // Smooth rotation stopping
    playerBody.setLinearDamping(0.9); // Smooth movement stopping

    // Enable pointer lock on click
    const canvas = scene.getEngine().getRenderingCanvas();
    canvas.addEventListener("click", () => {
        canvas.requestPointerLock();
    });

    // Handle keyboard input
    window.addEventListener("keydown", (event) => {
        if (keys.hasOwnProperty(event.key)) keys[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
        if (keys.hasOwnProperty(event.key)) keys[event.key] = false;
    });

    // Handle mouse movement for camera rotation
    let yaw = 0;
    let pitch = 0;
    window.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement === canvas) {
            const sensitivity = 0.002;
            yaw += event.movementX * sensitivity;
            pitch += event.movementY * sensitivity;

            // Limit up/down rotation to prevent flipping
            pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

            camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, 0);
        }
    });

    // Movement logic
    scene.onBeforeRenderObservable.add(() => {
        if (!playerBody) return;

        // Get forward and right vectors from the camera
        const forward = new BABYLON.Vector3(
            Math.sin(yaw),
            0,
            Math.cos(yaw)
        ).normalize();

        const right = BABYLON.Vector3.Cross(BABYLON.Axis.Y, forward).normalize();

        let moveDirection = BABYLON.Vector3.Zero();

        if (keys["w"]) moveDirection.addInPlace(forward);
        if (keys["s"]) moveDirection.subtractInPlace(forward);
        if (keys["a"]) moveDirection.subtractInPlace(right);
        if (keys["d"]) moveDirection.addInPlace(right);

        if (!moveDirection.equals(BABYLON.Vector3.Zero())) {
            moveDirection.normalize().scaleInPlace(moveForce);
            playerBody.setLinearVelocity(moveDirection); // Apply force directly
        }
    });
}
