import { formatters } from 'web3-core-helpers';
import { SubscriptionsFactory } from 'web3-core-subscriptions';
import { Accounts } from 'web3-eth-accounts';
import { Ens } from 'web3-eth-ens';
import { ContractModuleFactory } from 'web3-eth-contract';
import { Personal } from 'web3-eth-personal';
import { AbiCoder } from 'web3-eth-abi';
import { Iban } from 'web3-eth-iban';
import { ProvidersModuleFactory } from 'web3-providers';
import { Network } from 'web3-net';
import * as Utils from 'web3-utils';
import { AbstractMethodFactory, GetNodeInfoMethod, GetProtocolVersionMethod, GetCoinbaseMethod, IsMiningMethod, GetHashrateMethod, IsSyncingMethod, GetGasPriceMethod, GetAccountsMethod, GetBlockNumberMethod, GetBalanceMethod, GetStorageAtMethod, GetCodeMethod, GetBlockMethod, GetUncleMethod, GetBlockTransactionCountMethod, GetBlockUncleCountMethod, GetTransactionMethod, GetTransactionFromBlockMethod, GetTransactionReceipt, GetTransactionCountMethod, SendRawTransactionMethod, SignTransactionMethod, SendTransactionMethod, SignMethod, CallMethod, EstimateGasMethod, SubmitWorkMethod, GetWorkMethod, GetPastLogsMethod, RequestAccountsMethod, MethodModuleFactory } from 'web3-core-method';
import { PromiEvent } from 'web3-core-promievent';
import { AbstractWeb3Module } from 'web3-core';

class MethodFactory extends AbstractMethodFactory {
  constructor(methodModuleFactory, utils, formatters$$1) {
    super(methodModuleFactory, utils, formatters$$1);
    this.methods = {
      getNodeInfo: GetNodeInfoMethod,
      getProtocolVersion: GetProtocolVersionMethod,
      getCoinbase: GetCoinbaseMethod,
      isMining: IsMiningMethod,
      getHashrate: GetHashrateMethod,
      isSyncing: IsSyncingMethod,
      getGasPrice: GetGasPriceMethod,
      getAccounts: GetAccountsMethod,
      getBlockNumber: GetBlockNumberMethod,
      getBalance: GetBalanceMethod,
      getStorageAt: GetStorageAtMethod,
      getCode: GetCodeMethod,
      getBlock: GetBlockMethod,
      getUncle: GetUncleMethod,
      getBlockTransactionCount: GetBlockTransactionCountMethod,
      getBlockUncleCount: GetBlockUncleCountMethod,
      getTransaction: GetTransactionMethod,
      getTransactionFromBlock: GetTransactionFromBlockMethod,
      getTransactionReceipt: GetTransactionReceipt,
      getTransactionCount: GetTransactionCountMethod,
      sendSignedTransaction: SendRawTransactionMethod,
      signTransaction: SignTransactionMethod,
      sendTransaction: SendTransactionMethod,
      sign: SignMethod,
      call: CallMethod,
      estimateGas: EstimateGasMethod,
      submitWork: SubmitWorkMethod,
      getWork: GetWorkMethod,
      getPastLogs: GetPastLogsMethod,
      requestAccounts: RequestAccountsMethod
    };
  }
}

