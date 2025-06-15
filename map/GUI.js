let updateHealth = function () {};

const GUI = (scene) => {
  const advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  // Healthbar
  const healthBarContainer = new BABYLON.GUI.Rectangle();
  healthBarContainer.width = "300px";
  healthBarContainer.height = "30px";
  healthBarContainer.color = "white";
  healthBarContainer.thickness = 2;
  healthBarContainer.background = "black";
  healthBarContainer.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  healthBarContainer.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  healthBarContainer.left = -20;
  healthBarContainer.top = -20;
  advancedTexture.addControl(healthBarContainer);

  // Red background bar (full width)
  const healthBarRed = new BABYLON.GUI.Rectangle();
  healthBarRed.width = "100%";
  healthBarRed.height = "100%";
  healthBarRed.background = "red";
  healthBarRed.thickness = 0;
  healthBarContainer.addControl(healthBarRed);

  // Green foreground bar (scales with health)
  const healthBarGreen = new BABYLON.GUI.Rectangle();
  healthBarGreen.width = "100%";
  healthBarGreen.height = "100%";
  healthBarGreen.background = "limegreen";
  healthBarGreen.thickness = 0;
  healthBarGreen.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  healthBarContainer.addControl(healthBarGreen);

  updateHealth = function (value) {
    const percent = Math.max(0, Math.min(100, value));
    healthBarGreen.width = percent + "%";
  };

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
  const gunImage = new BABYLON.GUI.Image(
    "gunImage",
    "img/MCGUN1/MCGUN1_frame0.png",
  );
  gunImage.width = "400px";
  gunImage.height = "300px";
  gunImage.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  gunImage.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
  gunImage.left = "-110px";
  gunImage.top = "0px";
  advancedTexture.addControl(gunImage);

  // Image Frames Array
  const frames = [
    "img/MCGUN1/MCGUN1_frame0.png",
    "img/MCGUN1/MCGUN1_frame1.png",
    "img/MCGUN1/MCGUN1_frame2.png",
    "img/MCGUN1/MCGUN1_frame3.png",
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

function damagePlayer(amount) {
  if (!window.player) {
    console.warn("damagePlayer: No player object found on window.");
    return;
  }
  const oldHealth = window.player.health;
  window.player.health = Math.max(0, window.player.health - amount);
  console.log(
    `damagePlayer: Damaged player by ${amount}. Health: ${oldHealth} -> ${window.player.health}`,
  );
  updateHealth(window.player.health);
  if (window.player.health <= 0) {
    console.log("damagePlayer: Player died.");

    onPlayerDeathAlert(() => {
      // Reset and reinitiate the game
      if (window.location && window.location.reload) {
        window.location.reload();
      } else if (typeof startGame === "function") {
        startGame();
      }
    });
  }
}

function onPlayerDeathAlert(callback) {
  if (typeof callback === "function") {
    callback();
  }
}

export { GUI, switchFrame, updateHealth, damagePlayer, onPlayerDeathAlert };
