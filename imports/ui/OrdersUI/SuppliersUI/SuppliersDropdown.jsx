//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {Supplier} from "../../../api/PurchasingAPI/supplier";

//Semantic-UI
import {Dropdown} from "semantic-ui-react";

//Other

//Component
class SuppliersDropdown extends Component {

    passDataToParent = (e, { value }) => this.props.selectedSupplier(value);

    render() {
        return (
            <Dropdown
                fluid selection search
                options={this.props.supplierNickNames}
                placeholder={'Select Supplier'}
                onChange={this.passDataToParent}
            />
        )
    }
}

//Type-checking
SuppliersDropdown.propTypes = {
    supplierNickNames: PropTypes.array
};

//Container to push data to component
const SuppliersDropdownContainer = withTracker(() => {
    let supplierSub = Meteor.subscribe('allSupplierNickNames');
    let ready = supplierSub.ready();
    let supplierNickNames = [];

    if(ready) {
        let suppliers = Supplier.find().fetch();
        for (let i = 0; i < suppliers.length; i++) {
            supplierNickNames[i] = {
                key: suppliers[i]._id,
                value: suppliers[i].nickname,
                text: suppliers[i].nickname
            }
        }
    }

    return {
        supplierNickNames
    };
})(SuppliersDropdown);

export default SuppliersDropdownContainer;