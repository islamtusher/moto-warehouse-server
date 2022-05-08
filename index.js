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
        const bikesCollection = client.db('warehouse-stocks').collection('moto-collection')
        console.log('conncet to db');

        // server home 
        app.get('/', async (req, res) => {
            res.send('Moto WareHouse server running')
        })

        // post single data
        app.post('/bikes', async (req, res) => {
            const data = req.body
            const result = await bikesCollection.insertOne(data)
            res.send(result)
        })

        // load all data
        app.get('/bikes', async(req, res)=>{
            const query ={}
            const cursor = bikesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // load single data by req id
        app.get('/bike/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await bikesCollection.findOne(query)
            res.send(result)
            // console.log(id);
        })

        // load data specific using email
        app.get('/myitems', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const cursor = bikesCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)
        })

        //update single data quantity and sold
        app.put('/bike/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity : req.body.newQuantity
                    // sold : req.body.newSold
                },
              };
            const result = await bikesCollection.updateOne(filter, updateDoc, options) 
            res.send(result)
        })

        // Delete single data
        app.delete('/bike/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await bikesCollection.deleteOne(query)
            res.send(result)
        })
    }
    finally {
        
    }
}
run().catch(console.dir)


app.listen(port, () => {
    console.log('Listing Port:', port);
})