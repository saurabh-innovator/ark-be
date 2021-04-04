const express = require('express');
const cors = require('cors');
const app = express();
// const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const connectionParams = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}

var serverConfig = require('./server.json');
console.log(`*****Initializing Arkenea's node server*****`);

async function main() {
    const uri = `mongodb+srv://revvmotorsu1:${serverConfig.mongoPassword}@cluster0.ptqia.mongodb.net/${serverConfig.mongoDbName}?retryWrites=true&w=majority`;
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();
        const db = client.db('arkeneaUsers')
        const usersCollection = db.collection('users')
        usersCollection.createIndex({ "email": 1 }, { unique: true }) //As mentioned applied unique key indexing for email.

        // Get API calls
        app.get('/getUserDetails', (req, res) => {
            var userEmail = req.query.email;
            usersCollection.findOne({ email: userEmail })
                .then(result => {
                    res.status(200).send({
                        message: 'User found.',
                        statusCode: 'USER_FOUND',
                        response: result
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(404).send({
                        message: err,
                        statusCode: 'USER_NOT_FOUND',
                    });
                })
        })

        app.get('/getAllUsers', (req, res) => {
            usersCollection.find({}).toArray(function (err, result) {
                if (err) throw err;
                console.log(result);
                res.status(200).send(result);
            });
        })

        app.post('/addUser', (req, res) => {
            usersCollection.insertOne(req.body)
                .then(result => {
                    res.status(200).send({
                        message: 'User(s) added.',
                        statusCode: 'USER_ADDED',
                        response: result
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).send({
                        message: err,
                        statusCode: 'ERROR_IN_USER_ADD',
                    });
                })
        })

        app.post('/updateUser', (req, res) => {
            var userEmail = req.query.email;
            var valueToBeUpdated = req.body;
            usersCollection.updateOne({ email: userEmail }, { $set: valueToBeUpdated })
                .then(result => {
                    res.status(200).send({
                        message: 'User modified.',
                        statusCode: 'USER_MODIFIED',
                        response: result
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).send({
                        message: err,
                        statusCode: 'ERROR_IN_MODIFIED',
                    });
                })
        })

        app.delete('/deleteUser', (req, res) => {
            var userEmail = req.query.email;
            usersCollection.deleteOne({ email: userEmail })
                .then(result => {
                    res.status(200).send({
                        message: 'User Deleted.',
                        statusCode: 'USER_DELETED',
                        response: result
                    })
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).send({
                        message: err,
                        statusCode: 'ERROR_IN_DELETE',
                    });
                })
        })

    } catch (e) {
        console.error(e);
    }
}

app.use(cors())
// Parsers for POST data
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: false, limit: '20mb' }));

// Parsers for POST data
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: false, limit: '20mb' }))

app.listen(serverConfig.port, () => {
    console.log(`*****Arkenea's server is listening on port ${serverConfig.port}*****`);
})

main().catch(console.error);
