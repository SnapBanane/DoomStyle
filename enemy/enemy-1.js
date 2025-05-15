import { enemyDeath } from "./enemyDeath.js";
import { rayCastShootFromEnemy } from "./shootingFromEnemy.js"

export function aiForEnemy1(enemy, scene) {
    const player = scene.getMeshByName("player");

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
                const newRotation = new BABYLON.Vector3(0, -(Math.atan2(direction.z, direction.x) + Math.PI / 2), 0);
                lastRotation = newRotation.clone();
                enemy.rotation = newRotation;

                midFreezeCalled = false; // Reset flag for next cycle
            } else {
                enemy.rotation = lastRotation.clone();

                // Check if we are in the middle 1000ms frozen phase (between 3000–4000ms)
                // and if we are around 3500ms (±30ms to account for frame gaps)
                if (!midFreezeCalled && cycleTime >= 3485 && cycleTime <= 3515) {
                    rayCastShootFromEnemy(scene, enemy);
                    midFreezeCalled = true;
                }
            }

            enemyDeath(enemy, 50);
        });
    }
}