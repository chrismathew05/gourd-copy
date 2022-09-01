import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {_} from 'meteor/underscore';

import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';

import {Tasks} from './tasks';
import {Logger} from "../GeneralAPI/logger";

export const Labels = new Mongo.Collection('Labels');

// SCHEMA
Labels.schema = new SimpleSchema({
    _id: {
        type: String
    },
    name: {
        type: String,
        max: 200,
        unique: true
    },
    parent: {
        type: String,
        optional: true
    },
    children: { type: Array },
    'children.$': { type: String },
});
Labels.attachSchema(Labels.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('allLabels', () => {
        return Labels.find({}, {fields: {_id: 1, name: 1, parent: 1, children: 1}});
    });

    Meteor.publish('allLabelNames', () => {
        return Labels.find({}, {fields: {_id: 1, name: 1}});
    });
}

// METHODS
Meteor.methods({
    'Labels.insertChildLabel'(childLabelName, parentLabelId) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        //add child
        let childLabelId = Labels.insert({
            name: childLabelName,
            parent: parentLabelId,
            children: []
        });

        //update parent
        Labels.update({_id: parentLabelId}, {$push: {children: childLabelId}}, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Labels.insertChildLabel', true,
                    ['Attempted to add child label.', 'childLabelName: ' + childLabelName,  'parentLabelId: ' + parentLabelId, 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Labels.insertChildLabel', false,
                    ['Successfully added child label.', 'childLabelName: ' + childLabelName,  'parentLabelId: ' + parentLabelId]
                );
            }
        });
    },

    'Labels.editLabelName'(labelId, newLabelName) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }
        if(labelId === "GENERAL") {
            throw new Meteor.Error('Cannot Delete!');
        }

        Labels.update({_id: labelId}, {$set: {name: newLabelName}});
    },

    'Labels.editLabelParent'(labelId, newParentId) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }
        if(labelId === "GENERAL") {
            throw new Meteor.Error('Cannot Delete!');
        }

        let label = Labels.findOne({_id: labelId}, {fields: {_id: 1, parent: 1}});

        //pull label reference from old parent
        Labels.update({_id: label.parent}, {$pull: {children: label._id}});

        //push label reference unto new parent
        Labels.update({_id: newParentId}, {$push: {children: label._id}});

        //change parent reference (basically, entire sub-tree moves over to new parent)
        Labels.update({_id: labelId}, {$set: {parent: newParentId}});
    },

    'Labels.remove'(labelId) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }
        if(labelId === "GENERAL") {
            throw new Meteor.Error('Cannot Delete!');
        }

        let label = Labels.findOne({_id: labelId}, {fields: {_id: 1, parent: 1, children: 1}});

        //re-assign parent of child nodes to label's own parent
        Labels.update({parent: label._id}, {$set: {parent: label.parent}});

        //assign children of label to label's parent
        Labels.update({_id: label.parent}, {$pull: {children: label._id}});
        Labels.update({_id: label.parent}, {$push: {children: {$each: label.children}}});

        //remove reference from related tasks
        Tasks.update({labelId}, {$set: {labelId: 'GENERAL'}}, {multi: true});

        Labels.remove(labelId);
    },
});

// SECURITY
Labels.deny({
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
                'Labels.insertChildLabel',
                'Labels.editLabelParent',
                'Labels.editLabelName',
                'Labels.remove',
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}