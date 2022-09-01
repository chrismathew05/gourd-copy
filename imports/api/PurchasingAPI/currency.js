import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';
import {HTTP} from "meteor/http";
import {Meteor} from 'meteor/meteor';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

export const Currency = new Mongo.Collection('Currency');

// SCHEMA
Currency.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    code: {
        type: String, //i.e. CAD_USD = convert CAD -> USD
        min: 7,
        max: 7,
        unique: true
    },
    rate: {
        type: Number,
        min: 0
    },
    obtained: {
        type: Date //timestamp rate was obtained
    }
});
Currency.attachSchema(Currency.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('currencyInfo', code => {
        //update fx rate if older than 30 minutes
        let c = Currency.findOne({code}, {fields: {code: 1, rate: 1, obtained: 1}});

        if(!c) {
            Meteor.call('Currency.updateRate', 'USD_CAD');
        } else {
            let obtained = c.obtained;
            let now = new Date();
            if((now - obtained) > 1800000) { //greater than 30 min = 1800000ms
                Meteor.call('Currency.updateRate', 'USD_CAD');
            }
        }

        return Currency.find({code}, {fields: {code: 1, rate: 1, obtained: 1}});
    });
}

// METHODS
Meteor.methods({
    'Currency.insert'(obj) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Currency.insert({
            ...obj
        });
    },

    'Currency.updateRate'(code) {
        let obtained = new Date();
        let rate = 1;
        let url = "https://free.currencyconverterapi.com/api/v6/convert?q=" + code + "&compact=ultra&apiKey=" + Meteor.settings.public.currencyConverterAPIKey;

        HTTP.call('GET', url, (err, res) => {
            if (!err) {
                rate = res.data[code];

                //insert currency code if need be, otherwise just update rate and obtained timestamp
                let c = Currency.findOne({code}, {fields: {_id: 1}});
                if(c) {
                    Currency.update({code}, {$set: {rate, obtained}});
                } else {
                    Currency.insert({code, rate, obtained});
                }
            } else {
                console.log(err);
            }
        });
    }
});

// SECURITY
Currency.deny({
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
                'Currency.insert',
                'Currency.updateRate',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}