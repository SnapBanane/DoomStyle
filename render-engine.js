import { createScene } from './map.js';
import { setupPlayerControls } from './player.js';

window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

    const scene = createScene(engine, canvas); // Call the createScene function

    const player = BABYLON.MeshBuilder.CreateSphere("player", { diameter: 1 }, scene);
    player.position.y = 1; // Adjust the player's initial position

    // Create and position a free camera
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    // Attach the camera to the player
    camera.parent = player;

    // Setup player controls
    setupPlayerControls(scene, player, camera);

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });
});