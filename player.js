import { rayCastShoot } from "./shooting.js";
import { GUI, switchFrame } from "./map/GUI.js";

function setupPlayerControls(scene, player, camera) {

    // init GUI for player
    const { advancedTexture, gunImage, frames } = GUI(scene);

    //define shooting cooldown
    const shootCooldown = 250; // 250 milliseconds
    let lastShootTime = Date.now() - shootCooldown;

    scene.collisionsEnabled = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 0.9, 1); 
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
        if(document.pointerLockElement && Date.now() - lastShootTime > shootCooldown) {
            rayCastShoot(scene, camera);
            switchFrame(gunImage, frames);
            lastShootTime = Date.now();
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

        // horizontal movement
        if (keys["KeyW"]) {
            moveDirection.addInPlace(forward);
        }
        if (keys["KeyS"]) {
            moveDirection.subtractInPlace(forward);
        }
        if (keys["KeyA"]) {
            moveDirection.subtractInPlace(right);
        }
        if (keys["KeyD"]) {
            moveDirection.addInPlace(right);
        }

        // Check if the player is on the ground
        if (isPlayerOnGround(player)) {
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

        camera.position = player.position.add(new BABYLON.Vector3(0, 0.5, 0));
        camera.rotation.Quaternion = camera.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(yaw, pitch, 0);
    });
}


function isPlayerOnGround(player) {
    const scene = player.getScene();
    const rayLength = 0.8;
    const footRadius = 2; // How far from center to check (adjust as needed)
    const rayOrigin = player.position.clone();
    const directions = [
        BABYLON.Vector3.Down(), // straight down
        new BABYLON.Vector3(footRadius, 0, 0).normalize().add(BABYLON.Vector3.Down()).normalize(),
        new BABYLON.Vector3(-footRadius, 0, 0).normalize().add(BABYLON.Vector3.Down()).normalize(),
        new BABYLON.Vector3(0, 0, footRadius).normalize().add(BABYLON.Vector3.Down()).normalize(),
        new BABYLON.Vector3(0, 0, -footRadius).normalize().add(BABYLON.Vector3.Down()).normalize()
    ];

    for (const dir of directions) {
        const ray = new BABYLON.Ray(rayOrigin, dir, rayLength);
        const hit = scene.pickWithRay(ray, mesh =>
            mesh !== player && mesh.isPickable);
        if (hit.hit && hit.getNormal && hit.getNormal().y > 0.5) {
            // Only count as ground if the surface is not too steep (prevents wall jumps)
            return true;
        }
    }
    return false;
}

function checkClip(player, camera, scene, baseDirection, offsets) { // deprecated function but could be used for hit detection on enemys if too close
    const rayLength = 1;
    const rayOrigin = new BABYLON.Vector3(
        player.position.x,
        player.position.y + camera.ellipsoidOffset.y,
        player.position.z
    );

    function rotateVector(vector, angle) {
        const radians = BABYLON.Tools.ToRadians(angle);
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        return new BABYLON.Vector3(
            vector.x * cos - vector.z * sin,
            vector.y,
            vector.x * sin + vector.z * cos
        );
    }

    for (const offset of offsets) {
        for (let i = 0; i < 20; i++) {
            const angleOffset = offset + (i - 10) * 10;
            const direction = rotateVector(baseDirection, angleOffset);
            const ray = new BABYLON.Ray(rayOrigin, direction, rayLength);

            const hit = scene.pickWithRay(ray, (mesh) => mesh !== player && mesh !== camera && !mesh.isRayLine);
            if (hit.hit && hit.distance < rayLength) {
                //console.log(`Obstacle detected at distance: ${hit.distance}, Offset: ${angleOffset}`);
                //console.log("Hit point:", hit.pickedPoint);
                //console.log("Hit mesh name:", hit.pickedMesh?.name);
                return true;
            }
        }
    }

    return false;
}

export { setupPlayerControls };