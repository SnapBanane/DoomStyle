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

/**
 * Converts multi-layer map data to an array of wall segments for Babylon.js.
 * @param {Object} mapData - The map data object with layers and ramps.
 * @returns {Array} Array of wall segments: [ [ [x1, y1], [x2, y2] ], ... ]
 */
export function extractWallSegments(mapData) {
    if (!mapData.layers) return [];
    const allWalls = [];
    for (const layer of mapData.layers) {
        for (const [a, b] of layer.walls) {
            const p1 = layer.points[a];
            const p2 = layer.points[b];
            allWalls.push([p1, p2]);
        }
    }
    return allWalls;
}

/**
 * Builds all layers' walls and (optionally) ramps in Babylon.js.
 * @param {BABYLON.Scene} scene
 * @param {Object} mapData - The map data object.
 * @param {Object} [options] - {layerHeight, wallHeight, wallThickness}
 * @returns {BABYLON.Mesh[]} Array of all wall meshes.
 */
export function buildMultiLayerMap(scene, mapData, options = {}) {
    const layerHeight = options.layerHeight || 6;
    const wallHeight = options.wallHeight || 4;
    const wallThickness = options.wallThickness || 0.5;
    const meshes = [];

    if (!mapData.layers) return meshes;

    // Build walls for each layer, offsetting Y by layer index
    mapData.layers.forEach((layer, i) => {
        const y = i * layerHeight + wallHeight / 2;
        const wallSegs = [];
        for (const [a, b] of layer.walls) {
            const p1 = layer.points[a];
            const p2 = layer.points[b];
            // Babylon uses X,Z for horizontal plane, so treat y as z
            wallSegs.push([[p1[0], p1[1]], [p2[0], p2[1]]]);
        }
        const layerWalls = buildWallsFromArray(scene, wallSegs, { height: wallHeight, thickness: wallThickness, y });
        meshes.push(...layerWalls);
    });

    // Optionally: visualize ramps as thin boxes or lines
    if (mapData.ramps) {
        for (const ramp of mapData.ramps) {
            const fromL = mapData.layers[ramp.from.layer];
            const toL = mapData.layers[ramp.to.layer];
            if (!fromL || !toL) continue;
            const p1 = fromL.points[ramp.from.point];
            const p2 = toL.points[ramp.to.point];
            const y1 = ramp.from.layer * layerHeight + wallHeight / 2;
            const y2 = ramp.to.layer * layerHeight + wallHeight / 2;
            // Draw a thin box or cylinder between (p1, y1) and (p2, y2)
            const rampMesh = BABYLON.MeshBuilder.CreateTube("ramp", {
                path: [
                    new BABYLON.Vector3(p1[0], y1, p1[1]),
                    new BABYLON.Vector3(p2[0], y2, p2[1])
                ],
                radius: 0.2,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE
            }, scene);
            const mat = new BABYLON.StandardMaterial("rampMat", scene);
            mat.diffuseColor = new BABYLON.Color3(0, 0.7, 1);
            mat.emissiveColor = new BABYLON.Color3(0, 0.3, 1);
            rampMesh.material = mat;
            meshes.push(rampMesh);
        }
    }

    return meshes;
}

export { buildWallsFromArray, exportWallData };