/// <reference types="node" />
import { ICoinCodec, LiskCoinCodecMsgs, PostableRiseTransaction, RiseTransaction, SignOptions, Address, ICoinCodecTxs, LiskTransaction } from 'dpos-offline';
import { IRegisterDelegateTx, ISendTx, IVoteTx } from 'dpos-offline/dist/es5/codecs/interface';
import { IRegisterSecondSignature } from 'dpos-offline/dist/es5/codecs/lisk';
export declare type BBNTransaction<T> = RiseTransaction<T>;
export declare type IBBNTransaction = IVoteTx | ISendTx | IRegisterDelegateTx | IRegisterSecondSignature;
export declare type BBNCoinCodecTxs = ICoinCodecTxs<BBNTransaction<any>, IBBNTransaction, SignOptions, PostableRiseTransaction<any>> & {
    getAddressBytes(address: Address): Buffer;
    getChildBytes(tx: LiskTransaction<any>): Buffer;
};
export declare const BBN: ICoinCodec<BBNCoinCodecTxs, LiskCoinCodecMsgs>;
