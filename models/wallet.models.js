const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
    userId: { type: String, required: true, unique: true }, // user1
    total: { type: Number, required: true, default: 0 }, // total balance
    previousBalance: { type: Schema.Types.Mixed, default: {} }, // {"user1": 250}
    currentBalance: { type: Schema.Types.Mixed, default: {} },
    lastTransaction: { type: Schema.Types.Mixed, default: [] }, // [ {from: "user1", to: "user2", amount: 250} ]
    timestamp: { type: Number, default: +new Date() },
}, { minimize: false });

const Wallet = mongoose.model("unicoconnect_wallet", WalletSchema);

WalletSchema.index({ userId: 1, timestamp: 1 });

module.exports = Wallet;