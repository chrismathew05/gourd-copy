import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {Meteor} from "meteor/meteor";

export const CostObj = new Mongo.Collection('CostObj');

// SCHEMA
CostObj.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    name: {
        type: String,
        unique: true,
        min: 1
    },
    unitDesc: {
        type: String,
        defaultValue: 'unit'
    },
    balance: {
        type: Number,
        min: 0,
        defaultValue: 0
    },
    notes: {
        type: String,
        max: 9000,
        defaultValue: ''
    },
    itemType: {
        type: Number, //one of: equipment=0, part=1, supply=2, service=3
        defaultValue: 1,
        min: 0,
        max: 3
    },
});
CostObj.attachSchema(CostObj.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('allCostObjNames', () => {
        return CostObj.find({}, {fields: {name: 1}, sort: {name: 1}});
    });

    Meteor.publish('costObjDetails', costObjId => {
        return CostObj.find({_id: costObjId}, {fields: {name: 1, unitDesc: 1, itemType: 1}});
    });
}

// METHODS
Meteor.methods({
    'CostObj.insert'(newCostObj) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        CostObj.insert({
            ...newCostObj
        }, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'CostObj.insert', true,
                    ['Attempted to add Cost Object.', 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'CostObj.insert', false,
                    ['Successfully added Cost Object.']
                );
            }
        });
    },

    'CostObj.updateName'(itemId, newName) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        CostObj.update({_id: itemId}, {$set: {name: newName}});
    },

    'CostObj.updateUnitDesc'(itemId, newUnitDesc) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        CostObj.update({_id: itemId}, {$set: {name: newUnitDesc}});
    },

    'CostObj.updateNotes'(itemId, newNotes) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        CostObj.update({_id: itemId}, {$set: {name: newNotes}});
    },

    'CostObj.updateBalance'(itemId, newBalance) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        CostObj.update({_id: itemId}, {$set: {name: newBalance}});
    },

    'CostObj.remove'(itemId) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        CostObj.remove(itemId);
    },
});

// SECURITY
CostObj.deny({
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
                'CostObj.insert',
                'CostObj.updateName',
                'CostObj.updateUnitDesc',
                'CostObj.updateNotes',
                'CostObj.updateBalance',
                'CostObj.remove',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}