//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {CostObj} from "../../../api/PurchasingAPI/costObj";

//Semantic-UI
import {Dropdown} from "semantic-ui-react";

//Other

//Component
class CostObjDropdown extends Component {
    state = {
        selectedCostObj: ''
    };

    passDataToParent = (e, { value }) => {
        this.setState({selectedCostObj: value});
        this.props.selectedCostObj(value);
    };

    render() {
        return (
            <Dropdown
                fluid selection search
                options={this.props.costObjList}
                value={this.state.selectedCostObj}
                placeholder={'Select Cost Object'}
                onChange={this.passDataToParent}
            />
        )
    }
}

//Type-checking
CostObjDropdown.propTypes = {
    costObjList: PropTypes.array
};

//Container to push data to component
const CostObjDropdownContainer = withTracker(() => {
    let costObjHandle = Meteor.subscribe('allCostObjNames');
    let ready = costObjHandle.ready();
    let costObjList = [];

    if(ready) {
        let costObjs = CostObj.find().fetch();

        for (let i = 0; i < costObjs.length; i++) {
            costObjList[i] = {
                key: costObjs[i]._id,
                value: costObjs[i]._id,
                text: costObjs[i].name
            }
        }
    }

    return {
        costObjList
    };
})(CostObjDropdown);

export default CostObjDropdownContainer;