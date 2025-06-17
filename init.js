import { createScene, initEnemies } from "./map/map.js";
import { setupPlayerControls } from "./player.js";
import "./DevKit/console.js";
import HavokPhysics from "https://cdn.babylonjs.com/havok/HavokPhysics_es.js";
import { aiForEnemy0 } from "./enemy/enemy-0.js";
import { aiForEnemy1 } from "./enemy/enemy-1.js";
import { updateHealth, GUI, damagePlayer } from "./map/GUI.js";
import { buildEnemyMap } from "./map/mapConstructor.js";
import { treasureChest } from "./map/treasureChest.js";
import {
  openDoorsIfRoomCleared,
  resetAllEnemiesAlive,
} from "./map/enemyRoomHandler.js";
import { writeERROR, writeDEBUG, writeLOG } from "./DevKit/niceLogs.js";

export const allEnemyMeshes = [];
export const allDoorMeshes = [];
export const allWallMeshes = [];
export const allFloorMeshes = [];
export const allRampMeshes = [];

export async function startGame() {
  const initStart = performance.now();
  writeLOG("Starting game initialization...");
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  // Create the scene here!
  const scene = new BABYLON.Scene(engine);

  // Initialize Havok physics
  writeDEBUG("HavokPhysics", "Initializing Havok physics...");
  const havokInstance = await HavokPhysics();
  const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);

  // Expose the scene globally for console access
  window.scene = scene;

  // Assign spawn functions BEFORE createScene
  window.spawnEnemy0 = (x, y, z, id) => {
    writeDEBUG("spawnEnemy0 args", { x, y, z, id });
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof z !== "number"
    ) {
      writeERROR("Invalid arguments. Use the format: spawnEnemy0(x, y, z, id)");
      return;
    }
    const mesh = aiForEnemy0(scene, x, y, z, id);
    writeDEBUG("spawnEnemy0 mesh", mesh);
    return mesh;
  };

  window.spawnEnemy1 = (x, y, z, id) => {
    writeDEBUG("spawnEnemy1 args", { x, y, z, id });
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof z !== "number"
    ) {
      writeERROR("Invalid arguments. Use the format: spawnEnemy1(x, y, z, id)");
      return;
    }
    const mesh = aiForEnemy1(scene, x, y, z, id);
    writeDEBUG("spawnEnemy1 mesh", mesh);
    return mesh;
  };

  window.createTreasureChest = (x, y, z) => {
    writeDEBUG("createTreasureChest args", { x, y, z });
    if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") {
      writeERROR(
        "Invalid arguments. Use the format: createTreasureChest(x, y, z)",
      );
      return;
    }
    const chest = treasureChest(scene, x, y, z);
    writeDEBUG("createTreasureChest chest", chest);
    return chest;
  };

  writeLOG("Calling createScene...");
  await createScene(scene, canvas);

  const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
  scene.enablePhysics(gravityVector, physicsPlugin);

  treasureChest(scene, -25, 0, 10);

  writeLOG("Initializing body physics...");
  initBodyPhysics(scene);

  writeLOG("Creating player mesh...");
  const player = BABYLON.MeshBuilder.CreateBox(
    "player",
    { width: 1, height: 1.2, depth: 1 },
    scene,
  );
  player.position = new BABYLON.Vector3(2, 0.75, 0); // define player start position

  writeDEBUG("Player mesh", player);

  const playerAggregate = new BABYLON.PhysicsAggregate(
    player,
    BABYLON.PhysicsShapeType.BOX,
    {
      mass: 1,
      restitution: 0.2,
      friction: 1,
      inertia: BABYLON.Vector3.ZeroReadOnly,
    },
    scene,
  );

  writeDEBUG("Player physics aggregate", playerAggregate);

  const camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 1, 0),
    scene,
  );
  camera.rotation = new BABYLON.Vector3(0, Math.PI + Math.PI / 2, 0);
  camera.setTarget(camera.position.add(new BABYLON.Vector3(-1, 0, 0)));
  camera.attachControl(canvas, false);

  writeDEBUG("Camera", camera);

  setupPlayerControls(scene, player, camera);

  camera.minZ = 0.01;
  camera.maxZ = 10000;

  // Init Health Engine
  player.health = 150;
  window.player = player;

  //damagePlayer(40); // DEMO CALL DO NOT KEEP IN PRODUCTION CODE

  writeLOG("Initializing enemies...");
  initEnemies(scene);
  writeDEBUG("initEnemies called", allEnemyMeshes);

  await resetAllEnemiesAlive(scene);
  writeDEBUG("resetAllEnemiesAlive called", allEnemyMeshes);

  allEnemyMeshes.forEach((enemy) => {
    enemy.isDead = false;
    enemy.alive = true;
    if (enemy.health !== undefined) enemy.health = 50;
  });

  writeDEBUG("allEnemyMeshes", allEnemyMeshes);
  writeDEBUG("allDoorMeshes", allDoorMeshes);
  writeDEBUG("allWallMeshes", allWallMeshes);
  writeDEBUG("allFloorMeshes", allFloorMeshes);
  writeDEBUG("allRampMeshes", allRampMeshes);

  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Browser Resize event call
  window.addEventListener("resize", function () {
    engine.resize();
  });

  // --- Overview logging ---
  const initEnd = performance.now();
  const duration = (initEnd - initStart).toFixed(1);

  writeLOG("===========================================");
  writeLOG(" DoomStyle Engine Initialization Overview");
  writeLOG("===========================================");
  writeLOG(`Total initialization time: ${duration} ms`);
  writeLOG(`Total meshes in scene: ${scene.meshes.length}`);
  writeLOG(`Walls: ${allWallMeshes.length}`);
  writeLOG(`Floors: ${allFloorMeshes.length}`);
  writeLOG(`Ramps: ${allRampMeshes.length}`);
  writeLOG(`Doors: ${allDoorMeshes.length}`);
  writeLOG(`Enemies: ${allEnemyMeshes.length}`);
  writeLOG("Game initialization complete.");
  writeLOG("===========================================");

  // setInterval(async () => {
  //   const res = await fetch("/map/wallData");
  //   if (res.ok) {
  //     const mapData = await res.json();
  //     openDoorsIfRoomCleared(mapData.enemies, allDoorMeshes);
  //   }
  // }, 1000);
}

function initBodyPhysics(scene) {
  writeLOG("Initializing physics for all scene meshes...");
  scene.meshes.forEach((element) => {
    let shapeType = BABYLON.PhysicsShapeType.BOX; // Default to BOX
    if (element.name && element.name.toLowerCase().includes("sphere")) {
      shapeType = BABYLON.PhysicsShapeType.SPHERE;
    } else if (element.name && element.name.toLowerCase().includes("mesh")) {
      shapeType = BABYLON.PhysicsShapeType.MESH;
    } else {
      shapeType = BABYLON.PhysicsShapeType.MESH;
    }
    const mass = 0;
    const restitution = 0.2;

    new BABYLON.PhysicsAggregate(
      element,
      shapeType,
      { mass: mass, restitution: restitution },
      scene,
    );
    element.chechCollisions = true;
    writeDEBUG("Physics aggregate for mesh", {
      name: element.name,
      shapeType,
      mass,
      restitution,
    });
  });
}
