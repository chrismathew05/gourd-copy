//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Popup, Label, Grid, Button} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class OrderTotals extends Component {
    toggleFlag = () => {
        if(this.props.flag) {
            Meteor.call('Order.unflag', this.props.orderId);
        } else {
            Meteor.call('Order.flag', this.props.orderId);
        }
    };

    render() {
        return (
            <Button as='div' labelPosition='left' style={{float: 'right'}}>
                <Popup position='top center' basic trigger={
                    <Label as='a' size={'large'} basic pointing={'right'}>
                        GRAND TOTAL: ${this.props.grandTotal.toFixed(2) + ' ' + this.props.paymentCurrency}
                    </Label>
                }>
                    <Grid divided='vertically'>
                        <Grid.Row>
                            <Grid.Column><br/>Total Base:
                                <p style={{float: 'right'}}>${this.props.baseTotal.toFixed(2) + ' ' + this.props.orderCurrency}</p>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>Total Shipping:
                                <p style={{float: 'right'}}>${this.props.shippingTotal.toFixed(2) + ' ' + this.props.orderCurrency}</p>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>Total Tax:
                                <p style={{float: 'right'}}>${this.props.taxesTotal.toFixed(2) + ' ' + this.props.orderCurrency}</p>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>Net Ancillary:
                                <p style={{float: 'right'}}>${this.props.extraChargesTotal.toFixed(2) + ' ' + this.props.orderCurrency}</p>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>FX Differences: <p style={{float: 'right'}}>${this.props.fxDiff.toFixed(2)}</p></Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Popup>
                <Button icon onClick={() => this.toggleFlag()} color={this.props.flag ? 'red' : 'green'}>
                    {this.props.flag ? 'Order Flagged' : 'Flag Order'}
                    {/*<Icon name='flag' />*/}
                </Button>
            </Button>
        )
    }
}

//Type-checking
OrderTotals.propTypes = {
    expenditures: PropTypes.array,
    baseTotal: PropTypes.number,
    shippingTotal: PropTypes.number,
    taxesTotal: PropTypes.number,
    extraChargesTotal: PropTypes.number,
    fxDiff: PropTypes.number,
    grandTotal: PropTypes.number,
    orderCurrency: PropTypes.string,
    paymentCurrency: PropTypes.string,
    flag: PropTypes.bool,
    orderId: PropTypes.string
};

//Container to push data to component
const OrderTotalsContainer = withTracker(props => {
    let baseTotal = 0;
    let shippingTotal = 0;
    let taxesTotal = 0;
    let extraChargesTotal = 0;
    let fxDiff = 0;

    if(props.expenditures) {
        props.expenditures.forEach(exp => {
            let base = exp.unitPrice*exp.quantOrd;
            let shipping = exp.shipping;
            let taxes = exp.tax;
            let extraCharges = 0;

            baseTotal += base;
            shippingTotal += shipping;
            taxesTotal += taxes;
            if(exp.extraCharges) {
                extraCharges = exp.extraCharges.reduce((totalCharges, currCharge) => totalCharges + parseFloat(currCharge.amount), 0);
                extraChargesTotal += extraCharges;
            }
            fxDiff += (base + shipping + taxes + extraCharges)*(exp.fxRate - 1);
        });
    }

    let grandTotal = parseFloat(baseTotal + shippingTotal + taxesTotal + extraChargesTotal + fxDiff);

    if(props.orderId && grandTotal > 0 && parseFloat(props.orderTotal) !== grandTotal) {
        Meteor.call('Order.updateOrderTotal', props.orderId, grandTotal, err => {
            if(err) {
                toast.error('Something went wrong. Order Total not updated!');
            }
        });
    }

    return {
        baseTotal,
        shippingTotal,
        taxesTotal,
        extraChargesTotal,
        fxDiff,
        grandTotal
    };
})(OrderTotals);

export default OrderTotalsContainer;