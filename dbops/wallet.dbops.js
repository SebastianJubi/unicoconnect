const Wallet = require("../models/wallet.models");

module.exports = {
    bulkCreateWallets: (wallets) => {
        return new Promise((resolve, reject) => {
            Wallet.insertMany(wallets)
                .then(function (docs) {
                    // console.log("Data inserted");  // Success
                    return resolve(docs);
                }).catch(function (e) {
                    console.log(e);      // Failure
                    return reject(e);
                });
        })
    },
    getWalletByOptions: (options) => {
        return new Promise((resolve, reject) => {
            try {
                Wallet.find(options)
                    .lean()
                    .exec((err, data) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
                        // console.log(data)
                        if (!data || (data && data.length <= 0)) {
                            return resolve(null);
                        }
                        // console.log("resolve data");
                        return resolve(data);
                    });
            } catch (e) {
                console.log(e);
                return reject(e);
            }
        });
    },
    updateWallet: (model) => {
        return new Promise((resolve, reject) => {
            try {
                if ("_id" in model) {
                    delete model._id;
                }
                // console.log("to be updated model =>", model);
                Wallet.findOneAndUpdate({ userId: model.userId }, model, { new: true })
                    .lean()
                    .exec((err, data) => {
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
                        // console.log(data);
                        if (!data || (data && data.length <= 0)) {
                            return resolve(null);
                        }
                        // console.log("resolve updated data", data);
                        return resolve(data);
                    });
            } catch (err) {
                console.log(err);
                return reject(err);
            }
        });
    },
};