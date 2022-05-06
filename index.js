const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
const app = express();
require('dotenv').config();

app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    res.send('Moto WareHouse server running')
})

app.listen(port, () => {
    console.log('Listing Port:', port);
})