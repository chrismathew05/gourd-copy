//Core imports
import React from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from "meteor/react-meteor-data";
import PropTypes from 'prop-types';

//Component imports
import {Budget} from "../../../../api/PurchasingAPI/budget";
import EditItemBudgetPathModal from "./ItemDetailModals/EditItemBudgetPathModal";
import EditItemDatePaidModal from "./ItemDetailModals/EditItemDatePaidModal";

//Semantic-UI
import {Segment, List, Label} from "semantic-ui-react";

//Other
import moment from "moment";

//Component
const EditPaymentDetails = props => (
    <Segment>
        <Label color='green'>Payment Details</Label>
        <List celled>
            <List.Item>
                <List.Content floated='right'>
                    {props.budgetName !== '' ?
                        <div>{props.budgetName}//{props.budgetCat}</div> :
                        <div>Not set</div>
                    }
                </List.Content>
                <List.Content>
                    <EditItemBudgetPathModal
                        expIdList={new Set([props.expId])}
                        trigger={<b style={{cursor: 'pointer'}}>Budget Path</b>}
                    />
                </List.Content>
            </List.Item>
            <List.Item>
                <List.Content floated='right'>
                    {props.datePaid ?
                        <div>{moment(props.datePaid).format("MMM D/YY")}</div> :
                        <div>Unpaid</div>
                    }
                </List.Content>
                <List.Content>
                    <EditItemDatePaidModal
                        expIdList={new Set([props.expId])}
                        dateOrdered={props.dateOrdered}
                        trigger={<b style={{cursor: 'pointer'}}>Date Paid</b>}
                    />
                </List.Content>
            </List.Item>
        </List>
    </Segment>
);

//Type-checking
EditPaymentDetails.propTypes = {
    expId: PropTypes.string,
    budgetId: PropTypes.string,
    budgetName: PropTypes.string,
    budgetCat: PropTypes.string,
    datePaid: PropTypes.instanceOf(Date)
};

const EditPaymentDetailsContainer = withTracker(props => {
    let budgetName = '';
    if(props.budgetId !== '' && typeof props.budgetId !== 'undefined') {
        let ready = Meteor.subscribe('selectBudgetName', props.budgetId);
        if(ready) {
            let b = Budget.findOne({_id: props.budgetId});
            if(typeof b !== 'undefined') {
                budgetName = b.name;
            }
        }
    }

    return {
        budgetName
    };
})(EditPaymentDetails);

export default EditPaymentDetailsContainer;