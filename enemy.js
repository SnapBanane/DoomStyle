import { rayCastShoot } from "./shooting.js";

export function aiForEnemy(enemy, scene) {
    const player = scene.getMeshByName("player");
    let enemyHealth = 100;

    if (player && enemy) {
        scene.onBeforeRenderObservable.add(() => {
            const direction = player.position.subtract(enemy.position).normalize();

            // Apply force to the enemy's physics body to move it toward the player
            const enemyBody = enemy.physicsBody;
            if (enemyBody) {
                const force = direction.scale(5); // Adjust force magnitude as needed
                enemyBody.applyForce(force, enemy.position);
            }

            // Rotate the enemy to face the player
            const angle = Math.atan2(direction.z, direction.x);
            enemy.rotation.y = angle + Math.PI / 2; // Adjust rotation to face the player

            // Check if the enemy is hit
            const hit = rayCastShoot.hit;
            if (hit && hit.pickedMesh === enemy) {
                enemyHealth -= 10; // Reduce enemy health
                console.log("Enemy hit! Health:", enemyHealth);

                if (enemyHealth <= 0) {
                    console.log("Enemy defeated!");
                    enemy.dispose(); // Remove the enemy from the scene
                }

                // Reset the hit to avoid multiple detections
                rayCastShoot.hit = null;
            }
        });
    }
}