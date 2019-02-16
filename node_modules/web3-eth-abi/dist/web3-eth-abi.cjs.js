'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Utils = require('web3-utils');
var abiCoder = require('ethers/utils/abi-coder');
var _typeof = _interopDefault(require('@babel/runtime/helpers/typeof'));
var _classCallCheck = _interopDefault(require('@babel/runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('@babel/runtime/helpers/createClass'));
var isArray = _interopDefault(require('lodash/isArray'));
var isObject = _interopDefault(require('lodash/isObject'));

var AbiCoder =
function () {
  function AbiCoder(utils, ethersAbiCoder) {
    _classCallCheck(this, AbiCoder);
    this.utils = utils;
    this.ethersAbiCoder = ethersAbiCoder;
  }
  _createClass(AbiCoder, [{
    key: "encodeFunctionSignature",
    value: function encodeFunctionSignature(functionName) {
      if (isObject(functionName)) {
        functionName = this.utils.jsonInterfaceMethodToString(functionName);
      }
      return this.utils.sha3(functionName).slice(0, 10);
    }
  }, {
    key: "encodeEventSignature",
    value: function encodeEventSignature(functionName) {
      if (isObject(functionName)) {
        functionName = this.utils.jsonInterfaceMethodToString(functionName);
      }
      return this.utils.sha3(functionName);
    }
  }, {
    key: "encodeParameter",
    value: function encodeParameter(type, param) {
      return this.encodeParameters([type], [param]);
    }
  }, {
    key: "encodeParameters",
    value: function encodeParameters(types, params) {
      return this.ethersAbiCoder.encode(this._mapTypes(types), params);
    }
  }, {
    key: "_mapTypes",
    value: function _mapTypes(types) {
      var _this = this;
      var mappedTypes = [];
      types.forEach(function (type) {
        if (_this._isSimplifiedStructFormat(type)) {
          var structName = Object.keys(type)[0];
          mappedTypes.push(Object.assign(_this._mapStructNameAndType(structName), {
            components: _this._mapStructToCoderFormat(type[structName])
          }));
          return;
        }
        mappedTypes.push(type);
      });
      return mappedTypes;
    }
  }, {
    key: "_isSimplifiedStructFormat",
    value: function _isSimplifiedStructFormat(type) {
      return _typeof(type) === 'object' && typeof type.components === 'undefined' && typeof type.name === 'undefined';
    }
  }, {
    key: "_mapStructNameAndType",
    value: function _mapStructNameAndType(structName) {
      var type = 'tuple';
      if (structName.indexOf('[]') > -1) {
        type = 'tuple[]';
        structName = structName.slice(0, -2);
      }
      return {
        type: type,
        name: structName
      };
    }
  }, {
    key: "_mapStructToCoderFormat",
    value: function _mapStructToCoderFormat(struct) {
      var _this2 = this;
      var components = [];
      Object.keys(struct).forEach(function (key) {
        if (_typeof(struct[key]) === 'object') {
          components.push(Object.assign(_this2._mapStructNameAndType(key), {
            components: _this2._mapStructToCoderFormat(struct[key])
          }));
          return;
        }
        components.push({
          name: key,
          type: struct[key]
        });
      });
      return components;
    }
  }, {
    key: "encodeFunctionCall",
    value: function encodeFunctionCall(jsonInterface, params) {
      return this.encodeFunctionSignature(jsonInterface) + this.encodeParameters(jsonInterface.inputs, params).replace('0x', '');
    }
  }, {
    key: "decodeParameter",
    value: function decodeParameter(type, bytes) {
      return this.decodeParameters([type], bytes)[0];
    }
  }, {
    key: "decodeParameters",
    value: function decodeParameters(outputs, bytes) {
      if (outputs.length > 0 && (!bytes || bytes === '0x' || bytes === '0X')) {
        throw new Error("Returned values aren't valid, did it run Out of Gas?");
      }
      var res = this.ethersAbiCoder.decode(this._mapTypes(outputs), "0x".concat(bytes.replace(/0x/i, '')));
      var returnValues = {};
      var decodedValue;
      outputs.forEach(function (output, i) {
        decodedValue = res[i];
        decodedValue = decodedValue === '0x' ? null : decodedValue;
        returnValues[i] = decodedValue;
        if (isObject(output) && output.name) {
          returnValues[output.name] = decodedValue;
        }
      });
      return returnValues;
    }
  }, {
    key: "decodeLog",
    value: function decodeLog(inputs) {
      var _this3 = this;
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var topics = arguments.length > 2 ? arguments[2] : undefined;
      var topicCount = 0;
      if (!isArray(topics)) {
        topics = [topics];
      }
      var notIndexedInputs = [];
      var indexedParams = [];
      inputs.forEach(function (input, i) {
        if (input.indexed) {
          indexedParams[i] = ['bool', 'int', 'uint', 'address', 'fixed', 'ufixed'].find(function (staticType) {
            return input.type.indexOf(staticType) !== -1;
          }) ? _this3.decodeParameter(input.type, topics[topicCount]) : topics[topicCount];
          topicCount++;
        } else {
          notIndexedInputs[i] = input;
        }
      });
      var nonIndexedData = data;
      var notIndexedParams = nonIndexedData ? this.decodeParameters(notIndexedInputs.filter(Boolean), nonIndexedData) : [];
      var notIndexedOffset = 0;
      var returnValues = {};
      inputs.forEach(function (res, i) {
        if (res.indexed) notIndexedOffset++;
        returnValues[i] = res.type === 'string' ? '' : null;
        if (!res.indexed && typeof notIndexedParams[i - notIndexedOffset] !== 'undefined') {
          returnValues[i] = notIndexedParams[i - notIndexedOffset];
        }
        if (typeof indexedParams[i] !== 'undefined') {
          returnValues[i] = indexedParams[i];
        }
        if (res.name) {
          returnValues[res.name] = returnValues[i];
        }
      });
      return returnValues;
    }
  }]);
  return AbiCoder;
}();

var AbiModuleFactory =
function () {
  function AbiModuleFactory() {
    _classCallCheck(this, AbiModuleFactory);
  }
  _createClass(AbiModuleFactory, [{
    key: "createAbiCoder",
    value: function createAbiCoder(utils) {
      return new AbiCoder(utils, new abiCoder.AbiCoder(function (type, value) {
        if (type.match(/^u?int/) && !isArray(value) && (!isObject(value) || value.constructor.name !== 'BN')) {
          return value.toString();
        }
        return value;
      }));
    }
  }]);
  return AbiModuleFactory;
}();

var AbiCoder$1 = function AbiCoder() {
  return new AbiModuleFactory().createAbiCoder(Utils);
};

exports.AbiCoder = AbiCoder$1;
