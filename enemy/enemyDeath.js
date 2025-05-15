export function enemyDeath(enemy, enemyHealth) {
    if (enemy.isHit) {
        if (enemy.health === undefined) {
            enemy.health = enemyHealth; 
        }

        enemy.health -= 10;
        console.log("Enemy health:", enemy.health);

        if (enemy.health <= 0) {
            console.log("Enemy defeated!");

            enemy.isDead = true;
            enemy.dispose();
        }

        enemy.isHit = false;
    }
}
