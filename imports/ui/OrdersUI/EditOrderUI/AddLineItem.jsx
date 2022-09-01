//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports
import {Expenditure} from "../../../api/PurchasingAPI/expenditure";

//Semantic-UI
import {Form} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class AddLineItem extends Component {
    submitLineItem = () => {
        let extNum = document.getElementById('addItem-extNum').value;
        let extDesc = document.getElementById('addItem-extDesc').value;
        let unitPrice = document.getElementById('addItem-unitPrice').value;
        let quantOrd = document.getElementById('addItem-quantity').value;

        if(extNum === '' || extDesc === '' || unitPrice === '' || quantOrd === '') {
            toast.error('All fields are required! Please fill them in to add item.');
            return;
        }

        Meteor.call('Expenditure.insertBasic', this.props.orderId, extNum, extDesc, unitPrice, quantOrd,
            err => {
                if(err) {
                    toast.error('Something went wrong. Line item not inserted!');
                } else {
                    //clear the fields
                    document.getElementById('addItem-extNum').value = '';
                    document.getElementById('addItem-extDesc').value = '';
                    document.getElementById('addItem-unitPrice').value = '';
                    document.getElementById('addItem-quantity').value = '';

                    //move cursor
                    document.querySelector('#addItem-extNum').focus();
                }
            }
        );
    };

    render() {
        return (
            <Form>
                <Form.Group>
                    <Form.Input id={'addItem-extNum'} placeholder={'External Number'} width={3}/>
                    <Form.Input id={'addItem-extDesc'} placeholder={'External Description'} width={8}/>
                    <Form.Input id={'addItem-unitPrice'} placeholder={'Unit Price'} width={2} type={'number'} min={0}/>
                    <Form.Input id={'addItem-quantity'} placeholder={'Quant Ordered'} width={2} type={'number'} min={0}/>
                    <Form.Button content={'Add Item'} onClick={this.submitLineItem} fluid/>
                </Form.Group>
            </Form>
        )
    }
}

//Type-checking
AddLineItem.propTypes = {
    orderId: PropTypes.string
};

export default AddLineItem;