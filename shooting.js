export function rayCastShoot(scene, camera) {
    const origin = camera.position;
    const forward = camera.getDirection(BABYLON.Axis.Z);
    const rayLength = 1000;

    const offsetDistance = 2;
    const rayOrigin = origin.add(forward.scale(offsetDistance));

    const ray = new BABYLON.Ray(rayOrigin, forward, rayLength);

    const hit = scene.pickWithRay(ray);

    if (hit && hit.pickedMesh) {
        // Check if the hit mesh is part of an enemy (either hitbox or part of enemy)
        let targetMesh = hit.pickedMesh;
        
        // If the mesh has a hitbox reference, use that instead
        if (targetMesh.hitBox) {
            targetMesh = targetMesh.hitBox;
        }
        
        // Set the hit flag on the appropriate mesh
        targetMesh.isHit = true;
        console.log("Hit object:", targetMesh.name);
    } else {
        console.log("No object hit by the ray.");
    }

    
    const rayLine = BABYLON.MeshBuilder.CreateLines("rayLine", {
        points: [rayOrigin, rayOrigin.add(forward.scale(rayLength))],
    }, scene);
    rayLine.color = new BABYLON.Color3(1, 0, 0);

    setTimeout(() => {
        rayLine.dispose();
    }, 100);
    
}