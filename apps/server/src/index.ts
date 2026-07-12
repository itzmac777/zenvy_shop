import { createApp } from "./app";
import { startBscPaymentWatcher } from "./bsc-payment-watcher";
import { config } from "./config";
import { migrate } from "./db";
import { startSubmittedTxVerifier } from "./submitted-tx-verifier";

async function main() {
  await migrate();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Zenvy server listening on ${config.port}`);
    startBscPaymentWatcher();
    startSubmittedTxVerifier();
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
