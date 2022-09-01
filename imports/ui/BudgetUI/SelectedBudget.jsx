//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {Budget} from "../../api/PurchasingAPI/budget";
import {Currency} from "../../api/PurchasingAPI/currency";
import {Expenditure} from "../../api/PurchasingAPI/expenditure";
import {Order} from "../../api/PurchasingAPI/order";

import BudgetTree from "./BudgetTree";
import CategoryAdder from "./CategoryAdder";
import BudgetAllocationChart from "./BudgetAllocationChart";
import AllocationVSExpensesBarChartContainer from "./AllocationVSExpensesBarChart";

//Semantic-UI
import {Divider, Grid, Segment} from "semantic-ui-react";

//Other
import {Link} from 'react-router-dom';

//Component
const buildCategories = categories => {
    let catArray = [];
    for (let i = 0; i < categories.length; i++) {
        let c = categories[i];
        catArray.push(c.title, ...buildCategories(c.children));
    }
    return catArray;
};

const calcExpAndAllocation = (nodeTitle, nodeChildren, viewCurrency, expList, allocationAmount, allocationCurrency, currentFX) => {

    //build up array of budget category names and filter expenditures
    let categories = [nodeTitle, ...buildCategories(nodeChildren)];
    let expenditures = expList.filter(exp => categories.includes(exp.budgetCat));

    //total exp expressed in allocation and view currency
    let totalExpViewCurrency = 0;

    let expendituresDetails = [];

    expenditures.forEach(currExp => {
        let order = Order.findOne({_id: currExp.orderId});
        let paymentCurrency = order.paymentCurrency;
        let orderCurrency = order.orderCurrency;

        let tBase = currExp.unitPrice * currExp.quantOrd + currExp.shipping + currExp.tax;
        let extraCharges = 0;
        if (currExp.extraCharges) {
            extraCharges += currExp.extraCharges.reduce((totalCharges, currCharge) => totalCharges + parseFloat(currCharge.amount), 0);
            tBase += extraCharges;
        }

        let chargesDesc = '$' + currExp.unitPrice.toFixed(2) + orderCurrency + ' x ' + currExp.quantOrd
            + (currExp.shipping ? ' + $' + currExp.shipping.toFixed(2) + orderCurrency + ' Shipping' : '')
            + (currExp.tax ? ' + $' + currExp.tax.toFixed(2) + orderCurrency + ' Tax' : '')
            + (extraCharges !== 0 ? ' + $' + extraCharges.toFixed(2) + orderCurrency + ' Extra Charges' : '');


        tBase *= currExp.fxRate;
        chargesDesc = '(' + chargesDesc + ')' + ' x ' + currExp.fxRate.toFixed(4);

        if(paymentCurrency === viewCurrency) {
            totalExpViewCurrency += tBase;
            chargesDesc += ' = $' + tBase.toFixed(2);
        } else {
            //convert to viewCurrency
            tBase *= (paymentCurrency === 'USD' ? currentFX : 1/currentFX).toFixed(4);
            totalExpViewCurrency += tBase;
            chargesDesc += ' x ' + (paymentCurrency === 'USD' ? currentFX : 1/currentFX).toFixed(4) + ' = $' + tBase.toFixed(2);
        }

        chargesDesc += viewCurrency;

        expendituresDetails.push({
            poNum: order.poNum,
            extDesc: currExp.extDesc,
            chargesDesc,
            orderLink: '/orders/edit/' + order._id
        });
    });

    if(allocationCurrency !== viewCurrency) {
        allocationAmount *= (allocationCurrency === 'USD' ? currentFX : 1/currentFX);
    }

    return {
        expenses: totalExpViewCurrency,
        allocationRemaining: allocationAmount - totalExpViewCurrency,
        allocation: allocationAmount,
        expendituresDetails
    }
};

const buildCategoryData = (categories, viewCurrency, expList, currentFX) => {
    let catArray = [];
    for (let i = 0; i < categories.length; i++) {
        let c = categories[i];

        let obj = calcExpAndAllocation(c.title, c.children, viewCurrency, expList, c.allocation, c.currency, currentFX);
        let allocation = obj.allocation;
        let remaining = obj.allocationRemaining;
        let expenses = obj.expenses;
        let expendituresDetails = obj.expendituresDetails;

        catArray.push({
            title: c.title,
            allocation,
            expenses,
            remaining,
            expendituresDetails,
            children: buildCategoryData(c.children, viewCurrency, expList, currentFX)
        });
    }

    return catArray;
};

