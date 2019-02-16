import * as Utils from 'web3-utils';
import { AbiCoder } from 'ethers/utils/abi-coder';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

class AbiCoder$1 {
  constructor(utils, ethersAbiCoder) {
    this.utils = utils;
    this.ethersAbiCoder = ethersAbiCoder;
  }
  encodeFunctionSignature(functionName) {
    if (isObject(functionName)) {
      functionName = this.utils.jsonInterfaceMethodToString(functionName);
    }
    return this.utils.sha3(functionName).slice(0, 10);
  }
  encodeEventSignature(functionName) {
    if (isObject(functionName)) {
      functionName = this.utils.jsonInterfaceMethodToString(functionName);
    }
    return this.utils.sha3(functionName);
  }
  encodeParameter(type, param) {
    return this.encodeParameters([type], [param]);
  }
  encodeParameters(types, params) {
    return this.ethersAbiCoder.encode(this._mapTypes(types), params);
  }
  _mapTypes(types) {
    const mappedTypes = [];
    types.forEach(type => {
      if (this._isSimplifiedStructFormat(type)) {
        const structName = Object.keys(type)[0];
        mappedTypes.push(Object.assign(this._mapStructNameAndType(structName), {
          components: this._mapStructToCoderFormat(type[structName])
        }));
        return;
      }
      mappedTypes.push(type);
    });
    return mappedTypes;
  }
  _isSimplifiedStructFormat(type) {
    return typeof type === 'object' && typeof type.components === 'undefined' && typeof type.name === 'undefined';
  }
  _mapStructNameAndType(structName) {
    let type = 'tuple';
    if (structName.indexOf('[]') > -1) {
      type = 'tuple[]';
      structName = structName.slice(0, -2);
    }
    return {
      type,
      name: structName
    };
  }
  _mapStructToCoderFormat(struct) {
    const components = [];
    Object.keys(struct).forEach(key => {
      if (typeof struct[key] === 'object') {
        components.push(Object.assign(this._mapStructNameAndType(key), {
          components: this._mapStructToCoderFormat(struct[key])
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
  encodeFunctionCall(jsonInterface, params) {
    return this.encodeFunctionSignature(jsonInterface) + this.encodeParameters(jsonInterface.inputs, params).replace('0x', '');
  }
  decodeParameter(type, bytes) {
    return this.decodeParameters([type], bytes)[0];
  }
  decodeParameters(outputs, bytes) {
    if (outputs.length > 0 && (!bytes || bytes === '0x' || bytes === '0X')) {
      throw new Error("Returned values aren't valid, did it run Out of Gas?");
    }
    const res = this.ethersAbiCoder.decode(this._mapTypes(outputs), `0x${bytes.replace(/0x/i, '')}`);
    const returnValues = {};
    let decodedValue;
    outputs.forEach((output, i) => {
      decodedValue = res[i];
      decodedValue = decodedValue === '0x' ? null : decodedValue;
      returnValues[i] = decodedValue;
      if (isObject(output) && output.name) {
        returnValues[output.name] = decodedValue;
      }
    });
    return returnValues;
  }
  decodeLog(inputs, data = '', topics) {
    let topicCount = 0;
    if (!isArray(topics)) {
      topics = [topics];
    }
    const notIndexedInputs = [];
    const indexedParams = [];
    inputs.forEach((input, i) => {
      if (input.indexed) {
        indexedParams[i] = ['bool', 'int', 'uint', 'address', 'fixed', 'ufixed'].find(staticType => {
          return input.type.indexOf(staticType) !== -1;
        }) ? this.decodeParameter(input.type, topics[topicCount]) : topics[topicCount];
        topicCount++;
      } else {
        notIndexedInputs[i] = input;
      }
    });
    const nonIndexedData = data;
    const notIndexedParams = nonIndexedData ? this.decodeParameters(notIndexedInputs.filter(Boolean), nonIndexedData) : [];
    let notIndexedOffset = 0;
    const returnValues = {};
    inputs.forEach((res, i) => {
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
}

class AbiModuleFactory {
  createAbiCoder(utils) {
    return new AbiCoder$1(utils, new AbiCoder((type, value) => {
      if (type.match(/^u?int/) && !isArray(value) && (!isObject(value) || value.constructor.name !== 'BN')) {
        return value.toString();
      }
      return value;
    }));
  }
}

const AbiCoder$2 = () => {
  return new AbiModuleFactory().createAbiCoder(Utils);
};

export { AbiCoder$2 as AbiCoder };
