import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

export const Logger = new Mongo.Collection('Logger');

// SCHEMA
Logger.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    header: {
        type: String //METHOD BY USERID ON DATE
    },
    contentList: {
        type: Array
    },
    'contentList.$': { type: String },
    error: {
        type: Boolean,
        defaultValue: false
    },
    dateTime: {
        type: Date
    }
});
Logger.attachSchema(Logger.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('allLogs', () => {
        return Logger.find({}, {fields: {header: 1, contentList: 1, error: 1}, sort: {dateTime: -1}, limit: 100});
    });
}

// METHODS
Meteor.methods({
    'Logger.insert'(methodName, error, contentList) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}
        let dateTime = new Date();

        Logger.insert({
            header: '[' + methodName + '] by user [' + this.userId + '] on [' + dateTime.toString() + ']',
            error,
            contentList,
            dateTime
        });
    },
});

// SECURITY
Logger.deny({
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
                'Logger.insert',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}