const generateCategoriesModified = (categories, viewCurrency, expList, currentFX) => {
    let categoriesModified = buildCategoryData(categories, viewCurrency, expList, currentFX);

    let children = categoriesModified[0].children;
    let catSum = 0;
    for (let i = 0; i < children.length - 1; i++) {
        let c = children[i];
        catSum += +c.allocation;
    }

    let parentAllocation = +categoriesModified[0].allocation;
    let allocation = parentAllocation - catSum;
    let expenses = categoriesModified[0].children[children.length - 1].expenses;

    categoriesModified[0].children[children.length - 1].allocation = parentAllocation - catSum;
    categoriesModified[0].children[children.length - 1].remaining = allocation - expenses;

    return categoriesModified;
};

class SelectedBudget extends Component {
    state = {
        viewCurrency: 'CAD',
        categoriesModified: [],
        initial: true,
        selectedCategoryDetails: []
    };

    static getDerivedStateFromProps(props, state) {
        if(props.ready && props.ordersDataReady) {
            let categoriesModified = generateCategoriesModified(props.categories, state.viewCurrency, props.expenditures, props.fx);

            return {
                viewCurrency: state.viewCurrency,
                categoriesModified,
                initial: false
            };
        }
        return {};
    }

    handleChange = viewCurrency => {
        this.setState({
            viewCurrency,
            selectedCategoryDetails: [],
            categoriesModified: generateCategoriesModified(this.props.categories, viewCurrency, this.props.expenditures, this.props.fx)
        });
    };

    handleCategorySelection = selectedCategoryDetails => this.setState({selectedCategoryDetails});

    render() {
        return (
            <div>
                <Divider/>
                {this.props.ready && this.props.ordersDataReady ?
                    <div>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column>
                                    <AllocationVSExpensesBarChartContainer categoriesModified={this.state.categoriesModified}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        {this.state.selectedCategoryDetails.length > 0 ?
                            <Segment.Group id={'categoryDetails'}>
                                <Segment><b>SELECTED CATEGORY DETAILS</b></Segment>
                                {this.state.selectedCategoryDetails.map((exp, index) =>
                                    <Segment key={index}>
                                        <Link to={exp.orderLink}>{exp.poNum}</Link> | {exp.extDesc} : {exp.chargesDesc}
                                    </Segment>)
                                }
                            </Segment.Group> : <span/>
                        }
                        <Divider/>
                        <Grid stackable>
                            <Grid.Row>
                                <Grid.Column width={8}>
                                    <BudgetTree
                                        budgetId={this.props.selectedBudget}
                                        categories={this.props.categories}
                                        fx={this.props.fx}
                                        viewCurrency={this.state.viewCurrency}
                                        expenditures={this.props.expenditures}
                                        categoriesModified={this.state.categoriesModified}
                                        selectedCategoryDetails={this.handleCategorySelection}
                                    />
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    <BudgetAllocationChart categoriesModified={this.state.categoriesModified}/>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <Divider/>
                        <Segment color={'blue'}>
                            {/*<Header>Budget Editor</Header>*/}
                            <CategoryAdder
                                budgetId={this.props.selectedBudget}
                                fx={this.props.fx}
                                viewCurrency={this.handleChange}
                                obtained={this.props.obtained}
                            />
                        </Segment>
                        <br/>
                        <br/>
                    </div> : <div>Loading Selected Budget...</div>
                }
            </div>
        )
    }
}

//Type-checking
SelectedBudget.propTypes = {
    ready: PropTypes.bool,
    categories: PropTypes.array,
    expenditures: PropTypes.array,
    selectedBudget: PropTypes.string,
    fx: PropTypes.number,
    obtained: PropTypes.instanceOf(Date),
    ordersDataReady: PropTypes.bool
};

//Container to push data to component
const SelectedBudgetContainer = withTracker(props => {
    let ready = false;
    let categories = [{}];
    let fx = 1;
    let obtained;
    let expenditures = [{}];

    let ordersDataReady = false;

    //budget selected
    if(props.selectedBudget !== '') {
        //create separate publication for this specific request
        let selectedBudgetHandle = Meteor.subscribe('selectBudget', props.selectedBudget);
        let currencyHandle = Meteor.subscribe('currencyInfo', 'USD_CAD');
        let expendituresHandle = Meteor.subscribe('budgetedExpenditures', props.selectedBudget);

        ready = selectedBudgetHandle.ready() && currencyHandle.ready() && expendituresHandle.ready();
        if(ready) {
            categories = Budget.findOne({_id: props.selectedBudget}).categories;

            //obtain USD/CAD rate for conversions
            let c = Currency.findOne({code: 'USD_CAD'});
            fx = c.rate;
            obtained = c.obtained;

            //find associated expenditures with budget category
            expenditures = Expenditure.find().fetch();
            let orderIds = expenditures.map(exp => exp.orderId);
            let orderHandle = Meteor.subscribe('orderBudgetDetails', orderIds);
            ordersDataReady = orderHandle.ready();
        }
    }

    return {
        ready,
        categories,
        fx,
        obtained,
        expenditures,
        ordersDataReady
    };
})(SelectedBudget);

export default SelectedBudgetContainer;