//Core imports
import React, {Component} from 'react';

//Component imports
import {Supplier} from "../../../api/PurchasingAPI/supplier";
import SupplierForm from "./SupplierForm";

//Semantic-UI
import {Modal, Button} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class AddSupplierModal extends Component {

    submitSupplier = () => {
        let nickname = document.getElementById('supplier-nickname').value;
        if(nickname === '') {
            toast.error('Nickname must be non-empty!');
            return;
        }

        let newSupplier = {
            nickname,
            officialName: document.getElementById('supplier-officialName').value,
            hstNumber: document.getElementById('supplier-hstNumber').value,
            notes: document.getElementById('supplier-notes').value,
            email: document.getElementById('supplier-email').value,
            phoneNumber: document.getElementById('supplier-phoneNumber').value,
            streetAddress: document.getElementById('supplier-streetAddress').value,
            city: document.getElementById('supplier-city').value,
            province: document.getElementById('supplier-province').value,
            country: document.getElementById('supplier-country').value,
            postalCode: document.getElementById('supplier-postalCode').value,
        };

        Meteor.call('Supplier.insert', newSupplier, err => {
            if(err) {
                toast.error('Something went wrong! Supplier nickname is probably already taken!');
            } else {
                toast.success('Supplier successfully added!');
            }
        });
    };

    render() {
        return (
            <Modal trigger={<Button content='Add Supplier'/>} closeIcon closeOnDimmerClick={false}>
                <Modal.Header>
                    Add Supplier
                </Modal.Header>
                <Modal.Content>
                    <SupplierForm/>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.submitSupplier} icon='checkmark' labelPosition='right'
                            content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default AddSupplierModal;