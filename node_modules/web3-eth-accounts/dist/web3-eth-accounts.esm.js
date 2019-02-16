import { ProvidersModuleFactory } from 'web3-providers';
import * as Utils from 'web3-utils';
import { formatters } from 'web3-core-helpers';
import { AbstractMethodFactory, GetGasPriceMethod, GetTransactionCountMethod, VersionMethod, MethodModuleFactory } from 'web3-core-method';
import isUndefined from 'lodash/isUndefined';
import isNull from 'lodash/isNull';
import isObject from 'lodash/isObject';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import has from 'lodash/has';
import extend from 'lodash/extend';
import Account from 'eth-lib/lib/account';
import Hash from 'eth-lib/lib/hash';
import RLP from 'eth-lib/lib/rlp';
import Nat from 'eth-lib/lib/nat';
import Bytes from 'eth-lib/lib/bytes';
import scryptsy from 'scrypt.js';
import uuid from 'uuid';
import { AbstractWeb3Module } from 'web3-core';

class MethodFactory extends AbstractMethodFactory {
  constructor(methodModuleFactory, utils, formatters$$1) {
    super(methodModuleFactory, utils, formatters$$1);
    this.methods = {
      getGasPrice: GetGasPriceMethod,
      getTransactionCount: GetTransactionCountMethod,
      getId: VersionMethod
    };
  }
}

