//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';

//Component imports
import {Budget} from "../../api/PurchasingAPI/budget";

//Semantic-UI
import {Button, Input, Modal, Dropdown} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
const currencyOptions = [
    { key: 'ca', value: 'CAD', flag: 'ca', text: 'Canadian Dollar' },
    { key: 'us', value: 'USD', flag: 'us', text: 'US Dollar' },
];

class AddBudgetModal extends Component {
    state = {
        newBudgetName: '',
        totalAllocation: '',
        selectedCurrency: 'CAD'
    };

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    addBudget = () => {
        if(this.state.newBudgetName !== '') {
            if(this.state.totalAllocation === '') {
                toast.error('Total allocation cannot be empty!');
                return;
            }
            Meteor.call('Budget.insert', this.state.newBudgetName, this.state.totalAllocation, this.state.selectedCurrency, err => {
                if(err) {
                    toast.error('Something went wrong. Budget name is probably already in use!');
                } else {
                    toast.success('New Budget successfully added!');
                    this.setState({
                        newBudgetName: '',
                        totalAllocation: ''
                    });
                }
            });
        } else {
            toast.error('New budget name cannot be empty!')
        }
    };

    render() {
        return (
            <Modal size={'tiny'} trigger={<Button primary content='Budget' icon='add' labelPosition='left' fluid/>}>
                <Modal.Header>Add New Budget</Modal.Header>
                <Modal.Content>
                    <Input placeholder={'New Budget Name'} name={'newBudgetName'}
                           onChange={this.handleChange} value={this.state.newBudgetName} fluid />
                    <br/>
                    <Input type={'numeric'} placeholder={'Total Allocation'} name={'totalAllocation'}
                           onChange={this.handleChange} value={this.state.totalAllocation} fluid />
                    <br/>
                    <Dropdown
                        placeholder='Select Currency'
                        fluid search selection
                        onChange={(e, {value}) => this.setState({selectedCurrency: value})}
                        options={currencyOptions} />
                </Modal.Content>
                <Modal.Actions>
                    <Button positive icon='checkmark' content='Submit' onClick={this.addBudget}/>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default AddBudgetModal;