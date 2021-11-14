const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3bc4k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run() {
    try {
        await client.connect();
        console.log('database connected successfully');
        const database = client.db('bikeBooking');
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        //get API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        //get singleProduct
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific product', id);
            const query = { _id: ObjectId(id) };
            const singleProduct = await productsCollection.findOne(query);
            res.json(singleProduct);
        });

        //post API
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product)

            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });

        //DELETE API
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });

        //add order API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log('order', order);
            const result = await orderCollection.insertOne(order);
            res.json(result);

        });

        // for update
        app.put('/orders/:id', async (req, res) => {
            const updateOrder = req.body[0];
            const id = req.params.id;
            // console.log(updateOrder);
            const filter = { _id: ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    name: updateOrder.name,
                    email: updateOrder.email,
                    price: updateOrder.price,
                    orderStatus: updateOrder.orderStatus,
                    address: updateOrder.address,
                    phone: updateOrder.phone,
                    title: updateOrder.title,
                }
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.send(result);
        })

        //get all order api
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // get order api 
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific order', id);
            const query = { _id: ObjectId(id) };
            const singleOrder = await orderCollection.findOne(query);
            res.json(singleOrder);
        });

        //delete order API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        })


    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello bikes world!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})