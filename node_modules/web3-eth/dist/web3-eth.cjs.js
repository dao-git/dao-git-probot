'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var web3CoreHelpers = require('web3-core-helpers');
var web3CoreSubscriptions = require('web3-core-subscriptions');
var web3EthAccounts = require('web3-eth-accounts');
var web3EthEns = require('web3-eth-ens');
var web3EthContract = require('web3-eth-contract');
var web3EthPersonal = require('web3-eth-personal');
var web3EthAbi = require('web3-eth-abi');
var web3EthIban = require('web3-eth-iban');
var web3Providers = require('web3-providers');
var web3Net = require('web3-net');
var Utils = require('web3-utils');
var web3CoreMethod = require('web3-core-method');
var _classCallCheck = _interopDefault(require('@babel/runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('@babel/runtime/helpers/createClass'));
var _possibleConstructorReturn = _interopDefault(require('@babel/runtime/helpers/possibleConstructorReturn'));
var _set = _interopDefault(require('@babel/runtime/helpers/set'));
var _getPrototypeOf = _interopDefault(require('@babel/runtime/helpers/getPrototypeOf'));
var _get = _interopDefault(require('@babel/runtime/helpers/get'));
var _inherits = _interopDefault(require('@babel/runtime/helpers/inherits'));
var web3CorePromievent = require('web3-core-promievent');
var web3Core = require('web3-core');

var MethodFactory =
function (_AbstractMethodFactor) {
  _inherits(MethodFactory, _AbstractMethodFactor);
  function MethodFactory(methodModuleFactory, utils, formatters) {
    var _this;
    _classCallCheck(this, MethodFactory);
    _this = _possibleConstructorReturn(this, _getPrototypeOf(MethodFactory).call(this, methodModuleFactory, utils, formatters));
    _this.methods = {
      getNodeInfo: web3CoreMethod.GetNodeInfoMethod,
      getProtocolVersion: web3CoreMethod.GetProtocolVersionMethod,
      getCoinbase: web3CoreMethod.GetCoinbaseMethod,
      isMining: web3CoreMethod.IsMiningMethod,
      getHashrate: web3CoreMethod.GetHashrateMethod,
      isSyncing: web3CoreMethod.IsSyncingMethod,
      getGasPrice: web3CoreMethod.GetGasPriceMethod,
      getAccounts: web3CoreMethod.GetAccountsMethod,
      getBlockNumber: web3CoreMethod.GetBlockNumberMethod,
      getBalance: web3CoreMethod.GetBalanceMethod,
      getStorageAt: web3CoreMethod.GetStorageAtMethod,
      getCode: web3CoreMethod.GetCodeMethod,
      getBlock: web3CoreMethod.GetBlockMethod,
      getUncle: web3CoreMethod.GetUncleMethod,
      getBlockTransactionCount: web3CoreMethod.GetBlockTransactionCountMethod,
      getBlockUncleCount: web3CoreMethod.GetBlockUncleCountMethod,
      getTransaction: web3CoreMethod.GetTransactionMethod,
      getTransactionFromBlock: web3CoreMethod.GetTransactionFromBlockMethod,
      getTransactionReceipt: web3CoreMethod.GetTransactionReceipt,
      getTransactionCount: web3CoreMethod.GetTransactionCountMethod,
      sendSignedTransaction: web3CoreMethod.SendRawTransactionMethod,
      signTransaction: web3CoreMethod.SignTransactionMethod,
      sendTransaction: web3CoreMethod.SendTransactionMethod,
      sign: web3CoreMethod.SignMethod,
      call: web3CoreMethod.CallMethod,
      estimateGas: web3CoreMethod.EstimateGasMethod,
      submitWork: web3CoreMethod.SubmitWorkMethod,
      getWork: web3CoreMethod.GetWorkMethod,
      getPastLogs: web3CoreMethod.GetPastLogsMethod,
      requestAccounts: web3CoreMethod.RequestAccountsMethod
    };
    return _this;
  }
  return MethodFactory;
}(web3CoreMethod.AbstractMethodFactory);

var Eth =
function (_AbstractWeb3Module) {
  _inherits(Eth, _AbstractWeb3Module);
  function Eth(provider, providersModuleFactory, methodModuleFactory, methodFactory, net, accounts, personal, Iban, abiCoder, ens, utils, formatters, subscriptionsFactory, contractModuleFactory, options) {
    var _this;
    _classCallCheck(this, Eth);
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Eth).call(this, provider, providersModuleFactory, methodModuleFactory, methodFactory, options));
    _this.net = net;
    _this.accounts = accounts;
    _this.personal = personal;
    _this.Iban = Iban;
    _this.abi = abiCoder;
    _this.ens = ens;
    _this.utils = utils;
    _this.formatters = formatters;
    _this.subscriptionsFactory = subscriptionsFactory;
    _this.contractModuleFactory = contractModuleFactory;
    _this.initiatedContracts = [];
    _this.Contract = function (abi, address, options) {
      var contract = _this.contractModuleFactory.createContract(_this.currentProvider, _this.providersModuleFactory, web3CorePromievent.PromiEvent, abi, address, options);
      _this.initiatedContracts.push(contract);
      return contract;
    };
    return _this;
  }
  _createClass(Eth, [{
    key: "clearSubscriptions",
    value: function clearSubscriptions() {
      return _get(_getPrototypeOf(Eth.prototype), "clearSubscriptions", this).call(this, 'eth_unsubscribe');
    }
  }, {
    key: "subscribe",
    value: function subscribe(type, options, callback) {
      switch (type) {
        case 'logs':
          return this.subscriptionsFactory.createLogSubscription(options, this, this.methodFactory.createMethod('getPastLogs')).subscribe(callback);
        case 'newBlockHeaders':
          return this.subscriptionsFactory.createNewHeadsSubscription(this).subscribe(callback);
        case 'pendingTransactions':
          return this.subscriptionsFactory.createNewPendingTransactionsSubscription(this).subscribe(callback);
        case 'syncing':
          return this.subscriptionsFactory.createSyncingSubscription(this).subscribe(callback);
        default:
          throw new Error("Unknown subscription: ".concat(type));
      }
    }
  }, {
    key: "setProvider",
    value: function setProvider(provider, net) {
      var setContractProviders = this.initiatedContracts.every(function (contract) {
        return contract.setProvider(provider, net);
      });
      return this.net.setProvider(provider, net) && this.personal.setProvider(provider, net) && this.accounts.setProvider(provider, net) && _get(_getPrototypeOf(Eth.prototype), "setProvider", this).call(this, provider, net) && setContractProviders;
    }
  }, {
    key: "defaultGasPrice",
    set: function set(value) {
      this.initiatedContracts.forEach(function (contract) {
        contract.defaultGasPrice = value;
      });
      this.net.defaultGasPrice = value;
      this.personal.defaultGasPrice = value;
      _set(_getPrototypeOf(Eth.prototype), "defaultGasPrice", value, this, true);
    }
    ,
    get: function get() {
      return _get(_getPrototypeOf(Eth.prototype), "defaultGasPrice", this);
    }
  }, {
    key: "defaultGas",
    set: function set(value) {
      this.initiatedContracts.forEach(function (contract) {
        contract.defaultGas = value;
      });
      this.net.defaultGas = value;
      this.personal.defaultGas = value;
      _set(_getPrototypeOf(Eth.prototype), "defaultGas", value, this, true);
    }
    ,
    get: function get() {
      return _get(_getPrototypeOf(Eth.prototype), "defaultGas", this);
    }
  }, {
    key: "transactionBlockTimeout",
    set: function set(value) {
      this.initiatedContracts.forEach(function (contract) {
        contract.transactionBlockTimeout = value;
      });
      this.net.transactionBlockTimeout = value;
      this.personal.transactionBlockTimeout = value;
      _set(_getPrototypeOf(Eth.prototype), "transactionBlockTimeout", value, this, true);
    }
    ,
    get: function get() {
      return _get(_getPrototypeOf(Eth.prototype), "transactionBlockTimeout", this);
    }
  }, {
    key: "transactionConfirmationBlocks",
    set: function set(value) {
      this.initiatedContracts.forEach(function (contract) {
        contract.transactionConfirmationBlocks = value;
      });
      this.net.transactionConfirmationBlocks = value;
      this.personal.transactionConfirmationBlocks = value;
      _set(_getPrototypeOf(Eth.prototype), "transactionConfirmationBlocks", value, this, true);
    }
    ,
    get: function get() {
      return _get(_getPrototypeOf(Eth.prototype), "transactionConfirmationBlocks", this);
    }
  }, {
    key: "transactionPollingTimeout",
    set: function set(value) {
      this.initiatedContracts.forEach(function (contract) {
        contract.transactionPollingTimeout = value;
      });
      this.net.transactionPollingTimeout = value;
      this.personal.transactionPollingTimeout = value;
      _set(_getPrototypeOf(Eth.prototype), "transactionPollingTimeout", value, this, true);
    }
    ,
    get: function get() {
      return _get(_getPrototypeOf(Eth.prototype), "transactionPollingTimeout", this);
    }
  }, {
    key: "defaultAccount",
    set: function set(value) {
      var _this2 = this;
      this.initiatedContracts.forEach(function (contract) {
        contract.defaultAccount = _this2.utils.toChecksumAddress(value);
      });
      this.net.defaultAccount = value;
      this.personal.defaultAccount = value;
      _set(_getPrototypeOf(Eth.prototype), "defaultAccount", value, this, true);
    }
    ,
    get: function get() {
      return _get(_getPrototypeOf(Eth.prototype), "defaultAccount", this);
    }
  }, {
    key: "defaultBlock",
    set: function set(value) {
      this.initiatedContracts.forEach(function (contract) {
        contract.defaultBlock = value;
      });
      this.net.defaultBlock = value;
      this.personal.defaultBlock = value;
      _set(_getPrototypeOf(Eth.prototype), "defaultBlock", value, this, true);
    }
    ,
    get: function get() {
      return _get(_getPrototypeOf(Eth.prototype), "defaultBlock", this);
    }
  }]);
  return Eth;
}(web3Core.AbstractWeb3Module);

