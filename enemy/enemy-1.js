import { enemyDeath } from "./enemyDeath.js";

export function aiForEnemy1(enemy, scene) {
    const player = scene.getMeshByName("player");
    
    if (player && enemy) {
        // Store initial rotation values
        const initialRotation = new BABYLON.Vector3(0, 0, 0);
        enemy.rotation = initialRotation;
        enemy.isRotating = true; // Add rotation flag

        // Use the scene's observable instead of creating new ones
        scene.onBeforeRenderObservable.add(() => {
            if (enemy.isRotating) {
                const direction = player.position.subtract(enemy.position).normalize();
                enemy.rotation.y = -(Math.atan2(direction.z, direction.x) + Math.PI / 2);
            }
            enemyDeath(scene, enemy);
        });

        // Add global function to stop/start rotation for this enemy
        enemy.toggleRotation = () => {
            enemy.isRotating = !enemy.isRotating;
            console.log(`Enemy rotation ${enemy.isRotating ? 'enabled' : 'disabled'}`);
        };
    }
}