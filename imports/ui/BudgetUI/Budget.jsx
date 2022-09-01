//Core imports
import React, {Component} from 'react';

//Component imports
import AddBudgetModal from "./AddBudgetModal";
import BudgetsDropdownContainer from "./BudgetsDropdown";
import SelectedBudgetContainer from "./SelectedBudget";

//Semantic-UI
import {Grid} from "semantic-ui-react";

//Other

//Component
class Budget extends Component {
    state = {
        selectedBudget: ''
    };

    handleBudgetSelection = selectedBudget => this.setState({selectedBudget});

    render() {
        return (
            <div>
                <Grid stackable>
                    <Grid.Row>
                        <Grid.Column width={14}>
                            <BudgetsDropdownContainer selectedBudget={this.handleBudgetSelection}/>
                        </Grid.Column>
                        <Grid.Column width={2}>
                            <AddBudgetModal/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                {this.state.selectedBudget === '' ?
                    <span/> : <SelectedBudgetContainer selectedBudget={this.state.selectedBudget}/>
                }
            </div>
        )
    }
}

export default Budget;