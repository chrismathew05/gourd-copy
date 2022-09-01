import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import {_} from 'meteor/underscore';
import {DDPRateLimiter} from 'meteor/ddp-rate-limiter';
import moment from "moment";

import {Logger} from "../GeneralAPI/logger";

export const Tasks = new Mongo.Collection('Tasks');

// SCHEMA
Tasks.schema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    complete: {
        type: Boolean,
        defaultValue: false
    },
    weekStart: {
        type: Date
    },
    description: {
        type: String,
        max: 200,
    },
    notes: {
        type: String,
        max: 500,
        optional: true,
    },
    hours: {
        type: Number,
        min: 0,
        max: 168,
        optional: true,
    },
    member: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
    },
    labelId: {
        type: String,
        optional: true
    },
    prevLinkedTask: {
        type: String,
        optional: true
    },
    nextLinkedTask: {
        type: String,
        optional: true
    }
});
Tasks.attachSchema(Tasks.schema);

// PUBLICATIONS
if (Meteor.isServer) {
    Meteor.publish('allTasks', () => {
        return Tasks.find({}, {fields: {}, sort: {}});
    });
    Meteor.publish('tasksForWeekAndUsers', (weekStart, users) => {
        return Tasks.find({weekStart, member: {$in: users}}, {fields: {
            _id:1, complete:1, pushed:1, weekStart:1, description:1, notes:1, hours:1, member:1, labelId: 1, prevLinkedTask: 1, nextLinkedTask: 1
        }});
    });

}

// METHODS
Meteor.methods({
    'Tasks.insert'(obj) {
        if (!this.userId || this.userId !== obj.member) { //only allow users to add tasks for themselves
            throw new Meteor.Error('Not Authorized!');
        }

        Tasks.insert({
            ...obj,
            complete: false,
            labelId: 'GENERAL'
        }, err => {
            if(err) {
                Meteor.call(
                    'Logger.insert', 'Tasks.insert', true,
                    ['Attempted to insert Task.', 'Task details: ' + JSON.stringify(obj), 'Error: ' + err]
                );
            } else {
                Meteor.call(
                    'Logger.insert', 'Tasks.insert', false,
                    ['Successfully inserted Task.', 'Task details: ' + JSON.stringify(obj)]
                );
            }
        });
    },

    'Tasks.removeTask'(objId, member, prevLinkedTask, nextLinkedTask) {
        if (!this.userId || this.userId !== member) { //can only delete your own tasks
            throw new Meteor.Error('Not Authorized!');
        }

        //link previous and next tasks together
        if(typeof prevLinkedTask !== 'undefined' && prevLinkedTask !== null) {
            if(typeof  nextLinkedTask !== 'undefined' && nextLinkedTask !== null) {
                Tasks.update({_id: prevLinkedTask}, {$set: {nextLinkedTask}});
                Tasks.update({_id: nextLinkedTask}, {$set: {prevLinkedTask}});
            } else {
                Tasks.update({_id: prevLinkedTask}, {$unset: {nextLinkedTask}});
            }
        } else {
            if(typeof  nextLinkedTask !== 'undefined' && nextLinkedTask !== null) {
                Tasks.update({_id: nextLinkedTask}, {$unset: {prevLinkedTask}});
            }
        }

        //remove task
        Tasks.remove(objId)
    },

    'Tasks.updateDescription'(objId, description) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }
        Tasks.update({_id: objId}, {$set: {description}});
    },

    'Tasks.updateNotes'(objId, notes) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        Tasks.update({_id: objId}, {$set: {notes}});
    },

    'Tasks.updateHours'(objId, hours) {
        if (!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }
        Tasks.update({_id: objId}, {$set: {hours}});
    },

    'Tasks.completeTask'(objId) {
        if(!this.userId) {
            throw new Meteor.Error('Not Authorized!');
        }

        let t;
        let initialRun = true;
        let idStored;

        //go backwards
        do {
            t = Tasks.findOne({_id: objId}, {fields: {complete:1, prevLinkedTask: 1, nextLinkedTask: 1}});
            if(initialRun) {
                idStored = t.nextLinkedTask;
                initialRun = false;
            }
            if(typeof t !== 'undefined' && t !== null) {
                Tasks.update({_id: objId}, {$set: {complete: !t.complete}});
            }
            objId = t.prevLinkedTask;
        } while (typeof objId !== 'undefined' && objId !== null);

        //go forwards
        objId = idStored;
        if(typeof objId !== 'undefined' && objId !== null) {
            do {
                t = Tasks.findOne({_id: objId}, {fields: {complete:1, prevLinkedTask: 1, nextLinkedTask: 1}});
                if(typeof t !== 'undefined' && t !== null) {
                    Tasks.update({_id: objId}, {$set: {complete: !t.complete}});
                }
                objId = t.nextLinkedTask;
            } while (typeof objId !== 'undefined' && objId !== null);
        }
    },

    'Tasks.updateLabel'(taskId, newLabelId) {
        if(!this.userId) {throw new Meteor.Error('Not Authorized!');}
        Tasks.update({_id: taskId}, {$set: {labelId: newLabelId}});
    },

    'Tasks.pushTask'(taskId) {
        let task = Tasks.findOne(taskId);
        if(typeof task.nextLinkedTask === 'undefined' || task.nextLinkedTask === null) {
            let newTaskId = Tasks.insert({
                complete: task.complete,
                weekStart: moment(task.weekStart).add(7, 'd').toDate(),
                description: task.description,
                notes: task.notes,
                hours: task.hours,
                member: task.member,
                labelId: task.labelId,
                prevLinkedTask: task._id
            });

            Tasks.update({_id: taskId}, {$set: {nextLinkedTask: newTaskId}});
        }
    }
});

// SECURITY
Tasks.deny({
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
                'Tasks.insert',
                'Tasks.removeTask',
                'Tasks.pushTask',
                'Tasks.updateLabel',
                'Tasks.completeTask',
                'Tasks.updateHours',
                'Tasks.updateNotes',
                'Tasks.updateDescription'
            ], name);
        },
        // Rate limit per connection ID
        connectionId() {
            return true;
        }
    }, 20, 1000);
}