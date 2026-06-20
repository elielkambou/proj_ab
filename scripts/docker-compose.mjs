import { existsSync } from "fs";
import { spawn } from "child_process";

const args = process.argv.slice(2);
const candidates = [process.env.DOCKER_BIN, "docker", "/snap/bin/docker"].filter(Boolean);

function runDocker(index = 0) {
  const bin = candidates[index];
  if (!bin) {
    console.error("Docker est introuvable. Installe Docker ou ajoute-le au PATH.");
    process.exit(1);
  }

  if (bin.startsWith("/") && !existsSync(bin)) {
    runDocker(index + 1);
    return;
  }

  const child = spawn(bin, ["compose", ...args], { stdio: "inherit" });
  child.on("error", (error) => {
    if (error.code === "ENOENT") {
      runDocker(index + 1);
      return;
    }
    console.error(error.message);
    process.exit(1);
  });
  child.on("exit", (code) => process.exit(code ?? 1));
}

runDocker();
