export const GUI = () => {
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('myUI');

    // Healthbar
    // setup Healthbar container
    const healthBarContainer = new BABYLON.GUI.Rectangle();
    healthBarContainer.width = "200px";
    healthBarContainer.height = "20px";
    healthBarContainer.color = "white";
    healthBarContainer.thickness = 2;
    healthBarContainer.background = "black";
    healthBarContainer.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    healthBarContainer.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    healthBarContainer.left = 20;
    healthBarContainer.top = 20;
    advancedTexture.addControl(healthBarContainer);

    // make the actual Healthbar
    const healthBar = new BABYLON.GUI.Rectangle();
    healthBar.width = "100%";
    healthBar.height = "100%";
    healthBar.background = "red";
    healthBarContainer.addControl(healthBar);

    // Function to update health bar
    function updateHealth(percentage) {
        healthBar.width = `${percentage}%`;
    }

    // Crosshair
    // create line element for crosshair
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

    // Crosshair lines
    const topLine = createCrosshairLine("2px", "10px", 0, -8);
    const bottomLine = createCrosshairLine("2px", "10px", 0, 8);
    const leftLine = createCrosshairLine("10px", "2px", -8, 0);
    const rightLine = createCrosshairLine("10px", "2px", 8, 0);

    // Add crosshair to HUD
    advancedTexture.addControl(topLine);
    advancedTexture.addControl(bottomLine);
    advancedTexture.addControl(leftLine);
    advancedTexture.addControl(rightLine);

    return advancedTexture;
};