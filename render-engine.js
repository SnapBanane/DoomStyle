import { createScene } from './map/map.js';
import { setupPlayerControls } from './player.js';
import { GUI } from './map/GUI.js'; // Ensure the path starts with './'
import './DevKit/console.js';
import HavokPhysics from "https://cdn.babylonjs.com/havok/HavokPhysics_es.js";
import { aiForEnemy } from './enemy/enemy.js'; // Import the AI function

window.addEventListener('DOMContentLoaded', async function () {
    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);

    // Initialize Havok physics
    const havokInstance = await HavokPhysics();
    const physicsPlugin = new BABYLON.HavokPlugin(true, havokInstance);

    const scene = createScene(engine, canvas);

    // Expose the scene globally for console access
    window.scene = scene;

    // Define a global function to spawn an enemy at a specific position
    window.spawnEnemy = (x, y, z) => {
        if (typeof x !== "number" || typeof y !== "number" || typeof z !== "number") {
            console.error("Invalid arguments. Use the format: spawnEnemy(x, y, z)");
            return;
        }

        const enemy = BABYLON.MeshBuilder.CreateBox("enemy", { width: 1, height: 1, depth: 1 }, scene);
        enemy.position = new BABYLON.Vector3(x, y, z);
        enemy.physicsBody = new BABYLON.PhysicsAggregate(
            enemy,
            BABYLON.PhysicsShapeType.BOX,
            { mass: 1, restitution: 0.2, friction: 1 },
            scene
        );

        // Apply AI to the spawned enemy
        aiForEnemy(enemy, scene);

        console.log(`Enemy spawned at position: [${x}, ${y}, ${z}]`);
    };

    const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    scene.enablePhysics(gravityVector, physicsPlugin);

    initBodyPhysics(scene);

    const player = BABYLON.MeshBuilder.CreateBox("player", { width: 1, height: 1.2, depth: 1}, scene);
    player.position = new BABYLON.Vector3(0, 5, 0);

    const playerAggregate = new BABYLON.PhysicsAggregate(
        player,
        BABYLON.PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.2, friction: 1, inertia: BABYLON.Vector3.ZeroReadOnly},
        scene
    );

    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    setupPlayerControls(scene, player, camera);

    GUI(scene);

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Browser Resize event call
    window.addEventListener("resize", function () {
        engine.resize();
    });
});

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