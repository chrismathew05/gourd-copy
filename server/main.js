import { Meteor } from 'meteor/meteor';

import {Tasks} from '../imports/api/CommitmentsAPI/tasks';
import {Labels} from '../imports/api/CommitmentsAPI/labels';
import {Banner} from "../imports/api/CommitmentsAPI/banner";

import {Budget} from "../imports/api/PurchasingAPI/budget";
import {Currency} from "../imports/api/PurchasingAPI/currency";

import {Supplier} from "../imports/api/PurchasingAPI/supplier";
import {Order} from "../imports/api/PurchasingAPI/order";
import {Expenditure} from "../imports/api/PurchasingAPI/expenditure";
import {CostObj} from "../imports/api/PurchasingAPI/costObj";

import {Account} from "../imports/api/AccountingAPI/account";
import {JournalEntry} from "../imports/api/AccountingAPI/journalEntry";
import {TxnDetail} from "../imports/api/AccountingAPI/txnDetail";

import {Logger} from "../imports/api/GeneralAPI/logger";

Meteor.startup(() => {
    //Set up Google log-in
    ServiceConfiguration.configurations.upsert({
        service: "google"
    }, {
        $set: {
            clientId: Meteor.settings.google.client_id,
            loginStyle: "popup",
            secret: Meteor.settings.google.client_secret,
        }
    });

    //Check for parent node GENERAL for labels tree
    let generalLabel = Labels.findOne({_id: 'GENERAL'});
    if(!generalLabel) {

        //Add parent node General as well as General Banner
        Labels.insert({_id: 'GENERAL', name: 'General', parent: '', children: []});
        Banner.insert({_id: 'GENERAL', content: ''});

        //Add USD/CAD currency code
        Currency.insert({code: 'USD_CAD', rate: 1, obtained: new Date('December 17, 1995 03:24:00')});
    }
});

Meteor.publish("allUsers", function () {
    return Meteor.users.find({}, {fields: {_id: 1, services: 1}});
});

Meteor.publish("thisUserServices", function () {
    return Meteor.users.find({_id: Meteor.userId()}, {fields: {services: 1}});
});