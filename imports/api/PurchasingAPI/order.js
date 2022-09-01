import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {Meteor} from "meteor/meteor";
import {Supplier} from "./supplier";
import {HTTP} from "meteor/http";

export const Order = new Mongo.Collection('Order');

// SCHEMA
Order.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    poNum: {
        type: String,
        min: 1,
        unique: true
    },
    supplier: {
        type: String, //stores supplier name (since unique)
    },
    dateOrdered: {
        type: Date
    },
    paymentTerms: {
        type: String, //one of COD, 2/10n30, n30, or #/#n#
        defaultValue: "COD",
        min: 1
    },
    notes: {
        type: String,
        max: 1000,
        optional: true
    },
    orderTotal: {
        type: Number,
        min: 0,
        defaultValue: 0
    },
    orderCurrency: {
        type: String,
        defaultValue: 'CAD'
    },
    paymentCurrency: {
        type: String,
        defaultValue: 'CAD'
    },
    flag: {
        type: Boolean,
        defaultValue: false
    },
    gDriveFolderId: {
        type: String,
        optional: true
    },
    attachmentIds: { //attached gDrive file ids
        type: Array,
        defaultValue: []
    },
    'attachmentIds.$': {
        type: Object,
        blackbox: true
    },
    journalEntryIds: {
        type: Array,
        defaultValue: []
    },
    'journalEntryIds.$': {
        type: String
    },
});
Order.attachSchema(Order.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('ordersList', (query, limit) => {
        return Order.find(
            query,
            {fields: {poNum: 1, paymentCurrency: 1, supplier: 1, dateOrdered: 1, paymentTerms: 1, orderTotal: 1, flag: 1},
                sort: {dateOrdered: -1},
                limit
            });
    });
    Meteor.publish('orderDetails', orderId => {
        return Order.find({_id: orderId}, {
            fields: {poNum: 1, supplier: 1, dateOrdered: 1, paymentTerms: 1, orderTotal: 1,
                notes: 1, lineItems: 1, orderCurrency: 1, paymentCurrency: 1, flag: 1, gDriveFolderId: 1,
                attachmentIds: 1, journalEntryIds: 1}
        })
    });
    Meteor.publish('orderBudgetDetails', orderIds => {
        return Order.find({_id: {$in: orderIds}}, {fields: {poNum: 1, orderCurrency: 1, paymentCurrency: 1}});
    });
}

