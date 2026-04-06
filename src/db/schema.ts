import { Effect } from "effect";
import { executeSql } from ".";

const createEnum = `
  DO $$ BEGIN
    CREATE TYPE job_state AS ENUM (
      'created',
      'retry',
      'active',
      'completed',
      'cancelled',
      'failed'
    );
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$
`;

const createJobsTable = `
  CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue TEXT NOT NULL,
    status job_state NOT NULL DEFAULT 'created',
    payload JSONB,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retry INTEGER NOT NULL DEFAULT 3,
    run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    started_on TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  )
`;

const createImagesTable = `
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_key TEXT NOT NULL,
    status TEXT NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
)
`;

const createImageVariants = `
  CREATE TABLE IF NOT EXISTS image_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL REFERENCES images(id),
    size TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    r2_key TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  )
`;

const createIndex = `
  CREATE INDEX IF NOT EXISTS jobs_fetch_idx 
  ON jobs (queue, run_at) 
  WHERE status < 'active'
`;

export const migrate = () =>
  Effect.gen(function* () {
    yield* executeSql(createEnum);
    yield* executeSql(createJobsTable);
    yield* executeSql(createIndex);
    yield* executeSql(createImagesTable);
    yield* executeSql(createImageVariants);
    console.log("migration done");
  });
