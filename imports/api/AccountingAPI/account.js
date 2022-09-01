import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

export const Account = new Mongo.Collection('Account');

// SCHEMA
Account.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    name: {
        type: String,
        unique: true
    },
    balance: {
        type: Number,
        defaultValue: 0
    },
    parent: {
        type: String,
        allowedValues: ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses', 'Other']
    }
});
Account.attachSchema(Account.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('allAccountNames', () => {
        return Account.find({}, {fields: {name: 1}, sort: {name: 1}});
    });
}

// METHODS
Meteor.methods({
    'Account.insert'(name, parent) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        //add child
        Account.insert({name, balance: 0, parent});
    },

    'Account.remove'(accountId) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        //add child
        Account.remove({_id: accountId});
    }
});

// SECURITY
Account.deny({
    // DENY all client-side updates since we will be using methods to manage this collection
    insert() {
        return true;
    },
    update() {
        return true;
    },
    remove() {
        return true;
    },
});
// RATE LIMITING
if (Meteor.isServer) {
    DDPRateLimiter.addRule({
        name(name) {
            return _.contains([
                'Account.insert',
                'Account.remove',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}