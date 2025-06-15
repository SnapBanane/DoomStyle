export async function enemyDeath(enemy, enemyHealth) {
  if (enemy.isHit) {
    if (enemy.health === undefined) {
      enemy.health = enemyHealth;
    }

    enemy.health -= 10;
    console.log("Enemy health:", enemy.health);

    if (enemy.health <= 0) {
      console.log("Enemy defeated!");

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
        console.warn("Error during enemy cleanup:", error);
      }

      enemy.isDead = true;

      // --- Use gameId instead of id ---
      if (enemy.gameId !== undefined) {
        try {
          const res = await fetch('/map/wallData');
          if (!res.ok) throw new Error('Failed to load map data');
          const mapData = await res.json();

          // Use == for loose comparison in case of string/number mismatch
          const mapEnemy = (mapData.enemies || []).find(e => e.id == enemy.gameId);
          if (mapEnemy) {
            mapEnemy.alive = false;

            const saveRes = await fetch('/map/wallData', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mapData, null, 2)
            });
            if (!saveRes.ok) throw new Error('Failed to save map data');
            console.log(`Enemy ${enemy.gameId} marked as dead and saved to server.`);
          } else {
            console.warn(`Enemy with id ${enemy.gameId} not found in map data.`);
          }
        } catch (err) {
          console.error('Error updating enemy death on server:', err);
        }
      } else {
        console.warn('Enemy has no gameId, cannot update map data.');
      }
      // --- END NEW ---
    }

    enemy.isHit = false;
  }
}
