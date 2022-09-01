import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

export const FundingSource = new Mongo.Collection('FundingSource');

// SCHEMA
FundingSource.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    name: {
        type: String
    },
    fundingType: {
        type: String,
        allowedValues: ['Equity Investment', 'Award', 'Government Grant']
    },
    dateRecd: {
        type: Date
    },
    amountRecd: {
        type: Number,
        min: 0
    }
});
FundingSource.attachSchema(FundingSource.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('allFundingSource', () => {
        return FundingSource.find({}, {fields: {}, sort: {}});
    });
}

// METHODS
Meteor.methods({
    'FundingSource.insert'(obj) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        FundingSource.insert({
            ...obj
        });
    },

    'FundingSource.updateBLANK'(objId) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        FundingSource.update({_id:objId}, {$set: {}});
    },
});

// SECURITY
FundingSource.deny({
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
                'FundingSource.insert',
                'FundingSource.remove',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}