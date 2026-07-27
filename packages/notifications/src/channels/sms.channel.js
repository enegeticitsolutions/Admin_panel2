"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsChannel = void 0;
const provider_factory_1 = require("../providers/provider.factory");
class SmsChannel {
    async send(message) {
        const provider = (0, provider_factory_1.getSmsProvider)();
        return provider.send(message);
    }
}
exports.SmsChannel = SmsChannel;
