"use strict";
//? Requiring npm modules
const express = require("express");
const router = express.Router();

//? Requiring DB services
const userService = require("../dbops/user.dbops");
const walletService = require("../dbops/wallet.dbops");

//? Get JSON reponse of balance for all users
router.get("/balance", async (req, res) => {
  try {
    console.log(`/balance called`);
    let wallet = await walletService.getWalletByOptions({});
    if (wallet && wallet.length > 0) {
      return res
        .status(200)
        .send({ status: true, message: "Wallet found", wallet });
    }
    return res
      .status(404)
      .send({ status: false, message: "Wallet not found", wallet: null });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

//? Get HTML response of balance for all users
router.get("/balance/describe", async (req, res) => {
  try {
    console.log(`/balance/describe called`);
    let wallet = await walletService.getWalletByOptions({});
    let users = await userService.getAppuserByOptions({});
    //* Creating id and name mapper for users
    let userMap = {};
    users.forEach((user) => { userMap[user.userId] = user.name; return; });
    //* Creating HTML response
    let balance = "";
    wallet.forEach((user) => {
      Object.entries(user.currentBalance).forEach(([key, value]) => {
        if (value > 0) {
          balance += `<br/>${userMap[key]} owes ${userMap[user.userId]}: ${value} (${user.previousBalance[key] || 0}+${(user.lastTransaction.find((el) => el.from === key) || { amount: 0 }).amount})`
        }
      });
    });
    if (wallet && wallet.length > 0) {
      return res
        .status(200)
        .send(balance);
      // .send({ status: true, message: "Wallet found", wallet, balance });
    }
    return res
      .status(404)
      .send({ status: false, message: "Wallet not found", wallet: null });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

//? Add transaction
router.post("/transact", async (req, res) => {
  try {
    console.log(`/transact called`);
    let transactions = req.body.input;
    //* Extracting different params from input string
    const params = transactions.split(" ");
    const userId = params[0];
    const total = +params[1];
    const numUsers = +params[2];
    const type = params[3 + numUsers]; //* EQUAL, EXACT, PERCENT
    // console.log("data", { params, userId, total, numUsers, type });
    let _payee = await walletService.getWalletByOptions({ userId });
    //* Check if payee exists
    if (!_payee || _payee.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "Error in processing transaction string (Payee not found)" });
    }
    switch (type) {
      case "EQUAL":
        break;
      case "EXACT":
        // console.log("params slice", params.slice(4 + numUsers));
        let totalExact = params.slice(4 + numUsers).reduce((acc, num) => +acc + +num);
        // console.log({ totalExact });
        //* Check if total spend matches the amount shared
        if (totalExact !== total) {
          return res
            .status(400)
            .send({ status: false, message: "Error in processing transaction string (Total does not match)" });
        }
        break;
      case "PERCENT":
        let totalPercent = params.slice(4 + numUsers).reduce((acc, num) => +acc + +num);
        //* Check if total percent adds up to 100
        if (totalPercent !== 100) {
          return res
            .status(400)
            .send({ status: false, message: "Error in processing transaction string (Percent does not add up to 100)" });
        }
        break;
      default:
        //* Check if number of users matches the input
        return res
          .status(400)
          .send({ status: false, message: "Error in processing transaction string (Number of users does not match input)" });
        break;
    }
    let totalPercent = 0, totalEqual = 0;
    let payeeTransaction = [];
    _payee = _payee[0];
    _payee.previousBalance = JSON.parse(JSON.stringify(_payee.currentBalance));
    //* Calculate balance for each user
    for (let i = 2 + numUsers; i > 2; i--) {
      let _user = await walletService.getWalletByOptions({ userId: params[i] });
      //* Check if amount-sharing user exists
      if (!_user || _user.length === 0) {
        return res
          .status(404)
          .send({ status: false, message: "Error in processing transaction string (User not found)" });
      }
      let amount = 0;
      //* If 1st user needs to pay extra, eg. Say if User1 paid 100
      //* and the amount is split equally among 3 people. Assign 33.34 to the first person
      //* and 33.33 to the others.
      if (i !== 3) {
        //* Calculate amount for users except 1st user
        switch (type) {
          case "EQUAL":
            amount = +((total / numUsers).toFixed(2));
            totalEqual += amount;
            break;
          case "EXACT":
            amount = +params[numUsers + i + 1];
            break;
          case "PERCENT":
            amount = +(((+params[numUsers + i + 1] * total) / 100).toFixed(2));
            totalPercent += amount;
            break;
          default:
            break;
        }
      } else {
        //* Calculate amount for 1st user
        switch (type) {
          case "EQUAL":
            amount = +(total - totalEqual).toFixed(2);
            break;
          case "EXACT":
            amount = +params[numUsers + i + 1];
            break;
          case "PERCENT":
            amount = +(total - totalPercent).toFixed(2);
            break;
          default:
            break;
        }
      }
      _user = _user[0];
      //* Check if payee and sharing user is different
      if (userId !== _user.userId) {
        //* Preparing user model for update
        _user.previousBalance = JSON.parse(JSON.stringify(_user.currentBalance));
        _user.lastTransaction = [{ from: _user.userId, to: userId, amount }];
        _user.total = +(_user.total - amount).toFixed(2);
        _payee.total = +(_payee.total + amount).toFixed(2);
        payeeTransaction.push({ from: _user.userId, to: userId, amount });
        if (userId in _user.currentBalance) {
          _user.currentBalance[userId] = +(_user.currentBalance[userId] - amount).toFixed(2);
        } else {
          _user.currentBalance[userId] = -amount;
        }
        if (_user.userId in _payee.currentBalance) {
          _payee.currentBalance[_user.userId] = +(_payee.currentBalance[_user.userId] + amount).toFixed(2);
        } else {
          _payee.currentBalance[_user.userId] = amount;
        }
        //* Updating wallet for each user
        await walletService.updateWallet(_user);
      }
    }
    _payee.lastTransaction = payeeTransaction;
    //* Updating wallet for payee
    await walletService.updateWallet(_payee);
    return res
      .status(200)
      .send({ status: true, message: "Wallet updated", data: payeeTransaction });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
});

module.exports = router;