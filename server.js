'use strict';

// Node models
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// module files
const models = require('./models.js');

const port = 3000;
const app = express();

// const url = 'http://localhost:' + port + '/api';
const adminToken = 'rssiprmp';

// Connect mongoose and then run the server.
mongoose.connect('localhost/app');
mongoose.connection.once('open', () => {
    console.log('Mongoose is connected.');
    // Run the server
    app.listen(port, () => {
        console.log('Server is on port', port);
    });
});

app.use(bodyParser.json());

// Returns a list of all registered companies
app.get('/api/companies', (req, res) => {
    models.Company.find({}, (err, docs) => {
        if (err) {
            res.status(500).send('ERROR');
            return;
        }
        res.status(200).send(docs);
    });
});

// Removes all companies in the database
// NOTE: just for testing
app.delete('/api/companies', (req, res) => {
    models.Company.remove({}, (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.status(204).send('Removed all companies');
    });
});

// Adds a new company to the database
// Example input : { name: "Glo", description : "Healty goodshit", punchcard_liftime: 10 }
app.post('/api/companies', (req, res) => {
    // Check if the admin token is set and correct
    if (req.headers.hasOwnProperty('admin_token') && req.headers.admin_token === adminToken)
    {
        const company = new models.Company(req.body);
        // Validate company
        company.validate((err) => {
            if (err) {
                console.log('ERROR company: ', err.message);
                res.status(412).send(err.message);
                return;
            }
            // Save company to database
            company.save((err, docs) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                // Return
                res.status(201).send({ 'company_id' : docs._id });
                return;
            });
        });
    } else {
        res.status(401).send('Admin token missing or incorrect');
        return;
    }
});

// Returns a given company by id.
app.get('/api/companies/:id', (req, res) => {
    const id = req.params.id;
    // Find the user by id
    models.Company.findOne({ '_id' : id }, (err, docs) => {
        if (err) {
            res.status(500).send('Error getting user.');
            return;
        }
        if (!docs) {
            res.status(404).send('User not found.');
            return;
        }
        res.status(200).send(docs);
    });
});

// Returns a list of all users
app.get('/api/users', (req,res) => {
    models.User.find({}, (err, docs) => {
        if (err) {
            res.status(500).send('Error, cannot get users');
            return;
        }
        res.status(200).send(docs.map((val) => { val.token = undefined; return val; }));
    });
});

// Get user by id
app.get('/api/users/:id', (req,res) => {
    const id = req.params.id;
    models.User.findOne({ '_id' : id }, (err, docs) => {
        if (err) {
            res.status(500).send('Error, cannot get user');
            return;
        }
        if (!docs) {
            res.status(404).send('User not found');
            return;
        }
        res.status(200).send(docs);
    });
});

// Adds a new user to the system
app.post('/api/users', (req, res) => {
    const user = new models.User(req.body);
    user.validate((err) => {
        if (err) {
            res.status(412).send(err);
            return;
        }
        user.save((err,docs) => {
            if (err) {
                res.status(500).send('Error, adding user');
                return;
            }
            res.status(201).send(docs);
        });
    });
});

// Adds a new punch to the user account.
app.post('/api/punchcards/:company_id', (req, res) => {
    const company_id = req.params.company_id;

    models.Company.findOne({ '_id' : company_id }, (err, company) => {
        if (err) {
            console.log('comapany error ', err);
            res.status(500).send('Error getting company.');
            return;
        }
        // Check if the company exsist
        if (!company) {
            console.log('company not found');
            res.status(404).send('Company not found.');
            return;
        }
        // Check if the token header is set
        if (!req.headers.hasOwnProperty('token')) {
            res.status(401).send('Token not set');
            return;
        }
        // Get the user token from header
        const userToken = req.headers.token;
        models.User.findOne({ 'token' : userToken }, (err, user) => {
            if (err) {
                res.status(500).send('Error when checking user token');
                return;
            }
            if (!user) {
                res.status(401).send('User not found with provided token');
                return;
            }
            const user_id = user._id;

            models.Punchcard.findOne({ 'user_id' : user_id, 'company_id' : company_id }, (err, punchcard) =>{
                if (err) {
                    res.status(500).send('Error when checking for punch');
                    return;
                }
                if (punchcard) {
                    res.status(409).send('User already has a punchcard for the given company');
                    return;
                }
                const new_punchcard = new models.Punchcard({
                    'user_id' : user_id,
                    'company_id' : company_id,
                });
                new_punchcard.save((err, punch) => {
                    if (err) {
                        res.status(500).send('Error when adding punch');
                        return;
                    }
                    res.status(201).send({ 'punch_id' : punch._id });
                });
            });
        });
    });
});
