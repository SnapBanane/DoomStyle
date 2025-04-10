import { enemyDeath } from "./enemyDeath.js";

export function aiForEnemy(enemy, scene) {
    const player = scene.getMeshByName("player");

    if (player && enemy) {
        scene.onBeforeRenderObservable.add(() => {
            const direction = player.position.subtract(enemy.position).normalize();

            // Ensure physicsBody is valid and supports applyForce
            const enemyBody = enemy.physicsBody?.body; // Access the underlying physics body
            if (enemyBody && typeof enemyBody.applyForce === "function") {
                const force = direction.scale(5); // Adjust force magnitude as needed
                enemyBody.applyForce(force, enemy.position);
            }

            enemyDeath(scene, enemy);

            const angle = Math.atan2(direction.z, direction.x);
            enemy.rotation.y = angle + Math.PI / 2;
        });
    }
}