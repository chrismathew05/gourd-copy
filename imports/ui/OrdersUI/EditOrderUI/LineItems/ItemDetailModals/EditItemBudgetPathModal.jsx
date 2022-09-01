//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Meteor} from "meteor/meteor";

//Component imports
import BudgetsDropdownContainer from "../../../../BudgetUI/BudgetsDropdown";
import BudgetCatDropdownContainer from "../../../../BudgetUI/BudgetCatDropdown";

//Semantic-UI
import {Button, Header, Modal} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class EditItemBudgetPathModal extends Component {
    state = {
        selectedBudget: '',
        selectedBudgetCat: '',
    };

    handleBudgetSelection = selectedBudget => this.setState({selectedBudget, selectedBudgetCat: ''});
    handleBudgetCatSelection = selectedBudgetCat => this.setState({selectedBudgetCat});

    updateBudgetPath = () => {
        let selectedBudget = this.state.selectedBudget;
        let selectedBudgetCat = this.state.selectedBudgetCat;

        Meteor.call('Expenditure.updateBudget', [...this.props.expIdList], selectedBudget, selectedBudgetCat, err => {
            if(err) {
                toast.error('Something went wrong! Budget details not updated.');
            }  else {
                toast.success('Budget details successfully updated!');
            }
        });
    };

    render() {
        return (
            <Modal size={'tiny'} trigger={this.props.trigger} closeIcon closeOnDimmerClick={false}>
                <Header icon={'chart pie'} content={'Edit Budget Details'}/>
                <Modal.Content>
                    <BudgetsDropdownContainer selectedBudget={this.handleBudgetSelection}/>
                    <br/>
                    <BudgetCatDropdownContainer selectedBudget={this.state.selectedBudget} selectedBudgetCat={this.handleBudgetCatSelection}/>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.updateBudgetPath} icon='checkmark' labelPosition='right'
                            content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

EditItemBudgetPathModal.propTypes = {
    expIdList: PropTypes.object,
    trigger: PropTypes.element
};

export default EditItemBudgetPathModal;