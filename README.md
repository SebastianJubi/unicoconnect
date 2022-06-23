# unicoconnect
**API-based Expense Sharing Application**

## Overview
An expense sharing application where you can add your expenses and split it among different people. The app keeps balances between people as in who owes how much to whom.

## Requirements
1. User: Each user should have a userId, name, email, mobile number.
2. Expense: Could either be EQUAL, EXACT or PERCENT
3. Users can add any amount, select any type of expense and split with any of the available users.
4. The percent and amount provided could have decimals upto two decimal places.
5. In case of percent, you need to verify if the total sum of percentage shares is 100 or not.
6. In case of exact, you need to verify if the total sum of shares is equal to the total amount or not.
7. The application should have a capability to show expenses for a single user as well as balances for everyone.
8. When asked to show balances, the application should show balances of a user with all the users where there is a non-zero balance.
9. The amount should be rounded off to two decimal places. Say if User1 paid 100 and the amount is split equally among 3 people. Assign 33.34 to the first person and 33.33 to the others.

## Installation

Requires [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/)

Download and install the dependencies.

```sh
git clone https://github.com/SebastianJubi/unicoconnect.git
cd unicoconnect
npm i
```

## Setup

Copy contents of `.env-example` file to `.env-dev` for development or `.env` for production.

```env
PORT = 8080
IP = 127.0.0.1
DB_URL = mongodb://localhost:27017/unicoconnect
```

- `PORT`: Port on which the server should listen
- `IP`: IP Address for starting the server
- `DB_URL`: MonngoDB url for storing of persistence data

## Deployment

_**For Development**_

```sh
node server.js
```

_**For Production**_

Using [PM2](https://pm2.keymetrics.io/)

```sh
pm2 start server.js --name unicoconnect-app -- production
```

## Usage

Start the server, open browser and go to the url: http://localhost:8080/

## API Documentation

To view and use the Postman Collection, click [here](https://drive.google.com/file/d/1fc5JpSvPGq168VJQ6ZmloMGz13KRXtG-/view?usp=sharing).
