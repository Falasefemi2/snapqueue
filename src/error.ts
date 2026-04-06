import { Data } from "effect";

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause: unknown;
}> {}

export class ImageError extends Data.TaggedError("ImageError")<{
  cause: unknown;
}> {}

export class QueueError extends Data.TaggedError("QueueError")<{
  cause: unknown;
}> {}

export class UploadThingError extends Data.TaggedError("UploadThingError")<{
  cause: unknown;
}> {}
