import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

export const TxnDetail = new Mongo.Collection('TxnDetail');

// SCHEMA
TxnDetail.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    accountId: {
        type: String
    },
    journalEntryId: {
        type: String
    },
    amount: {
        type: Number
    },
    currency: {
        type: String,
        min: 3,
        max: 3,
        defaultValue: 'CAD'
    },
});
TxnDetail.attachSchema(TxnDetail.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('matchingTxnDetails', journalEntryIds => {
        return TxnDetail.find(
            {journalEntryId: {$in: journalEntryIds}},
            {fields: {accountId: 1, journalEntryId: 1, type: 1, amount: 1, currency: 1}});
    });
}

// METHODS
Meteor.methods({
    'TxnDetail.insert'(obj) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        TxnDetail.insert({
            ...obj
        });
    },

    'TxnDetail.updateBLANK'(objId) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        TxnDetail.update({_id:objId}, {$set: {}});
    },
});

// SECURITY
TxnDetail.deny({
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
                'TxnDetail.insert',
                'TxnDetail.remove',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}