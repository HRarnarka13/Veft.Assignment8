'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const db = require('./app.js');
const port = 3000;
const app = express();

const url = 'http://localhost:' + port + '/api';

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
            res.status('500').send('ERROR');
        } else {
            res.status('200').send(companies);
        }
    });
});

// Removes all companies in the database
// NOTE: just for testing
app.delete('/api/companies', (req, res) => {
    db.removeAllCompanies((err) => {
        if (err) {
            res.status('500').send(err);
        } else {
            res.status('204').send('Removed all companies');
        }
    });
});

// Adds a new company
app.post('/api/companies', (req, res) => {
    if (!req.body.hasOwnProperty('name')) {
        res.status('412').send('missing attribute: name');
        return;
    }
    if (!req.body.hasOwnProperty('description')) {
        res.status('412').send('missing attribute: description');
        return;
    }
    if (!req.body.hasOwnProperty('punchcard_liftime')) {
        res.status('412').send('missing attribute: punchcard_liftime');
        return;
    }

    let company = {
        name: req.body.name,
        description: req.body.description,
        punchcard_liftime: req.body.punchcard_liftime
    };
    db.addCompany(company, (err, dbrs) => {
        console.log(err);
        console.log(dbrs);
    });
    res.status('201').send();
});

// Returns a given company by id.
app.get('/api/companies/:id', (req, res) => {
    const id = req.params.id;
    console.log('ID', id);
    db.getCompanyById(id, (err, company) => {
        if (err) {
            res.status('404').send('Company not found.');
        } else {
            console.log('Company: ', company);
            if (company) {
                res.status('200').send(company);
            } else {
                res.status('404').send('Company not found.');
            }
        }
    });
});

// Returns a list of all users
app.get('/api/users', (req,res) => {
    db.getUsers((err, users) => {
        if (err) {
            res.status('500').send('Cannot get users');
        } else {
            res.status('200').send(users);
        }
    });
});

// Adds a new user to the system
app.post('/api/users', (req, res) => {
    if (!req.body.hasOwnProperty('name')) {
        res.status('412').send('Missing attribute: name');
        return;
    }
    if (!req.body.hasOwnProperty('email')) {
        res.status('412').send('Missing attribute: email');
        return;
    }

    users.push({
        name : req.body.name,
        token : req.body.token,
        age : req.body.age,
        gender : req.body.gender
    });

    

    res.status('201').send();
});

// Returns a list of all punches registered for the given user.
app.get('/api/users/:id/punches', (req, res) => {
    const id = parseInt(req.params.id);
    const user = getUserById(id);
    if (user) {
        if (req.query.company) {
            const companyId = parseInt(req.query.company);
            const userPunches = _.filter(punches, {'userId': id, 'companyId': companyId});
            res.status('200').send(getUserPunchesDTO(userPunches));
        } else {
            const userPunches = _.filter(punches, 'userId', id);
            res.status('200').send(getUserPunchesDTO(userPunches));
        }
    } else {
        res.status('404').send('User not found.');
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
            res.status('201').send(url + '/users/'+ id + '/punches/' + nextId);
        } else {
            res.status('412').send('Company not found.');
        }
    } else {
        res.status('404').send('User not found.');
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
            res.status('200').send(punch);
        } else {
            res.status('404').send('Punch not found.');
        }
    } else {
        res.status('404').send('User not found.');
    }
});


// Run the server
app.listen(port, () => {
    console.log('Server is on port', port);
});
