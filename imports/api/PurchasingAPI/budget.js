import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import {Meteor} from "meteor/meteor";

export const Budget = new Mongo.Collection('Budget');

// SCHEMA
Budget.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    name: {
        type: String,
        unique: true
    },
    categories: { type: Array },
    'categories.$': { type: Object, blackbox: true  },
});
Budget.attachSchema(Budget.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('allBudgetNames', () => {
        return Budget.find({}, {fields: {name: 1}, sort: {name: 1}});
    });
    Meteor.publish('selectBudget', selectedBudgetId => {
        return Budget.find({_id: selectedBudgetId}, {fields: {categories: 1}});
    });
    Meteor.publish('selectBudgetName', selectedBudgetId => {
        return Budget.find({_id: selectedBudgetId}, {fields: {name: 1}});
    });
}

//HELPER FUNCTIONS
//recursive function that builds categories from scratch again, while ignoring catToRemove
//effectively, removing catToRemove
const buildCategoriesOnRemove = (catToRemove, categories) => {
    let builtCategories = [];
    for (let i = 0; i < categories.length; i++) {
        let c = categories[i];
        if(c.title !== catToRemove) {
            builtCategories.push({
                title: c.title,
                allocation: c.allocation,
                currency: c.currency,
                children: buildCategoriesOnRemove(catToRemove, c.children)
            });
        }
    }
    return builtCategories;
};

//checks if category to add has a unique name
const isUniqueName = (newCategoryName, categories) => {
    let isUnique = true;
    for (let i = 0; i < categories.length; i++) {
        let c = categories[i];
        if(c.title === newCategoryName) {return false;}
        isUnique = isUnique && (c.title !== newCategoryName) && isUniqueName(newCategoryName, c.children);
    }
    return isUnique;
};

// METHODS
Meteor.methods({
    'Budget.insert'(newBudgetName, totalAllocation, currency) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        let categories = [
            {title: newBudgetName, allocation: totalAllocation, currency,
                children: [{title: 'Buffer', allocation: totalAllocation, currency, children: []}] //buffer automatically created
            }];

        Budget.insert({
            name: newBudgetName,
            categories
        }, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Budget.insert', true,
                    ['Attempted to add Budget.', 'newBudgetName: ' + newBudgetName, 'totalAllocation' + totalAllocation, 'currency: ' + currency, 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Budget.insert', false,
                    ['Successfully added Budget.', 'newBudgetName: ' + newBudgetName, 'totalAllocation' + totalAllocation, 'currency: ' + currency]
                );
            }
        });
    },

    'Budget.addCategory'(budgetId, newCategoryName, newCategoryAllocation, newCategoryCurrency) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        let categories = Budget.findOne({_id: budgetId}).categories;

        if(!isUniqueName(newCategoryName, categories)) {
            throw new Meteor.Error('Category name already exists!');
        }

        //adds new category to top, to keep buffer at the bottom
        categories[0].children.unshift({title: newCategoryName, allocation: newCategoryAllocation, currency: newCategoryCurrency, children: []});
        Budget.update({_id: budgetId}, {$set: {categories}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Budget.addCategory', true,
                    ['Attempted to add Budget Category.', 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Budget.addCategory', false,
                    ['Successfully added Budget Category.', 'Budget Id: ' + budgetId, 'New Cat Name: ' + newCategoryName]
                );
            }
        });
    },

    'Budget.updateCategories'(budgetId, categories) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}
        Budget.update({_id: budgetId}, {$set: {categories}});
    },

    'Budget.removeCategory'(budgetId, catToRemove) {
        if (!this.userId) {throw new Meteor.Error('Not Authorized!');}

        let categories = Budget.findOne({_id: budgetId}).categories;

        //aggregate the categories of budget via recursion
        //  with the exception of the categoryToRemove
        categories = buildCategoriesOnRemove(catToRemove, categories);
        Budget.update({_id: budgetId}, {$set: {categories}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Budget.removeCategory', true,
                    ['Attempted to remove Budget Category.', 'Budget Id: ' + budgetId, 'Category to Remove: ' + catToRemove, 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Budget.removeCategory', false,
                    ['Successfully removed Budget Category: ' + catToRemove + ' from BudgetId: ' + budgetId]
                );
            }
        });
    }
});

// SECURITY
Budget.deny({
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
                'Budget.insert',
                'Budget.remove',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}