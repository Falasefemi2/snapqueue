import { complete, fail, fetch } from ".";

type JobHandler = (payload: unknown) => Promise<void>;

const handlers: Record<string, JobHandler> = {};

export function register(queue: string, handler: JobHandler) {
  handlers[queue] = handler;
}

export async function processQueue(queue: string) {
  const jobs = await fetch(queue);

  for (const job of jobs) {
    const handler = handlers[job.queue];
    if (!handler) {
      await fail(job.id, `no handler registered for queue ${job.queue}`);
      continue;
    }

    try {
      await handler(job.payload);
      await complete(job.id);
      console.log("job completed");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await fail(job.id, msg);
      console.log(`✗ Job ${job.id} failed: ${msg}`);
    }
  }
}

export async function start(queue: string, intervalMs = 2000) {
  console.log(`Worker started on queue: ${queue}`);

  const loop = async () => {
    await processQueue(queue);
    setTimeout(loop, intervalMs);
  };

  loop();
}
