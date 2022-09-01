//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {Budget} from "../../api/PurchasingAPI/budget";

//Semantic-UI
import {Dropdown} from "semantic-ui-react";

//Other

//Component
class BudgetsDropdown extends Component {
    state = {
        selectedBudget: ''
    };

    passDataToParent = (e, { value }) => {
        this.setState({selectedBudget: value});
        this.props.selectedBudget(value);
    };

    render() {
        return (
            <Dropdown
                fluid selection search
                options={this.props.budgetsList}
                value={this.state.selectedBudget}
                placeholder={'Select Budget'}
                onChange={this.passDataToParent}
            />
        )
    }
}

//Type-checking
BudgetsDropdown.propTypes = {
    budgetsReady: PropTypes.bool,
    budgetsList: PropTypes.array
};

//Container to push data to component
const BudgetsDropdownContainer = withTracker(() => {
    let budgetsHandle = Meteor.subscribe('allBudgetNames');
    let budgetsReady = budgetsHandle.ready();
    let budgetsList = [];

    if(budgetsReady) {
        let budgets = Budget.find({}, {sort: {name: 1}}).fetch();

        for (let i = 0; i < budgets.length; i++) {
            budgetsList[i] = {
                key: budgets[i]._id,
                value: budgets[i]._id,
                text: budgets[i].name
            }
        }
    }

    return {
        budgetsReady,
        budgetsList
    };
})(BudgetsDropdown);

export default BudgetsDropdownContainer;