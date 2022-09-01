//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Dropdown, Button, Modal, Header} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";
const currencyOptions = [
    { key: 'ca', value: 'CAD', flag: 'ca', text: 'Canadian Dollar' },
    { key: 'us', value: 'USD', flag: 'us', text: 'US Dollar' },
];

//Component
class CurrencyModal extends Component {
    state = {
        selectedCurrency: 'CAD'
    };

    updateCurrency = () => {
        if(this.props.updateType === 'Order') {
            Meteor.call('Order.updateOrderCurrency', this.props.orderId, this.state.selectedCurrency, err => {
                if(err) {
                    toast.error('Something went wrong. ' + this.props.updateType + ' Currency was not updated');
                } else {
                    toast.success(this.props.updateType + ' Currency successfully updated!');
                }
            });
        } else {
            Meteor.call('Order.updatePaymentCurrency', this.props.orderId, this.state.selectedCurrency, err => {
                if(err) {
                    toast.error('Something went wrong. ' + this.props.updateType + ' Currency was not updated');
                } else {
                    toast.success(this.props.updateType + ' Currency successfully updated!');
                }
            });
        }
    };

    render() {
        return (
            <Modal size={'mini'} trigger={this.props.trigger} closeIcon closeOnDimmerClick={false}>
                <Header icon={'flag'} content={'Edit' + this.props.updateType + 'Currency'}/>
                <Modal.Content>
                    <Dropdown
                        placeholder='Select Currency'
                        fluid search selection
                        onChange={(e, {value}) => this.setState({selectedCurrency: value})}
                        options={currencyOptions} />
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.updateCurrency} icon='checkmark' labelPosition='right' content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

//Type-checking
CurrencyModal.propTypes = {
    orderId: PropTypes.string,
    trigger: PropTypes.element,
    updateType: PropTypes.string //one of 'Order', 'Payment'
};

export default CurrencyModal;