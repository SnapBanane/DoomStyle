export function createScene(engine, canvas) {
    var scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10});

    const box = BABYLON.MeshBuilder.CreateBox("box", {});
    box.position.y = 0.5;

    const roof = BABYLON.MeshBuilder.CreateCylinder("roof", {diameter: 1.3, height: 1.2, tessellation: 3});
    roof.scaling.x = 0.75;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = 1.22;

    const material = new BABYLON.StandardMaterial("name", scene);

    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseColor = new BABYLON.Color3.Green();
    ground.material = groundMat; //Place the material property of the ground

    return scene;
}
