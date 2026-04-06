import { executeSql } from "../db";

export async function enqueue(queue: string, payload: unknown, runAt?: Date) {
  const result = await executeSql(
    `INSERT INTO jobs (queue,payload,run_at) VALUES ($1,$2,COALESCE($3,now())) RETURNING id`,
    [queue, JSON.stringify(payload), runAt ?? null],
  );

  if (result.rows.length === 0) {
    return "no jobs inserted";
  }
  return result.rows[0].id;
}

export async function fetch(queue: string, limit = 1) {
  const result = await executeSql(
    `WITH next AS (
      SELECT id
      FROM jobs
      WHERE queue = $1
        AND status < 'active'
        AND run_at < now()
      ORDER BY created_at, id
      LIMIT $2
      FOR UPDATE SKIP LOCKED
    )
    UPDATE jobs SET
      status = 'active',
      started_on = now()
    FROM next
    WHERE jobs.id = next.id
    RETURNING jobs.*`,
    [queue, limit],
  );
  return result.rows;
}

export async function complete(id: string, output?: unknown) {
  await executeSql(
    `UPDATE jobs SET status = 'completed', updated_at = now() WHERE id = $1`,
    [id],
  );
}

export async function fail(id: string, error: string) {
  await executeSql(
    `UPDATE jobs SET
      status = CASE 
        WHEN retry_count < max_retry THEN 'retry'::job_state
        ELSE 'failed'::job_state
      END,
      retry_count = retry_count + 1,
      error_message = $2,
      run_at = CASE
        WHEN retry_count < max_retry THEN now() + interval '30 seconds'
        ELSE run_at
      END,
      updated_at = now()
    WHERE id = $1`,
    [id, error],
  );
}
