import { Effect } from "effect";
import sharp from "sharp";
import { ImageError } from "../error";

const resizeBuffer = (imagePath: string, width: number, height: number) =>
  Effect.tryPromise({
    try: () => sharp(imagePath).resize(width, height).toBuffer(),
    catch: (cause) => new ImageError({ cause }),
  });

export const resize = (imagePath: string) =>
  Effect.gen(function* () {
    const [thumbnail, medium, large] = yield* Effect.all([
      resizeBuffer(imagePath, 100, 100),
      resizeBuffer(imagePath, 500, 500),
      resizeBuffer(imagePath, 1200, 1200),
    ]);

    return { thumbnail, medium, large };
  });
