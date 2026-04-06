import { migrate } from "./src/db/schema";
import { enqueue } from "./src/queue";
import { start } from "./src/queue/worker";
import "./src/processor/handler";

async function main() {
  await migrate();

  const id = await enqueue("image", {
    imagePath: "C:/Users/FEMI/Downloads/phone.jpg",
  });
  console.log("Enqueued job:", id);

  // start the worker
  start("image");
}

main();
