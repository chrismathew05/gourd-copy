//Core imports
import React, {Component} from 'react';

//Component imports
import SuppliersDropdownContainer from "./SuppliersUI/SuppliersDropdown";
import AddSupplierModal from "./SuppliersUI/AddSupplierModal";
import {Order} from "../../api/PurchasingAPI/order";

//Semantic-UI
import {Modal, Button, Input, Header} from "semantic-ui-react";

//Other
import DateTimePicker from 'react-datetime-picker'
import {toast} from "react-toastify";

//Component
class AddOrderModal extends Component {
    state = {
        dateOrdered: new Date(),
        selectedSupplier: ''
    };

    handleDateTimeChange = date => this.setState({ dateOrdered: date });

    handleSupplierSelection = selectedSupplier => {
        this.setState({selectedSupplier});

        //automatically set PO-number
        let d = this.state.dateOrdered;
        let dateStr = d.getFullYear().toString().substr(-2) + (d.getMonth() + 1).toString().padStart(2, '0') + d.getDate().toString().padStart(2, '0')
                        + d.getHours().toString().padStart(2, '0') + d.getMinutes().toString().padStart(2, '0')
                        + d.getSeconds().toString().padStart(2, '0');

        document.getElementById('order-poNum').value = selectedSupplier.toUpperCase().replace(/ /g,'') + '-' + dateStr;
    };

    submitExpenditure = () => {
        let poNum = document.getElementById('order-poNum').value;
        if(poNum === "") {
            toast.error('Order number must not be empty!');
            return;
        }

        let newOrder = {
            poNum,
            supplier: this.state.selectedSupplier,
            dateOrdered: this.state.dateOrdered
        };

        Meteor.call('Order.insert', newOrder, err => {
            if(err) {
                toast.error('Something went wrong! Order not inserted.');
            } else {
                toast.success('Order successfully added!');
                this.setState({
                    dateOrdered: new Date(),
                    selectedSupplier: ''
                });
                document.getElementById('order-poNum').value = '';
            }
        });
    };

    render() {
        return (
            <Modal size={'tiny'} trigger={<Button>Add Order</Button>} closeIcon closeOnDimmerClick={false}>
                <Header content={'Add Order'}/>
                <Modal.Content>
                    <Header as={'h5'} content={'Order Date'}/>
                    <div>
                        <DateTimePicker
                            locale="en-US"
                            maxDetail={'second'}
                            onChange={this.handleDateTimeChange}
                            value={this.state.dateOrdered}
                        />
                    </div>

                    <br/>
                    <SuppliersDropdownContainer selectedSupplier={this.handleSupplierSelection}/>
                    <br/>
                    <Input id={'order-poNum'} placeholder='Order #' fluid/>
                </Modal.Content>
                <Modal.Actions>
                    <AddSupplierModal/>
                    <Button positive onClick={this.submitExpenditure} icon='checkmark' labelPosition='right'
                            content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default AddOrderModal;