// METHODS
Meteor.methods({
    'Order.insert'(newOrder) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        //ensure poNum is unique
        const poNum = newOrder.poNum;
        const orders = Order.find({poNum}).fetch();
        if(orders.length > 0) {throw new Meteor.Error('Supplier nickname already exists');}

        //add orders folder under matching suppliers folder on GDrive
        const supplier = newOrder.supplier;
        const supplierGDriveFolderId = Supplier.findOne({nickname: supplier}, {fields: {gDriveFolderId: 1}}).gDriveFolderId;

        const accessToken = Meteor.user().services.google.accessToken;
        const url = 'https://www.googleapis.com/drive/v3/files';
        const data = {
            parents: [supplierGDriveFolderId], //id of Orders folder
            mimeType: "application/vnd.google-apps.folder",
            name: poNum
        };

        //folder creation
        try {
            const res = HTTP.call('POST', url, {
                data,
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            });
            Order.insert({...newOrder, gDriveFolderId: res.data.id, orderTotal: 0}, err => {
                if(err) {
                    throw err;
                } else {
                    Meteor.call(
                        'Logger.insert', 'Order.insert', false, [
                            'Successfully inserted new order.',
                            'Order: ' + JSON.stringify(newOrder),
                            'Response: ' + JSON.stringify(res)
                        ]
                    );
                }
            });
        } catch (e) {
            Meteor.call(
                'Logger.insert', 'Order.insert', true, [
                    'Attempted to insert new order.',
                    'Order: ' + JSON.stringify(newOrder),
                    'Error: ' + JSON.stringify(e)
                ]
            );
            throw new Meteor.Error('Order not inserted. Try logging out and logging back in (probably expired refresh token)');
        }
    },

    'Order.updateOrderCurrency'(orderId, orderCurrency) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Order.update({_id:orderId}, {$set: {orderCurrency}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Order.updateOrderCurrency', true, [
                        'Attempted to update order currency.',
                        'Order Id: ' + orderId,
                        'Order Currency: ' + orderCurrency,
                        'Error: ' + JSON.stringify(err)
                    ]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Order.updateOrderCurrency', false, [
                        'Successfully updated order currency.',
                        'Order Id: ' + orderId,
                        'Order Currency: ' + orderCurrency
                    ]
                );
            }
        });
    },

    'Order.updatePaymentCurrency'(orderId, paymentCurrency) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Order.update({_id:orderId}, {$set: {paymentCurrency}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Order.updatePaymentCurrency', true, [
                        'Attempted to update order currency.',
                        'Order Id: ' + orderId,
                        'Order Currency: ' + paymentCurrency,
                        'Error: ' + JSON.stringify(err)
                    ]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Order.updatePaymentCurrency', false, [
                        'Successfully updated order currency.',
                        'Order Id: ' + orderId,
                        'Order Currency: ' + paymentCurrency
                    ]
                );
            }
        });
    },

    'Order.updateOrderTotal'(orderId, orderTotal) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Order.update({_id:orderId}, {$set: {orderTotal}});
    },

    'Order.updateOrderNotes'(orderId, notes) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Order.update({_id:orderId}, {$set: {notes}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Order.updateOrderNotes', true, [
                        'Attempted to update order notes.',
                        'Order Id: ' + orderId,
                        'Order Notes: ' + notes,
                        'Error: ' + JSON.stringify(err)
                    ]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Order.updateOrderNotes', false, [
                        'Successfully updated order notes.',
                        'Order Id: ' + orderId,
                        'Order Notes: ' + notes
                    ]
                );
            }
        });
    },

    'Order.flag'(orderId) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Order.update({_id:orderId}, {$set: {flag: true}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Order.flag', true, [
                        'Attempted to flag order.',
                        'Order Id: ' + orderId,
                        'Error: ' + JSON.stringify(err)
                    ]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Order.flag', false, [
                        'Successfully flagged order.',
                        'Order Id: ' + orderId
                    ]
                );
            }
        });
    },

    'Order.unflag'(orderId) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Order.update({_id:orderId}, {$set: {flag: false}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Order.unflag', true, [
                        'Attempted to unflag order.',
                        'Order Id: ' + orderId,
                        'Error: ' + JSON.stringify(err)
                    ]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Order.unflag', false, [
                        'Successfully unflagged order.',
                        'Order Id: ' + orderId
                    ]
                );
            }
        });
    },

    'Order.updateAttachmentIds'(orderId, gDriveFolderId) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        const url = "https://www.googleapis.com/drive/v3/files?q='" + gDriveFolderId + "'%20in%20parents";
        const accessToken = Meteor.user().services.google.accessToken;

        try {
            HTTP.call('GET', url, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Accept': 'application/json'
                }
            }, (err, res) => {
                if(err) {
                    console.log(err);
                } else {
                    let attachmentIds = [];
                    res.data.files.forEach(file => {
                        attachmentIds.push({id: file.id, name: file.name})
                    });
                    Order.update({_id: orderId}, {$set: {attachmentIds}});
                }
            });
        } catch(e) {
            throw e;
        }
    }
});

// SECURITY
Order.deny({
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
                'Order.insert',
                'Order.updateOrderCurrency',
                'Order.updatePaymentCurrency',
                'Order.remove',
                'Order.flag',
                'Order.unflag',
                'Order.updateAttachmentIds'
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}