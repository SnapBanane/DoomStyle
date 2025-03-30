export function rayCastShoot(scene, camera) {
    const origin = camera.position;
    const forward = camera.getDirection(BABYLON.Axis.Z);
    const rayLength = 1000;

    const offsetDistance = 1;
    const rayOrigin = origin.add(forward.scale(offsetDistance));

    const ray = new BABYLON.Ray(rayOrigin, forward, rayLength);

    const hit = scene.pickWithRay(ray);

    if (hit && hit.pickedMesh) {
        console.log("Hit object:", hit.pickedMesh.name);
    }

    const rayLine = BABYLON.MeshBuilder.CreateLines("rayLine", {
        points: [rayOrigin, rayOrigin.add(forward.scale(rayLength))],
    }, scene);
    rayLine.color = new BABYLON.Color3(1, 0, 0);

    setTimeout(() => {
        rayLine.dispose();
    }, 1000);
}