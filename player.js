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
        const cameraOffset = forward.scale(-0.5).add(new BABYLON.Vector3(0, 0.5, 0)); // 2 units behind and 0.5 units above
        camera.position = player.position.add(cameraOffset);

        // Update the camera rotation
        camera.rotation.Quaternion = camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, 0);
    });

    function isPlayerOnGround(playerBody) {
        const velocity = playerBody.getLinearVelocity();
        return Math.abs(velocity.y) < 0.01;
    }
}
