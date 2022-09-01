import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';
import {Meteor} from "meteor/meteor";

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

import {TxnDetail} from "./txnDetail";
import {Order} from "../PurchasingAPI/order";
import {Account} from "./account";

export const JournalEntry = new Mongo.Collection('JournalEntry');

// SCHEMA
JournalEntry.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    datePosted: {
        type: Date
    },
    txnDate: {
        type: Date
    },
    postedBy: {
        type: String //userId
    },
    firstApproval: { //userId of initial approval (should be fin officer) TODO: implement JE approval functionality
        type: String,
        optional: true
    },
    secondaryApproval: {
        type: String,
        optional: true
    },
    description: {
        type: String,
        max: 1000,
        optional: true
    },
    supportLinks: { //links to supporting evidence of JE (i.e. for purchase entries: orders/edit/orderId)
        type: Array,
        defaultValue: []
    },
    'supportLinks.$': {
        type: String
    },
});
JournalEntry.attachSchema(JournalEntry.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('jeDetails', journalEntryIds => {
        return JournalEntry.find(
            {_id: {$in: journalEntryIds}},
            {fields: {datePosted: 1, txnDate: 1, postedBy: 1, description: 1, supportLinks: 1}});
    });

    Meteor.publish('jeDetailsLimited', (journalEntryIds, limit) => {
        return JournalEntry.find({},
            {fields: {datePosted: 1, txnDate: 1, postedBy: 1, description: 1, supportLinks: 1}, limit});
    });
}

// METHODS
Meteor.methods({
    'PurchaseJournalEntry.insert'(newJE, txnDetails, currency, addlSupportLinks, orderId) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        let journalEntryId = JournalEntry.insert({
            ...newJE,
            supportLinks: ['/orders/edit/' + orderId, ...addlSupportLinks]
        }, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'PurchaseJournalEntry.insert', true, [
                        'Attempted to add journal entry.',
                        'New JE: ' + JSON.stringify(newJE),
                        'Txn Details: ' + txnDetails.toString(),
                        'Error: ' + JSON.stringify(err)
                    ]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Order.unflag', false, [
                        'Successfully added journal entry.',
                        'New JE: ' + JSON.stringify(newJE),
                        'Txn Details: ' + txnDetails.toString()
                    ]
                );
            }
        });

        //insert each txnDetail into db and update account balance
        txnDetails.forEach(t => {
            TxnDetail.insert({...t, journalEntryId, currency});
            Account.update({_id: t.accountId}, {$inc: {balance: +t.amount}});
        });

        //add je reference to Order
        Order.update({_id: orderId}, {$push: {journalEntryIds: journalEntryId}});
    },

    'JournalEntry.insert'(newJE, txnDetails, currency, addlSupportLinks) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        let journalEntryId = JournalEntry.insert({
            ...newJE,
            supportLinks: addlSupportLinks
        }, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'PurchaseJournalEntry.insert', true, [
                        'Attempted to add journal entry.',
                        'New JE: ' + JSON.stringify(newJE),
                        'Txn Details: ' + txnDetails.toString(),
                        'Error: ' + JSON.stringify(err)
                    ]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Order.unflag', false, [
                        'Successfully added journal entry.',
                        'New JE: ' + JSON.stringify(newJE),
                        'Txn Details: ' + txnDetails.toString()
                    ]
                );
            }
        });

        //insert each txnDetail into db and update account balance
        txnDetails.forEach(t => {
            TxnDetail.insert({...t, journalEntryId, currency});
            Account.update({_id: t.accountId}, {$inc: {balance: +t.amount}});
        });
    },

    'JournalEntry.updateBLANK'(objId) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        JournalEntry.update({_id:objId}, {$set: {}});
    },
});

// SECURITY
JournalEntry.deny({
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
                'PurchaseJournalEntry.insert',
                'JournalEntry.insert',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}