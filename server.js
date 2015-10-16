'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const db = require('./app.js');
const port = 3000;
const app = express();

const url = 'http://localhost:' + port + '/api';

const adminToken = 'rssiprmp';


app.use(bodyParser.json());

// A list of companies
let companies = [];
let users = [];
let punches = [];

// Returns an array of UserPunchesDTO objects
function getUserPunchesDTO(userPunches) {
    const punchesDTO = [];
    _.forEach(userPunches, (punch) => {
        const company = getCompanyById(punch.companyId);
        if (company) {
            punchesDTO.push({
                company: company.name,
                date: punch.date
            });
        }
    });
    return punchesDTO;
}

function getUserById(userId) {
    return _.find(users, (u) => {
        return u.id === userId;
    });
}

function getCompanyById(companyId) {
    return _.find(companies, (c) => {
        return c.id === companyId;
    });
}

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
            } else {
                res.status(412).send('Only add one company at a time');
            }
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
        } else {
            console.log('Company: ', company);
            if (company) {
                res.status(200).send(company);
            } else {
                res.status(404).send('Company not found.');
            }
        }
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

// Returns a list of all punches registered for the given user.
app.get('/api/users/:id/punches', (req, res) => {
    const id = parseInt(req.params.id);
    const user = getUserById(id);
    if (user) {
        if (req.query.company) {
            const companyId = parseInt(req.query.company);
            const userPunches = _.filter(punches, {'userId': id, 'companyId': companyId});
            res.status(200).send(getUserPunchesDTO(userPunches));
        } else {
            const userPunches = _.filter(punches, 'userId', id);
            res.status(200).send(getUserPunchesDTO(userPunches));
        }
    } else {
        res.status(404).send('User not found.');
    }
});

// Adds a new punch to the user account.
app.post('/api/users/:id/punches', (req, res) => {
    const id = parseInt(req.params.id);
    const user = getUserById(id);
    if (user) {
        if(!req.body.hasOwnProperty('companyId')){
            res.status(412).send('Missing attribute company id!');
        }
        const companyId = req.body.companyId;
        const company = getCompanyById(companyId);
        if (company) {
            let nextId = punches.length;
            punches.push({
                id : nextId,
                userId : id,
                companyId : companyId,
                date : Date.now()
            });
            res.status(201).send(url + '/users/'+ id + '/punches/' + nextId);
        } else {
            res.status(412).send('Company not found.');
        }
    } else {
        res.status(404).send('User not found.');
    }
});

app.get('/api/users/:userId/punches/:punchId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = getUserById(userId);
    if (user) {
        const punchId = parseInt(req.params.punchId);
        const punch = _.find(punches, (p) => {
            return p.id === punchId;
        });
        if (punch) {
            res.status(200).send(punch);
        } else {
            res.status(404).send('Punch not found.');
        }
    } else {
        res.status(404).send('User not found.');
    }
});


// Run the server
app.listen(port, () => {
    console.log('Server is on port', port);
});
