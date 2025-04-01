import { rayCastShoot } from "./shooting.js";

export function aiForEnemy(enemy, scene) {
    // AI logic for enemy movement and actions
    const player = scene.getMeshByName("player");
    const hit = rayCastShoot.hit;

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
        });
    }

    // Example of shooting logic
    if (Math.random() < 0.01) { // Adjust shooting probability
        rayCastShoot(scene, enemy.position);
    }
    // Example of health reduction
    if (hit && hit.pickedMesh) {
        if (hit.pickedMesh.name === "player") {
            enemyHealth -= 10; // Reduce enemy health
            console.log("Enemy hit! Health:", enemyHealth);
        }
    }

    if (enemyHealth <= 0) {
        enemy.dispose();
    }
}