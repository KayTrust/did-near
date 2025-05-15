import {IssuerBaseCls, IssuerOkpAlg} from '@kaytrust/did-base'
import { interpretIdentifier, makeDidNear } from './helpers';
import { Account, keyStores, Near } from 'near-api-js';
import { Ed25519Signer, privateKeyToSecretKey } from './signer';
import { createJWT, JWTHeader, JWTVerified, verifyJWT, JWTVerifyOptions } from 'did-jwt';
import { Resolvable } from 'did-resolver';

type IssuerNear = IssuerBaseCls<IssuerOkpAlg>;

interface IConfig extends Partial<Pick<IssuerNear, "signer" | "alg">> {
  identifier: string
  privateKey?: string
  networkId?: string
  contractId?: string

//   signer?: IssuerNear["signer"]
//   alg?: 'ES256K' | 'ES256K-R'
//   txSigner?: TxSigner
//   privateKey?: string

  rpcUrl?: string
  near?: Near
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   web3?: any
}

export class NearDID extends IssuerBaseCls<IssuerOkpAlg> {
    did: string;
    declare signer: IssuerNear["signer"];
    declare alg?: 'EdDSA' | undefined;
    private near?: Near;
    private contractId?: string;

    constructor(conf: IConfig) {
        super();
        let { accountId, networkId, privateKey } = interpretIdentifier(conf.identifier)
        if (!networkId) networkId = conf.networkId;
        this.contractId = conf.contractId;
        if (conf.rpcUrl || conf.near) {
            const keyStore = new keyStores.InMemoryKeyStore();
            const defaultNetworkId = networkId ?? "testnet";
            this.near = conf.near ?? new Near({
                networkId: defaultNetworkId,
                keyStore,
                nodeUrl: conf.rpcUrl!,
                headers: {},
            });
            if (!this.contractId && defaultNetworkId) this.contractId = `neardti.${defaultNetworkId}`
        }
        this.did = makeDidNear({accountId, networkId});
        if (conf.signer) {
            this.signer = conf.signer;
            this.alg = conf.alg
            if (!this.alg) {
                console.warn(
                'A JWT signer was specified but no algorithm was set. Please set the `alg` parameter when calling `new EthrDID()`'
                )
            }
        } else if (conf.privateKey || privateKey) {
            this.signer = Ed25519Signer(privateKeyToSecretKey(privateKey || conf.privateKey!))
            this.alg = 'EdDSA'
        }
    }

  async lookupOwner(cache = true): Promise<string> {
    if (typeof this.near === 'undefined') {
      throw new Error('a near provider configuration is needed for network operations')
    }
    if (typeof this.contractId === 'undefined') {
      throw new Error('a contractId configuration is needed for network operations')
    }
    if (cache && this.owner) return this.owner
    const account: Account = await this.near.account(this.contractId);
    return await account.viewFunction({
      contractId: this.contractId,
      methodName: "identity_owner",
      args: { identity: this.did },
    });
  }

  // eslint-disable-next-line
  async signJWT(payload: any, expiresIn?: number, header: Partial<JWTHeader> = {}): Promise<string> {
    if (typeof this.signer !== 'function') {
      throw new Error('No signer configured')
    }
    const alg: IssuerOkpAlg = "EdDSA"
    const options = {
      signer: this.signer,
      alg: alg,
      issuer: this.did,
    }
    if (!header.alg) header.alg = alg;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (expiresIn) (<any>options)['expiresIn'] = expiresIn
    return createJWT(payload, options, header)
  }

  async verifyJWT(jwt: string, resolver: Resolvable, audience = this.did, options: Omit<JWTVerifyOptions, "resolver"|"audience"> = {policies: {}}): Promise<JWTVerified> {
    return verifyJWT(jwt, { resolver, audience, ...options})
  }
}