import { assert, describe, expect, test } from 'vitest'
import base64url from "base64url";
import { createDidNearFromPrivateKey } from '#src/helpers';

const jwk_wallet = {
    "_id": "did:near:6Ee3RLEG5CgWEzVyQTWQKrZ4siRW6HyGDRHQmHACEGXS",
    "crv": "Ed25519",
    "d": "PT3nIJN62rqsUQW9YPklbhIi30txjGYhMWW2QSmXFrg",
    "kid": "did:near:6Ee3RLEG5CgWEzVyQTWQKrZ4siRW6HyGDRHQmHACEGXS", "kty": "OKP",
    "x": "TcjeTEM-ef6k-vuu7KslJh9O62i-NdVWZOG4864PS1k", "y": "0x"
}

const privateKey = "0x3d3de720937adabaac5105bd60f9256e1222df4b718c66213165b641299716b8"

test("privateKey from d", () => {
    const privateKey = "0x"+base64url.decode(jwk_wallet.d, "hex")
    console.log("private", privateKey)
    expect(privateKey).toBe(privateKey);
})

test("did:near from privateKey", () => {
    const did = createDidNearFromPrivateKey(privateKey)
    console.log("did", did)
    expect(did).toBe("did:near:6Ee3RLEG5CgWEzVyQTWQKrZ4siRW6HyGDRHQmHACEGXS");
})