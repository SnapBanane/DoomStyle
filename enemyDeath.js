// This function handles the enemy's death logic

export function enemyDeath(scene, enemy) {
    if (enemy.isHit) {
        // Reduce enemy health
        if (!enemy.health) {
            enemy.health = 100; // Initialize health if not already set
        }

        enemy.health -= 10; // Reduce health
        console.log("Enemy health:", enemy.health);

        if (enemy.health <= 0) {
            console.log("Enemy defeated!");
            enemy.dispose(); // Remove the enemy from the scene
        }

        // Reset the isHit flag to avoid multiple detections
        enemy.isHit = false; // Ensure this property is writable
    }
}