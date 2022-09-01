//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import JournalEntriesListContainer from "./JournalEntriesList";
import AddJournalEntryContainer from "./AddJournalEntry";

//Semantic-UI
import {Grid, Header, Divider, Button} from "semantic-ui-react";

//Other

//Component
class Accounting extends Component {
    state = {};

    method = () => {

    };

    render() {
        return (
            <div>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <Header
                                content='Accounting'
                                subheader='Manage accounts and journal entries'/>
                        </Grid.Column>
                        <Grid.Column width={8} textAlign='right'>
                            <AddJournalEntryContainer
                                jeMethodName={'JournalEntry.insert'}
                                addlParameters={[]}
                            />
                            {/*<Button>Add Account</Button>*/}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Divider/>
                <JournalEntriesListContainer journalEntryIds={0}/>
            </div>
        )
    }
}

//Type-checking
Accounting.propTypes = {};

//Container to push data to component
const AccountingContainer = withTracker(props => {
    return {
        user: Meteor.user(),
    };
})(Accounting);

export default AccountingContainer;