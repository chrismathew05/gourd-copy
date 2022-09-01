//Core imports
import React from 'react';
import PropTypes from 'prop-types';

//Component imports
import EditItemShippingModal from "./ItemDetailModals/EditItemShippingModal";
import EditItemTaxModal from "./ItemDetailModals/EditItemTaxModal";
import EditItemFXModal from "./ItemDetailModals/EditItemFXModal";
import EditItemAddExtraChargeModal from "./ItemDetailModals/EditItemAddExtraChargeModal";

//Semantic-UI
import {Segment, List, Label, Button} from "semantic-ui-react";

//Other

//Component
const EditCostBreakdown = props => (
    <Segment>
        <Label color='purple'>Cost Breakdown</Label>
        <EditItemAddExtraChargeModal
            expIdList={new Set([props.expId])}
            trigger={<Button circular icon='plus' size={'mini'} basic floated={'right'}/>}
        />

        <List celled>
            <List.Item>
                <List.Content floated='right'>${props.shipping ? props.shipping.toFixed(2) : 0.00}</List.Content>
                <List.Content>
                    <EditItemShippingModal
                        expIdList={new Set([props.expId])}
                        shipping={props.shipping}
                        trigger={<b style={{cursor: 'pointer'}}>Shipping</b>}
                    />
                </List.Content>
            </List.Item>
            {props.extraCharges && props.extraCharges.length > 0 ?
                props.extraCharges.map((extraCharge, index) => {
                    return (
                        <List.Item key={'extraCharge-' + index}>
                            <List.Content floated='right'>${parseFloat(extraCharge.amount).toFixed(2)}</List.Content>
                            <List.Content><b>{extraCharge.desc}</b></List.Content>
                        </List.Item>
                    );
                }) : <span/>
            }
            <List.Item>
                <List.Content floated='right'>${props.tax ? props.tax.toFixed(2) : 0.00}</List.Content>
                <List.Content>
                    <EditItemTaxModal
                        expIdList={new Set([props.expId])}
                        tax={props.tax}
                        hstEligible={props.hstEligible}
                        trigger={<b style={{cursor: 'pointer'}}>Tax</b>}
                    />
                </List.Content>
            </List.Item>
            <List.Item>
                <List.Content floated='right'>
                    {props.hstEligible ? 'Yes' : 'No'}
                </List.Content>
                <List.Content>
                    <EditItemTaxModal
                        expIdList={new Set([props.expId])}
                        tax={props.tax}
                        hstEligible={props.hstEligible}
                        trigger={<b style={{cursor: 'pointer'}}>HST Eligible?</b>}
                    />
                </List.Content>
            </List.Item>
            <List.Item>
                <List.Content floated='right'>{props.fxRate}</List.Content>
                <List.Content>
                    <EditItemFXModal
                        expIdList={new Set([props.expId])}
                        fx={props.fxRate}
                        trigger={<b style={{cursor: 'pointer'}}>FX Rate</b>}
                    />
                </List.Content>
            </List.Item>
        </List>
    </Segment>
);

//Type-checking
EditCostBreakdown.propTypes = {
    expId: PropTypes.string,
    shipping: PropTypes.number,
    extraCharges: PropTypes.array,
    tax: PropTypes.number,
    hstEligible: PropTypes.bool,
    fxRate: PropTypes.number
};

export default EditCostBreakdown;