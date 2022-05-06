const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
const app = express();
require('dotenv').config();

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.txqt9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const servicesCollection = client.db('stocks').collection('moto-collection')
        console.log('conncet to db');

        // server home
        app.get('/', async (req, res) => {
            res.send('Moto WareHouse server running')
        })
    }
    finally {
        
    }
}
run().catch(console.dir)


app.listen(port, () => {
    console.log('Listing Port:', port);
})