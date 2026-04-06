import { migrate } from "./src/db/schema";
import { enqueue } from "./src/queue";
import { start } from "./src/queue/worker";
import "./src/processor/handler";
import { Effect } from "effect";

const program = Effect.gen(function* () {
  yield* migrate();

  const id = yield* enqueue("image", {
    imagePath: "C:/Users/FEMI/Downloads/car.jpg",
  });

  yield* Effect.sync(() => {
    console.log("Enqueued job:", id);
  });

  yield* Effect.sync(() => {
    start("image");
  });
});

Effect.runPromise(program);
