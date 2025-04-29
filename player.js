import { rayCastShoot } from "./shooting.js";

export function setupPlayerControls(scene, player, camera) {
    scene.collisionsEnabled = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1); 
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.5, 0);

    //init the physics body
    const playerBody = player.physicsBody;
    const moveForce = 5;
    let keys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false, Space: false};

    if (!playerBody) {
        console.error("Player body is undefined!");
        return;
    }

    //set some parameters for physicsbody
    playerBody.setMassProperties({ inertia: BABYLON.Vector3.Zero() });
    playerBody.setAngularVelocity(BABYLON.Vector3.Zero());
    playerBody.setAngularDamping(1);
    playerBody.setLinearDamping(1);

    const canvas = scene.getEngine().getRenderingCanvas();
    canvas.addEventListener('click', () => {
        if (!document.pointerLockElement) {
            canvas.requestPointerLock();
        }
        if(document.pointerLockElement) {
            rayCastShoot(scene, camera);
        }
    });

    canvas.style.cursor = 'none';

    //listen for incoming keys and store them in the keys object
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
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE && document.pointerLockElement) {

            yaw += event.movementX * sensitivity; 
            pitch +=event.movementY * sensitivity;

            pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (!playerBody) return;

        const forward = new BABYLON.Vector3(
            Math.sin(yaw),
            0,
            Math.cos(yaw)
        ).normalize();

        const right = BABYLON.Vector3.Cross(BABYLON.Axis.Y, forward).normalize();

        let moveDirection = BABYLON.Vector3.Zero();

        // Check for obstacles and handle horizontal movement
        if (keys["KeyW"] && !checkClip(player, camera, scene, forward, [0])) {
            moveDirection.addInPlace(forward);
        }
        if (keys["KeyS"] && !checkClip(player, camera, scene, forward.scale(-1), [0])) {
            moveDirection.subtractInPlace(forward);
        }
        if (keys["KeyA"] && !checkClip(player, camera, scene, right.scale(-1), [0])) {
            moveDirection.subtractInPlace(right);
        }
        if (keys["KeyD"] && !checkClip(player, camera, scene, right, [0])) {
            moveDirection.addInPlace(right);
        }

        // Check if the player is on the ground
        if (isPlayerOnGround(playerBody)) {
            if (keys["Space"]) {
                playerBody.setLinearVelocity(new BABYLON.Vector3(0, 5, 0));
            }
        }

        const currentVelocity = playerBody.getLinearVelocity();

        const verticalVelocity = currentVelocity.y;

        const horizontalDirection = new BABYLON.Vector3(moveDirection.x, 0, moveDirection.z);
        if (!horizontalDirection.equals(BABYLON.Vector3.Zero())) {
            horizontalDirection.normalize().scaleInPlace(moveForce);
        }

        moveDirection = new BABYLON.Vector3(horizontalDirection.x, verticalVelocity, horizontalDirection.z);

        // Apply the final velocity to the player
        playerBody.setLinearVelocity(moveDirection);

        // Dynamically calculate the camera offset to always stay behind the player
        camera.position = player.position.add(new BABYLON.Vector3(0, 0.5, 0));
        camera.rotation.Quaternion = camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, 0);
    });

    function isPlayerOnGround(playerBody) {
        const velocity = playerBody.getLinearVelocity();
        return Math.abs(velocity.y) < 0.01;
    }
}

function checkClip(player, camera, scene, baseDirection, offsets) {
    const rayLength = 1.25; // Adjust the length of the rays as needed
    const rayOrigin = new BABYLON.Vector3(
        player.position.x,
        player.position.y + camera.ellipsoidOffset.y, // Adjust height to match the player's position
        player.position.z
    );

    // Helper function to rotate a vector by a given angle around the Y-axis
    function rotateVector(vector, angle) {
        const radians = BABYLON.Tools.ToRadians(angle);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        return new BABYLON.Vector3(
            vector.x * cos - vector.z * sin,
            vector.y, // Keep the y component unchanged
            vector.x * sin + vector.z * cos
        );
    }

    for (const offset of offsets) {
        for (let i = 0; i < 10; i++) {
            const angleOffset = offset + (i - 5) * 5; // Spread rays around the base offset
            const direction = rotateVector(baseDirection, angleOffset);
            const ray = new BABYLON.Ray(rayOrigin, direction, rayLength);

            // Check for collisions, excluding the player's mesh, camera, and ray lines
            const hit = scene.pickWithRay(ray, (mesh) => mesh !== player && mesh !== camera && !mesh.isRayLine);
            if (hit.hit && hit.distance < rayLength) {
                console.log(`Obstacle detected at distance: ${hit.distance}, Offset: ${angleOffset}`);
                console.log("Hit point:", hit.pickedPoint);
                console.log("Hit mesh name:", hit.pickedMesh?.name);
                return true; // Obstacle detected
            }
        }
    }

    return false; // No obstacles detected
}