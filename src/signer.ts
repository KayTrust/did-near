import base64url from "base64url";
import { Signer } from "did-jwt";
import nacl from "tweetnacl";

export const Ed25519Signer = (secretKey: Uint8Array) : Signer => async (data: string | Uint8Array): Promise<string> => {
  const messageBytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const signature = nacl.sign.detached(messageBytes, secretKey);
  return base64url.encode(Buffer.from(signature));
};