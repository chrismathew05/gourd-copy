import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

import {CostObj} from "./costObj";
import {Meteor} from "meteor/meteor";
export const Expenditure = new Mongo.Collection('Expenditure');

// SCHEMA
Expenditure.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },

    //External Classifiers
    costObjId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    orderId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    budgetId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    budgetCat: {
        type: String,
        optional: true
    },

    //PROPERTIES ====================================
    //QUANTITIES
    extNum: {
        type: String
    },
    extDesc: {
        type: String
    },
    quantOrd: {
        type: Number,
        defaultValue: 1,
        min: 0,
    },
    quantRecInternal: {
        type: Number,
        defaultValue: 0,
        min: 0,
    },
    notes: {
        type: String,
        max: 500,
        optional: true
    },

    //DATES
    dateRecd: {
        type: Date,
        optional: true
    },
    datePaid: {
        type: Date,
        optional: true
    },
    expectedArrrival: { //TODO: implement expected arrival date
        type: Date,
        optional: true
    },

    //METRICS
    unitPrice: {
        type: Number,
        defaultValue: 0,
        min: 0
    },
    extraCharges: {
        type: Array,
        defaultValue: [] //[{desc, amount}]
    },
    'extraCharges.$': {
        type: Object,
        blackbox: true
    },
    shipping: {
        type: Number,
        defaultValue: 0,
        min: 0,
    },
    tax: {
        type: Number,
        defaultValue: 0,
        min: 0
    },
    hstEligible: {
        type: Boolean,
        defaultValue: false
    },
    fxRate: {
        type: Number,
        defaultValue: 1,
        min: 0
    }
});
Expenditure.attachSchema(Expenditure.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('associatedExpenditures', orderId => {
        return Expenditure.find({orderId}, {fields: {
                costObjId: 1,
                orderId: 1,
                budgetId: 1,
                budgetCat: 1,
                extNum: 1,
                extDesc: 1,
                quantOrd: 1,
                quantRecInternal: 1,
                notes: 1,
                dateRecd: 1,
                datePaid: 1,
                expectedArrrival: 1,
                unitPrice: 1,
                extraCharges: 1,
                shipping: 1,
                tax: 1,
                hstEligible: 1,
                fxRate: 1,
                flag: 1
            }});
    });
    Meteor.publish('budgetedExpenditures', budgetId => {
        return Expenditure.find({budgetId}, {fields: {
                orderId: 1,
                extDesc: 1,
                budgetId: 1,
                budgetCat: 1,
                quantOrd: 1,
                unitPrice: 1,
                extraCharges: 1,
                shipping: 1,
                tax: 1,
                fxRate: 1
            }});
    });
}

