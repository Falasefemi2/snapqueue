import sharp from "sharp";

export async function resize(imagePath: string) {
  const thumbnail = await sharp(imagePath).resize(100, 100).toBuffer();
  const medium = await sharp(imagePath).resize(500, 500).toBuffer();
  const large = await sharp(imagePath).resize(1200, 1200).toBuffer();

  return { thumbnail, medium, large };
}
