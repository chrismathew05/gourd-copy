//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports
import EditItemNotesModal from "./ItemDetailModals/EditItemNotesModal";
import EditItemBudgetPathModal from "./ItemDetailModals/EditItemBudgetPathModal";
import EditItemDatePaidModal from "./ItemDetailModals/EditItemDatePaidModal";
import EditItemDateRecdModal from "./ItemDetailModals/EditItemDateRecdModal";
import EditItemShippingModal from "./ItemDetailModals/EditItemShippingModal";
import EditItemTaxModal from "./ItemDetailModals/EditItemTaxModal";
import EditItemFXModal from "./ItemDetailModals/EditItemFXModal";
import EditItemAddExtraChargeModal from "./ItemDetailModals/EditItemAddExtraChargeModal";

//Semantic-UI
import {Dropdown, Button} from "semantic-ui-react";

//Other

//Component
class EditPropertiesDropdown extends Component {
    state = {
        options: [
            { key: 'notes', icon: 'sticky note', text: 'Notes', value: 'notes' },
            { key: 'budget', icon: 'chart pie', text: 'Budget Path', value: 'budget' },
            { key: 'datePaid', icon: 'credit card', text: 'Date Paid', value: 'datePaid' },
            { key: 'costObj', icon: 'tags', text: 'Cost Object', value: 'costObj' },
            { key: 'quantRecd', icon: 'hashtag', text: 'Quantity Received', value: 'quantRecd' },
            { key: 'dateRecd', icon: 'dolly flatbed', text: 'Date Received', value: 'dateRecd' },
            { key: 'shipping', icon: 'truck', text: 'Shipping', value: 'shipping' },
            { key: 'extraCharges', icon: 'dollar sign', text: 'Extra Charges', value: 'extraCharges' },
            { key: 'tax', icon: 'legal', text: 'Tax', value: 'tax' },
            { key: 'fx', icon: 'pound sign', text: 'FX Rate', value: 'fx' }
        ],
        itemToEdit: 'notes'
    };

    handleChange = (e, { value }) => this.setState({ itemToEdit: value });

    renderEditButton = () => {
        let itemToEdit = this.state.itemToEdit;
        switch (itemToEdit) {
            case 'notes':
                return (
                    <EditItemNotesModal
                        expIdList={this.props.selectedItems}
                        notes={''}
                        trigger={<Button content={'Add/Edit'}/>}
                    />
                );
            case 'budget':
                return (
                    <EditItemBudgetPathModal
                        expIdList={this.props.selectedItems}
                        trigger={<Button content={'Add/Edit'}/>}
                    />
                );
            case 'datePaid':
                return (
                    <EditItemDatePaidModal
                        expIdList={this.props.selectedItems}
                        dateOrdered={this.props.dateOrdered}
                        trigger={<Button content={'Add/Edit'}/>}
                    />
                );
            case 'costObj':
                break;
            case 'quantRecd':
                break;
            case 'dateRecd':
                return (
                    <EditItemDateRecdModal
                        expIdList={this.props.selectedItems}
                        dateOrdered={this.props.dateOrdered}
                        trigger={<Button content={'Add/Edit'}/>}
                    />
                );
            case 'shipping':
                return (
                    <EditItemShippingModal
                        expIdList={this.props.selectedItems}
                        shipping={0}
                        trigger={<Button content={'Add/Edit'}/>}
                    />
                );
            case 'extraCharges':
                return (
                    <EditItemAddExtraChargeModal
                        expIdList={this.props.selectedItems}
                        trigger={<Button content={'Add/Edit'}/>}
                    />
                );
            case 'tax':
                return (
                    <EditItemTaxModal
                        expIdList={this.props.selectedItems}
                        tax={0}
                        hstEligible={false}
                        trigger={<Button content={'Add/Edit'}/>}
                    />
                );
            case 'fx':
                return (
                    <EditItemFXModal
                        expIdList={this.props.selectedItems}
                        fx={1}
                        trigger={<Button content={'Add/Edit'}/>}
                    />
                );
        }
    };

    render() {
        return (
            <Button.Group basic style={{float: 'right'}}>
                {this.renderEditButton()}
                <Dropdown
                    onChange={this.handleChange}
                    options={this.state.options}
                    floating button
                    className='icon'
                    value={this.state.itemToEdit}
                />
            </Button.Group>
        )
    }
}

//Type-checking
EditPropertiesDropdown.propTypes = {
    selectedItems: PropTypes.object,
    dateOrdered: PropTypes.instanceOf(Date)
};

export default EditPropertiesDropdown;