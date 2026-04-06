import { Effect } from "effect";
import { complete, fail, fetch } from ".";

type JobHandler = (payload: unknown) => Effect.Effect<unknown, unknown, void>;

const handlers: Record<string, JobHandler> = {};

export function register(queue: string, handler: JobHandler) {
  handlers[queue] = handler;
}

export const processQueue = (queue: string) =>
  Effect.gen(function* () {
    const jobs = yield* fetch(queue);

    for (const job of jobs) {
      const handler = handlers[job.queue];
      if (!handler) {
        yield* fail(job.id, `no handler registered for queue ${job.queue}`);
        continue;
      }

      const result = yield* Effect.either(handler(job.payload));

      if (result._tag === "Left") {
        const error = result.left;
        const msg = error instanceof Error ? error.message : String(error);
        yield* fail(job.id, msg);
        console.log(`✗ Job ${job.id} failed: ${msg}`);
      } else {
        yield* complete(job.id);
        console.log("job completed");
      }
    }
    return;
  });

export async function start(queue: string, intervalMs = 2000) {
  console.log(`Worker started on queue: ${queue}`);

  const loop = async () => {
    try {
      await (Effect.runPromise as any)(processQueue(queue));
    } catch (error) {
      console.error("processQueue error", error);
    }
    setTimeout(loop, intervalMs);
  };

  loop();
}
