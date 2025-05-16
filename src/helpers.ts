import nacl from "tweetnacl";
import bs58 from "bs58";

export const privateKeyToSecretKey = (privateKey: string) => {
  if (privateKey.startsWith("0x")) privateKey = privateKey.slice(2);
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const keypair = nacl.sign.keyPair.fromSeed(privateKeyBuffer);
  return keypair.secretKey;
}

export const secretKeyToPrivateKey = (secretKey: Uint8Array) => {
  const privateKeySeed = secretKey.slice(0, 32);
  return Buffer.from(privateKeySeed).toString("hex");
}

export const createDidNearFromPrivateKey = (privateKey: string) => {
  if (privateKey.startsWith("0x")) privateKey = privateKey.substring(2);
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const keypair = nacl.sign.keyPair.fromSeed(privateKeyBuffer);
  return createDidNearFromPublicKey(keypair.publicKey);
}

export const createDidNearFromSecretKey = (secretKey: Uint8Array) => {
  const keypair = nacl.sign.keyPair.fromSeed(secretKey.slice(0, 32));
  return createDidNearFromPublicKey(keypair.publicKey);
}

export const createDidNearFromPublicKey = (publicKey: Uint8Array) => {
  const publicKeyBase58 = bs58.encode(publicKey);
  return `did:near:${publicKeyBase58}`;
}


export function interpretIdentifier(identifier: string = "", secretKey?: Uint8Array): { accountId: string; networkId?: string, secretKey?: Uint8Array } {
  if (!identifier) {
    if (typeof secretKey === 'undefined') secretKey = nacl.sign.keyPair().secretKey;
    identifier = createDidNearFromSecretKey(secretKey)
  }
  let id = identifier
  if (identifier.startsWith("0x")) identifier = identifier.substring(2);
  let networkId:string|undefined = undefined
  if (id.startsWith('did:near')) {
    id = id.split('?')[0]
    id = id.split('#')[0]
    const components = id.split(':')
    id = components[components.length - 1]
    if (components.length >= 4) {
      networkId = components.splice(2, components.length - 3).join(':')
    }
  } else {
    id = identifier;
  }
  return { accountId: id, networkId, secretKey }
}

export function makeDidNear(opt: { accountId: string; networkId?: string }) {
    return `did:near:${opt.accountId}`;
}