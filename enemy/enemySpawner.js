import { aiForEnemy } from './enemy-0.js';

export function enemySpawn(scene, triggerMeshName) {
    const triggerMesh = scene.getMeshByName(triggerMeshName);

    if (!triggerMesh) {
        console.error(`Trigger mesh with name "${triggerMeshName}" not found.`);
        return;
    }

    triggerMesh.actionManager = new BABYLON.ActionManager(scene);

    // Set up an action to spawn an enemy when the trigger mesh is hit
    triggerMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnIntersectionEnterTrigger,
            (event) => {
                const enemy = spawnEnemy(scene);
                console.log("Enemy spawned due to trigger mesh hit.");
            }
        )
    );
}

function spawnEnemy(scene) {
    // Use MeshBuilder to create the enemy
    const enemy = BABYLON.MeshBuilder.CreateBox("enemy", { width: 1, height: 1, depth: 1 }, scene);
    enemy.position = new BABYLON.Vector3(
        Math.random() * 50 - 25, // Adjusted X-axis range
        1,                      // Ground level
        Math.random() * 50 - 25 // Adjusted Z-axis range
    ); // Random spawn position
    enemy.physicsBody = new BABYLON.PhysicsAggregate(
        enemy,
        BABYLON.PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.2, friction: 1 },
        scene
    );

    // Initialize onDeathObservable if not already defined
    if (!enemy.onDeathObservable) {
        enemy.onDeathObservable = new BABYLON.Observable();
    }

    aiForEnemy(enemy, scene);
    return enemy;
}

function enemyIsAlive(enemy) {
    return enemy && !enemy.isDead; // Check if the enemy is alive
}

function onEnemyDeath(enemy, callback) {
    // Ensure the callback is triggered when the enemy dies
    if (enemy.onDeathObservable) {
        enemy.onDeathObservable.addOnce(() => {
            callback();
        });
    } else {
        // Fallback: Check periodically if the enemy is dead
        const interval = setInterval(() => {
            if (!enemyIsAlive(enemy)) {
                clearInterval(interval);
                callback();
            }
        }, 100);
    }
}