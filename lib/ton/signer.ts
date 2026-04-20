import { Buffer } from 'node:buffer';
import { Cell, SendMode, internal } from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { Address, TonClient, WalletContractV4, WalletContractV5R1 } from '@ton/ton';
import { env } from '@/lib/env';
import { normalizeAddress } from '@/lib/ton/address';

export interface TonConnectLikeMessage {
  address: string;
  amount: string;
  payload?: string;
}

type WalletContext = {
  address: string;
  contract: {
    getBalance(): Promise<bigint>;
    getSeqno(): Promise<number>;
    sendTransfer(args: Record<string, unknown>): Promise<void>;
  };
  secretKey: Buffer;
};

export class ServerWalletSigner {
  private readonly client: TonClient;
  private readonly mnemonicWords: string[];

  constructor() {
    if (!env.MNEMONIC) {
      throw new Error('MNEMONIC is required for server-side testnet wallet operations.');
    }

    this.client = new TonClient({
      endpoint: env.NETWORK === 'testnet' ? 'https://testnet.toncenter.com/api/v2/jsonRPC' : 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: env.TONCENTER_API_KEY,
    });
    this.mnemonicWords = env.MNEMONIC.trim().split(/\s+/);
  }

  async getWalletContext(): Promise<WalletContext> {
    const keyPair = await mnemonicToPrivateKey(this.mnemonicWords);
    const version = env.WALLET_VERSION?.toLowerCase();
    const wallet = version === 'v5r1'
      ? WalletContractV5R1.create({ publicKey: keyPair.publicKey })
      : WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
    const contract = this.client.open(wallet as never) as unknown as WalletContext['contract'];
    const derivedAddress = wallet.address.toString({ bounceable: false, urlSafe: true });

    if (env.TON_WALLET_ADDRESS && normalizeAddress(env.TON_WALLET_ADDRESS) !== derivedAddress) {
      throw new Error('Derived wallet address does not match configured TON_WALLET_ADDRESS.');
    }

    return {
      secretKey: keyPair.secretKey,
      contract,
      address: derivedAddress,
    };
  }

  async getBalance(): Promise<bigint> {
    const { contract } = await this.getWalletContext();
    return contract.getBalance();
  }

  async sendTonConnectMessages(messages: TonConnectLikeMessage[]) {
    const { contract, secretKey, address } = await this.getWalletContext();
    const seqno = await contract.getSeqno();

    await contract.sendTransfer({
      seqno,
      secretKey,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      messages: messages.map((message) =>
        internal({
          to: Address.parse(message.address),
          value: BigInt(message.amount),
          body: message.payload ? Cell.fromBoc(Buffer.from(message.payload, 'base64'))[0] : undefined,
        }),
      ),
    });

    return {
      from: address,
      seqno,
      sentMessages: messages.length,
    };
  }
}

let signerInstance: ServerWalletSigner | null = null;

export function getServerWalletSigner() {
  signerInstance ??= new ServerWalletSigner();
  return signerInstance;
}
