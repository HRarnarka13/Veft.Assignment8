'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./app.js');
const uuid = require('node-uuid');
const port = 3000;
const app = express();

// const url = 'http://localhost:' + port + '/api';

const adminToken = 'rssiprmp';


app.use(bodyParser.json());

// Returns a list of all registered companies
app.get('/api/companies', (req, res) => {
    db.getCompanies((err, companies) => {
        if (err) {
            res.status(500).send('ERROR');
        } else {
            res.status(200).send(companies);
        }
    });
});

// Removes all companies in the database
// NOTE: just for testing
app.delete('/api/companies', (req, res) => {
    db.removeAllCompanies((err) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(204).send('Removed all companies');
        }
    });
});

// Adds a new company to the database
// Example input : { name: "Glo", description : "Healty goodshit", punchcard_liftime: 10 }
app.post('/api/companies', (req, res) => {
    // Check if the admin token is set and correct
    if (req.headers.hasOwnProperty('admin_token') && req.headers.admin_token === adminToken)
    {
        // Check if the requst body attributes are correct and their types are correct
        if (!req.body.hasOwnProperty('name')) {
            res.status(412).send('missing attribute: name');
            return;
        } else if (typeof req.body.name !== 'string' && req.body.name instanceof String === false) {
            res.status(412).send('invalid type for attribute name');
            return;
        }
        if (!req.body.hasOwnProperty('description')) {
            res.status(412).send('missing attribute: description');
            return;
        } else if (typeof req.body.description !== 'string' && req.body.description instanceof String === false) {
            res.status(412).send('invalid type for attribute description');
            return;
        }
        if (!req.body.hasOwnProperty('punchcard_liftime')) {
            res.status(412).send('missing attribute: punchcard_liftime');
            return;
        } else if (typeof req.body.punchcard_liftime !== 'number' && req.body.punchcard_liftime instanceof Number === false) {
            res.status(412).send('invalid type for attribute punchcard_liftime');
            return;
        }

        // Create a company object
        let company = {
            name: req.body.name,
            description: req.body.description,
            punchcard_liftime: req.body.punchcard_liftime
        };
        // Add the new company to database
        db.addCompany(company, (err, dbrs) => {
            if (err) {
                res.status(500).send('Error accured when adding company');
                return;
            }
            // Check if the company id is in the response
            if (dbrs.insertedCount === 1 && dbrs.insertedIds[0]) {
                res.status(201).send({'company_id' : dbrs.insertedIds[0]});
                return;
            }
            res.status(412).send('Only add one company at a time');
            return;
        });
    } else {
        res.status(401).send('Admin token missing or incorrect');
    }
});

// Returns a given company by id.
app.get('/api/companies/:id', (req, res) => {
    const id = req.params.id;
    console.log('ID', id);
    db.getCompanyById(id, (err, company) => {
        if (err) {
            res.status(404).send('Company not found.');
            return;
        }
        console.log('Company: ', company);
        if (company) {
            res.status(200).send(company);
            return;
        }
        res.status(404).send('Company not found.');
    });
});

// Returns a list of all users
app.get('/api/users', (req,res) => {
    db.getUsers((err, users) => {
        if (err) {
            res.status(500).send('Cannot get users');
            return;
        }
        res.status(200).send(users);
    });
});

// Adds a new user to the system
app.post('/api/users', (req, res) => {
    if (!req.body.hasOwnProperty('name')) {
        res.status(412).send('Missing attribute: name');
        return;
    }
    if (!req.body.hasOwnProperty('token')) {
        res.status(412).send('Missing attribute: token');
        return;
    }
    if (!req.body.hasOwnProperty('age')) {
        res.status(412).send('Missing attribute: age');
        return;
    }
    if (!req.body.hasOwnProperty('gender')) {
        res.status(412).send('Missing attribute: gender');
        return;
    }

    const user = {
        name : req.body.name,
        token : req.body.token,
        age : req.body.age,
        gender : req.body.gender
    };

    db.addUser(user, (err, dbrs) => {
        if (err) {
            res.status(500).send('Error adding user');
            return;
        }
        res.status(201).send(dbrs.insertedIds);
    });
});

// Adds a new punch to the user account.
app.post('/api/punchcard/:company_id', (req, res) => {
    const company_id = req.params.company_id;
    db.getCompanyById(company_id, (err, company) => {
        if (err) {
            res.status(500).send('Error getting company.');
            return;
        }
        // Check if the company exsist
        if (!company) {
            res.status(404).send('Company not found.');
            return;
        }
        // Check if the token header is set
        if (!req.header.hasOwnProperty('token')) {
            res.status(401).send('Token not set');
            return;
        }
        const userToken = req.header.token;
        console.log('TOKEN!!!', userToken);
        db.getUserByToken(userToken, (err, user) => {
            if (err) {
                res.status(500).send('Error when checking user token');
                return;
            }
            if (!user) {
                res.status(401).send('User not found with provided token');
                return;
            }
            const user_id = user._id;
            // Check if the punch exsist for the current user for the given company.
            db.getPunchByUserAndCompany(user_id, company_id, (err, punch) => {
                if (err) {
                    res.status(500).send('Error when checking for punch');
                    return;
                }
                if (punch) {
                    res.status(409).send('User already has a punchcard for the given company');
                    return;
                }
                // Create a punch object
                const newPunch = {
                    company_id : company_id,
                    user_id : user_id,
                    created : new Date()
                };
		// Add punch to database
                db.addPunch(newPunch, (err, dbrs) => {
                    if (err) {
                        res.status(500).send('Error when adding punch');
                        return;
                    }
                    if (dbrs.insertedCount === 1 && dbrs.insertedIds[0]) {
                        res.status(201).send({'punch_id' : dbrs.insertedIds[0]});
                        return;
                    }
                    res.status(412).send('Only add one punch at a time');
                });
            });
        });
    });
});

// Run the server
app.listen(port, () => {
    console.log('Server is on port', port);
});
