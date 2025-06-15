import { createScene, initEnemies } from "./map/map.js";
import { setupPlayerControls } from "./player.js";
import "./DevKit/console.js";
import HavokPhysics from "https://cdn.babylonjs.com/havok/HavokPhysics_es.js";
import { aiForEnemy0 } from "./enemy/enemy-0.js";
import { aiForEnemy1 } from "./enemy/enemy-1.js";
import { updateHealth, GUI, damagePlayer } from "./map/GUI.js";
import { buildEnemyMap } from "./map/mapConstructor.js";
import {
  openDoorsIfRoomCleared,
  resetAllEnemiesAlive,
} from "./map/enemyRoomHandler.js";

export const allEnemyMeshes = [];
export const allDoorMeshes = [];

export async function startGame() {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  // Create the scene here!
  const scene = new BABYLON.Scene(engine);

  // Initialize Havok physics
  const havokInstance = await HavokPhysics();
  const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);

  // Expose the scene globally for console access
  window.scene = scene;

  // Assign spawn functions BEFORE createScene
  window.spawnEnemy0 = (x, y, z, id) => {
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof z !== "number"
    ) {
      console.error(
        "Invalid arguments. Use the format: spawnEnemy0(x, y, z, id)",
      );
      return;
    }
    const mesh = aiForEnemy0(scene, x, y, z, id);
    return mesh;
  };

  window.spawnEnemy1 = (x, y, z, id) => {
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof z !== "number"
    ) {
      console.error(
        "Invalid arguments. Use the format: spawnEnemy1(x, y, z, id)",
      );
      return;
    }
    const mesh = aiForEnemy1(scene, x, y, z, id);
    return mesh;
  };

  await createScene(scene, canvas);

  const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
  scene.enablePhysics(gravityVector, physicsPlugin);

  initBodyPhysics(scene);

  const player = BABYLON.MeshBuilder.CreateBox(
    "player",
    { width: 1, height: 1.2, depth: 1 },
    scene,
  );
  player.position = new BABYLON.Vector3(2, 0.75, 0); // define player start position

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

  const camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 1, 0),
    scene,
  );
  camera.rotation = new BABYLON.Vector3(0, Math.PI, 0);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, false);

  setupPlayerControls(scene, player, camera);

  camera.minZ = 0.01;
  camera.maxZ = 10000;

  // Init Health Engine
  player.health = 100;
  window.player = player;

  //damagePlayer(40); // DEMO CALL DO NOT KEEP IN PRODUCTION CODE

  initEnemies(scene);

  await resetAllEnemiesAlive(scene);

  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Browser Resize event call
  window.addEventListener("resize", function () {
    engine.resize();
  });
}

function initBodyPhysics(scene) {
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
  });
}
