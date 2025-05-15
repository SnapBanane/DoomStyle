export function rayCastShootFromEnemy(scene, enemy) {
    const origin = enemy.position.clone(); // Enemy's current position

    // Compute the forward direction based on enemy's rotation
    const forward = new BABYLON.Vector3(
        -(Math.sin(enemy.rotation.y)),
        0,
        -(Math.cos(enemy.rotation.y))
    );

    const rayLength = 1000;
    const offsetDistance = 0;

    const rayOrigin = origin.add(forward.scale(offsetDistance));
    const ray = new BABYLON.Ray(rayOrigin, forward, rayLength);

    const hit = scene.pickWithRay(ray);

    if (hit && hit.pickedMesh) {
        console.log("Enemy hit object:", hit.pickedMesh.name);
        hit.pickedMesh.isHit = true; // Set a custom flag on the target
    } else {
        console.log("Enemy ray missed.");
    }

    
    // Optional: visualize the ray for debugging
    // const rayLine = BABYLON.MeshBuilder.CreateLines("rayLine", {
    //     points: [rayOrigin, rayOrigin.add(forward.scale(rayLength))],
    // }, scene);
    // rayLine.color = new BABYLON.Color3(1, 0, 0);

    // setTimeout(() => {
    //     rayLine.dispose();
    // }, 1000);
    
}
