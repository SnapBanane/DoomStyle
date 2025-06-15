import { allEnemyMeshes, allDoorMeshes } from "../init.js";

/**
 * Point-in-polygon test for 2D arrays.
 */
function isPointInPolygon(point, polygon) {
  let x = point[0],
    y = point[1];
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i][0],
      yi = polygon[i][1];
    let xj = polygon[j][0],
      yj = polygon[j][1];
    let intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-10) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Fetch wall data from the server.
 * @returns {Promise<Array>} - Resolves to wall data array.
 */
export async function fetchWallData() {
  const res = await fetch("/map/wallData");
  if (!res.ok) throw new Error("Failed to fetch wall data");
  return await res.json();
}

/**
 * Save wall data to the server.
 * @param {Array} wallData - The wall data array.
 * @returns {Promise<void>}
 */
export async function saveWallData(wallData) {
  const res = await fetch("/map/wallData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(wallData),
  });
  if (!res.ok) throw new Error("Failed to save wall data");
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

function getAllClosedPolygons(points, walls) {
  const adj = {};

  // Create adjacency list from wall definitions
  for (const wall of walls) {
    const [a, b] = wall.points;
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push(b);
    adj[b].push(a);
  }

  const visited = new Set();
  const polygons = [];

  // Try to trace a loop from each point
  for (let start = 0; start < points.length; start++) {
    if (visited.has(start) || !adj[start]) continue;

    const loop = [];
    let curr = start;
    let prev = null;

    while (true) {
      loop.push(curr);
      visited.add(curr);

      const nextCandidates = adj[curr].filter(n => n !== prev);
      if (nextCandidates.length === 0) break;

      const next = nextCandidates[0];

      if (next === start && loop.length >= 3) {
        polygons.push(loop.map(i => points[i]));
        break;
      }

      if (loop.includes(next)) break; // infinite loop prevention

      prev = curr;
      curr = next;
    }
  }

  return polygons;
}


// Convex hull (Graham scan)
function convexHull(points) {
  points = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const n = points.length;
  if (n < 3) return null;
  const lower = [];
  for (let p of points) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    )
      lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = n - 1; i >= 0; i--) {
    const p = points[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    )
      upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}
function cross(a, b, o) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function createRampMesh(scene, x, y, z, width, height, depth, angle) {
  // width: along X, depth: along Z, height: vertical
  // The ramp will slope from y to y+height along the +Z direction
  const halfW = width / 2;
  const halfD = depth / 2;

  // 8 vertices of a prism with a sloped top
  const positions = [
    // Bottom face
    -halfW,
    y,
    -halfD,
    halfW,
    y,
    -halfD,
    halfW,
    y,
    halfD,
    -halfW,
    y,
    halfD,
    // Top face (sloped)
    -halfW,
    y + height,
    -halfD,
    halfW,
    y + height,
    -halfD,
    halfW,
    y,
    halfD,
    -halfW,
    y,
    halfD,
  ];

  // Indices for faces
  const indices = [
    // Bottom
    0, 1, 2, 0, 2, 3,
    // Back
    0, 1, 5, 0, 5, 4,
    // Left
    0, 4, 7, 0, 7, 3,
    // Right
    1, 2, 6, 1, 6, 5,
    // Slope (front)
    3, 2, 6, 3, 6, 7,
    // Top (sloped)
    4, 5, 6, 4, 6, 7,
  ];

  // Create mesh
  const mesh = new BABYLON.Mesh("ramp", scene);
  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);
  vertexData.applyToMesh(mesh);

  // Position and rotate
  mesh.position = new BABYLON.Vector3(x, y, z);
  mesh.rotation = new BABYLON.Vector3(0, -angle, 0);

  // Material
  const mat = new BABYLON.StandardMaterial("rampMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  mat.backFaceCulling = false;
  mesh.material = mat;

  return mesh;
}

/**
 * Builds all layers' walls, ramps, and floors (as big planes) in Babylon.js.
 * @param {BABYLON.Scene} scene
 * @param {Object} mapData - The map data object.
 * @param {Object} [options] - {layerHeight, wallHeight, wallThickness}
 * @returns {BABYLON.Mesh[]} Array of all wall meshes.
 */
