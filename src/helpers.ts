import nacl from "tweetnacl";
import bs58 from "bs58";

export const createDidNearFromPrivateKey = (privateKey: string) => {
  if (privateKey.startsWith("0x")) privateKey = privateKey.substring(2);
  const privateKeyBuffer = Buffer.from(privateKey, 'hex');
  const keypair = nacl.sign.keyPair.fromSeed(privateKeyBuffer);
  const publicKeyBase58 = bs58.encode(keypair.publicKey);
  return `did:near:${publicKeyBase58}`;
}


export function interpretIdentifier(identifier: string): { accountId: string; networkId?: string, privateKey?: string } {
  let id = identifier
  if (identifier.startsWith("0x")) identifier = identifier.substring(2);
  let networkId:string|undefined = undefined
  let privateKey:string|undefined = undefined
  if (id.startsWith('did:near')) {
    id = id.split('?')[0]
    id = id.split('#')[0]
    const components = id.split(':')
    id = components[components.length - 1]
    if (components.length >= 4) {
      networkId = components.splice(2, components.length - 3).join(':')
    }
  } else if (identifier.length === 64) {
    privateKey = identifier;
    id = createDidNearFromPrivateKey(privateKey);
  } else {
    id = identifier;
  }
  return { accountId: id, networkId, privateKey }
}

export function makeDidNear(opt: { accountId: string; networkId?: string }) {
    return `did:near:${opt.accountId}`;
}