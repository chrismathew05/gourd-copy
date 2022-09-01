//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Modal, Button, Input, Header, Checkbox} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class EditItemAddExtraChargeModal extends Component {

    addExtraCharge = () => {
        let extraChargeDesc = document.getElementById('extraCharge-desc').value;
        let extraChargeAmount = document.getElementById('extraCharge-amount').value;
        let expIdList = [...this.props.expIdList];

        if(!extraChargeDesc || !extraChargeAmount || extraChargeDesc === '' || extraChargeAmount === 0) {
            toast.error('All fields are required! Please fill before adding extra charge.');
            return;
        }

        let splitAmount = document.getElementById('split-amount').checked;
        if(splitAmount) {
            extraChargeAmount = extraChargeAmount/expIdList.length;
        }

        let extraCharge = {
            desc: extraChargeDesc,
            amount: extraChargeAmount
        };

        Meteor.call('Expenditure.addExtraCharge', expIdList, extraCharge, err => {
           if(err) {
               toast.error('Something went wrong! Extra charge not added.');
           } else {
               toast.success('Extra charge successfully added!');
           }
        });
    };

    render() {
        return (
            <Modal size={'mini'} trigger={this.props.trigger}
                   closeIcon closeOnDimmerClick={false}>
                <Header icon={'dollar sign'} content={'Add Extra Charge'}/>
                <Modal.Content>
                    <Input id={'extraCharge-desc'} fluid placeholder={'Description'}/>
                    <br/>
                    <Input id={'extraCharge-amount'} fluid placeholder={'Amount'} type={'number'}/>
                    <br/>
                    <Checkbox id={'split-amount'} label={'Split selected?'}/>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.addExtraCharge} icon='checkmark' labelPosition='right' content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

//Type-checking
EditItemAddExtraChargeModal.propTypes = {
    expIdList: PropTypes.object,
    trigger: PropTypes.element
};

export default EditItemAddExtraChargeModal;