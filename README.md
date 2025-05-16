# DID-Near Library

[DID Specification](https://w3c.github.io/did-core/)

This library can be used to create a new near-did identifier. It allows near-did identifiers to be represented as an
object that can perform actions such as updating its DID document, signing messages, and verifying messages from other
DIDs.

Use this if you are looking for the easiest way to start using near-did identifiers, and want high-level abstractions to
access its entire range of capabilities. It encapsulates all the functionality
of [did-near-resolver](https://github.com/DTI-web3/did-near-resolver)
and [NearDIDRegistry](https://github.com/DTI-web3/did-near).

A DID is an Identifier that allows you to lookup a DID document that can be used to authenticate you and messages
created by you.

DID-Near provides a scalable identity method for base58-encoded Ed25519 public keys and [NEAR Named Accounts](https://docs.near.org/protocol/account-id#named-address) that gives them the ability to
collect on-chain and off-chain data. Because DID-Near allows any Near key pair to become a DID.

This particular DID method relies on the [NearDIDRegistry](https://github.com/DTI-web3/did-near). The
NearDIDRegistry is a smart contract that facilitates public key resolution for off-chain (and on-chain)
authentication. It also facilitates key rotation, delegate assignment and revocation to allow 3rd party signers on a
key's behalf, as well as setting and revoking off-chain attribute data. These interactions and events are used in
aggregate to form a DID's DID document using
the [did-near-resolver](https://github.com/DTI-web3/did-near-resolver)
.

An example of a DID document resolved using
the [did-near-resolver](https://github.com/DTI-web3/did-near-resolver):

```json5
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:near:CF5Ri...",
  "verificationMethod": [
    {
      "id": "did:near:CF5Ri...#owner",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:near:CF5Ri...",
      "publicKeyBase58": "CF5RiJYh4EVmEt8UAD..."
    }
  ],
  "authentication": ["did:near:CF5Ri...#owner"],
  "assertionMethod": ["did:near:CF5Ri...#owner"]
}
```

On-chain refers to something that queried or modified with a transaction on a blockchain, while off-chain can refer to
anything from temporary payment channels to IPFS and regular web services.

It supports the proposed [Decentralized Identifiers](https://w3c.github.io/did-core/) spec from
the [W3C Credentials Community Group](https://w3c-ccg.github.io).

## DID Method

A "DID method" is a specific implementation of a DID scheme that is identified by a `method name`. In this case, the
method name is `near`, and the method identifier is an NEAR Account or a `base58-encoded Ed25519` publicKey.

To encode a DID for an NEAR account, simply prepend `did:near:`

For example:

* DID based on an NEAR account: `did:near:alice.near`
* DID based on a key: `did:near:2zDZtLktExaL18PWhjUQj8Gg4X1u7dhCsQrMqQx1KeC9`

## Configuration

```typescript
import { NearDID } from '@kaytrust/did-near'

const nearDid = new NearDID({ identifier: 'alice.near', privateKey: '...' })
```

| key | description| required |
|-----|------------|----------|
|`identifier`|NEAR account, public key or a full `did:near` representing Identity| no |
|`networkId`|The name near network (defaults to `testnet`) | no, but recommended |
|`contractId`| contract registry address (defaults to `neardti.testnet` if `rpcUrl` is defined) | if `rpcUrl` or `near` is defined |
|`near`| This is the main class developers should use to interact with NEAR ([Provided by @near-js/wallet-account](https://www.npmjs.com/package/@near-js/wallet-account)) | either `rpcUrl` |
|`rpcUrl`| JSON-RPC endpoint url | either `near` or `rpcUrl` |
|`signer`| [JWS Signing function](https://github.com/uport-project/did-jwt#signer-functions)| either `signer` or `privateKey` |
|`secretKey`| base58 secretKey | either `signer` or `privateKey` |
|`privateKey`| Hex encoded private key | no* |

### Important notes on keys and signers

If `privateKey` is specified, then `signer` and `secretKey` don't need to be used.

## Notes

### Readonly near-did

An instance created using only an NEAR account or publicKey (without access to a privateKey or to signers) can only be used
to encapsulate an external near-did . This instance will not have the ability to sign anything, but it can be used for a
subset of actions:

* provide the full DID string (`nearDid.did`)
* lookup its owner `await nearDid.lookupOwner()`
* verify a JWT `await nearDid.verifyJwt(jwt)`