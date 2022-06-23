"use strict";
//? Requiring npm modules
const express = require("express");
const router = express.Router();

//? Requiring DB services
const userService = require("../dbops/user.dbops");
const walletService = require("../dbops/wallet.dbops");

//? Get balance of user by userid
router.get("/balance/:user", async (req, res) => {
  try {
    console.log(`/balance called for ` + req.params.user);
    let userResp = userService.getAppuserByOptions({ userId: req.params.user });
    let walletResp = walletService.getWalletByOptions({ userId: req.params.user });
    //* Awaiting response of user and wallet
    Promise.all([userResp, walletResp]).then(([user, wallet]) => {
      if (user && user.length > 0) {
        return res
          .status(200)
          .send({ status: true, message: "User found", user, wallet });
      }
      return res
        .status(404)
        .send({ status: false, message: "User not found", user: null, wallet: null });
    })
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

//? Add user
/**
 * @reqBody - {users: [{userId: "string", name: "string", email: "string", mobile: "string"}, {...}, ...]}
**/
router.post("/add", async (req, res) => {
  try {
    const users = req.body.users;
    //* Check if users is empty
    if (!users || users.length === 0) {
      return res.status(400).send({ status: false, message: "No users provided" });
    }
    let _valid = true;
    let _ids = [];
    //* Check if all valid fields are provided in each user
    for (let user of users) {
      if (!("name" in user && "userId" in user && "email" in user && "mobile" in user)) {
        _valid = false;
        break;
      }
      _ids.push(user.userId);
    };
    if (!_valid) {
      return res.status(400).send({ status: false, message: "Data validation failed (Required fields missing)" });
    }
    _ids = [...new Set(_ids)];
    //* Check if all users have unique id in req body
    if (_ids.length !== users.length) {
      return res.status(400).send({ status: false, message: "Data validation failed (Duplicate user-id found)" });
    }
    const allUsers = await userService.getAppuserByOptions({ userId: { "$in": _ids } });
    //* Check if all user ids are not present in DB
    if (!allUsers || allUsers.length === 0) {
      //* Creating users
      const userResp = await userService.bulkAddAppusers(users);
      if (userResp) {
        //* Creating wallets
        const wallets = await walletService.bulkCreateWallets(users);
        if (wallets) {
          return res
            .status(200)
            .send({ status: true, message: "Users added", users: userResp, wallets });
        }
      }
      return res
        .status(409)
        .send({ status: false, message: "Users not added", users: null, wallets: null });
    }
    return res
      .status(400)
      .send({ status: false, message: "One or more users already exist in the database", users: null });
  } catch (e) {
    console.log(e);
    if (e.code === 11000) {
      return res.status(409).send({ status: false, message: "User already exists", data: e });
    }
    return res.status(500).send(e);
  }
});

module.exports = router;