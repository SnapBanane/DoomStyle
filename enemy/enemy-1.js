import { enemyDeath } from "./enemyDeath.js";
import { rayCastShootFromEnemy } from "./shootingFromEnemy.js";

export function aiForEnemy1(scene, x, y, z) {
    const player = scene.getMeshByName("player");

    // BABYLON.SceneLoader.ImportMeshAsync("", "models/railgun/", "railgun_base.glb", scene).then((result) => {
    //     const enemyStand = result.meshes[1]; // Get the root mesh of the model

    //     if (!enemyStand || enemyStand.getTotalVertices() === 0) {
    //         console.error("Error: Imported mesh has no valid geometry.");
    //         return; // Exit if the mesh is invalid
    //     }

    //     enemyStand.name = "enemyStand";
    //     enemyStand.position = new BABYLON.Vector3(x, y, z);
    //     enemyStand.scaling = new BABYLON.Vector3(1, 1, 1); // Adjust scaling if necessary

    //     enemyStand.physicsBody = new BABYLON.PhysicsAggregate(
    //         enemyStand,
    //         BABYLON.PhysicsShapeType.MESH,
    //         { mass: 0, restitution: 0.2, friction: 1 },
    //         scene
    //     );
    // }).catch((error) => {
    //     console.error("Error loading model:", error);
    // });

        BABYLON.SceneLoader.ImportMeshAsync("", "models/railgun/", "railgun_test_2.glb", scene).then((result) => {
            const enemy = result.meshes[1]; // Get the root mesh of the model

            if (!enemy || enemy.getTotalVertices() === 0) {
                console.error("Error: Imported mesh has no valid geometry.");
                return; // Exit if the mesh is invalid
            }

            enemy.name = "enemy";
            enemy.position = new BABYLON.Vector3(x, y, z);
            enemy.scaling = new BABYLON.Vector3(1, 1, 1); // Adjust scaling if necessary

            enemy.physicsBody = new BABYLON.PhysicsAggregate(
                enemy,
                BABYLON.PhysicsShapeType.MESH,
                { mass: 0, restitution: 0.2, friction: 1 },
                scene
            );

            if (player && enemy) {
                let lastRotation = new BABYLON.Vector3(0, 0, 0);
                let timeAccumulator = 0;

                const rotationOnDuration = 3000;    // 3 seconds rotating
                const rotationOffDuration = 1000;   // 1 second frozen
                const cycleDuration = rotationOnDuration + rotationOffDuration;

                let lastFrameTime = performance.now();
                let midFreezeCalled = false;

                enemy.aiObserver = scene.onBeforeRenderObservable.add(() => {
                    if (enemy.isDead) {
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
                        const yaw = -(Math.atan2(direction.z, direction.x) + Math.PI / 2);
                        const rot = new BABYLON.Vector3(0, yaw, 0);
                        lastRotation = rot.clone();

                        // Apply rotation directly to the enemy mesh and its children
                        enemy.rotation = rot;
                        enemy.getChildMeshes().forEach(child => child.rotation = rot.clone());

                        midFreezeCalled = false; // Reset flag for next cycle
                    } else {
                        // Apply last rotation directly to the enemy mesh and its children
                        enemy.rotation = lastRotation.clone();
                        enemy.getChildMeshes().forEach(child => child.rotation = lastRotation.clone());

                        // Check if we are in the middle 1000ms frozen phase (between 3000–4000ms)
                        if (!midFreezeCalled && cycleTime >= 3485 && cycleTime <= 3515) {
                            rayCastShootFromEnemy(scene, enemy);
                            midFreezeCalled = true;
                        }
                    }

                    enemyDeath(enemy, 50);
                });
            }
        }).catch((error) => {
            console.error("Error loading model:", error);
        });
}