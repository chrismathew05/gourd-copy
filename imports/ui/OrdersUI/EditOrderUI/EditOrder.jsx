//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {Order} from "../../../api/PurchasingAPI/order";
import {Expenditure} from "../../../api/PurchasingAPI/expenditure";

import EditOrderHeader from "./OrderHeader/EditOrderHeader";
import EditLineItems from "./LineItems/EditLineItems";
import OrderTotalsContainer from "./OrderFooter/OrderTotals";
import EditOrderNotes from "./OrderFooter/EditOrderNotes";
import UploadOrderFiles from "./OrderFooter/UploadOrderFiles";
import OrderAttachmentsContainer from "./OrderFooter/OrderAttachments";
import AddLineItem from "./AddLineItem";
import PrintPO from "./OrderFooter/PrintPO";

import AddJournalEntryContainer from "../../AccountingUI/AddJournalEntry";
import JournalEntriesListContainer from "../../AccountingUI/JournalEntriesList";

//Semantic-UI
import {Divider, Header, Icon, Grid, Label} from "semantic-ui-react";

//Other

//Component
class EditOrder extends Component {
    render() {
        return (
            <div>
                {this.props.ready ?
                    <div>
                        <EditOrderHeader
                            orderId={this.props.orderId}
                            poNum={this.props.order.poNum}
                            supplier={this.props.order.supplier}
                            dateOrdered={this.props.order.dateOrdered}
                            paymentTerms={this.props.order.paymentTerms}
                            orderCurrency={this.props.order.orderCurrency}
                            paymentCurrency={this.props.order.paymentCurrency}
                        />
                        <Divider horizontal>
                            <Header as='h4'>
                                <Icon name='list alternate outline' />
                                Line Items
                            </Header>
                        </Divider>
                        <AddLineItem orderId={this.props.orderId}/>
                        <EditLineItems dateOrdered={this.props.order.dateOrdered} expenditures={this.props.expenditures}/>
                        <br/>
                        <Grid stackable>
                            <Grid.Row>
                                <Grid.Column width={4}>
                                    <UploadOrderFiles
                                        accessToken={this.props.accessToken}
                                        supplier={this.props.order.supplier}
                                        gDriveFolderId={this.props.order.gDriveFolderId}
                                        orderId={this.props.orderId}
                                        poNum={this.props.order.poNum}
                                    />
                                    <EditOrderNotes
                                        orderId={this.props.orderId}
                                        orderNotes={this.props.order.notes}
                                    />
                                    <AddJournalEntryContainer
                                        jeMethodName={'PurchaseJournalEntry.insert'}
                                        addlParameters={[this.props.orderId]}
                                    />
                                    <PrintPO
                                        poNum={this.props.order.poNum}
                                        supplier={this.props.order.supplier}
                                        dateOrdered={this.props.order.dateOrdered}
                                        orderCurrency={this.props.order.orderCurrency}
                                        expenditures={this.props.expenditures}
                                        orderTotal={this.props.order.orderTotal}
                                    />
                                </Grid.Column>
                                <Grid.Column width={12}>
                                    <OrderTotalsContainer
                                        expenditures={this.props.expenditures}
                                        orderCurrency={this.props.order.orderCurrency}
                                        paymentCurrency={this.props.order.paymentCurrency}
                                        orderTotal={this.props.order.orderTotal}
                                        orderId={this.props.orderId}
                                        flag={this.props.order.flag}
                                    />
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <br/>
                        {/*Attachments*/}
                        {this.props.order.attachmentIds && this.props.order.attachmentIds.length > 0 ?
                            <div>
                                <OrderAttachmentsContainer
                                    gDriveFolderId={this.props.order.gDriveFolderId}
                                    accessToken={this.props.accessToken}
                                    attachmentIds={this.props.order.attachmentIds}
                                    orderId={this.props.orderId}
                                />
                                <br/>
                            </div> : <span/>
                        }

                        {/*Order Notes*/}
                        {this.props.order.notes && this.props.order.notes !== "" ?
                            <div>
                                <Label color={'blue'}>Order Notes:</Label>
                                <br/>
                                <br/>
                                <p style={{whiteSpace: 'pre-wrap'}}>{this.props.order.notes}</p>
                            </div> : <span/>
                        }
                        <br/>

                        {/*Journal Entries*/}
                        {this.props.order.journalEntryIds && this.props.order.journalEntryIds.length > 0 ?
                            <div>
                                <Label color={'blue'}>Journal Entries:</Label>
                                <br/>
                                <br/>
                                <JournalEntriesListContainer journalEntryIds={this.props.order.journalEntryIds}/>
                                <br/>
                            </div> : <span/>
                        }
                        <br/>
                        <br/>
                        <br/>
                    </div> :
                    <div>Loading Order...</div>
                }
            </div>
        )
    }
}

//Type-checking
EditOrder.propTypes = {
    orderId: PropTypes.string,
    order: PropTypes.object,
    expenditures: PropTypes.array,
    accessToken: PropTypes.string,
    ready: PropTypes.bool
};

//Container to push data to component
const EditOrderContainer = withTracker(props => {
    let orderId = props.match.params.orderId;
    let orderHandle = Meteor.subscribe('orderDetails', orderId);
    let expenditureHandle = Meteor.subscribe('associatedExpenditures', orderId);
    let userHandle = Meteor.subscribe('thisUserServices');

    let ready = orderHandle.ready() && expenditureHandle.ready() && userHandle.ready();
    let order;
    let expenditures = [];
    let accessToken = '';

    if(ready) {
        order = Order.findOne();
        expenditures = Expenditure.find().fetch();
        accessToken = Meteor.users.findOne({_id: Meteor.userId()}).services.google.accessToken;
    }

    return {
        ready,
        order,
        expenditures,
        orderId,
        accessToken
    };
})(EditOrder);

export default EditOrderContainer;