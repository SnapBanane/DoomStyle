export function setupPlayerControls(scene, player, camera) {
    const playerBody = player.physicsBody;
    const moveForce = 5;
    let keys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, Space: false};

    if (!playerBody) {
        console.error("Player body is undefined!");
        return;
    }

    playerBody.setMassProperties({ inertia: BABYLON.Vector3.Zero() });
    playerBody.setAngularVelocity(BABYLON.Vector3.Zero());
    playerBody.setAngularDamping(1);
    playerBody.setLinearDamping(1);

    const canvas = scene.getEngine().getRenderingCanvas();
    canvas.addEventListener('click', () => {
        if (!document.pointerLockElement) {
            canvas.requestPointerLock();
        }
    });

    canvas.style.cursor = 'none';

    window.addEventListener("keydown", (event) => {
        if (keys.hasOwnProperty(event.code)) keys[event.code] = true;
    });

    window.addEventListener("keyup", (event) => {
        if (keys.hasOwnProperty(event.code)) keys[event.code] = false;
    });

    const sensitivity = 0.002002;
    let yaw = 0;
    let pitch = 0;

    camera.rotationQuaternion = BABYLON.Quaternion.Identity();

    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
            //yaw += pointerInfo.event.movementX * sensitivity;  // Invert yaw direction (left-right)
            //pitch += pointerInfo.event.movementY * sensitivity;  // Invert pitch direction (up-down)

            yaw += event.movementX * sensitivity; 
            pitch +=event.movementY * sensitivity;

            pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
        }
    });

    let isJumping = false;
    scene.onBeforeRenderObservable.add(() => {
        if (!playerBody) return;

        const forward = new BABYLON.Vector3(
            Math.sin(yaw),
            0,
            Math.cos(yaw)
        ).normalize();

        const up = new BABYLON.Vector3(0, 1, 0).normalize();

        const right = BABYLON.Vector3.Cross(BABYLON.Axis.Y, forward).normalize();

        let moveDirection = BABYLON.Vector3.Zero();

        // Handle horizontal movement
        if (keys["KeyW"]) moveDirection.addInPlace(forward);
        if (keys["KeyS"]) moveDirection.subtractInPlace(forward);
        if (keys["KeyA"]) moveDirection.subtractInPlace(right);
        if (keys["KeyD"]) moveDirection.addInPlace(right);

        // Check if the player is on the ground
        if (isPlayerOnGround(playerBody)) {
            if (keys["Space"]) {
                console.log("Jumping!");
                // playerBody.applyImpulse(new BABYLON.Vector3(0, 10, 0), player.position);
                playerBody.setLinearVelocity(new BABYLON.Vector3(0, 5, 0));
            }
        }

        const currentVelocity = playerBody.getLinearVelocity();

        const verticalVelocity = currentVelocity.y;

        const horizontalDirection = new BABYLON.Vector3(moveDirection.x, 0, moveDirection.z);
        if (!horizontalDirection.equals(BABYLON.Vector3.Zero())) {
            horizontalDirection.normalize().scaleInPlace(moveForce);
        }

        // Combine horizontal movement with vertical velocity
        moveDirection = new BABYLON.Vector3(horizontalDirection.x, verticalVelocity, horizontalDirection.z);

        // Apply the final velocity to the player
        playerBody.setLinearVelocity(moveDirection);

        // Update the camera position and rotation
        camera.position = player.position.add(new BABYLON.Vector3(0, 1, 0));
        camera.rotation.Quaternion = camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, 0);
    });

    // Helper function to check if the player is on the ground
    function isPlayerOnGround(playerBody) {
        const velocity = playerBody.getLinearVelocity();
        return Math.abs(velocity.y) < 0.01; // Adjust threshold as needed
    }
}
