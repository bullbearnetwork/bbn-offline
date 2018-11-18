"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dpos_offline_1 = require("dpos-offline");
var bs58check = __importStar(require("bs58check"));
var ripemd160_1 = __importDefault(require("ripemd160"));
var crypto = __importStar(require("crypto"));
var bytebuffer_1 = __importDefault(require("bytebuffer"));
var is_empty_1 = __importDefault(require("is-empty"));
exports.BBN = __assign({}, dpos_offline_1.Rise, { msgs: __assign({}, dpos_offline_1.Rise.msgs, { prefix: new Buffer('BBN Signed Message:\n', 'utf8') }), txs: __assign({}, dpos_offline_1.Rise.txs, { _codec: null, baseFees: {
            'register-delegate': 500000000,
            'second-signature': 50000000,
            'send': 100000,
            'vote': 10000000,
        }, bytes: function (tx, signOpts) {
            var assetBytes = this.getChildBytes(tx);
            var bb = new bytebuffer_1.default(1 + 4 + 32 + 32 + 8 + 8 + 64 + 64 + assetBytes.length, true);
            bb.writeByte(tx.type);
            bb.writeUint32(tx.timestamp);
            bb.append(tx.senderPublicKey);
            if (!is_empty_1.default(tx.requesterPublicKey)) {
                bb.append(tx.requesterPublicKey);
            }
            if (!is_empty_1.default(tx.recipientId)) {
                bb.append(this.getAddressBytes(tx.recipientId));
            }
            else {
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
        createAndSign: function (tx, kp, inRawFormat) {
            var t = dpos_offline_1.Lisk.txs.createAndSign.call(this, tx, kp, true);
            if (inRawFormat) {
                return t;
            }
            return this.toPostable(t);
        },
        getAddressBytes: function (address) {
            return Buffer.concat([
                bs58check.decode(address.slice(0, -3)),
                Buffer.from(address.slice(-3), 'utf8')
            ]);
        },
        identifier: function (tx) {
            var bytes = this.bytes(tx, { skipSignature: false, skipSecondSign: false });
            var hash = crypto.createHash('sha256').update(bytes).digest();
            return bs58check.encode(new ripemd160_1.default().update(hash).digest());
        },
        createNonce: function () {
            return "" + Math.floor((Date.now() - Date.UTC(2018, 9, 1, 0, 0, 0, 0)) / 1000);
        },
        toPostable: function (tx) {
            var ri = dpos_offline_1.Lisk.txs.toPostable.call(this, tx);
            return __assign({}, ri, { amount: parseInt(ri.amount, 10), fee: parseInt(ri.fee, 10), senderId: this._codec.calcAddress(tx.senderPublicKey) });
        } }), calcAddress: function (publicKey) {
        if (typeof (publicKey) === 'string') {
            publicKey = Buffer.from(publicKey, 'hex');
        }
        return bs58check.encode(new ripemd160_1.default().update(crypto.createHash('sha256').update(publicKey).digest()).digest()) + "BBN";
    } });
exports.BBN.msgs._codec = exports.BBN;
exports.BBN.txs._codec = exports.BBN;
exports.BBT = __assign({}, exports.BBN, { txs: __assign({}, exports.BBN.txs), msgs: __assign({}, exports.BBN.msgs), calcAddress: function (publicKey) {
        if (typeof (publicKey) === 'string') {
            publicKey = Buffer.from(publicKey, 'hex');
        }
        return bs58check.encode(new ripemd160_1.default().update(crypto.createHash('sha256').update(publicKey).digest()).digest()) + "BBT";
    } });
exports.BBT.msgs._codec = exports.BBT;
exports.BBT.txs._codec = exports.BBT;
