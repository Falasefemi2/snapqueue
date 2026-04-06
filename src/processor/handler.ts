import { Effect } from "effect";
import { createImage, createVariants } from "../db/images";
import { register } from "../queue/worker";
import { uploadBuffer } from "../storage/uploadthing";
import { resize } from "./resize";

type ImagePayload = {
  imagePath: string;
};

register("image", (payload) =>
  Effect.gen(function* () {
    const { imagePath } = payload as ImagePayload;

    const imageId = yield* createImage(imagePath);
    const imageResize = yield* resize(imagePath);

    const thumbnail = yield* uploadBuffer(
      imageResize.thumbnail,
      "thumbnail.jpg",
    );

    const medium = yield* uploadBuffer(imageResize.medium, "medium.jpg");

    const large = yield* uploadBuffer(imageResize.large, "large.jpg");

    yield* createVariants(imageId, {
      thumbnailUrl: thumbnail,
      mediumUrl: medium,
      largeUrl: large,
    });

    yield* Effect.sync(() => {
      console.log("Image processed:", imageId);
    });
  }),
);
