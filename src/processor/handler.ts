import { createImage, createVariants } from "../db/images";
import { register } from "../queue/worker";
import { uploadBuffer } from "../storage/uploadthing";
import { resize } from "./resize";

type ImagePayload = {
  imagePath: string;
};

register("image", async (payload) => {
  const { imagePath } = payload as ImagePayload;
  const imageId = await createImage(imagePath);
  const imageResize = await resize(imagePath);
  const thumbnail = await uploadBuffer(imageResize.thumbnail, "thumbnail.jpg");
  const medium = await uploadBuffer(imageResize.medium, "medium.jpg");
  const large = await uploadBuffer(imageResize.large, "large.jpg");
  await createVariants(imageId, {
    thumbnailUrl: thumbnail,
    mediumUrl: medium,
    largeUrl: large,
  });

  console.log("Image processed:", imageId);
});
