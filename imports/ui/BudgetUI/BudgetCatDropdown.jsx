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
class BudgetCatDropdown extends Component {
    state = {
        selectedBudgetCat: ''
    };

    passDataToParent = (e, { value }) => {
        this.setState({selectedBudgetCat: value});
        this.props.selectedBudgetCat(value);
    };

    render() {
        return (
            <Dropdown
                fluid selection search
                disabled={!this.props.ready}
                options={this.props.budgetCatList}
                value={this.state.selectedBudgetCat}
                placeholder={'Select Sub-Category'}
                onChange={this.passDataToParent}
            />
        )
    }
}

//Type-checking
BudgetCatDropdown.propTypes = {
    ready: PropTypes.bool,
    budgetCatList: PropTypes.array
};

const flattenCategories = (parentName, categories) => {
    let result = [];
    for (let i = 0; i < categories.length; i++) {
        let c = categories[i];
        let path = parentName + '/' + c.title;
        result.push({
           key: c.title,
           value: c.title,
           text: path
        });
        result.push(...flattenCategories(path, c.children));
    }
    return result;
};

//Container to push data to component
const BudgetCatDropdownContainer = withTracker(props => {
    let ready = false;
    let budgetCatList = [];

    if(typeof(props.selectedBudget) !== 'undefined' && props.selectedBudget !== '') {
        let budgetCatHandle = Meteor.subscribe('selectBudget', props.selectedBudget);
        ready = budgetCatHandle.ready();
        if(ready) {
            let categories = Budget.findOne({_id: props.selectedBudget}, {fields: {categories: 1}}).categories;

            budgetCatList = flattenCategories(categories[0].title, categories[0].children);
        }
    }

    return {
        ready,
        budgetCatList
    };
})(BudgetCatDropdown);

export default BudgetCatDropdownContainer;