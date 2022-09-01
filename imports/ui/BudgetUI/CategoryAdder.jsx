//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports
import {Budget} from "../../api/PurchasingAPI/budget";

//Semantic-UI
import {Form, Dropdown, Grid} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";
import TimeAgo from 'react-timeago';
const currencyOptions = [
    { key: 'ca', value: 'CAD', flag: 'ca', text: 'Canadian Dollar' },
    { key: 'us', value: 'USD', flag: 'us', text: 'US Dollar' },
];

//Component
class CategoryAdder extends Component {
    state = {
        selectedCurrency: "CAD",
        viewCurrency: 'CAD'
    };

    addCategory = () => {
        let catName = document.getElementById("category-add-name").value;
        let catAllocation =  document.getElementById("category-add-allocation").value;

        if(catName === '') {
            toast.error('Category Name must be a non-empty string');
            return;
        }

        Meteor.call(
            'Budget.addCategory', this.props.budgetId, catName, catAllocation, this.state.selectedCurrency, this.props.fx, this.state.viewCurrency, err => {
                if(err) {
                    toast.error('Something went wrong. Maybe category already exists?');
                } else {
                    document.getElementById("category-add-name").value = '';
                    document.getElementById("category-add-allocation").value = '';
                    document.getElementById("category-add-name").focus();
                    toast.success('Category added!');
                }
            }
        );
    };

    passDataToParent = (e, {value}) => {
        this.props.viewCurrency(value);
        this.setState({viewCurrency: value});
    };

    render() {
        return (
            <Form>
                <Form.Group>
                    <Form.Input
                        id='category-add-name'
                        icon={'tag'}
                        width={5}
                        placeholder='Category Name'
                    />
                    <Form.Input
                        icon={'dollar sign'}
                        id='category-add-allocation'
                        width={5}
                        placeholder='Allocation'
                    />
                    <Form.Dropdown
                        placeholder='Select Currency'
                        width={5}
                        fluid search selection
                        onChange={(e, {value}) => this.setState({selectedCurrency: value})}
                        options={currencyOptions} />
                    <Form.Button onClick={this.addCategory}>Add</Form.Button>
                </Form.Group>
                {!Meteor.Device.isDesktop() ? <br/> : <span/>}
                <Grid stackable>
                    <Grid.Row>
                        <Grid.Column width={13} verticalAlign={'middle'}>
                            <i>USD/CAD FX: {this.props.fx}, Fetched <TimeAgo date={this.props.obtained.toString()}/></i>
                        </Grid.Column>
                        <Grid.Column width={3} textAlign={'right'}>
                            <Dropdown button className='icon' floating labeled icon='world' options={currencyOptions}
                                      text={'View in: ' + this.state.viewCurrency} onChange={this.passDataToParent} fluid
                                      style={{textAlign: 'center'}}
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Form>
        )
    }
}

CategoryAdder.propTypes = {
    budgetId: PropTypes.string,
    fx: PropTypes.number,
    obtained: PropTypes.instanceOf(Date)
};

export default CategoryAdder;