class Eth extends AbstractWeb3Module {
  constructor(provider, providersModuleFactory, methodModuleFactory, methodFactory, net, accounts, personal, Iban$$1, abiCoder, ens, utils, formatters$$1, subscriptionsFactory, contractModuleFactory, options) {
    super(provider, providersModuleFactory, methodModuleFactory, methodFactory, options);
    this.net = net;
    this.accounts = accounts;
    this.personal = personal;
    this.Iban = Iban$$1;
    this.abi = abiCoder;
    this.ens = ens;
    this.utils = utils;
    this.formatters = formatters$$1;
    this.subscriptionsFactory = subscriptionsFactory;
    this.contractModuleFactory = contractModuleFactory;
    this.initiatedContracts = [];
    this.Contract = (abi, address, options) => {
      const contract = this.contractModuleFactory.createContract(this.currentProvider, this.providersModuleFactory, PromiEvent, abi, address, options);
      this.initiatedContracts.push(contract);
      return contract;
    };
  }
  clearSubscriptions() {
    return super.clearSubscriptions('eth_unsubscribe');
  }
  set defaultGasPrice(value) {
    this.initiatedContracts.forEach(contract => {
      contract.defaultGasPrice = value;
    });
    this.net.defaultGasPrice = value;
    this.personal.defaultGasPrice = value;
    super.defaultGasPrice = value;
  }
  get defaultGasPrice() {
    return super.defaultGasPrice;
  }
  set defaultGas(value) {
    this.initiatedContracts.forEach(contract => {
      contract.defaultGas = value;
    });
    this.net.defaultGas = value;
    this.personal.defaultGas = value;
    super.defaultGas = value;
  }
  get defaultGas() {
    return super.defaultGas;
  }
  set transactionBlockTimeout(value) {
    this.initiatedContracts.forEach(contract => {
      contract.transactionBlockTimeout = value;
    });
    this.net.transactionBlockTimeout = value;
    this.personal.transactionBlockTimeout = value;
    super.transactionBlockTimeout = value;
  }
  get transactionBlockTimeout() {
    return super.transactionBlockTimeout;
  }
  set transactionConfirmationBlocks(value) {
    this.initiatedContracts.forEach(contract => {
      contract.transactionConfirmationBlocks = value;
    });
    this.net.transactionConfirmationBlocks = value;
    this.personal.transactionConfirmationBlocks = value;
    super.transactionConfirmationBlocks = value;
  }
  get transactionConfirmationBlocks() {
    return super.transactionConfirmationBlocks;
  }
  set transactionPollingTimeout(value) {
    this.initiatedContracts.forEach(contract => {
      contract.transactionPollingTimeout = value;
    });
    this.net.transactionPollingTimeout = value;
    this.personal.transactionPollingTimeout = value;
    super.transactionPollingTimeout = value;
  }
  get transactionPollingTimeout() {
    return super.transactionPollingTimeout;
  }
  set defaultAccount(value) {
    this.initiatedContracts.forEach(contract => {
      contract.defaultAccount = this.utils.toChecksumAddress(value);
    });
    this.net.defaultAccount = value;
    this.personal.defaultAccount = value;
    super.defaultAccount = value;
  }
  get defaultAccount() {
    return super.defaultAccount;
  }
  set defaultBlock(value) {
    this.initiatedContracts.forEach(contract => {
      contract.defaultBlock = value;
    });
    this.net.defaultBlock = value;
    this.personal.defaultBlock = value;
    super.defaultBlock = value;
  }
  get defaultBlock() {
    return super.defaultBlock;
  }
  subscribe(type, options, callback) {
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
        throw new Error(`Unknown subscription: ${type}`);
    }
  }
  setProvider(provider, net) {
    const setContractProviders = this.initiatedContracts.every(contract => {
      return contract.setProvider(provider, net);
    });
    return this.net.setProvider(provider, net) && this.personal.setProvider(provider, net) && this.accounts.setProvider(provider, net) && super.setProvider(provider, net) && setContractProviders;
  }
}

class EthModuleFactory {
  constructor(provider, providersModuleFactory, methodModuleFactory, accounts, PromiEvent$$1, utils, formatters$$1, contractModuleFactory, abiCoder) {
    this.provider = provider;
    this.providersModuleFactory = providersModuleFactory;
    this.methodModuleFactory = methodModuleFactory;
    this.accounts = accounts;
    this.utils = utils;
    this.formatters = formatters$$1;
    this.contractModuleFactory = contractModuleFactory;
    this.PromiEvent = PromiEvent$$1;
    this.abiCoder = abiCoder;
  }
  createEthModule(net, personal, iban, ens, subscriptionsFactory, options) {
    return new Eth(this.provider, this.providersModuleFactory, this.methodModuleFactory, this.createMethodFactory(), net, this.accounts, personal, iban, this.abiCoder, ens, this.utils, this.formatters, subscriptionsFactory, this.contractModuleFactory, options);
  }
  createMethodFactory() {
    return new MethodFactory(this.methodModuleFactory, this.utils, this.formatters);
  }
}

const Eth$1 = (provider, options) => {
  const accounts = new Accounts(provider, options);
  const abiCoder = new AbiCoder();
  const methodModuleFactory = new MethodModuleFactory(accounts);
  return new EthModuleFactory(provider, new ProvidersModuleFactory(), methodModuleFactory, accounts, PromiEvent, Utils, formatters, new ContractModuleFactory(Utils, formatters, abiCoder, accounts, methodModuleFactory), abiCoder).createEthModule(new Network(provider, options), new Personal(provider, accounts, options), Iban, new Ens(provider, accounts), new SubscriptionsFactory(), options);
};

export { Eth$1 as Eth };
