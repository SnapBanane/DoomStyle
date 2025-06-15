import { damagePlayer } from "../map/GUI.js";

export function rayCastShootFromEnemy(scene, enemy) {
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

  const hit = scene.pickWithRay(ray);

  if (hit && hit.pickedMesh) {
    console.log("Enemy hit object:", hit.pickedMesh.name);

    // If the hit object is the player, call damagePlayer
    if (hit.pickedMesh.name === "player") {
      damagePlayer(30);
    } else {
      hit.pickedMesh.isHit = true; // Set a custom flag on the target
    }
  } else {
    console.log("Enemy ray missed.");
  }

  // Optional: visualize the ray for debugging
  const rayLine = BABYLON.MeshBuilder.CreateLines(
    "rayLine",
    {
      points: [rayOrigin, rayOrigin.add(forward.scale(rayLength))],
    },
    scene,
  );
  rayLine.color = new BABYLON.Color3(1, 0, 0);

  setTimeout(() => {
    rayLine.dispose();
  }, 1000);
}
