import { startGame } from "./init.js";

export function renderMenu() {
  // --- MAIN MENU SETUP ---
  // Create a simple overlay div for the main menu
  const menuDiv = document.createElement("div");
  menuDiv.id = "mainMenu";
  menuDiv.style.position = "absolute";
  menuDiv.style.top = "0";
  menuDiv.style.left = "0";
  menuDiv.style.width = "100vw";
  menuDiv.style.height = "100vh";
  menuDiv.style.background = "rgba(0,0,0,0.85)";
  menuDiv.style.display = "flex";
  menuDiv.style.flexDirection = "column";
  menuDiv.style.justifyContent = "center";
  menuDiv.style.alignItems = "center";
  menuDiv.style.zIndex = "1000";

  // Title
  const title = document.createElement("h1");
  title.innerText = "Informatik DoomStyle";
  title.style.color = "#fff";
  title.style.marginBottom = "40px";
  menuDiv.appendChild(title);

  // Play Button
  const playButton = document.createElement("button");
  playButton.innerText = "Play";
  playButton.style.fontSize = "2rem";
  playButton.style.padding = "20px 60px";
  playButton.style.cursor = "pointer";
  playButton.style.borderRadius = "10px";
  playButton.style.border = "none";
  playButton.style.background = "#2ecc40";
  playButton.style.color = "#fff";
  playButton.style.transition = "background 0.2s";
  playButton.onmouseover = () => (playButton.style.background = "#27ae38");
  playButton.onmouseout = () => (playButton.style.background = "#2ecc40");
  menuDiv.appendChild(playButton);

  document.body.appendChild(menuDiv);

  // Event listener for the play button
  playButton.addEventListener("click", startGame);
  playButton.addEventListener("click", () => {
    menuDiv.style.display = "none"; // Hide the main menu
  });
}
