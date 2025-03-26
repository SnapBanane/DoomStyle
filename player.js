export function setupPlayerControls(scene, player, camera) {
    // Enable Babylon.js built-in collisions
    player.checkCollisions = true;
    player.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5); // Adjust for box shape
    player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

    // Movement variables
    const speed = 0.1;
    const keys = {};

    // Mouse look sensitivity
    const sensitivity = 0.002;
    let yaw = 0;
    let pitch = 0;

    // Prevent camera roll by using quaternions
    camera.rotationQuaternion = BABYLON.Quaternion.Identity();

    // Position the camera above the player for first-person view
    const cameraOffset = new BABYLON.Vector3(0, 1.5, 0); // Camera positioned slightly above the player

    // Mouse movement for first-person view (yaw & pitch)
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
            yaw += pointerInfo.event.movementX * sensitivity;  // Invert yaw direction (left-right)
            pitch += pointerInfo.event.movementY * sensitivity;  // Invert pitch direction (up-down)

            // Limit vertical rotation to prevent flipping
            pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

            // Apply rotation to camera (yaw and pitch only)
            camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, 0);
        }
    });

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
        // Get forward and right direction vectors from camera rotation (yaw only)
        const forward = new BABYLON.Vector3(
            Math.sin(yaw), 
            0, 
            Math.cos(yaw)
        ).normalize();
        const right = BABYLON.Vector3.Cross(BABYLON.Axis.Y, forward).normalize();

        let movement = new BABYLON.Vector3(0, 0, 0);
        if (keys["w"]) movement.addInPlace(forward.scale(speed)); // Forward
        if (keys["s"]) movement.addInPlace(forward.scale(-speed)); // Backward
        if (keys["a"]) movement.addInPlace(right.scale(-speed)); // Left
        if (keys["d"]) movement.addInPlace(right.scale(speed)); // Right

        // Move player with collisions
        player.moveWithCollisions(movement);

        // Update camera position to follow player without inheriting rotation
        camera.position = player.position.add(cameraOffset);

        // Ensure camera rotation is independent of the player (yaw and pitch)
        camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, 0);
    });

    // Lock pointer for FPS-style camera movement
    const canvas = scene.getEngine().getRenderingCanvas(); // Get the rendering canvas
    canvas.addEventListener('click', () => {
        // Only enter pointer lock on mouse click
        if (!document.pointerLockElement) {
            canvas.requestPointerLock(); // Lock pointer
        }
    });

    // Event listener to unlock pointer if needed (for example, pressing "Esc")
    window.addEventListener("keydown", (event) => {
        if (event.code === "Escape") {
            document.exitPointerLock();
        }
    });

    // Optionally hide cursor when pointer is locked
    canvas.style.cursor = 'none';

    // Optional cleanup: Ensure pointer lock is exited when scene ends
    scene.onDispose = () => {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    };

    // Camera rotation independent of the cube
    camera.parent = null; // Ensure the camera is not parented to the cube (to prevent roll)

    // Prevent camera from going below the player or showing the cube
    camera.minZ = 0.1; // Set minimum camera distance to avoid clipping with the player (and cube)
}
