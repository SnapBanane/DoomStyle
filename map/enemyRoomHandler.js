import { writeDEBUG, writeERROR } from "../DevKit/niceLogs.js";

async function resetAllEnemiesAlive() {
  try {
    const res = await fetch("/map/wallData");
    if (!res.ok) throw new Error("Failed to load map data");
    const mapData = await res.json();

    if (Array.isArray(mapData.enemies)) {
      mapData.enemies.forEach((enemy) => {
        enemy.alive = true;
      });
    }

    const saveRes = await fetch("/map/wallData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapData, null, 2),
    });
    if (!saveRes.ok) throw new Error("Failed to save map data");
  } catch (err) {
    console.error("Error resetting enemies:", err);
  }
}

/**
 * Opens all doors in a room if all enemies in that room are dead.
 * @param {Array} mapEnemies - Array of all enemies from mapData.enemies (with .room and .alive).
 * @param {Array} doorMeshes - Array of all door meshes (with .room and .doorId).
 */
export function openDoorsIfRoomCleared(mapEnemies, doorMeshes) {
  const aliveCount = Array.isArray(mapEnemies)
    ? mapEnemies.filter((e) => e.alive !== false).length
    : 0;

  writeDEBUG("openDoorsIfRoomCleared called", {
    enemyCount: mapEnemies.length,
    doorCount: doorMeshes.length,
    aliveEnemies: aliveCount,
  });

  if (!Array.isArray(mapEnemies) || !Array.isArray(doorMeshes)) {
    console.error(
      "Invalid arguments: expected arrays for mapEnemies and doorMeshes",
    );
    return;
  }
  // Group enemies by room
  const rooms = {};
  for (const enemy of mapEnemies) {
    if (!enemy.room) continue;
    if (!rooms[enemy.room]) rooms[enemy.room] = [];
    rooms[enemy.room].push(enemy);
  }

  // For each room, check if all enemies are dead
  for (const [room, enemies] of Object.entries(rooms)) {
    const allDead = enemies.every((e) => e.alive === false);
    if (allDead) {
      // Open all doors in this room
      for (const door of doorMeshes) {
        if (door.room == room && !door._isOpening) {
          door._isOpening = true;
          // Move the door down by twice its height
          const targetY = door.position.y - 2 * (door.scaling.y || 4);
          const anim = new BABYLON.Animation(
            "doorSlideDown",
            "position.y",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
          );
          anim.setKeys([
            { frame: 0, value: door.position.y },
            { frame: 30, value: targetY },
          ]);
          door.animations = [anim];
          door.getScene().beginAnimation(door, 0, 30, false, 1, () => {
            door.dispose();
          });
        }
      }
    }
  }
}

export { resetAllEnemiesAlive };
