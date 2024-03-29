const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
const app = express();
require('dotenv').config();

// cors error handle
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// enable cors
app.use(
    cors({
      origin: true,
      optionsSuccessStatus: 200,
      credentials: true,
    })
  );
  app.options(
    '*',
    cors({
      origin: true,
      optionsSuccessStatus: 200,
      credentials: true,
    })
  );

app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.txqt9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// jwt verufy
function verifyJwt(req, res, next){
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({message:'Unauthorize Access'})
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err){
            return res.status(403).send({message: 'Frbidden Access'})
        }
        console.log('jWT decoded', decoded);
        req.decoded = decoded
        next()

    })
}

async function run() {
    try {
        await client.connect()
        const bikesCollection = client.db('warehouse-stocks').collection('moto-collection')
        console.log('Conncet to DB');

        // jwt Auth
        app.post('/token', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.SECRET_TOKEN, {
                expiresIn: '10d'
            })
            res.send({ accessToken })
        })

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
        })

        // load specific data  using email
        app.get('/myitems',verifyJwt, async (req, res) => {
            const decoded = req.decoded.email
            const token = req.headers.authorization
            const email = req.query.email
            if (email === decoded) {
                const query = { email: email }
                const cursor = bikesCollection.find(query)
                const orders = await cursor.toArray()
                res.send(orders)
            }
            else {
                res.status(403).send({message: 'forbeden access'})
            }
        })

        //update single data quantity
        app.put('/bike/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity : req.body.newQuantity
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