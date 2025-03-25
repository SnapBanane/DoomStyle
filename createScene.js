export function createScene(engine, canvas) {
    var scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:10, height:10});

    const box = BABYLON.MeshBuilder.CreateBox("box", {width:2, height: 1.5, depth: 3});
    box.position.y = 2;

    return scene;
}