export function buildMultiLayerMap(scene, mapData, options = {}) {
  const meshes = [];
  const gridSize = 1;
  const layerHeight = options.layerHeight || 4;
  const wallHeight = options.wallHeight || 4;
  const wallThickness = options.wallThickness || 0.5;

  if (!mapData.layers) return meshes;

  // --- Render walls ---
  mapData.layers.forEach((layer, i) => {
    if (!layer.walls || !layer.points) return;
    const y = i * layerHeight + wallHeight / 2;
    for (const wall of layer.walls) {
      let a, b, type;
      if (Array.isArray(wall)) {
        [a, b] = wall;
        type = "wall";
      } else {
        [a, b] = wall.points;
        type = wall.type || "wall";
      }
      const p1 = layer.points[a];
      const p2 = layer.points[b];

      // Material: wall = #999999 (gray)
      let wallMat = new BABYLON.StandardMaterial("wallMat", scene);
      if (type === "door") {
        wallMat.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red for doors
      } else {
        wallMat.diffuseColor = BABYLON.Color3.FromHexString("#999999");
      }
      wallMat.backFaceCulling = false;

      const dx = p2[0] - p1[0];
      const dz = p2[1] - p1[1];
      const length = Math.sqrt(dx * dx + dz * dz);
      const cx = (p1[0] + p2[0]) / 2;
      const cz = (p1[1] + p2[1]) / 2;
      const angle = Math.atan2(dz, dx);

      const wallMesh = BABYLON.MeshBuilder.CreateBox(
        "wall",
        {
          width: length,
          height: wallHeight,
          depth: wallThickness,
        },
        scene,
      );

      wallMesh.position = new BABYLON.Vector3(cx, y, cz);
      wallMesh.rotation = new BABYLON.Vector3(0, -angle, 0);
      wallMesh.material = wallMat;

      // Assign door id if this is a door
      if (type === "door" && wall.id !== undefined) {
        wallMesh.doorId = wall.id;
        wallMesh.room = wall.room;
        allDoorMeshes.push(wallMesh);
      }

      meshes.push(wallMesh);
    }
  });

  // --- Render ramps as real ramps (prisms) ---
  if (mapData.ramps) {
    for (const ramp of mapData.ramps) {
      const rampHeight = layerHeight * 2;
      const y = ramp.layer;
      const width = gridSize * 4;
      const depth = gridSize * 4;
      const mesh = createRampMesh(
        scene,
        ramp.x,
        y,
        ramp.y,
        width / 2,
        rampHeight / 2,
        depth / 2,
        ramp.angle,
      );
      meshes.push(mesh);
    }
  }

  const floorThickness = 0.1 * gridSize;
  mapData.layers.forEach((layer, i) => {
    if (i === 0 || !layer.points || !layer.walls) {
      console.log(`Skipping layer ${i} due to missing data.`);
      return;
    }
    if (layer.floorEnabled === false) {
      console.log(`Skipping layer ${i} because floor is disabled.`);
      return;
    }

    console.log(`Processing layer ${i}...`);

    const polygons = getAllClosedPolygons(layer.points, layer.walls);
    console.log(`Found ${polygons.length} closed polygons on layer ${i}.`);

    for (let j = 0; j < polygons.length; j++) {
      let poly = polygons[j];
      console.log(`Polygon ${j} has ${poly.length} points:`, poly);

      if (poly.length < 3) {
        console.log(`Polygon ${j} skipped: less than 3 points.`);
        continue;
      }

      if (
        poly.length > 1 &&
        poly[0][0] === poly[poly.length - 1][0] &&
        poly[0][1] === poly[poly.length - 1][1]
      ) {
        poly = poly.slice(0, -1);
        console.log(`Polygon ${j} had duplicate end point removed.`);
      }

      poly = ensureWinding(poly, true);
      const outerVec2 = toVector2Array(poly);
      console.log(`Polygon ${j} after CCW winding:`, outerVec2);

      try {
        const polygonBuilder = new BABYLON.PolygonMeshBuilder(
          `floor_${i}_${meshes.length}`,
          outerVec2,
          scene,
        );
        const floorMesh = polygonBuilder.build(false, floorThickness);
        floorMesh.position.y = i * layerHeight + 0.05;

        const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
        floorMat.diffuseColor = BABYLON.Color3.FromHexString("#555555");
        floorMat.backFaceCulling = false;
        floorMesh.material = floorMat;

        meshes.push(floorMesh);
        console.log(`Polygon ${j} successfully created as floor mesh.`);
      } catch (e) {
        console.warn(
          `Failed to build floor for polygon ${j} on layer ${i}:`,
          e,
        );
      }
    }
  });

  return meshes;
}

