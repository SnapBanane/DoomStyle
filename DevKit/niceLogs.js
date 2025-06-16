//
// niceLogs v0.1 developed by SnapBanane
//

let debug = true; // Set this to true to enable debug logs

function writeERROR(message) {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR] [${timestamp}] ${message}`);
}

function writeDEBUG(variableName, variableValue) {
  if (!debug) return;
  const timestamp = new Date().toISOString();
  console.debug(`[DEBUG] [${timestamp}] ${variableName}:`, variableValue);
}

function writeLOG(message) {
  const timestamp = new Date().toISOString();
  console.log(`[LOG] [${timestamp}] ${message}`);
}

export { writeERROR, writeDEBUG, writeLOG, debug };
