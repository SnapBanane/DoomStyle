import { createScene } from './map.js';
import { setupPlayerControls } from './player.js';
import './DevKit/console.js';

window.addEventListener('DOMContentLoaded', function () {

    const canvas = document.getElementById("renderCanvas"); // Get the canvas element
    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

    let havokInstance;
    HavokPhysics().then((havok) => {
      // Havok is now available
      havokInstance = havok;
    });

    const scene = createScene(engine, canvas); // Call the createScene function

    const player = BABYLON.MeshBuilder.CreateSphere("player", { diameter: 1 }, scene);

    // Create and position a free camera
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, 0), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, false);

    // Attach the camera to the player
    camera.parent = player;

    // init player and camera position
    player.position = new BABYLON.Vector3(-8.794057100332045, 11.910679454482588, -15.029237134811092);
    camera.rotation = new BABYLON.Vector3(0.7274045117025131, 0.5, 0);

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