// METHODS
Meteor.methods({
    'Expenditure.insertBasic'(orderId, extNum, extDesc, unitPrice, quantOrd) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.insert({orderId, extNum, extDesc, unitPrice, quantOrd}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.insertBasic', true,
                    ['Attempted to add Expenditure.', 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.insertBasic', false,
                    ['Successfully added Expenditure.', 'Order Id: ' + orderId, 'External Num: ' + extNum]
                );
            }
        });
    },

    'Expenditure.updateNotes'(expIdList, newNotes) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}
        Expenditure.update({_id: { $in: expIdList }}, {$set: {notes: newNotes}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateNotes', true,
                    ['Attempted to update Expenditure Notes.', 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateNotes', false,
                    ['Successfully updated Expenditure Notes.', 'Exp Id List: ' + expIdList.toString(), 'Notes: ' + newNotes]
                );
            }
        });
    },

    'Expenditure.updateBudget'(expIdList, budgetId, budgetCat) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id: { $in: expIdList }}, {$set: {budgetId, budgetCat}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateBudget', true,
                    ['Attempted to update Budget Category.', 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateBudget', false,
                    ['Successfully updated Budget Categories.', 'Exp Id List: ' + expIdList.toString(), 'budgetId: ' + budgetId, 'budgetCat: ' + budgetCat]
                );
            }
        });
    },

    'Expenditure.updateDatePaid'(expIdList, datePaid) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id: { $in: expIdList }}, {$set: {datePaid}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateDatePaid', true,
                    ['Attempted to update Date Paid.', 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateDatePaid', false,
                    ['Successfully updated Date Paid.', 'Exp Id List: ' + expIdList.toString(), 'datePaid: ' + datePaid.toString()]
                );
            }
        });
    },

    'Expenditure.cancelDatePaid'(expIdList) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id: { $in: expIdList }}, {$unset: {datePaid: ''}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.cancelDatePaid', true,
                    ['Attempted to remove Date Paid.', 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.cancelDatePaid', false,
                    ['Successfully removed Date Paid.', 'Exp Id List: ' + expIdList.toString()]
                );
            }
        });
    },

    'Expenditure.updateCostObjId'(expId, costObjId, oldCostObjId, quantRecInternal) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        if(oldCostObjId && oldCostObjId !== '' && typeof oldCostObjId !== 'undefined') {
            //update balance of old tracker (i.e. remove quantRecInternal from old tracker)
            CostObj.update({_id:costObjId}, {$inc: {balance: -quantRecInternal}});
        }

        Expenditure.update({_id:expId}, {$set: {costObjId}});
        CostObj.update({_id:costObjId}, {$inc: {balance: quantRecInternal}});
    },

    'Expenditure.updateQuantRecInternal'(expId, oldQuantRecInternal, newQuantRecInternal, costObjId) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id:expId}, {$set: {quantRecInternal: newQuantRecInternal}});
        CostObj.update({_id: costObjId}, {$inc: {balance: newQuantRecInternal - oldQuantRecInternal}});
    },

    'Expenditure.updateDateRecd'(expIdList, dateRecd) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id: { $in: expIdList }}, {$set: {dateRecd}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateDateRecd', true,
                    ['Attempted to update Date Recd.', 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateDateRecd', false,
                    ['Successfully updated Date Recd.', 'Exp Id List: ' + expIdList.toString(), 'dateRecd: ' + dateRecd]
                );
            }
        });
    },

    'Expenditure.cancelDateRecd'(expIdList) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id: { $in: expIdList }}, {$unset: {dateRecd: ''}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.cancelDateRecd', true,
                    ['Attempted to remove Date Recd.', 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.cancelDateRecd', false,
                    ['Successfully removed Date Recd.', 'Exp Id List: ' + expIdList.toString()]
                );
            }
        });
    },

    'Expenditure.updateShipping'(expIdList, shipping) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id: { $in: expIdList }}, {$set: {shipping}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateShipping', true,
                    ['Attempted to update Shipping.', 'Error: ' + err, 'Exp Id List: ' + expIdList.toString(), 'Shipping: ' + shipping]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateShipping', false,
                    ['Successfully updated Shipping', 'Exp Id List: ' + expIdList.toString(), 'Shipping: ' + shipping]
                );
            }
        });
    },

    'Expenditure.updateTax'(expIdList, tax, hstEligible) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id: { $in: expIdList }}, {$set: {tax, hstEligible}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateTax', true,
                    ['Attempted to update Shipping.', 'Error: ' + err, 'Exp Id List: ' + expIdList.toString(), 'Tax: ' + tax]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateTax', false,
                    ['Successfully updated Shipping', 'Exp Id List: ' + expIdList.toString(), 'Tax: ' + tax]
                );
            }
        });
    },

    'Expenditure.updateTaxProportionally'(expIdList, tax, hstEligible) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        let orderTotal = 0;
        let expenditures = Expenditure.find({_id: {$in: expIdList}}).fetch().map(exp => {
            let baseTotal = exp.unitPrice * exp.quantOrd;
            orderTotal += baseTotal;
            return {
                _id: exp._id,
                baseTotal
            };
        });

        expenditures.forEach(exp => {
            let itemTax = (exp.baseTotal/orderTotal)*(tax);

            Expenditure.update({_id: exp._id}, {$set: {tax: itemTax, hstEligible}});
        });
    },

    'Expenditure.updateFX'(expIdList, fxRate) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id: { $in: expIdList }}, {$set: {fxRate}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateFX', true,
                    ['Attempted to update FX.', 'Error: ' + err, 'Exp Id List: ' + expIdList.toString(), 'FX: ' + fxRate]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.updateFX', false,
                    ['Successfully updated FX', 'Exp Id List: ' + expIdList.toString(), 'FX: ' + fxRate]
                );
            }
        });
    },

    'Expenditure.addExtraCharge'(expIdList, extraCharge) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.update({_id: { $in: expIdList }}, {$push: {extraCharges: extraCharge}}, {multi: true}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.addExtraCharge', true,
                    ['Attempted to add Extra Charge.', 'Error: ' + err, 'Exp Id List: ' + expIdList.toString(), 'Extra Charge: ' + extraCharge]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.addExtraCharge', false,
                    ['Successfully added Extra Charge', 'Exp Id List: ' + expIdList.toString(), 'Extra Charge: ' + extraCharge]
                );
            }
        });
    },

    'Expenditure.remove'(expIdList) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        Expenditure.find({_id: {$in: expIdList}}).fetch().forEach(exp => {
            if(exp.costObjId) {
                CostObj.update({_id: exp.costObjId}, {$inc: {balance: -exp.quantRecInternal}});
            }
        });

        Expenditure.remove({_id: {$in: expIdList}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Expenditure.remove', true,
                    ['Attempted to remove Expenditures.', 'Error: ' + err, 'Exp Id List: ' + expIdList.toString()]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Expenditure.remove', false,
                    ['Successfully removed Expenditures.', 'Exp Id List: ' + expIdList.toString()]
                );
            }
        });
    },
});

// SECURITY
Expenditure.deny({
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
                'Expenditure.insert',
                'Expenditure.remove',
                'Expenditure.updateNotes',
                'Expenditure.updateBudget',
                'Expenditure.updateDatePaid',
                'Expenditure.cancelDatePaid',
                'Expenditure.updateCostObjId',
                'Expenditure.updateQuantRecInternal',
                'Expenditure.updateDateRecd',
                'Expenditure.cancelDateRecd',
                'Expenditure.updateShipping',
                'Expenditure.updateTax',
                'Expenditure.updateFX',
                'Expenditure.addExtraCharge',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}