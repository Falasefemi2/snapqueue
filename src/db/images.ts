import { Effect } from "effect";
import { executeSql } from ".";

export const createImage = (originalKey: string) =>
  Effect.gen(function* () {
    const result = yield* executeSql(
      `INSERT INTO images (original_key, status) VALUES ($1, $2) RETURNING id`,
      [originalKey, "pending"],
    );
    return result.rows[0].id;
  });

export const createVariants = (
  imageId: string,
  variants: {
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
  },
) =>
  Effect.gen(function* () {
    yield* executeSql(
      `INSERT INTO image_variants (image_id, size, width, height, url) VALUES
      ($1, 'thumbnail', 100, 100, $2),
      ($1, 'medium', 500, 500, $3),
      ($1, 'large', 1200, 1200, $4)`,
      [imageId, variants.thumbnailUrl, variants.mediumUrl, variants.largeUrl],
    );
  });
