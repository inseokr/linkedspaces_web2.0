import { createDecipheriv } from "crypto";
import { notFound, redirect } from "next/navigation";

function decryptShareToken(
  token: string,
): { username: string; blogKey: number } | null {
  try {
    const keyBase64 = process.env.SHARE_TOKEN_KEY;
    if (!keyBase64) throw new Error("SHARE_TOKEN_KEY is not set");

    const KEY = Buffer.from(keyBase64, "base64");

    // base64url → base64
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const buf = Buffer.from(b64, "base64");

    // Layout: nonce(12) | ciphertext | tag(16)
    const nonce = buf.subarray(0, 12);
    const tag = buf.subarray(buf.length - 16);
    const ciphertext = buf.subarray(12, buf.length - 16);

    const decipher = createDecipheriv("aes-256-gcm", KEY, nonce);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    const [username, blogKeyStr] = plain.toString("utf8").split(":");
    const blogKey = parseInt(blogKeyStr, 10);
    if (!username || isNaN(blogKey)) return null;

    return { username, blogKey };
  } catch {
    return null;
  }
}

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function Page({ params }: PageProps) {
  const { token } = await params;
  const result = decryptShareToken(token);

  if (!result) {
    notFound();
  }

  const { username, blogKey } = result;
  redirect(`/trip/${username}/${blogKey}`);
}
