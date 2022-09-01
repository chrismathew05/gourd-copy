//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {TxnDetail} from "../../api/AccountingAPI/txnDetail";
import {JournalEntry} from "../../api/AccountingAPI/journalEntry";
import {Account} from "../../api/AccountingAPI/account";

import JournalEntryCard from "./JournalEntryCard";

//Semantic-UI
import {Grid, Loader} from "semantic-ui-react";

//Other
import {Waypoint} from "react-waypoint";

//Component
class JournalEntriesList extends Component {
    state = {
        prevLength: 0
    };

    handleWaypointEnter = () => {
        let currentLimit = +Session.get('searchLimit');
        if(this.state.prevLength < this.props.journalEntryList.length) {
            Session.set('searchLimit', currentLimit + 50);
            this.setState({prevLength: this.props.journalEntryList.length});
        }
    };

    render() {
        return (
            <div>
                <Grid stackable columns={2}>
                    {this.props.journalEntryList.map(
                        journalEntry => <Grid.Column key={journalEntry._id}>
                            <JournalEntryCard
                                txnDate={journalEntry.txnDate}
                                debits={journalEntry.debits}
                                credits={journalEntry.credits}
                                accountsList={this.props.accountsList}
                                description={journalEntry.description}
                                supportLinks={journalEntry.supportLinks}
                            />
                        </Grid.Column>
                    )}
                </Grid>
                <Waypoint onEnter={this.handleWaypointEnter}/>
                <br/>
                { !this.props.ready ? <Loader active inline='centered' size='small'/>: <span/>}
                <br/>
                <br/>
                <br/>
            </div>
        )
    }
}

//Type-checking
JournalEntriesList.propTypes = {
    journalEntryIds: PropTypes.oneOfType([ //either a list of ids or a given year
        PropTypes.array,
        PropTypes.number
    ]),

    accountsList: PropTypes.array,
    journalEntryList: PropTypes.array
};

//Container to push data to component
const JournalEntriesListContainer = withTracker(props => {
    let accountsHandle = Meteor.subscribe('allAccountNames');
    let jeHandle;
    if(typeof props.journalEntryIds === 'number') {
        Session.setDefault('searchLimit', 15);

        let searchLimit = +Session.get('searchLimit');
        jeHandle = Meteor.subscribe('jeDetailsLimited', props.journalEntryIds, searchLimit);
    } else {
        jeHandle = Meteor.subscribe('jeDetails', props.journalEntryIds);
    }

    let accountsList = Account.find({},{sort: {name: 1}}).fetch();
    let journalEntryList = [];
    let journalEntries = JournalEntry.find({}, {sort: {txnDate: -1}}).fetch();

    let journalEntryIds = [];

    if(typeof props.journalEntryIds === 'number') {
        journalEntryIds = journalEntries.map(je => je._id);
    } else {
        journalEntryIds = props.journalEntryIds;
    }
    let txnDetailsHandle = Meteor.subscribe('matchingTxnDetails', journalEntryIds);
    if(txnDetailsHandle.ready()) {
        journalEntries.forEach(je => {
            let journalEntry = je;
            let txns = TxnDetail.find({journalEntryId: je._id}).fetch();
            journalEntry.debits = txns.filter(t => t.amount > 0);
            journalEntry.credits = txns.filter(t => t.amount < 0);

            journalEntryList.push(journalEntry);
        });
    }

    let ready = accountsHandle.ready() && jeHandle.ready() && txnDetailsHandle.ready();

    return {
        accountsList,
        journalEntryList,
        ready
    };
})(JournalEntriesList);

export default JournalEntriesListContainer;