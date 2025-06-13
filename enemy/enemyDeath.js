export function enemyDeath(enemy, enemyHealth) {
    if (enemy.isHit) {
        if (enemy.health === undefined) {
            enemy.health = enemyHealth;
        }
        
        enemy.health -= 10;
        console.log("Enemy health:", enemy.health);

        if (enemy.health <= 0) {
            console.log("Enemy defeated!");

            try {
                // Find the gunPivot node that contains all the gun parts
                const rootEnemy = enemy.parent ? enemy.parent : enemy;
                const gunPivot = rootEnemy.getChildTransformNodes().find(node => node.name === "gunPivot");

                if (gunPivot) {
                    // Dispose all gun parts but keep the base
                    gunPivot.getChildMeshes().forEach(mesh => {
                        if (mesh.physicsBody) {
                            mesh.physicsBody.dispose();
                        }
                        mesh.dispose();
                    });
                    gunPivot.dispose();
                }

            } catch (error) {
                console.warn("Error during enemy cleanup:", error);
            }

            enemy.isDead = true;
        }

        enemy.isHit = false;
    }
}
