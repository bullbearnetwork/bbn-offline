import {
  ICoinCodec,
  IKeypair,
  ILiskTransaction,
  Lisk,
  LiskCoinCodecMsgs,
  PostableRiseTransaction,
  Rise,
  RiseTransaction,
  SenderType,
  SignOptions,
  Address, ICoinCodecTxs, LiskTransaction
} from 'dpos-offline';
import { As } from 'type-tagger';
import { Omit } from 'utility-types';
import * as bs58check from 'bs58check';
import RIPEMD160 from 'ripemd160';
import * as crypto from 'crypto';
import ByteBuffer from 'bytebuffer';
import empty from 'is-empty';
import { IRegisterDelegateTx, ISendTx, IVoteTx } from 'dpos-offline/dist/es5/codecs/interface';
import { IRegisterSecondSignature } from 'dpos-offline/dist/es5/codecs/lisk';

export type BBNTransaction<T> = RiseTransaction<T>;

export type IBBNTransaction =
  IVoteTx
  | ISendTx
  | IRegisterDelegateTx
  | IRegisterSecondSignature;

export type BBNCoinCodecTxs =
  ICoinCodecTxs<BBNTransaction<any>, IBBNTransaction, SignOptions, PostableRiseTransaction<any>>
  & {
  getAddressBytes(address: Address): Buffer;
  getChildBytes(tx: LiskTransaction<any>): Buffer;
};

export const BBN: ICoinCodec<BBNCoinCodecTxs, LiskCoinCodecMsgs> = {
  ...Rise,
  msgs: {
    ...Rise.msgs,
    prefix: new Buffer('BBN Signed Message:\n', 'utf8'),
  },
  txs : {
    ...Rise.txs,
    _codec  : null as any,
    baseFees: {
      'register-delegate': 500000000,
      'second-signature' : 50000000,
      'send'             : 100000,
      'vote'             : 10000000,
    },
    bytes(tx: BBNTransaction<any>, signOpts: SignOptions) {
      const assetBytes = this.getChildBytes(tx);
      const bb         = new ByteBuffer(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64 + assetBytes.length, true);
      bb.writeByte(tx.type);
      bb.writeUint32(tx.timestamp);
      bb.append(tx.senderPublicKey);
      if (!empty(tx.requesterPublicKey)) {
        bb.append(tx.requesterPublicKey!);
      }
      if (!empty(tx.recipientId)) {
        bb.append(this.getAddressBytes(tx.recipientId));
      } else {
        // TODO: fixme
        bb.append(Buffer.alloc(23).fill(0));
      }

      bb.writeInt64(tx.fee);
      bb.writeInt64(tx.amount);

      bb.append(assetBytes);
      if (!signOpts.skipSignature && tx.signature) {
        bb.append(tx.signature);
      }
      if (!signOpts.skipSecondSign && tx.signSignature) {
        bb.append(tx.signSignature);
      }

      bb.flip();
      return new Buffer(bb.toBuffer());
    },

    // tslint:disable-next-line max-line-length
    createAndSign(tx: Omit<ILiskTransaction, 'sender'> & { sender?: SenderType }, kp: IKeypair | string, inRawFormat?: true) {
      const t = Lisk.txs.createAndSign.call(this, tx, kp, true);
      if (inRawFormat) {
        return t;
      }
      return this.toPostable(t as any) as any;
    },

    getAddressBytes(address) {
      return Buffer.concat([
        bs58check.decode(address.slice(0, -3)),
        Buffer.from(address.slice(-3), 'utf8')
      ]);
    },

    identifier(tx: BBNTransaction<any>): string & As<"txIdentifier"> {
      const bytes = this.bytes(tx, {skipSignature: false, skipSecondSign: false});
      const hash = crypto.createHash('sha256').update(bytes).digest();
      return bs58check.encode(new RIPEMD160().update(hash).digest()) as string & As<'txIdentifier'>;
    },

    createNonce() {
      return `${Math.floor(
        (Date.now() - Date.UTC(2018, 9, 1, 0, 0, 0, 0)) / 1000
      )}` as string & As<'nonce'>;
    },

    toPostable(tx: BBNTransaction<any>): PostableRiseTransaction<any> {
      let ri = Lisk.txs.toPostable.call(this, tx);
      return {
        ... ri,
        amount  : parseInt(ri.amount, 10),
        fee     : parseInt(ri.fee, 10),
        senderId: this._codec.calcAddress(tx.senderPublicKey),
      }
    }
  },

  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    if (typeof (publicKey) === 'string') {
      publicKey = Buffer.from(publicKey, 'hex') as Buffer & As<'publicKey'>;
    }
    return `${bs58check.encode(new RIPEMD160().update(crypto.createHash('sha256').update(publicKey).digest()).digest())}BBN` as Address;
  },
};

BBN.msgs._codec = BBN;
BBN.txs._codec  = BBN;


export const BBT: ICoinCodec<BBNCoinCodecTxs, LiskCoinCodecMsgs> = {
  ... BBN,
  txs: { ... BBN.txs },
  msgs: { ... BBN.msgs },
  calcAddress(publicKey: (Buffer | string) & As<'publicKey'>) {
    if (typeof (publicKey) === 'string') {
      publicKey = Buffer.from(publicKey, 'hex') as Buffer & As<'publicKey'>;
    }
    return `${bs58check.encode(new RIPEMD160().update(crypto.createHash('sha256').update(publicKey).digest()).digest())}BBT` as Address;
  },
};


BBT.msgs._codec = BBT;
BBT.txs._codec  = BBT;
