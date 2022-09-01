//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Modal, Button, Header, Input, Checkbox} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class EditItemShippingModal extends Component {

    updateShipping = () => {
        let shipping = document.getElementById('shipping').value;
        let expIdList = [...this.props.expIdList];

        if(shipping === '' || shipping === null) {shipping = 0;}

        let splitAmount = document.getElementById('split-amount').checked;
        if(splitAmount) {
            shipping = shipping/expIdList.length;
        }

        Meteor.call(
            'Expenditure.updateShipping',
            expIdList,
            shipping,
            err => {
                if(err) {
                    toast.error('Something went wrong! Shipping not updated!');
                } else {
                    toast.success('Shipping successfully updated!');
                }
            }
        );
    };

    render() {
        return (
            <Modal size={'mini'} trigger={this.props.trigger} closeIcon closeOnDimmerClick={false}>
                <Header icon={'truck'} content={'Edit Shipping'}/>
                <Modal.Content>
                    <Input id={'shipping'} fluid placeholder={'Shipping'} defaultValue={this.props.shipping} type={'number'} min={0}/>
                    <br/>
                    <Checkbox id={'split-amount'} label={'Split selected?'}/>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.updateShipping} icon='checkmark' labelPosition='right' content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

//Type-checking
EditItemShippingModal.propTypes = {
    expIdList: PropTypes.object,
    shipping: PropTypes.number,
    trigger: PropTypes.element
};

export default EditItemShippingModal;