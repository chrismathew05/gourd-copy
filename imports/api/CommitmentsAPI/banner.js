import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

export const Banner = new Mongo.Collection('Banner');

// SCHEMA
Banner.schema = new SimpleSchema({
    _id: {
        type: String
    },
    content: {
        type: String,
        optional: true
    }
});
Banner.attachSchema(Banner.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('generalBanner', () => {
        return Banner.find({_id: 'GENERAL'}, {fields: {content: 1}});
    });
}

// METHODS
Meteor.methods({
    'Banner.insert'(obj) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        Banner.insert({
            ...obj
        });
    },

    'Banner.updateGeneralBannerContent'(content) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        Banner.update({_id:'GENERAL'}, {$set: {content}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Banner.updateGeneralBannerContent', true,
                    ['Attempted to update GENERAL banner.', 'Content: ' + content]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Banner.updateGeneralBannerContent', false,
                    ['Successfully updated banner.', 'Content: ' + content]
                );
            }
        });
    },
});

// SECURITY
Banner.deny({
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
                'Banner.insert',
                'Banner.updateGeneralBannerContent'
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}