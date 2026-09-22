"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = void 0;
const evm_codec_1 = require("@subsquid/evm-codec");
const abi_support_js_1 = require("../abi.support.js");
/** Transfer(address,address,uint256) */
exports.Transfer = (0, abi_support_js_1.event)('0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', {
    from: (0, abi_support_js_1.indexed)(evm_codec_1.address),
    to: (0, abi_support_js_1.indexed)(evm_codec_1.address),
    value: evm_codec_1.uint256,
});