var EthModuleFactory =
function () {
  function EthModuleFactory(provider, providersModuleFactory, methodModuleFactory, accounts, PromiEvent, utils, formatters, contractModuleFactory, abiCoder) {
    _classCallCheck(this, EthModuleFactory);
    this.provider = provider;
    this.providersModuleFactory = providersModuleFactory;
    this.methodModuleFactory = methodModuleFactory;
    this.accounts = accounts;
    this.utils = utils;
    this.formatters = formatters;
    this.contractModuleFactory = contractModuleFactory;
    this.PromiEvent = PromiEvent;
    this.abiCoder = abiCoder;
  }
  _createClass(EthModuleFactory, [{
    key: "createEthModule",
    value: function createEthModule(net, personal, iban, ens, subscriptionsFactory, options) {
      return new Eth(this.provider, this.providersModuleFactory, this.methodModuleFactory, this.createMethodFactory(), net, this.accounts, personal, iban, this.abiCoder, ens, this.utils, this.formatters, subscriptionsFactory, this.contractModuleFactory, options);
    }
  }, {
    key: "createMethodFactory",
    value: function createMethodFactory() {
      return new MethodFactory(this.methodModuleFactory, this.utils, this.formatters);
    }
  }]);
  return EthModuleFactory;
}();

var Eth$1 = function Eth(provider, options) {
  var accounts = new web3EthAccounts.Accounts(provider, options);
  var abiCoder = new web3EthAbi.AbiCoder();
  var methodModuleFactory = new web3CoreMethod.MethodModuleFactory(accounts);
  return new EthModuleFactory(provider, new web3Providers.ProvidersModuleFactory(), methodModuleFactory, accounts, web3CorePromievent.PromiEvent, Utils, web3CoreHelpers.formatters, new web3EthContract.ContractModuleFactory(Utils, web3CoreHelpers.formatters, abiCoder, accounts, methodModuleFactory), abiCoder).createEthModule(new web3Net.Network(provider, options), new web3EthPersonal.Personal(provider, accounts, options), web3EthIban.Iban, new web3EthEns.Ens(provider, accounts), new web3CoreSubscriptions.SubscriptionsFactory(), options);
};

exports.Eth = Eth$1;
