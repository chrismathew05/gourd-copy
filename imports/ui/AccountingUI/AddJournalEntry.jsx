//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import NamedDropdownContainer from "../GeneralUI/NamedDropdown";
import {Account} from "../../api/AccountingAPI/account";

//Semantic-UI
import {Button, Form, Grid, Header, Modal, TextArea, Select, Input, Popup} from "semantic-ui-react";

//Other
import DateTimePicker from 'react-datetime-picker'
import {toast} from "react-toastify";

const typeOptions = [{key: 'DR', text: 'DR', value: 1}, {key: 'CR', text: 'CR', value: -1}];
const currencyOptions = [
    { key: 'ca', value: 'CAD', flag: 'ca', text: 'Canadian Dollar' },
    { key: 'us', value: 'USD', flag: 'us', text: 'US Dollar' }
];

//Component
class AddJournalEntry extends Component {
    state = {
        //adder row state variables
        selectedCurrency: 'CAD',
        selectedAccount: '',
        txnType: 1,

        txnDetails: [],
        txnDate: new Date(),

        showModal: false
    };

    addTxnLine = () => {
        //error-checking
        if(this.state.selectedAccount === '') {
            toast.error('Account selection is mandatory!');
            return;
        }

        let txnDetails = this.state.txnDetails;

        txnDetails.push({
            accountId: this.state.selectedAccount,
            amount: document.getElementById('addJE-amount').value * this.state.txnType
        });

        this.setState({txnDetails});
    };

    addJournalEntry = () => {
        //ensure debits=credits
        let bal = this.state.txnDetails.reduce((bal, t) => bal + t.amount, 0);
        if(Math.abs(bal) > 0.001) {
            toast.error('Debits must equal credits. Currently, Debits - Credits = ' + bal);
            return;
        }

        let newJE = {
            datePosted: new Date(),
            txnDate: this.state.txnDate,
            postedBy: Meteor.userId(),
            description: document.getElementById('addJE-desc').value
        };

        let addlSupportLinks = document.getElementById('support-links').value.split(",");

        Meteor.call(this.props.jeMethodName, newJE, this.state.txnDetails, this.state.selectedCurrency, addlSupportLinks, ...this.props.addlParameters, err => {
            if(err) {
                toast.error('Something went wrong. JE not inserted!');
            } else {
                toast.success('Journal Entry succesfully added!');
                this.setState({txnDetails: [], showModal: false});
            }
        });
    };

    handleDateTimeChange = date => this.setState({ txnDate: date });

    handleAccountSelection = selectedAccount => this.setState({selectedAccount});

    getAccountName = accountId => this.props.accountsList.find(acct => acct._id === accountId).name;

    renderDebits = () => this.state.txnDetails.filter(t => t.amount > 0).map((t, index) => <div key={index}>
        DR {this.getAccountName(t.accountId)} {(+t.amount).toFixed(2)}
    </div>);

    renderCredits = () => this.state.txnDetails.filter(t => t.amount < 0).map((t, index) => <div key={index}>
        -------CR {this.getAccountName(t.accountId)} {(-t.amount).toFixed(2)}
    </div>);

    clearTxns = () => this.setState({txnDetails: []});

    closeModal = () => this.setState({ showModal: false });

    render() {
        return (
            <React.Fragment>
                <Popup
                    trigger={<Button color={'purple'} circular icon='calculator' onClick={() => this.setState({showModal: true})}/>}
                    content='Add Journal Entry'
                    position='bottom center'
                    inverted
                />
                <Modal open={this.state.showModal} size={'large'} closeIcon onClose={this.closeModal} closeOnDimmerClick={false}>
                    <Header icon={'calculator'} content={'Add Journal Entry'}/>
                    <Modal.Content>
                        <Header as={'h5'} content={'Transaction Date'}/>
                        <div>
                            <DateTimePicker
                                locale="en-US"
                                maxDetail={'second'}
                                onChange={this.handleDateTimeChange}
                                value={this.state.txnDate}
                            />
                            <Select
                                style={{marginLeft:'10px'}}
                                placeholder={'Select Transaction Currency'}
                                options={currencyOptions}
                                onChange={(e, {value}) => this.setState({selectedCurrency: value})}
                            />
                        </div>
                        <br/>
                        <Form>
                            <TextArea id={'addJE-desc'} placeholder={'Journal Entry Description'} autoHeight/>
                        </Form>
                        <br/>
                        <Grid columns={4} stackable>
                            <Grid.Row>
                                <Grid.Column>
                                    <Select
                                        fluid
                                        defaultValue={'DR'}
                                        options={typeOptions}
                                        onChange={(e, {value}) => this.setState({txnType: value})}
                                    />
                                </Grid.Column>
                                <Grid.Column>
                                    <NamedDropdownContainer
                                        objList={this.props.accountsList}
                                        objName={'Account'}
                                        selectedItem={this.handleAccountSelection}
                                    />
                                </Grid.Column>
                                <Grid.Column>
                                    <Input
                                        id={'addJE-amount'}
                                        placeholder={'Amount ($)'}
                                        type={'number'}
                                        min={0}
                                        fluid
                                    />
                                </Grid.Column>
                                <Grid.Column textAlign={'center'}>
                                    <Button primary width={8} onClick={this.addTxnLine}>Add Txn</Button>
                                    <Button secondary width={8} onClick={this.clearTxns}>Clear Txns</Button>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <br/>
                        <div>
                            {this.renderDebits()}
                            {this.renderCredits()}
                        </div>
                        <br/>
                        <Input id={'support-links'} placeholder={'Additional support links (comma-seperated)'} fluid/>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button positive onClick={this.addJournalEntry} icon='checkmark' labelPosition='right'
                                content='Post'/>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        )
    }
}

//Type-checking
AddJournalEntry.propTypes = {
    accountsList: PropTypes.array,

    jeMethodName: PropTypes.string,
    addlParameters: PropTypes.array
};

//Container to push data to component
const AddJournalEntryContainer = withTracker(() => {
    let accountsHandle = Meteor.subscribe('allAccountNames');
    let ready = accountsHandle.ready();
    let accountsList = [];

    if(ready) { accountsList = Account.find({},{sort: {name: 1}}).fetch(); }

    return {
        accountsList
    };
})(AddJournalEntry);

export default AddJournalEntryContainer;