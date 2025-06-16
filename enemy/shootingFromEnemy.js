import { damagePlayer } from "../map/GUI.js";
// Import or define allBlockerMeshes (walls, floors, ramps)
import { allWallMeshes, allFloorMeshes, allRampMeshes } from "../init.js";

export function rayCastShootFromEnemy(scene, enemy) {
  const allBlockerMeshes = [
    ...allWallMeshes,
    ...allFloorMeshes,
    ...allRampMeshes,
  ];
  // Get world position of the gunAssembly's muzzle
  const muzzleLocalPosition = new BABYLON.Vector3(0, 0.15, 2); // Match muzzle position from GunModel.js
  const muzzleWorld = BABYLON.Vector3.TransformCoordinates(
    muzzleLocalPosition,
    enemy.getWorldMatrix(),
  );

  // Compute the forward direction considering both yaw and pitch
  const forward = new BABYLON.Vector3(
    Math.sin(enemy.rotation.y) * Math.cos(enemy.rotation.x),
    -Math.sin(enemy.rotation.x),
    Math.cos(enemy.rotation.y) * Math.cos(enemy.rotation.x),
  );

  const rayLength = 1000;
  const offsetDistance = 0.3;

  const rayOrigin = muzzleWorld.add(forward.scale(offsetDistance));
  const ray = new BABYLON.Ray(rayOrigin, forward, rayLength);

  // Only allow the ray to hit the player if no wall/floor/ramp is in the way
  const hit = scene.pickWithRay(ray, (mesh) => {
    // Only consider collisions with blockers or the player
    return allBlockerMeshes.includes(mesh) || mesh.name === "player";
  });

  if (hit && hit.pickedMesh) {
    if (hit.pickedMesh.name === "player") {
      damagePlayer(30);
    } else {
      // Ray hit a wall, floor, or ramp before the player
    }
  } else {
  }

  // Draw debug line to the hit point
  let endPoint;
  if (hit && hit.hit && hit.pickedPoint) {
    endPoint = hit.pickedPoint;
  } else {
    endPoint = rayOrigin.add(forward.scale(rayLength));
  }
  const rayLine = BABYLON.MeshBuilder.CreateLines(
    "rayLine",
    {
      points: [rayOrigin, endPoint],
    },
    scene,
  );
  rayLine.color = new BABYLON.Color3(1, 0, 0);

  setTimeout(() => {
    rayLine.dispose();
  }, 1000);
}
