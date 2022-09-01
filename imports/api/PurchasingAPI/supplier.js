import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {Meteor} from "meteor/meteor";
import {HTTP} from "meteor/http";

export const Supplier = new Mongo.Collection('Supplier');

// SCHEMA
Supplier.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    nickname: {
        type: String,
        unique: true,
        min: 1,
        index: 1
    },
    officialName: {
        type: String,
        min: 1,
        optional: true,
    },
    hstNumber: {
        type: String,
        optional: true,
    },
    notes: {
        type: String,
        max: 500,
        optional: true
    },
    email: {
        type: SimpleSchema.RegEx.Email,
        max: 50,
        optional: true,
    },
    phoneNumber: {
        type: String,
        optional: true,
    },
    streetAddress: {
        type: String,
        optional: true,
    },
    city: {
        type: String,
        optional: true,
    },
    province: {
        type: String,
        optional: true,
    },
    country: {
        type: String,
        optional: true,
    },
    postalCode: {
        type: String,
        optional: true,
    },
    gDriveFolderId: {
        type: String,
        optional: true
    },
});
Supplier.attachSchema(Supplier.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('allSupplierNickNames', () => {
        return Supplier.find({}, {fields: {_id: 1, nickname: 1}, sort: {nickname: 1}});
    });
    Meteor.publish('supplierGDriveFolderId', nickname => {
        return Supplier.find({nickname}, {fields: {gDriveFolderId: 1, nickname: 1}});
    });
    Meteor.publish('supplierDetails', nickname => {
        return Supplier.find({nickname}, {fields: {officialName: 1, email: 1, phoneNumber: 1, streetAddress: 1, city: 1, province: 1, country: 1, postalCode: 1}});
    });
}

// METHODS
Meteor.methods({
    'Supplier.insert'(newSupplier) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        //ensure nickname is unique
        const nickname = newSupplier.nickname;
        let suppliers = Supplier.find({nickname}).fetch();
        if(suppliers.length > 0) {throw new Meteor.Error('Supplier nickname already exists');}

        //add supplier folder to 'Orders' folder on GDrive
        const accessToken = Meteor.user().services.google.accessToken;
        const url = 'https://www.googleapis.com/drive/v3/files';
        const data = {
            parents: [Meteor.settings.public.ordersGDriveFolderId], //id of Orders folder
            mimeType: "application/vnd.google-apps.folder",
            name: nickname
        };

        try {
            const res = HTTP.call('POST', url, {
                data,
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            });
            //insert supplier
            const gDriveFolderId = res.data.id;
            Supplier.insert({...newSupplier, gDriveFolderId}, err => {
                if(err) {
                    throw err;
                } else {
                    Meteor.call(
                        'Logger.insert', 'Supplier.insert', false, [
                            'Successfully inserted new suppler.',
                            'Supplier: ' + JSON.stringify(newSupplier),
                            'Response: ' + JSON.stringify(res)
                        ]
                    );
                }
            });
        } catch (e) {
            Meteor.call(
                'Logger.insert', 'Supplier.insert', true, [
                    'Attempted to insert new suppler.',
                    'Supplier: ' + JSON.stringify(newSupplier),
                    'Error: ' + JSON.stringify(e)
                ]
            );
            throw new Meteor.Error('Supplier not inserted. Try logging out and logging back in (probably expired refresh token).');
        }
    }
});

// SECURITY
Supplier.deny({
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
                'Supplier.insert'
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}