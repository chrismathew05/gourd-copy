//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Modal, Button, Header, Input, Checkbox} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class EditItemTaxModal extends Component {

    updateTax = () => {
        let tax = document.getElementById('tax').value;
        let hstEligible = document.getElementById('hstEligible').checked;
        let expIdList = [...this.props.expIdList];

        if(tax === '' || tax === null) {tax = 0;}

        if(document.getElementById('split-equally').checked) {
            tax = tax/expIdList.length;
        } else if(document.getElementById('split-proportionally').checked) {
            Meteor.call(
                'Expenditure.updateTaxProportionally',
                expIdList,
                tax,
                hstEligible,
                err => {
                    if(err) {
                        toast.error('Something went wrong! Tax not updated!');
                    } else {
                        toast.success('Tax successfully updated (proportionally)!');
                    }
                }
            );
            return;
        }

        Meteor.call(
            'Expenditure.updateTax',
            expIdList,
            tax,
            hstEligible,
            err => {
                if(err) {
                    toast.error('Something went wrong! Tax not updated!');
                } else {
                    toast.success('Tax successfully updated!');
                }
            }
        );
    };

    render() {
        return (
            <Modal size={'mini'} trigger={this.props.trigger} closeIcon closeOnDimmerClick={false}>
                <Header icon={'legal'} content={'Edit Tax'}/>
                <Modal.Content>
                    <Input id={'tax'} fluid placeholder={'Tax'} defaultValue={this.props.tax} type={'number'} min={0}/>
                    <br/>
                    <div>
                        <Checkbox id={'split-equally'} label={'Split equally?'}/>
                        <Checkbox id={'split-proportionally'} label={'Split proportionally?'} style={{float: 'right'}}/>
                    </div>
                    <br/>
                    <Checkbox id={'hstEligible'} label={'HST Eligible?'} toggle defaultChecked={this.props.hstEligible}/>
                    <br/>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.updateTax} icon='checkmark' labelPosition='right' content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

//Type-checking
EditItemTaxModal.propTypes = {
    expIdList: PropTypes.object,
    tax: PropTypes.number,
    hstEligible: PropTypes.bool,
    trigger: PropTypes.element
};

export default EditItemTaxModal;