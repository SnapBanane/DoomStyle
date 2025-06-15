//
// niceLogs v0.1 developed by SnapBanane
//

//
// Functions:
//

function writeERROR(message) {
  const timestamp = new Date().toISOString();
  console.error(`[ERROR] [${timestamp}] ${message}`);
}

function writeDEBUG(variableName, variableValue) {
  const timestamp = new Date().toISOString();
  console.debug(`[DEBUG] [${timestamp}] ${variableName}:`, variableValue);
}

function writeLOG(message) {
  const timestamp = new Date().toISOString();
  console.log(`[LOG] [${timestamp}] ${message}`);
}

export { writeERROR, writeDEBUG, writeLOG };