const cryp = typeof global === 'undefined' ? require('crypto-browserify') : require('crypto');
const isNot = value => {
  return isUndefined(value) || isNull(value);
};
const trimLeadingZero = hex => {
  while (hex && hex.startsWith('0x0')) {
    hex = `0x${hex.slice(3)}`;
  }
  return hex;
};
const makeEven = hex => {
  if (hex.length % 2 === 1) {
    hex = hex.replace('0x', '0x0');
  }
  return hex;
};
class Accounts extends AbstractWeb3Module {
  constructor(provider, providersModuleFactory, methodModuleFactory, methodFactory, utils, formatters$$1, options) {
    super(provider, providersModuleFactory, methodModuleFactory, methodFactory, options);
    this.utils = utils;
    this.formatters = formatters$$1;
    this.wallet = new Wallet(this);
  }
  _addAccountFunctions(account) {
    account.signTransaction = (tx, callback) => {
      return this.signTransaction(tx, account.privateKey, callback).bind(this);
    };
    account.sign = data => {
      return this.sign(data, account.privateKey);
    };
    account.encrypt = (password, options) => {
      return this.encrypt(account.privateKey, password, options);
    };
    return account;
  }
  create(entropy) {
    return this._addAccountFunctions(Account.create(entropy || this.utils.randomHex(32)));
  }
  privateKeyToAccount(privateKey) {
    return this._addAccountFunctions(Account.fromPrivate(privateKey));
  }
  signTransaction(tx, privateKey, callback) {
    const _this = this;
    let error = false;
    let result;
    callback = callback || (() => {});
    if (!tx) {
      error = new Error('No transaction object given!');
      callback(error);
      return Promise.reject(error);
    }
    function signed(tx) {
      if (!tx.gas && !tx.gasLimit) {
        error = new Error('gas is missing');
      }
      if (tx.nonce < 0 || tx.gas < 0 || tx.gasPrice < 0 || tx.chainId < 0) {
        error = new Error('Gas, gasPrice, nonce or chainId is lower than 0');
      }
      if (error) {
        callback(error);
        return Promise.reject(error);
      }
      try {
        tx = _this.formatters.inputCallFormatter(tx, _this);
        const transaction = tx;
        transaction.to = tx.to || '0x';
        transaction.data = tx.data || '0x';
        transaction.value = tx.value || '0x';
        transaction.chainId = _this.utils.numberToHex(tx.chainId);
        const rlpEncoded = RLP.encode([Bytes.fromNat(transaction.nonce), Bytes.fromNat(transaction.gasPrice), Bytes.fromNat(transaction.gas), transaction.to.toLowerCase(), Bytes.fromNat(transaction.value), transaction.data, Bytes.fromNat(transaction.chainId || '0x1'), '0x', '0x']);
        const hash = Hash.keccak256(rlpEncoded);
        const signature = Account.makeSigner(Nat.toNumber(transaction.chainId || '0x1') * 2 + 35)(Hash.keccak256(rlpEncoded), privateKey);
        const rawTx = RLP.decode(rlpEncoded).slice(0, 6).concat(Account.decodeSignature(signature));
        rawTx[6] = makeEven(trimLeadingZero(rawTx[6]));
        rawTx[7] = makeEven(trimLeadingZero(rawTx[7]));
        rawTx[8] = makeEven(trimLeadingZero(rawTx[8]));
        const rawTransaction = RLP.encode(rawTx);
        const values = RLP.decode(rawTransaction);
        result = {
          messageHash: hash,
          v: trimLeadingZero(values[6]),
          r: trimLeadingZero(values[7]),
          s: trimLeadingZero(values[8]),
          rawTransaction
        };
      } catch (error) {
        callback(error);
        return Promise.reject(error);
      }
      callback(null, result);
      return result;
    }
    if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
      return Promise.resolve(signed(tx));
    }
    return Promise.all([isNot(tx.chainId) ? _this.getId() : tx.chainId, isNot(tx.gasPrice) ? _this.getGasPrice() : tx.gasPrice, isNot(tx.nonce) ? _this.getTransactionCount(_this.privateKeyToAccount(privateKey).address) : tx.nonce]).then(args => {
      if (isNot(args[0]) || isNot(args[1]) || isNot(args[2])) {
        throw new Error(`One of the values 'chainId', 'gasPrice', or 'nonce' couldn't be fetched: ${JSON.stringify(args)}`);
      }
      return signed(extend(tx, {
        chainId: args[0],
        gasPrice: args[1],
        nonce: args[2]
      }));
    });
  }
  recoverTransaction(rawTx) {
    const values = RLP.decode(rawTx);
    const signature = Account.encodeSignature(values.slice(6, 9));
    const recovery = Bytes.toNumber(values[6]);
    const extraData = recovery < 35 ? [] : [Bytes.fromNumber(recovery - 35 >> 1), '0x', '0x'];
    const signingData = values.slice(0, 6).concat(extraData);
    const signingDataHex = RLP.encode(signingData);
    return Account.recover(Hash.keccak256(signingDataHex), signature);
  }
  hashMessage(data) {
    const message = this.utils.isHexStrict(data) ? this.utils.hexToBytes(data) : data;
    const messageBuffer = Buffer.from(message);
    const preamble = `\u0019Ethereum Signed Message:\n${message.length}`;
    const preambleBuffer = Buffer.from(preamble);
    const ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
    return Hash.keccak256s(ethMessage);
  }
  sign(data, privateKey) {
    const hash = this.hashMessage(data);
    const signature = Account.sign(hash, privateKey);
    const vrs = Account.decodeSignature(signature);
    return {
      message: data,
      messageHash: hash,
      v: vrs[0],
      r: vrs[1],
      s: vrs[2],
      signature
    };
  }
  recover(message, signature, preFixed) {
    const args = [].slice.apply(arguments);
    if (isObject(message)) {
      return this.recover(message.messageHash, Account.encodeSignature([message.v, message.r, message.s]), true);
    }
    if (!preFixed) {
      message = this.hashMessage(message);
    }
    if (args.length >= 4) {
      preFixed = args.slice(-1)[0];
      preFixed = isBoolean(preFixed) ? preFixed : false;
      return this.recover(message, Account.encodeSignature(args.slice(1, 4)), preFixed);
    }
    return Account.recover(message, signature);
  }
  decrypt(v3Keystore, password, nonStrict) {
    if (!isString(password)) {
      throw new Error('No password given.');
    }
    const json = isObject(v3Keystore) ? v3Keystore : JSON.parse(nonStrict ? v3Keystore.toLowerCase() : v3Keystore);
    if (json.version !== 3) {
      throw new Error('Not a valid V3 wallet');
    }
    let derivedKey;
    let kdfparams;
    if (json.crypto.kdf === 'scrypt') {
      kdfparams = json.crypto.kdfparams;
      derivedKey = scryptsy(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
    } else if (json.crypto.kdf === 'pbkdf2') {
      kdfparams = json.crypto.kdfparams;
      if (kdfparams.prf !== 'hmac-sha256') {
        throw new Error('Unsupported parameters to PBKDF2');
      }
      derivedKey = cryp.pbkdf2Sync(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256');
    } else {
      throw new Error('Unsupported key derivation scheme');
    }
    const ciphertext = Buffer.from(json.crypto.ciphertext, 'hex');
    const mac = this.utils.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).replace('0x', '');
    if (mac !== json.crypto.mac) {
      throw new Error('Key derivation failed - possibly wrong password');
    }
    const decipher = cryp.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), Buffer.from(json.crypto.cipherparams.iv, 'hex'));
    const seed = `0x${Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('hex')}`;
    return this.privateKeyToAccount(seed);
  }
  encrypt(privateKey, password, options) {
    const account = this.privateKeyToAccount(privateKey);
    options = options || {};
    const salt = options.salt || cryp.randomBytes(32);
    const iv = options.iv || cryp.randomBytes(16);
    let derivedKey;
    const kdf = options.kdf || 'scrypt';
    const kdfparams = {
      dklen: options.dklen || 32,
      salt: salt.toString('hex')
    };
    if (kdf === 'pbkdf2') {
      kdfparams.c = options.c || 262144;
      kdfparams.prf = 'hmac-sha256';
      derivedKey = cryp.pbkdf2Sync(Buffer.from(password), salt, kdfparams.c, kdfparams.dklen, 'sha256');
    } else if (kdf === 'scrypt') {
      kdfparams.n = options.n || 8192;
      kdfparams.r = options.r || 8;
      kdfparams.p = options.p || 1;
      derivedKey = scryptsy(Buffer.from(password), salt, kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
    } else {
      throw new Error('Unsupported kdf');
    }
    const cipher = cryp.createCipheriv(options.cipher || 'aes-128-ctr', derivedKey.slice(0, 16), iv);
    if (!cipher) {
      throw new Error('Unsupported cipher');
    }
    const ciphertext = Buffer.concat([cipher.update(Buffer.from(account.privateKey.replace('0x', ''), 'hex')), cipher.final()]);
    const mac = this.utils.sha3(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext, 'hex')])).replace('0x', '');
    return {
      version: 3,
      id: uuid.v4({
        random: options.uuid || cryp.randomBytes(16)
      }),
      address: account.address.toLowerCase().replace('0x', ''),
      crypto: {
        ciphertext: ciphertext.toString('hex'),
        cipherparams: {
          iv: iv.toString('hex')
        },
        cipher: options.cipher || 'aes-128-ctr',
        kdf,
        kdfparams,
        mac: mac.toString('hex')
      }
    };
  }
}
class Wallet {
  constructor(accounts) {
    this._accounts = accounts;
    this.length = 0;
    this.defaultKeyName = 'web3js_wallet';
  }
  _findSafeIndex(pointer = 0) {
    if (has(this, pointer)) {
      return this._findSafeIndex(pointer + 1);
    } else {
      return pointer;
    }
  }
  _currentIndexes() {
    const keys = Object.keys(this);
    const indexes = keys.map(key => {
      return parseInt(key);
    }).filter(n => {
      return n < 9e20;
    });
    return indexes;
  }
  create(numberOfAccounts, entropy) {
    for (let i = 0; i < numberOfAccounts; ++i) {
      this.add(this._accounts.create(entropy).privateKey);
    }
    return this;
  }
  add(account) {
    if (isString(account)) {
      account = this._accounts.privateKeyToAccount(account);
    }
    if (!this[account.address]) {
      account = this._accounts.privateKeyToAccount(account.privateKey);
      account.index = this._findSafeIndex();
      this[account.index] = account;
      this[account.address] = account;
      this[account.address.toLowerCase()] = account;
      this.length++;
      return account;
    } else {
      return this[account.address];
    }
  }
  remove(addressOrIndex) {
    const account = this[addressOrIndex];
    if (account && account.address) {
      this[account.address].privateKey = null;
      delete this[account.address];
      this[account.address.toLowerCase()].privateKey = null;
      delete this[account.address.toLowerCase()];
      this[account.index].privateKey = null;
      delete this[account.index];
      this.length--;
      return true;
    } else {
      return false;
    }
  }
  clear() {
    const _this = this;
    const indexes = this._currentIndexes();
    indexes.forEach(index => {
      _this.remove(index);
    });
    return this;
  }
  encrypt(password, options) {
    const _this = this;
    const indexes = this._currentIndexes();
    const accounts = indexes.map(index => {
      return _this[index].encrypt(password, options);
    });
    return accounts;
  }
  decrypt(encryptedWallet, password) {
    const _this = this;
    encryptedWallet.forEach(keystore => {
      const account = _this._accounts.decrypt(keystore, password);
      if (account) {
        _this.add(account);
      } else {
        throw new Error("Couldn't decrypt accounts. Password wrong?");
      }
    });
    return this;
  }
  save(password, keyName) {
    try {
      localStorage.setItem(keyName || this.defaultKeyName, JSON.stringify(this.encrypt(password)));
    } catch (error) {
      if (error.code === 18) {
        return true;
      } else {
        throw new Error(error);
      }
    }
    return true;
  }
  load(password, keyName) {
    let keystore;
    try {
      keystore = localStorage.getItem(keyName || this.defaultKeyName);
      if (keystore) {
        try {
          keystore = JSON.parse(keystore);
        } catch (error) {}
      }
    } catch (error) {
      if (error.code === 18) {
        keystore = this.defaultKeyName;
      } else {
        throw new Error(error);
      }
    }
    return this.decrypt(keystore || [], password);
  }
}
try {
  if (typeof localStorage === 'undefined') {
    delete Wallet.prototype.save;
    delete Wallet.prototype.load;
  }
} catch (error) {
  if (error.code !== 18) {
    throw new Error(error);
  }
}

class AccountsModuleFactory {
  constructor(utils, formatters$$1) {
    this.utils = utils;
    this.formatters = formatters$$1;
  }
  createAccounts(provider, providersModuleFactory, methodModuleFactory, options) {
    return new Accounts(provider, providersModuleFactory, methodModuleFactory, this.createMethodFactory(methodModuleFactory), this.utils, this.formatters, options);
  }
  createMethodFactory(methodModuleFactory) {
    return new MethodFactory(methodModuleFactory, this.utils, this.formatters);
  }
}

const Accounts$1 = (provider, options) => {
  return new AccountsModuleFactory(Utils, formatters).createAccounts(provider, new ProvidersModuleFactory(), new MethodModuleFactory(), options);
};

export { Accounts$1 as Accounts };
