(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('web3-core-helpers'), require('web3-core-subscriptions'), require('web3-eth-accounts'), require('web3-eth-ens'), require('web3-eth-contract'), require('web3-eth-personal'), require('web3-eth-abi'), require('web3-eth-iban'), require('web3-providers'), require('web3-net'), require('web3-utils'), require('web3-core-method'), require('@babel/runtime/helpers/classCallCheck'), require('@babel/runtime/helpers/createClass'), require('@babel/runtime/helpers/possibleConstructorReturn'), require('@babel/runtime/helpers/set'), require('@babel/runtime/helpers/getPrototypeOf'), require('@babel/runtime/helpers/get'), require('@babel/runtime/helpers/inherits'), require('web3-core-promievent'), require('web3-core')) :
    typeof define === 'function' && define.amd ? define(['exports', 'web3-core-helpers', 'web3-core-subscriptions', 'web3-eth-accounts', 'web3-eth-ens', 'web3-eth-contract', 'web3-eth-personal', 'web3-eth-abi', 'web3-eth-iban', 'web3-providers', 'web3-net', 'web3-utils', 'web3-core-method', '@babel/runtime/helpers/classCallCheck', '@babel/runtime/helpers/createClass', '@babel/runtime/helpers/possibleConstructorReturn', '@babel/runtime/helpers/set', '@babel/runtime/helpers/getPrototypeOf', '@babel/runtime/helpers/get', '@babel/runtime/helpers/inherits', 'web3-core-promievent', 'web3-core'], factory) :
    (factory((global.Web3Eth = {}),global.web3CoreHelpers,global.web3CoreSubscriptions,global.web3EthAccounts,global.web3EthEns,global.web3EthContract,global.web3EthPersonal,global.web3EthAbi,global.web3EthIban,global.web3Providers,global.web3Net,global.Utils,global.web3CoreMethod,global._classCallCheck,global._createClass,global._possibleConstructorReturn,global._set,global._getPrototypeOf,global._get,global._inherits,global.web3CorePromievent,global.web3Core));
}(this, (function (exports,web3CoreHelpers,web3CoreSubscriptions,web3EthAccounts,web3EthEns,web3EthContract,web3EthPersonal,web3EthAbi,web3EthIban,web3Providers,web3Net,Utils,web3CoreMethod,_classCallCheck,_createClass,_possibleConstructorReturn,_set,_getPrototypeOf,_get,_inherits,web3CorePromievent,web3Core) { 'use strict';

    _classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
    _createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;
    _possibleConstructorReturn = _possibleConstructorReturn && _possibleConstructorReturn.hasOwnProperty('default') ? _possibleConstructorReturn['default'] : _possibleConstructorReturn;
    _set = _set && _set.hasOwnProperty('default') ? _set['default'] : _set;
    _getPrototypeOf = _getPrototypeOf && _getPrototypeOf.hasOwnProperty('default') ? _getPrototypeOf['default'] : _getPrototypeOf;
    _get = _get && _get.hasOwnProperty('default') ? _get['default'] : _get;
    _inherits = _inherits && _inherits.hasOwnProperty('default') ? _inherits['default'] : _inherits;

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

    Object.defineProperty(exports, '__esModule', { value: true });

})));
