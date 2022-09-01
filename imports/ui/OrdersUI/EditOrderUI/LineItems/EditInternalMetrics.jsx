//Core imports
import React from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {CostObj} from "../../../../api/PurchasingAPI/costObj";
import EditItemCostObjModal from "./ItemDetailModals/EditItemCostObjModal";
import EditItemQuantRecInternalModal from "./ItemDetailModals/EditItemQuantRecInternalModal";
import EditItemDateRecdModal from "./ItemDetailModals/EditItemDateRecdModal";

//Semantic-UI
import {Segment, List, Label} from "semantic-ui-react";

//Other
import moment from "moment";

//Component
const EditInternalMetrics = props => (
    <Segment>
        <Label color='teal'>Internal Metrics</Label>
        <List celled>
            <List.Item>
                <List.Content floated='right'>{props.internalItemName}</List.Content>
                <List.Content>
                    <EditItemCostObjModal
                        expId={props.expId}
                        costObjId={props.costObjId}
                        quantRecInternal={props.quantRecInternal}
                    />
                </List.Content>
            </List.Item>
            <List.Item>
                <List.Content floated='right'>{props.internalItemType}</List.Content>
                <List.Content><b>Type</b></List.Content>
            </List.Item>
            <List.Item>
                <List.Content floated='right'>{props.quantRecInternal}{props.internalItemUnitDesc}</List.Content>
                <List.Content>
                    <EditItemQuantRecInternalModal
                        expId={props.expId}
                        quantRecInternal={props.quantRecInternal}
                        costObjId={props.costObjId}
                    />
                </List.Content>
            </List.Item>
            <List.Item>
                <List.Content floated='right'>
                    {props.dateRecd ?
                        <div>{moment(props.dateRecd).format("MMM D/YY")}</div> :
                        <div>Not Received</div>
                    }
                </List.Content>
                <List.Content>
                    <EditItemDateRecdModal
                        expIdList={new Set([props.expId])}
                        dateOrdered={props.dateOrdered}
                        trigger={<b style={{cursor: 'pointer'}}>Date Received</b>}
                    />
                </List.Content>
            </List.Item>
        </List>
    </Segment>
);

//Type-checking
EditInternalMetrics.propTypes = {
    expId: PropTypes.string,
    costObjId: PropTypes.string,
    quantRecInternal: PropTypes.number,
    dateRecd: PropTypes.instanceOf(Date),
    dateOrdered: PropTypes.instanceOf(Date),
    internalItemName: PropTypes.string,
    internalItemUnitDesc: PropTypes.string,
    internalItemType: PropTypes.string
};

//Container to push data to component
const EditInternalMetricsContainer = withTracker(props => {
    let internalItemName = 'Not set';
    let internalItemUnitDesc = '';
    let internalItemType = 'Not set';

    if(props.costObjId && props.costObjId !== '') {
        let costObjHandle = Meteor.subscribe('costObjDetails', props.costObjId);
        let ready = costObjHandle.ready();

        //determines item name, type and unit desc to display
        if(ready) {
            let costObj = CostObj.findOne({_id: props.costObjId}, {fields: {name: 1, unitDesc: 1, itemType: 1}});
            if(costObj) {
                internalItemName = costObj.name;
                internalItemUnitDesc = ' ' + costObj.unitDesc;
                switch (costObj.itemType) {
                    case 0:
                        internalItemType = 'Equipment';
                        break;
                    case 1:
                        internalItemType = 'Part';
                        break;
                    case 2:
                        internalItemType = 'Supply';
                        break;
                    case 3:
                        internalItemType = 'Service';
                        break;
                }
            }
        }
    }

    return {
        internalItemName,
        internalItemUnitDesc,
        internalItemType
    };
})(EditInternalMetrics);

export default EditInternalMetricsContainer;