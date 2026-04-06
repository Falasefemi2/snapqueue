import { UTApi } from "uploadthing/server";

const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const file = new File([buffer], filename);
  const result = await utapi.uploadFiles(file);
  return result.data?.ufsUrl ?? "";
}
