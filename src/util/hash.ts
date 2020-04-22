import * as crypto from "crypto";

export default function hash(): string {
  const buffer = Buffer.alloc(16);
  crypto.randomFillSync(buffer);

  return crypto
    .createHash("sha256")
    .update(buffer.toString("hex"))
    .digest("hex");
}
