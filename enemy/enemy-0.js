import { enemyDeath } from "./enemyDeath.js";
import { damagePlayer } from "../map/GUI.js";

export function aiForEnemy0(scene, x, y, z) {
    const player = scene.getMeshByName("player");
    console.log("aiForEnemy0 called");

    // Create the enemy mesh
    const enemy = BABYLON.MeshBuilder.CreateBox("enemy", { width: 1, height: 1, depth: 1 }, scene);
        enemy.position = new BABYLON.Vector3(x, y, z);
        enemy.physicsBody = new BABYLON.PhysicsAggregate(
            enemy,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 1, restitution: 0.2, friction: 1 },
            scene
        );

    let lastDamageTime = 0;
    const damageCooldown = 500;

    scene.onBeforeRenderObservable.add(() => {
        const direction = player.position.subtract(enemy.position).normalize();

        // Movement and physics
        const enemyBody = enemy.physicsBody?.body;
        if (enemyBody && typeof enemyBody.applyForce === "function") {
            const force = direction.scale(5);
            enemyBody.applyForce(force, enemy.position);
        }

        // Update rotation
        if (enemy.isRotating) {
            const angle = Math.atan2(direction.z, direction.x);
            enemy.rotation.y = -(angle + Math.PI / 2);
        }

        // Ray check for player contact
        const rayOrigin = enemy.position;
        const rayLength = 1.2;
        const ray = new BABYLON.Ray(rayOrigin, direction, rayLength);

        const hit = scene.pickWithRay(ray, mesh => mesh.name === "player");
        if (hit && hit.pickedMesh && hit.pickedMesh.name === "player") {
            const now = Date.now();
            if (now - lastDamageTime >= damageCooldown) {
                damagePlayer(10);
                lastDamageTime = now;
            }
        }

        enemyDeath(enemy, 50);
    });

    if (player && enemy) {
        enemy.isRotating = true;
        enemy.rotation = new BABYLON.Vector3(0, 0, 0);

        scene.onBeforeRenderObservable.add(() => {
            const direction = player.position.subtract(enemy.position).normalize();

            // Movement and physics
            const enemyBody = enemy.physicsBody?.body;
            if (enemyBody && typeof enemyBody.applyForce === "function") {
                const force = direction.scale(5);
                enemyBody.applyForce(force, enemy.position);
            }

            // Update rotation
            if (enemy.isRotating) {
                const angle = Math.atan2(direction.z, direction.x);
                enemy.rotation.y = -(angle + Math.PI / 2);
            }

            // Ray check for player contact
            const rayOrigin = enemy.position;
            const rayLength = 1.2;
            const ray = new BABYLON.Ray(rayOrigin, direction, rayLength);

            const hit = scene.pickWithRay(ray, mesh => mesh.name === "player");
            if (hit && hit.pickedMesh && hit.pickedMesh.name === "player") {
                const now = Date.now();
                if (now - lastDamageTime >= damageCooldown) {
                    damagePlayer(10);
                    lastDamageTime = now;
                }
            }

            enemyDeath(enemy, 50);
        });

        // Add rotation toggle function
        enemy.toggleRotation = () => {
            enemy.isRotating = !enemy.isRotating;
            console.log(`Enemy rotation ${enemy.isRotating ? 'enabled' : 'disabled'}`);
        };
    }
}