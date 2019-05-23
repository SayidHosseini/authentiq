const mongoose = require('mongoose');
const config = require('../../config/config.json');
const bcrypt = require('bcryptjs');
const Joi = require('@hapi/joi');
const sn = require('../static/names.json');

const UserSchema = mongoose.Schema({
    email: {
        type: String
        ,index: true
        ,required: true
        ,unique: true
        ,lowercase: true
        ,validate: {
            validator: function(value) {
                const { error } = Joi.validate(value, Joi.string().email({ minDomainSegments: 2}));
                return error ? false : true;
            }
        }
    }
    ,password: {
        type: String
        ,required: true
    }
    ,role: {
        type: String
        ,required: true
        ,enum: [sn.adminRole, sn.userRole, sn.guestRole]
        ,lowercase: true
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = (newUser, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
        if(err){
            callback(err, null);
        }
        else{
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err){
                    callback(err, null);
                }
                else{
                    newUser.password = hash;
                    newUser.save(callback);
                }
            });
        }
    });
};

module.exports.getUsers = (callback) => {
    User.find(callback);
};

module.exports.getUserByEmail = (email, callback) => {
    const query = {
        email: email
    };

    User.findOne(query, callback);
};

module.exports.comparePassword = (password, dbPassword, callback) => {
    bcrypt.compare(password, dbPassword, (err, res) => {
        if (res){
            isMatched = true;
        }
        else{
            isMatched = false;
        }
        callback(null, isMatched);
    });
};

module.exports.updateRole = (email, role, callback) => {
    User.getUserByEmail(email, (err, user) => {
        if(err){
            callback(err, null);
        }
        else{
            user.role = role;
            user.save(callback);
        }
    });
};

module.exports.changePassword = (email, newPassword, callback) => {
    User.getUserByEmail(email, (err, user) => {
        if(err){
            callback(err, null)
        }
        else{
            bcrypt.genSalt(10, (err, salt) => {
                if(err){
                    callback(err, null);
                }
                else{
                    bcrypt.hash(newPassword, salt, (err, hash) => {
                        if(err){
                            callback(err, null);
                        }
                        else{
                            user.password = hash;
                            user.save(callback);
                        }
                    });
                }
            });
        }
    });
};