import { enemyDeath } from "./enemyDeath.js";

export function aiForEnemy(enemy, scene) {
    const player = scene.getMeshByName("player");

    if (player && enemy) {
        scene.onBeforeRenderObservable.add(() => {
            const direction = player.position.subtract(enemy.position).normalize();

            // Apply force to the enemy's physics body to move it toward the player
            const enemyBody = enemy.physicsBody;
            if (enemyBody) {
                const force = direction.scale(5); // Adjust force magnitude as needed
                enemyBody.applyForce(force, enemy.position);
            }

            enemyDeath(scene, enemy); // Check for enemy death

            // Rotate the enemy to face the player
            const angle = Math.atan2(direction.z, direction.x);
            enemy.rotation.y = angle + Math.PI / 2; // Adjust rotation to face the player
            }
        );
    }
}