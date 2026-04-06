# Snapqueue

Snapqueue is a background image processing pipeline built on PostgreSQL and Uploadthing.

## How it works

When an image path is submitted, a job is created in the database and returned
immediately. A worker process runs in the background, picks up the job, resizes
the image to three dimensions using sharp, uploads each variant to Uploadthing,
and saves the resulting urls to the database.

## Processing pipeline

1. Job enqueued with image path
2. Worker picks up job from PostgreSQL queue
3. sharp resizes image to thumbnail (100x100), medium (500x500), large (1200x1200)
4. Each buffer uploaded to Uploadthing
5. Variant urls saved to image_variants table
6. Job marked complete

## Stack

- Bun
- TypeScript
- PostgreSQL
- sharp
- Uploadthing

## Tables

- jobs - background job queue
- images - original image records
- image_variants - resized image urls per size

## Setup

1. Clone the repository
2. Run bun install
3. Create a PostgreSQL database
4. Copy .env.example to .env and fill in your values
5. Run bun run index.ts

## Environment variables

DATABASE_URL=postgresql://user:password@localhost:5432/snapqueue
UPLOADTHING_TOKEN=your_token_here
