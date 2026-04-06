import { Effect } from "effect";
import { Pool } from "pg";
import { DatabaseError } from "../error";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 10000,
});

export const executeSql = (text: string, values?: unknown[]) =>
  Effect.tryPromise({
    try: () => pool.query(text, values),
    catch: (cause) => new DatabaseError({ cause }),
  });

export const closeDb = () =>
  Effect.tryPromise({
    try: () => pool.end(),
    catch: (cause) => new DatabaseError({ cause }),
  });
