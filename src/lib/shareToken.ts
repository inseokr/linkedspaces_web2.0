import { createDecipheriv } from "crypto";

/**
 * Decrypt a share token (AES-256-GCM) into username and blogKey.
 * Used by both www (legacy) and bloggo share-token handlers.
 */
export function decryptShareToken(
  token: string,
): { username: string; blogKey: number } | null {
  try {
    const keyBase64 = process.env.SHARE_TOKEN_KEY;
    if (!keyBase64) throw new Error("SHARE_TOKEN_KEY is not set");

    const KEY = Buffer.from(keyBase64, "base64");
    console.log(`[shareToken] KEY length: ${KEY.length} bytes`);

    // base64url → base64
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const buf = Buffer.from(b64, "base64");
    console.log(`[shareToken] decoded buffer length: ${buf.length} bytes`);

    // Layout: nonce(12) | ciphertext | tag(16)
    const nonce = buf.subarray(0, 12);
    const tag = buf.subarray(buf.length - 16);
    const ciphertext = buf.subarray(12, buf.length - 16);
    console.log(
      `[shareToken] nonce: ${nonce.toString("hex")}, ciphertext length: ${ciphertext.length}, tag: ${tag.toString("hex")}`,
    );

    const decipher = createDecipheriv("aes-256-gcm", KEY, nonce);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    const plainText = plain.toString("utf8");
    console.log(`[shareToken] decrypted plaintext: ${plainText}`);

    const [username, blogKeyStr] = plainText.split(":");
    const blogKey = parseInt(blogKeyStr, 10);
    if (!username || isNaN(blogKey)) {
      console.log(
        `[shareToken] invalid plaintext format (username="${username}", blogKeyStr="${blogKeyStr}")`,
      );
      return null;
    }

    console.log(
      `[shareToken] success → username="${username}", blogKey=${blogKey}`,
    );
    return { username, blogKey };
  } catch (err) {
    console.log(`[shareToken] decryption error:`, err);
    return null;
  }
}
