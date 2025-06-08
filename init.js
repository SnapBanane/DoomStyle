import { createScene } from './map/map.js';
import { setupPlayerControls } from './player.js';
import './DevKit/console.js';
import HavokPhysics from "https://cdn.babylonjs.com/havok/HavokPhysics_es.js";
import { aiForEnemy0 } from './enemy/enemy-0.js';
import { aiForEnemy1 } from './enemy/enemy-1.js';
import { updateHealth } from './map/GUI.js';

export async function startGame() {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);

    // Initialize Havok physics
    const havokInstance = await HavokPhysics();
    const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);

    const scene = await createScene(engine, canvas);

    // Expose the scene globally for console access
    window.scene = scene;

    // Define a global function to spawn an enemy at a specific position
    window.spawnEnemy = (x, y, z) => {
        if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") {
            console.error("Invalid arguments. Use the format: spawnEnemy(x, y, z)");
            return;
        }

        let whichEnemy = Math.floor(Math.random() * 2);
        console.log(whichEnemy);
        if (whichEnemy == 0){
            aiForEnemy0(scene, x, y, z);
        }
        else if (whichEnemy == 1) {
            aiForEnemy1(scene, x, y, z);
        }
        else {
            console.log(error);
        }

        console.log(`Enemy spawned at position: [${x}, ${y}, ${z}]`);
    };

    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);

    initBodyPhysics(scene);

    const player = BABYLON.MeshBuilder.CreateBox("player", { width: 1, height: 1.2, depth: 1}, scene);
    player.position = new BABYLON.Vector3(2, 0.75, 0); // define player start position

    const playerAggregate = new BABYLON.PhysicsAggregate(
        player,
        BABYLON.PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.2, friction: 1, inertia: BABYLON.Vector3.ZeroReadOnly},
        scene
    );

    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, 0), scene);
    camera.rotation = new BABYLON.Vector3(0, Math.PI, 0);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    setupPlayerControls(scene, player, camera);

    camera.minZ = 0.01;
    camera.maxZ = 10000;

    // Init Health Engine
    player.health = 100;
    updateHealth(player.health);

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
    scene.meshes.forEach(element => {
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

        new BABYLON.PhysicsAggregate(element, shapeType, { mass: mass, restitution: restitution }, scene);
        element.chechCollisions = true;
    });
}