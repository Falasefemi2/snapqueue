import { UTApi } from "uploadthing/server";
import { Effect } from "effect";
import { UploadThingError } from "../error";

const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

export const uploadBuffer = (buffer: Buffer, filename: string) =>
  Effect.gen(function* () {
    const file = new File([buffer], filename);

    const result = yield* Effect.tryPromise({
      try: () => utapi.uploadFiles(file),
      catch: (cause) => new UploadThingError({ cause }),
    });

    const url = result.data?.ufsUrl;

    if (!url) {
      return yield* Effect.fail(
        new UploadThingError({
          cause: new Error("Upload failed: no URL returned"),
        }),
      );
    }

    return url;
  });
