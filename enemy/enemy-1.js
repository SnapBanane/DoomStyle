import { enemyDeath } from "./enemyDeath.js";
import { rayCastShootFromEnemy } from "./shootingFromEnemy.js";
import { createTurretGun } from "../models/railgun/GunModel.js";

export function aiForEnemy1(scene, x, y, z) {
    const player = scene.getMeshByName("player");

    // Create the gun
    const gun = createTurretGun(scene);
    const enemy = gun.root;
    enemy.name = "enemy";
    enemy.position = new BABYLON.Vector3(x, y + 0.15, z); // Adjusted position since there's no stand
    enemy.scaling = new BABYLON.Vector3(1, 1, 1);
    enemy.isPickable = true; // Make sure the enemy is pickable

    // Create a hitbox mesh for the enemy that covers the entire turret
    const hitBox = BABYLON.MeshBuilder.CreateBox("enemyHitbox", {
        width: 2,
        height: 2,
        depth: 2
    }, scene);
    hitBox.position = new BABYLON.Vector3(0, 0.5, 0);
    hitBox.isVisible = false;
    hitBox.parent = enemy;
    hitBox.isPickable = true;

    // Setup health system
    hitBox.health = 50;  // Set health on hitbox
    hitBox.isHit = false;
    
    // Make the hitbox handle hits directly
    hitBox.onHit = () => {
        if (hitBox.health <= 0) {
            enemy.isDead = true;
        }
    };

    // Make all parts of the turret share the same hit detection
    [enemy, ...gun.gunPivot.getChildMeshes()].forEach(mesh => {
        mesh.hitBox = hitBox;
        mesh.isPickable = true;
    });

    // Add physics to the hitbox
    enemy.physicsBody = new BABYLON.PhysicsAggregate(
        hitBox,
        BABYLON.PhysicsShapeType.BOX,  // Using BOX instead of CONVEX_HULL for better performance
        { mass: 0, restitution: 0.2, friction: 1 },
        scene
    );

    if (player && enemy) {
        let lastRotation = new BABYLON.Vector3(0, 0, 0);
        let timeAccumulator = Math.random() * 2000; // Add random offset to start
        let returnStartTime = 0;
        let returnStartRotation = null;
        const returnDuration = 100; // Time in ms to return to tracking position

        const rotationOnDuration = 3000;    // 3 seconds rotating
        const rotationOffDuration = 500;   // 0.5 second frozen
        const cycleDuration = rotationOnDuration + rotationOffDuration;

        let lastFrameTime = performance.now();
        let midFreezeCalled = false;

        enemy.aiObserver = scene.onBeforeRenderObservable.add(() => {
            if (hitBox.health <= 0) {  // Check hitbox health instead of enemy
                scene.onBeforeRenderObservable.remove(enemy.aiObserver);
                return;
            }

            const now = performance.now();
            const deltaTime = now - lastFrameTime;
            lastFrameTime = now;

            timeAccumulator += deltaTime;
            const cycleTime = timeAccumulator % cycleDuration;

            const isRotating = cycleTime < rotationOnDuration;

            // Rotation logic
            if (isRotating) {
                const direction = player.position.subtract(enemy.position).normalize();
                const yaw = Math.atan2(direction.x, direction.z);
                const pitch = Math.asin(direction.y);  // Calculate pitch based on height difference
                const rot = new BABYLON.Vector3(-pitch, yaw, 0);  // Apply both pitch and yaw
                lastRotation = rot.clone();
                returnStartRotation = null; // Reset return animation

                gun.gunPivot.rotation = rot;

                midFreezeCalled = false;
            } else {
                if (!midFreezeCalled && cycleTime >= 3240 && cycleTime <= 3260) {
                    rayCastShootFromEnemy(scene, gun.gunPivot);
                    midFreezeCalled = true;
                    returnStartTime = now;
                    returnStartRotation = gun.gunPivot.rotation.clone();
                }

                // Smooth return to target rotation
                if (returnStartRotation) {
                    const timeSinceReturn = now - returnStartTime;
                    const progress = Math.min(timeSinceReturn / returnDuration, 1);
                    
                    // Linear interpolation between recoil position and target position
                    const currentRot = new BABYLON.Vector3(
                        BABYLON.Scalar.Lerp(returnStartRotation.x, lastRotation.x, progress),
                        BABYLON.Scalar.Lerp(returnStartRotation.y, lastRotation.y, progress),
                        BABYLON.Scalar.Lerp(returnStartRotation.z, lastRotation.z, progress)
                    );
                    
                    gun.gunPivot.rotation = currentRot;

                    if (progress === 1) {
                        returnStartRotation = null;
                    }
                } else {
                    gun.gunPivot.rotation = lastRotation.clone();
                }
            }

            enemyDeath(hitBox, 50);  // Pass hitbox instead of enemy
        });
    }
}