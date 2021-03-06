const express = require ('express');
const db = require('./db/connection');
const { companyMenu } = require('.');


const PORT = process.env.PORT || 3001;
const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use((req, res) => {
    res.status(404).end();
});

// Start server after DB connection
db.connect(err => {
    if (err) throw err;
    console.log(
        `Employee Database`)
    companyMenu();
    });