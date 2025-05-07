import { enemyDeath } from "./enemyDeath.js";

export function aiForEnemy0(enemy, scene) {
    const player = scene.getMeshByName("player");
    console.log("aiForEnemy0 called");

    if (player && enemy) {
        // Add rotation control
        enemy.isRotating = true;
        enemy.rotation = new BABYLON.Vector3(0, 0, 0);

        scene.onBeforeRenderObservable.add(() => {
            const direction = player.position.subtract(enemy.position).normalize();

            // Movement code remains unchanged
            const enemyBody = enemy.physicsBody?.body;
            if (enemyBody && typeof enemyBody.applyForce === "function") {
                const force = direction.scale(5);
                enemyBody.applyForce(force, enemy.position);
            }

            // Rotation only happens if isRotating is true
            if (enemy.isRotating) {
                const angle = Math.atan2(direction.z, direction.x);
                enemy.rotation.y = -(angle + Math.PI / 2);
            }

            enemyDeath(scene, enemy);
        });

        // Add rotation toggle function
        enemy.toggleRotation = () => {
            enemy.isRotating = !enemy.isRotating;
            console.log(`Enemy rotation ${enemy.isRotating ? 'enabled' : 'disabled'}`);
        };
    }
}