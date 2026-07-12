import { createApp } from "./app";
import { config } from "./config";
import { migrate } from "./db";

async function main() {
  await migrate();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Zenvy server listening on ${config.port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
