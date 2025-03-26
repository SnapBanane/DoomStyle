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

        const up = new BABYLON.Vector3(
            0,
            1,
            0
        ).normalize();

        const right = BABYLON.Vector3.Cross(BABYLON.Axis.Y, forward).normalize();

        let moveDirection = BABYLON.Vector3.Zero();

        if (keys["KeyW"]) moveDirection.addInPlace(forward);
        if (keys["KeyS"]) moveDirection.subtractInPlace(forward);
        if (keys["KeyA"]) moveDirection.subtractInPlace(right);
        if (keys["KeyD"]) moveDirection.addInPlace(right);

        if (keys["Space"] && !isJumping) {
            moveDirection.addInPlace(up);
            isJumping = true;
        }

        if(isPlayerOnGround(playerBody)) isJumping = false;

        if(!isJumping && moveDirection.y <= 0) {
            moveDirection.subtractInPlace(new BABYLON.Vector3(0, 9.81, 0));
        }

        /*
        const anyKeyPressed = Object.values(keys).some(value => value === true);
        if (!anyKeyPressed) {
            moveDirection = BABYLON.Vector3.Zero();
        }
        */

        if (!moveDirection.equals(BABYLON.Vector3.Zero())) {
            moveDirection.normalize().scaleInPlace(moveForce);
            playerBody.setLinearVelocity(moveDirection); // Apply force directly
        }

        camera.position = player.position.add(new BABYLON.Vector3(0,1,0));
        camera.rotation.Quaternion = camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, 0);
    });

    function isPlayerOnGround(playerBody) {
        const velocity = playerBody.getLinearVelocity();

        return Math.abs(velocity.y) < 0.01;
    }
}
