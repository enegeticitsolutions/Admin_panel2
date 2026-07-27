"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppChannel = void 0;
const provider_factory_1 = require("../providers/provider.factory");
class WhatsAppChannel {
    async send(message) {
        const provider = (0, provider_factory_1.getWhatsAppProvider)();
        return provider.send(message);
    }
}
exports.WhatsAppChannel = WhatsAppChannel;
