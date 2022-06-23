const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userId: { type: String, required: true, unique: true }, // user1
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    tags: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Number, default: +new Date() },
}, { minimize: false });

const User = mongoose.model("unicoconnect_user", UserSchema);

UserSchema.index({ userId: 1, timestamp: 1 });

module.exports = User;