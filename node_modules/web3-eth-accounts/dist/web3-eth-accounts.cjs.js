'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var web3Providers = require('web3-providers');
var Utils = require('web3-utils');
var web3CoreHelpers = require('web3-core-helpers');
var web3CoreMethod = require('web3-core-method');
var _classCallCheck = _interopDefault(require('@babel/runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('@babel/runtime/helpers/createClass'));
var _possibleConstructorReturn = _interopDefault(require('@babel/runtime/helpers/possibleConstructorReturn'));
var _getPrototypeOf = _interopDefault(require('@babel/runtime/helpers/getPrototypeOf'));
var _inherits = _interopDefault(require('@babel/runtime/helpers/inherits'));
var _assertThisInitialized = _interopDefault(require('@babel/runtime/helpers/assertThisInitialized'));
var isUndefined = _interopDefault(require('lodash/isUndefined'));
var isNull = _interopDefault(require('lodash/isNull'));
var isObject = _interopDefault(require('lodash/isObject'));
var isBoolean = _interopDefault(require('lodash/isBoolean'));
var isString = _interopDefault(require('lodash/isString'));
var has = _interopDefault(require('lodash/has'));
var extend = _interopDefault(require('lodash/extend'));
var Account = _interopDefault(require('eth-lib/lib/account'));
var Hash = _interopDefault(require('eth-lib/lib/hash'));
var RLP = _interopDefault(require('eth-lib/lib/rlp'));
var Nat = _interopDefault(require('eth-lib/lib/nat'));
var Bytes = _interopDefault(require('eth-lib/lib/bytes'));
var scryptsy = _interopDefault(require('scrypt.js'));
var uuid = _interopDefault(require('uuid'));
var web3Core = require('web3-core');

var MethodFactory =
function (_AbstractMethodFactor) {
  _inherits(MethodFactory, _AbstractMethodFactor);
  function MethodFactory(methodModuleFactory, utils, formatters) {
    var _this;
    _classCallCheck(this, MethodFactory);
    _this = _possibleConstructorReturn(this, _getPrototypeOf(MethodFactory).call(this, methodModuleFactory, utils, formatters));
    _this.methods = {
      getGasPrice: web3CoreMethod.GetGasPriceMethod,
      getTransactionCount: web3CoreMethod.GetTransactionCountMethod,
      getId: web3CoreMethod.VersionMethod
    };
    return _this;
  }
  return MethodFactory;
}(web3CoreMethod.AbstractMethodFactory);

var cryp = typeof global === 'undefined' ? require('crypto-browserify') : require('crypto');
var isNot = function isNot(value) {
  return isUndefined(value) || isNull(value);
};
var trimLeadingZero = function trimLeadingZero(hex) {
  while (hex && hex.startsWith('0x0')) {
    hex = "0x".concat(hex.slice(3));
  }
  return hex;
};
var makeEven = function makeEven(hex) {
  if (hex.length % 2 === 1) {
    hex = hex.replace('0x', '0x0');
  }
  return hex;
};
var Accounts =
function (_AbstractWeb3Module) {
  _inherits(Accounts, _AbstractWeb3Module);
  function Accounts(provider, providersModuleFactory, methodModuleFactory, methodFactory, utils, formatters, options) {
    var _this2;
    _classCallCheck(this, Accounts);
    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Accounts).call(this, provider, providersModuleFactory, methodModuleFactory, methodFactory, options));
    _this2.utils = utils;
    _this2.formatters = formatters;
    _this2.wallet = new Wallet(_assertThisInitialized(_assertThisInitialized(_this2)));
    return _this2;
  }
  _createClass(Accounts, [{
    key: "_addAccountFunctions",
    value: function _addAccountFunctions(account) {
      var _this3 = this;
      account.signTransaction = function (tx, callback) {
        return _this3.signTransaction(tx, account.privateKey, callback).bind(_this3);
      };
      account.sign = function (data) {
        return _this3.sign(data, account.privateKey);
      };
      account.encrypt = function (password, options) {
        return _this3.encrypt(account.privateKey, password, options);
      };
      return account;
    }
  }, {
    key: "create",
    value: function create(entropy) {
      return this._addAccountFunctions(Account.create(entropy || this.utils.randomHex(32)));
    }
  }, {
    key: "privateKeyToAccount",
    value: function privateKeyToAccount(privateKey) {
      return this._addAccountFunctions(Account.fromPrivate(privateKey));
    }
  }, {
    key: "signTransaction",
    value: function signTransaction(tx, privateKey, callback) {
      var _this = this;
      var error = false;
      var result;
      callback = callback || function () {};
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
          var transaction = tx;
          transaction.to = tx.to || '0x';
          transaction.data = tx.data || '0x';
          transaction.value = tx.value || '0x';
          transaction.chainId = _this.utils.numberToHex(tx.chainId);
          var rlpEncoded = RLP.encode([Bytes.fromNat(transaction.nonce), Bytes.fromNat(transaction.gasPrice), Bytes.fromNat(transaction.gas), transaction.to.toLowerCase(), Bytes.fromNat(transaction.value), transaction.data, Bytes.fromNat(transaction.chainId || '0x1'), '0x', '0x']);
          var hash = Hash.keccak256(rlpEncoded);
          var signature = Account.makeSigner(Nat.toNumber(transaction.chainId || '0x1') * 2 + 35)(Hash.keccak256(rlpEncoded), privateKey);
          var rawTx = RLP.decode(rlpEncoded).slice(0, 6).concat(Account.decodeSignature(signature));
          rawTx[6] = makeEven(trimLeadingZero(rawTx[6]));
          rawTx[7] = makeEven(trimLeadingZero(rawTx[7]));
          rawTx[8] = makeEven(trimLeadingZero(rawTx[8]));
          var rawTransaction = RLP.encode(rawTx);
          var values = RLP.decode(rawTransaction);
          result = {
            messageHash: hash,
            v: trimLeadingZero(values[6]),
            r: trimLeadingZero(values[7]),
            s: trimLeadingZero(values[8]),
            rawTransaction: rawTransaction
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
      return Promise.all([isNot(tx.chainId) ? _this.getId() : tx.chainId, isNot(tx.gasPrice) ? _this.getGasPrice() : tx.gasPrice, isNot(tx.nonce) ? _this.getTransactionCount(_this.privateKeyToAccount(privateKey).address) : tx.nonce]).then(function (args) {
        if (isNot(args[0]) || isNot(args[1]) || isNot(args[2])) {
          throw new Error("One of the values 'chainId', 'gasPrice', or 'nonce' couldn't be fetched: ".concat(JSON.stringify(args)));
        }
        return signed(extend(tx, {
          chainId: args[0],
          gasPrice: args[1],
          nonce: args[2]
        }));
      });
    }
  }, {
    key: "recoverTransaction",
    value: function recoverTransaction(rawTx) {
      var values = RLP.decode(rawTx);
      var signature = Account.encodeSignature(values.slice(6, 9));
      var recovery = Bytes.toNumber(values[6]);
      var extraData = recovery < 35 ? [] : [Bytes.fromNumber(recovery - 35 >> 1), '0x', '0x'];
      var signingData = values.slice(0, 6).concat(extraData);
      var signingDataHex = RLP.encode(signingData);
      return Account.recover(Hash.keccak256(signingDataHex), signature);
    }
  }, {
    key: "hashMessage",
    value: function hashMessage(data) {
      var message = this.utils.isHexStrict(data) ? this.utils.hexToBytes(data) : data;
      var messageBuffer = Buffer.from(message);
      var preamble = "\x19Ethereum Signed Message:\n".concat(message.length);
      var preambleBuffer = Buffer.from(preamble);
      var ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
      return Hash.keccak256s(ethMessage);
    }
  }, {
    key: "sign",
    value: function sign(data, privateKey) {
      var hash = this.hashMessage(data);
      var signature = Account.sign(hash, privateKey);
      var vrs = Account.decodeSignature(signature);
      return {
        message: data,
        messageHash: hash,
        v: vrs[0],
        r: vrs[1],
        s: vrs[2],
        signature: signature
      };
    }
  }, {
    key: "recover",
    value: function recover(message, signature, preFixed) {
      var args = [].slice.apply(arguments);
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
  }, {
    key: "decrypt",
    value: function decrypt(v3Keystore, password, nonStrict) {
      if (!isString(password)) {
        throw new Error('No password given.');
      }
      var json = isObject(v3Keystore) ? v3Keystore : JSON.parse(nonStrict ? v3Keystore.toLowerCase() : v3Keystore);
      if (json.version !== 3) {
        throw new Error('Not a valid V3 wallet');
      }
      var derivedKey;
      var kdfparams;
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
      var ciphertext = Buffer.from(json.crypto.ciphertext, 'hex');
      var mac = this.utils.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).replace('0x', '');
      if (mac !== json.crypto.mac) {
        throw new Error('Key derivation failed - possibly wrong password');
      }
      var decipher = cryp.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), Buffer.from(json.crypto.cipherparams.iv, 'hex'));
      var seed = "0x".concat(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('hex'));
      return this.privateKeyToAccount(seed);
    }
  }, {
    key: "encrypt",
    value: function encrypt(privateKey, password, options) {
      var account = this.privateKeyToAccount(privateKey);
      options = options || {};
      var salt = options.salt || cryp.randomBytes(32);
      var iv = options.iv || cryp.randomBytes(16);
      var derivedKey;
      var kdf = options.kdf || 'scrypt';
      var kdfparams = {
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
      var cipher = cryp.createCipheriv(options.cipher || 'aes-128-ctr', derivedKey.slice(0, 16), iv);
      if (!cipher) {
        throw new Error('Unsupported cipher');
      }
      var ciphertext = Buffer.concat([cipher.update(Buffer.from(account.privateKey.replace('0x', ''), 'hex')), cipher.final()]);
      var mac = this.utils.sha3(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(ciphertext, 'hex')])).replace('0x', '');
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
          kdf: kdf,
          kdfparams: kdfparams,
          mac: mac.toString('hex')
        }
      };
    }
  }]);
  return Accounts;
}(web3Core.AbstractWeb3Module);
var Wallet =
function () {
  function Wallet(accounts) {
    _classCallCheck(this, Wallet);
    this._accounts = accounts;
    this.length = 0;
    this.defaultKeyName = 'web3js_wallet';
  }
  _createClass(Wallet, [{
    key: "_findSafeIndex",
    value: function _findSafeIndex() {
      var pointer = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      if (has(this, pointer)) {
        return this._findSafeIndex(pointer + 1);
      } else {
        return pointer;
      }
    }
  }, {
    key: "_currentIndexes",
    value: function _currentIndexes() {
      var keys = Object.keys(this);
      var indexes = keys.map(function (key) {
        return parseInt(key);
      }).filter(function (n) {
        return n < 9e20;
      });
      return indexes;
    }
  }, {
    key: "create",
    value: function create(numberOfAccounts, entropy) {
      for (var i = 0; i < numberOfAccounts; ++i) {
        this.add(this._accounts.create(entropy).privateKey);
      }
      return this;
    }
  }, {
    key: "add",
    value: function add(account) {
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
  }, {
    key: "remove",
    value: function remove(addressOrIndex) {
      var account = this[addressOrIndex];
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
  }, {
    key: "clear",
    value: function clear() {
      var _this = this;
      var indexes = this._currentIndexes();
      indexes.forEach(function (index) {
        _this.remove(index);
      });
      return this;
    }
  }, {
    key: "encrypt",
    value: function encrypt(password, options) {
      var _this = this;
      var indexes = this._currentIndexes();
      var accounts = indexes.map(function (index) {
        return _this[index].encrypt(password, options);
      });
      return accounts;
    }
  }, {
    key: "decrypt",
    value: function decrypt(encryptedWallet, password) {
      var _this = this;
      encryptedWallet.forEach(function (keystore) {
        var account = _this._accounts.decrypt(keystore, password);
        if (account) {
          _this.add(account);
        } else {
          throw new Error("Couldn't decrypt accounts. Password wrong?");
        }
      });
      return this;
    }
  }, {
    key: "save",
    value: function save(password, keyName) {
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
  }, {
    key: "load",
    value: function load(password, keyName) {
      var keystore;
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
  }]);
  return Wallet;
}();
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

var AccountsModuleFactory =
function () {
  function AccountsModuleFactory(utils, formatters) {
    _classCallCheck(this, AccountsModuleFactory);
    this.utils = utils;
    this.formatters = formatters;
  }
  _createClass(AccountsModuleFactory, [{
    key: "createAccounts",
    value: function createAccounts(provider, providersModuleFactory, methodModuleFactory, options) {
      return new Accounts(provider, providersModuleFactory, methodModuleFactory, this.createMethodFactory(methodModuleFactory), this.utils, this.formatters, options);
    }
  }, {
    key: "createMethodFactory",
    value: function createMethodFactory(methodModuleFactory) {
      return new MethodFactory(methodModuleFactory, this.utils, this.formatters);
    }
  }]);
  return AccountsModuleFactory;
}();

var Accounts$1 = function Accounts(provider, options) {
  return new AccountsModuleFactory(Utils, web3CoreHelpers.formatters).createAccounts(provider, new web3Providers.ProvidersModuleFactory(), new web3CoreMethod.MethodModuleFactory(), options);
};

exports.Accounts = Accounts$1;
