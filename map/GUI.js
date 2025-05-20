const GUI = (scene) => {
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

    // Healthbar
    const healthBarContainer = new BABYLON.GUI.Rectangle();
    healthBarContainer.width = "300px";
    healthBarContainer.height = "30px";
    healthBarContainer.color = "white";
    healthBarContainer.thickness = 2;
    healthBarContainer.background = "black";
    healthBarContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    healthBarContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    healthBarContainer.left = -20;
    healthBarContainer.top = -20;
    advancedTexture.addControl(healthBarContainer);

    const healthBar = new BABYLON.GUI.Rectangle();
    healthBar.width = "100%";
    healthBar.height = "100%";
    healthBar.background = "green";
    healthBarContainer.addControl(healthBar);

    // Crosshair
    function createCrosshairLine(width, height, x, y) {
        const line = new BABYLON.GUI.Rectangle();
        line.width = width;
        line.height = height;
        line.color = "white";
        line.thickness = 2;
        line.background = "white";
        line.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        line.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        line.left = x;
        line.top = y;
        return line;
    }

    const topLine = createCrosshairLine("2px", "10px", 0, -8);
    const bottomLine = createCrosshairLine("2px", "10px", 0, 8);
    const leftLine = createCrosshairLine("10px", "2px", -8, 0);
    const rightLine = createCrosshairLine("10px", "2px", 8, 0);

    advancedTexture.addControl(topLine);
    advancedTexture.addControl(bottomLine);
    advancedTexture.addControl(leftLine);
    advancedTexture.addControl(rightLine);

    // Gun
    const gunImage = new BABYLON.GUI.Image("gunImage", "img/MCGUN1/MCGUN1_frame0.png");
    gunImage.width = "400px";
    gunImage.height = "300px";
    gunImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    gunImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    gunImage.left = "-110px";
    gunImage.top = "0px";
    advancedTexture.addControl(gunImage);

    // Image Frames Array
    const frames = [
        "img/MCGUN1/MCGUN1_frame0.png",
        "img/MCGUN1/MCGUN1_frame1.png",
        "img/MCGUN1/MCGUN1_frame2.png",
        "img/MCGUN1/MCGUN1_frame3.png"
    ];

    return { advancedTexture, gunImage, frames, updateHealth };
};

function switchFrame(gunImage, frames) {
    let currentFrame = 0;
    const startFrame = currentFrame;
    let frameIndex = 1;
    const interval = setInterval(() => {
        gunImage.source = frames[frameIndex];
        frameIndex = (frameIndex + 1) % frames.length;
        if (frameIndex === 1) {
            gunImage.source = frames[startFrame];
            clearInterval(interval);
        }
    }, 30);
}

function updateHealth(advancedTexture, health) {
    // placeholder not yet implememnted
}

export { GUI, switchFrame, updateHealth};