/**
 * Spawns all enemies from mapData.enemies and assigns their unique id.
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 * @param {Object} mapData - The map data object with an 'enemies' array.
 * @param {Object} [options] - Optional: {layerHeight}
 */
export function buildEnemyMap(scene, mapData, options = {}) {
  if (!mapData.enemies || !Array.isArray(mapData.enemies)) {
    return;
  }

  const layerHeight = options.layerHeight || 4;

  for (const enemy of mapData.enemies) {
    let x = enemy.x;
    let z = enemy.y;
    let y = (enemy.layer || 0) * layerHeight;
    const id = enemy.id;
    const type = enemy.type;

    // Move type 1 enemies up by 0.5 to avoid spawning under the map
    if (type === 1) {
      y += 0.5;
    }

    let mesh = null;
    if (type === 1) {
      if (typeof window.spawnEnemy0 === "function") {
        mesh = window.spawnEnemy0(x, y, z, id);
      }
    } else if (type === 2) {
      if (typeof window.spawnEnemy1 === "function") {
        mesh = window.spawnEnemy1(x, y, z, id);
      }
    }

    if (mesh) {
      mesh.id = id;
      mesh.enemyType = type;
      mesh.mapDataIndex = mapData.enemies.indexOf(enemy);
      mesh.alive = enemy.alive !== false;
      mesh.room = enemy.room;

      // Add a method or property to print id when damaged
      mesh.onDamage = function () {
        // No debug output
      };

      allEnemyMeshes.push(mesh);
    }
  }
}

// Helper: Convert array of [x, y] to array of BABYLON.Vector2
function toVector2Array(points) {
  return points.map(([x, y]) => new BABYLON.Vector2(x, y));
}

// Returns positive for CCW, negative for CW
function polygonArea2D(points) {
  let area = 0;
  for (let i = 0, n = points.length; i < n; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % n];
    area += x0 * y1 - x1 * y0;
  }
  return area / 2;
}

function ensureWinding(points, ccw = true) {
  if (points.length < 3) return points;
  const area = polygonArea2D(points);
  if ((ccw && area < 0) || (!ccw && area > 0)) {
    return points.slice().reverse();
  }
  return points;
}

function removeDuplicateConsecutivePoints(points) {
  if (points.length < 2) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (
      points[i][0] !== points[i - 1][0] ||
      points[i][1] !== points[i - 1][1]
    ) {
      out.push(points[i]);
    }
  }
  // Remove last point if it equals the first
  if (
    out.length > 2 &&
    out[0][0] === out[out.length - 1][0] &&
    out[0][1] === out[out.length - 1][1]
  ) {
    out.pop();
  }
  return out;
}

function createPolygonMesh(points, height, scene) {
  const positions = points.flatMap((p) => [p.x, height, p.z]);

  const indices = [];
  const triangles = earcut(positions, null, 3);
  for (let i = 0; i < triangles.length; i += 3) {
    indices.push(triangles[i], triangles[i + 1], triangles[i + 2]);
  }

  const mesh = new BABYLON.Mesh("floor", scene);
  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  BABYLON.VertexData.ComputeNormals(
    vertexData.positions,
    vertexData.indices,
    (vertexData.normals = []),
  );
  vertexData.applyToMesh(mesh);

  return mesh;
}
