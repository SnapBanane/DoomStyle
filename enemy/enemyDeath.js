import { openDoorsIfRoomCleared } from "../map/enemyRoomHandler.js";
import { allEnemyMeshes, allDoorMeshes } from "../init.js";
import { writeDEBUG, writeLOG } from "../DevKit/niceLogs.js";

export async function enemyDeath(enemy, enemyHealth) {
  if (enemy.isHit) {
    if (enemy.health === undefined) {
      enemy.health = enemyHealth;
    }

    enemy.health -= 10;

    if (enemy.health <= 0) {
      try {
        // Special case: enemy0 is a simple mesh with no parent or gunPivot
        if (!enemy.parent && enemy.name === "enemy") {
          if (enemy.physicsBody) {
            enemy.physicsBody.dispose();
          }
          enemy.dispose();
        } else {
          // Find the gunPivot node that contains all the gun parts
          const rootEnemy = enemy.parent ? enemy.parent : enemy;
          const gunPivot = rootEnemy
            .getChildTransformNodes()
            .find((node) => node.name === "gunPivot");

          if (gunPivot) {
            // Dispose all gun parts but keep the base
            gunPivot.getChildMeshes().forEach((mesh) => {
              if (mesh.physicsBody) {
                mesh.physicsBody.dispose();
              }
              mesh.dispose();
            });
            gunPivot.dispose();
          }
        }
      } catch (error) {
        // Cleanup error ignored
      }

      enemy.isDead = true;
      writeDEBUG("enemyDeath", {
        id: enemy.id,
        gameId: enemy.gameId,
        isDead: enemy.isDead,
        health: enemy.health,
        position: enemy.position,
        name: enemy.name,
      });

      openDoorsIfRoomCleared(allEnemyMeshes, allDoorMeshes);

      // --- Use gameId instead of id ---
      const lookupId = enemy.gameId !== undefined ? enemy.gameId : enemy.id;
      if (lookupId !== undefined) {
        try {
          const res = await fetch("/map/wallData");
          if (!res.ok) throw new Error("Failed to load map data");
          const mapData = await res.json();

          const mapEnemy = (mapData.enemies || []).find(
            (e) => e.id == lookupId,
          );
          if (mapEnemy) {
            mapEnemy.alive = false;

            writeDEBUG("enemyDeath mapData update", {
              lookupId,
              mapEnemy,
              mapDataEnemies: mapData.enemies,
            });

            const saveRes = await fetch("/map/wallData", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(mapData, null, 2),
            });
            if (!saveRes.ok) throw new Error("Failed to save map data");

            // --- Synchronize mesh state with map data ---
            enemy.alive = false;
            enemy.isDead = true;
          } else {
            writeDEBUG("enemyDeath", `No mapEnemy found for id ${lookupId}`);
          }
        } catch (err) {
          writeDEBUG("enemyDeath", `Server update error: ${err}`);
        }
      }
    }

    enemy.isHit = false;
  }
}
