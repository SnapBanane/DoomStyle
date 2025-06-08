/**
 * Builds Babylon.js wall meshes from a 2D array of wall segments.
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 * @param {Array} wallData - Array of wall segments, each [[x1, y1], [x2, y2]].
 * @param {Object} [options] - Optional: {height, thickness, y}
 * @returns {BABYLON.Mesh[
 * ]} Array of wall meshes.
 */
function buildWallsFromArray(scene, wallData, options = {}) {
    const height = options.height || 4;
    const thickness = options.thickness || 0.5;
    const y = options.y || height / 2;

    const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
    wallMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6); // light gray
    wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    wallMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
    wallMat.alpha = 1; // fully opaque
    wallMat.backFaceCulling = false; // render both sides

    const walls = [];
    for (const [[x1, z1], [x2, z2]] of wallData) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.sqrt(dx * dx + dz * dz);

        // Center position
        const cx = (x1 + x2) / 2;
        const cz = (z1 + z2) / 2;

        // Angle in XZ plane
        const angle = Math.atan2(dz, dx);

        // Create wall box
        const wall = BABYLON.MeshBuilder.CreateBox("wall", {
            width: length,
            height: height,
            depth: thickness
        }, scene);

        wall.position = new BABYLON.Vector3(cx, y, cz);
        wall.rotation = new BABYLON.Vector3(0, -angle, 0);
        wall.material = wallMat;

        walls.push(wall);
    }
    return walls;
}

/**
 * Fetch wall data from the server.
 * @returns {Promise<Array>} - Resolves to wall data array.
 */
export async function fetchWallData() {
    const res = await fetch('/map/wallData');
    if (!res.ok) throw new Error('Failed to fetch wall data');
    return await res.json();
}

/**
 * Save wall data to the server.
 * @param {Array} wallData - The wall data array.
 * @returns {Promise<void>}
 */
export async function saveWallData(wallData) {
    const res = await fetch('/map/wallData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wallData)
    });
    if (!res.ok) throw new Error('Failed to save wall data');
}

/**
 * Exports wall data as a JSON string.
 * @param {Array} wallData - The wall data array.
 * @returns {string} - JSON string of the wall data.
 */
function exportWallData(wallData) {
    return JSON.stringify(wallData, null, 2);
}

export { buildWallsFromArray, exportWallData };