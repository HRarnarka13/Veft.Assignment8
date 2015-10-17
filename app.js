'use strict';

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const url = 'mongodb://localhost:27017/app';

// <COMPANIES>
const getCompanies = (cb) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            cb(err);
            db.close();
            return;
        }

        const collection = db.collection('companies');
        collection.find({}).toArray((err, companies) => {
            if (err) {
                cb(err);
                db.close();
                return;
            }
            console.log('COMPANIES', companies);
            cb(null, companies);
            db.close();
            return;
        });
    });
};

const getCompanyById = (id, cb) => {
    const objID = new ObjectID(id);
    MongoClient.connect(url, (err, db) => {
        if (err) {
            cb(err);
            db.close();
            return;
        }

        const collection = db.collection('companies');
        collection.findOne({ '_id' : objID }, (err, company) => {
            if (err) {
                cb(err);
                db.close();
                return;
            }
            cb(null, company);
            db.close();
            return;
        });
    });
};

const addCompany = (company, cb) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            cb(err);
            db.close();
            return;
        }

        const collection = db.collection('companies');
        collection.insert(company, (err, res) => {
            if (err) {
                cb(err);
                db.close();
                return;
            }
            cb(null, res);
            db.close();
        });
    });
};

const removeAllCompanies = (cb) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            cb(err);
            db.close();
            return;
        }

        const collection = db.collection('companies');
        collection.remove();
        cb(null);
    });
};

// </COMPANIES>

// <USERS>
const getUsers = (cb) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            cb(err);
            db.close();
            return;
        }

        const collection = db.collection('users');
        collection.find({}).toArray((err, users) => {
            if (err) {
                cb(err);
                db.close();
                return;
            }
            cb(null, users);
            db.close();
            return;
        });
    });
};

const getUserByToken = (token, cb) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            cb(err);
            db.close();
            return;
        }

        const collection = db.collection('users');
        collection.findOne({ 'token' : token }, (err, user) => {
            if (err) {
                cb(err);
                db.close();
                return;
            }
            cb(null, user);
            db.close();
            return;
        });
    });
};

const addUser = (user, cb) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            cb(err);
            db.close();
            return;
        }

        const collection = db.collection('users');
        collection.insert(user, (err, res) => {
            if (err) {
                cb(err);
                db.close();
                return;
            }
            cb(null, res);
            db.close();
            return;
        });
    });
};
// </USERS>

// <punchcard>
const addPunch = (punch, cb) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            cb(err);
            db.close();
            return;
        }

        const collection = db.collection('punchcards');
        collection.insert(punch, (err, res) => {
            if (err) {
                cb(err);
                db.close();
                return;
            }
            cb(null, res);
            db.close();
            return;
        });
    });
};

const getPunchByUserAndCompany = (user_id, company_id, cb) => {
    MongoClient.connect(url, (err, db) => {
        if (err) {
            cb(err);
            db.close();
            return;
        }

        const collection = db.collection('punchcards');
        collection.findOne({ 'user_id' : user_id, 'company_id' : company_id }, (err, punch) => {
            if (err) {
                cb(err);
                db.close();
                return;
            }
            cb(null, punch);
            db.close();
            return;
        });
    });
};

// </punchcard>

module.exports = {
    getCompanies : getCompanies,
    getCompanyById : getCompanyById,
    addCompany : addCompany,
    removeAllCompanies : removeAllCompanies,
    getUsers : getUsers,
    getUserByToken: getUserByToken,
    addUser : addUser,
    addPunch : addPunch,
    getPunchByUserAndCompany : getPunchByUserAndCompany,
};
