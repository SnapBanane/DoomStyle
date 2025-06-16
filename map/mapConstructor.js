import { aiForEnemy0 } from "../enemy/enemy-0.js";
import { aiForEnemy1 } from "../enemy/enemy-1.js";
import {
  allEnemyMeshes,
  allDoorMeshes,
  allWallMeshes,
  allFloorMeshes,
  allRampMeshes,
} from "../init.js";
import { writeDEBUG, writeLOG } from "../DevKit/niceLogs.js";

const scale = 12.5; // Match this to your editor's gridSize

/**
 * Builds Babylon.js wall meshes from a 2D array of wall segments.
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 * @param {Array} wallData - Array of wall segments, each [[x1, y1], [x2, y2]].
 * @param {Object} [options] - Optional: {height, thickness, y}
 * @returns {BABYLON.Mesh[]} Array of wall meshes.
 */
function buildWallsFromArray(scene, wallData, options = {}) {
  const height = options.height || 4;
  const thickness = options.thickness || 0.5;
  const y = options.y || height / 2;

  const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
  wallMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
  wallMat.backFaceCulling = false;

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
    const wall = BABYLON.MeshBuilder.CreateBox(
      "wall",
      {
        width: length,
        height: height,
        depth: thickness,
      },
      scene,
    );

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

// Helper: get polygon points in order (fallback to convex hull)
function getPolygonPoints(points, walls) {
  if (points.length < 3) return [];
  if (!walls || walls.length < 3) return [];

  // Build adjacency list
  const adj = {};
  for (const wall of walls) {
    let a, b;
    if (Array.isArray(wall)) {
      [a, b] = wall;
    } else if (wall && wall.points) {
      [a, b] = wall.points;
    } else {
      continue;
    }
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push(b);
    adj[b].push(a);
  }
  let start;
  if (Array.isArray(walls[0])) {
    start = walls[0][0];
  } else if (walls[0] && walls[0].points) {
    start = walls[0].points[0];
  } else {
    return [];
  }
  const poly = [start];
  let prev = null,
    curr = start;
  while (true) {
    const nexts = adj[curr].filter((n) => n !== prev);
    if (nexts.length === 0) break;
    const next = nexts[0];
    if (next === start) break;
    poly.push(next);
    prev = curr;
    curr = next;
    if (poly.length > points.length + 2) break;
  }
  return poly.map((i) => points[i]);
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
    -halfD, // 0: left, bottom, back
    halfW,
    y,
    -halfD, // 1: right, bottom, back
    halfW,
    y,
    halfD, // 2: right, bottom, front
    -halfW,
    y,
    halfD, // 3: left, bottom, front
    // Top face (sloped)
    -halfW,
    y + height,
    -halfD, // 4: left, top, back
    halfW,
    y + height,
    -halfD, // 5: right, top, back
    halfW,
    y,
    halfD, // 6: right, low, front (same as bottom)
    -halfW,
    y,
    halfD, // 7: left, low, front (same as bottom)
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
 * Builds all layers' walls and (optionally) ramps in Babylon.js.
 * @param {BABYLON.Scene} scene
 * @param {Object} mapData - The map data object.
 * @param {Object} [options] - {layerHeight, wallHeight, wallThickness}
 * @returns {BABYLON.Mesh[]} Array of all wall meshes.
 */
export function buildMultiLayerMap(scene, mapData, options = {}) {
  writeLOG("Building multi-layer map...");
  const meshes = [];
  const gridSize = 1;
  const layerHeight = options.layerHeight || 4;
  const wallHeight = options.wallHeight || 4;
  const wallThickness = options.wallThickness || 0.5;

  if (!mapData.layers) {
    writeDEBUG("buildMultiLayerMap", "No layers in mapData");
    return meshes;
  }

  // --- Render walls ---
  mapData.layers.forEach((layer, i) => {
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

      // Choose material based on type
      let wallMat;
      if (type === "door") {
        wallMat = new BABYLON.StandardMaterial("doorMat", scene);
        wallMat.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red for doors
        wallMat.backFaceCulling = false;
      } else {
        wallMat = new BABYLON.StandardMaterial("wallMat", scene);
        wallMat.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
        wallMat.backFaceCulling = false;
      }

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
      allWallMeshes.push(wallMesh);
      meshes.push(wallMesh);

      writeDEBUG("Wall mesh created", {
        layer: i,
        type,
        position: wallMesh.position,
        rotation: wallMesh.rotation,
        id: wallMesh.doorId || undefined,
      });
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
      allRampMeshes.push(mesh);
      meshes.push(mesh);

      writeDEBUG("Ramp mesh created", {
        x: ramp.x,
        y: y,
        z: ramp.y,
        width: width / 2,
        height: rampHeight / 2,
        depth: depth / 2,
        angle: ramp.angle,
      });
    }
  }

  // --- Render floors as convex shapes ---
  const floorThickness = 0.1 * gridSize;
  mapData.layers.forEach((layer, i) => {
    if (i === 0) return; // Skip the most bottom layer
    const poly2d = getPolygonPoints(layer.points, layer.walls);
    if (poly2d && poly2d.length >= 3) {
      const y = i * layerHeight + wallHeight - wallHeight - floorThickness / 2;
      const mesh = createConvexFloor(
        scene,
        poly2d,
        y,
        layer.color,
        floorThickness,
        1,
      );
      if (mesh) {
        mesh.material.backFaceCulling = false;
        allFloorMeshes.push(mesh);
        meshes.push(mesh);

        writeDEBUG("Floor mesh created", {
          layer: i,
          y,
          color: layer.color,
          thickness: floorThickness,
          points: poly2d,
        });
      }
    }
  });

  writeLOG("Multi-layer map build complete.");
  return meshes;
}

// Now with scaling!
function createConvexFloor(scene, points, y, color, thickness = 1, scale = 1) {
  // points: [[x, z], ...] in order (convex)
  if (points.length < 3) return null;
  const positions = [];
  const indices = [];

  // Top and bottom vertices
  for (const [x, z] of points) {
    positions.push(x * scale, y + thickness / 2, z * scale); // top
  }
  for (const [x, z] of points) {
    positions.push(x * scale, y - thickness / 2, z * scale); // bottom
  }

  const n = points.length;

  // Top face (fan from first top vertex)
  for (let i = 1; i < n - 1; i++) {
    indices.push(0, i, i + 1);
  }
  // (No bottom face)

  // Side faces
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    // 4 vertices per quad: top[i], top[next], bottom[next], bottom[i]
    const ti = i;
    const tnext = next;
    const bi = n + i;
    const bnext = n + next;
    // Two triangles per quad
    indices.push(ti, tnext, bnext);
    indices.push(ti, bnext, bi);
  }

  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, vertexData.normals);

  // Add UVs for texture mapping (simple planar mapping)
  const uvs = [];
  for (const [x, z] of points) {
    uvs.push(x * 0.1, z * 0.1); // top
  }
  for (const [x, z] of points) {
    uvs.push(x * 0.1, z * 0.1); // bottom
  }
  vertexData.uvs = uvs;

  const mesh = new BABYLON.Mesh("convexFloor", scene);
  vertexData.applyToMesh(mesh);

  const mat = new BABYLON.StandardMaterial("floorMat", scene);
  const texture = new BABYLON.Texture("img/Textures/ground.jpg", scene);
  texture.uScale = 8;
  texture.vScale = 8;
  mat.diffuseTexture = texture;
  mat.backFaceCulling = true; // Only show top faces
  mesh.material = mat;
  return mesh;
}

/**
 * Spawns all enemies from mapData.enemies and assigns their unique id.
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 * @param {Object} mapData - The map data object with an 'enemies' array.
 * @param {Object} [options] - Optional: {layerHeight}
 */
export function buildEnemyMap(scene, mapData, options = {}) {
  writeLOG("Building enemy map...");
  if (!mapData.enemies || !Array.isArray(mapData.enemies)) {
    writeDEBUG("buildEnemyMap", "No enemies in mapData");
    return;
  }

  const layerHeight = options.layerHeight || 4;

  for (const enemy of mapData.enemies) {
    let x = enemy.x;
    let z = enemy.y;
    // Move the enemy one layer down
    let layer = (enemy.layer || 0) - 0.5;
    if (layer < 0) layer = 0; // Prevent negative layers
    let y = layer * layerHeight;
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
      mesh.layer = layer; // Store the new layer

      // Add a method or property to print id when damaged
      mesh.onDamage = function () {
        // No debug output
      };

      allEnemyMeshes.push(mesh);

      writeDEBUG("Enemy mesh created", {
        id,
        type,
        position: { x, y, z },
        layer,
        alive: mesh.alive,
        room: mesh.room,
      });
    }
  }
  writeLOG("Enemy map build complete.");
}