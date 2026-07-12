import { createApp } from "./app";
import { startBscPaymentWatcher } from "./bsc-payment-watcher";
import { config } from "./config";
import { migrate } from "./db";

async function main() {
  await migrate();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Zenvy server listening on ${config.port}`);
    startBscPaymentWatcher();
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
