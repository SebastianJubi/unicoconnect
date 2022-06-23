const Appuser = require("../models/user.models");

module.exports = {
    bulkAddAppusers: (appusers) => {
        return new Promise((resolve, reject) => {
            Appuser.insertMany(appusers)
                .then(function (docs) {
                    // console.log("Data inserted");  // Success
                    return resolve(docs);
                }).catch(function (e) {
                    console.log(e);      // Failure
                    return reject(e);
                });
        })
    },
    getAppuserByOptions: (options) => {
        return new Promise((resolve, reject) => {
            try {
                Appuser.find(options)
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
};