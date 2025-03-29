export function rayCastShoot(scene, camera) {
    // Get the camera's position and direction
    const origin = camera.position;
    const forward = camera.getDirection(BABYLON.Axis.Z); // Get the forward direction of the camera
    const rayLength = 1000; // Length of the ray

    // Offset the ray's origin slightly forward to avoid hitting the player
    const offsetDistance = 1; // Adjust this value as needed
    const rayOrigin = origin.add(forward.scale(offsetDistance)); // Move the ray's origin forward

    // Create the ray
    const ray = new BABYLON.Ray(rayOrigin, forward, rayLength);

    // Check for hits
    const hit = scene.pickWithRay(ray);

    if (hit && hit.pickedMesh) {
        console.log("Hit object:", hit.pickedMesh.name);

        // Example: Trigger an effect (e.g., explosion)
        // triggerExplosion(hit.pickedPoint);
    }

    // Draw the ray as a line (optional)
    const rayLine = BABYLON.MeshBuilder.CreateLines("rayLine", {
        points: [rayOrigin, rayOrigin.add(forward.scale(rayLength))],
    }, scene);
    rayLine.color = new BABYLON.Color3(1, 0, 0); // Red color for the line

    // Remove the line after a short delay
    setTimeout(() => {
        rayLine.dispose();
    }, 1000); // Remove after 100ms
}