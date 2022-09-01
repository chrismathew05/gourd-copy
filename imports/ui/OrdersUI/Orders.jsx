//Core imports
import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';

//Component imports
import {Order} from "../../api/PurchasingAPI/order";
import OrderCard from "./OrderCard";
import AddOrderModal from "./AddOrderModal";
import ItemsListContainer from "../GeneralUI/ItemsList";

//Semantic-UI
import {Grid, Header, Divider} from "semantic-ui-react";

//Other
import {Date} from "sugar";
// import {stringify} from "./meteor-v1.3.1";

//Component
const convertStr = value => {
    let str = value.trim();
    if(!isNaN(str)) {
        str *= 1; //convert to number
    } else {
        //try converting to date
        let d = Date.create(value);
        if(!isNaN(d)) {
            str = d;
        }
    }
    return str;
};
class Orders extends Component {
    render() {
        return (
            <div>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <Header
                                content='Orders'
                                subheader='Manage finalized orders/expenditures'/>
                        </Grid.Column>
                        <Grid.Column width={8} textAlign='right'>
                            <AddOrderModal/>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Divider/>
                <ItemsListContainer
                    subName={'ordersList'}
                    cardComponent={<OrderCard/>}
                    cardProps={[]}
                    listComponent={Order}
                    sortOrder={{dateOrdered: -1}}
                    searchQuery={this.props.query}
                />
            </div>
        )
    }
}

//Type-checking

//Container to push data to component
const OrdersContainer = withTracker(props => {

    //HANDLE PARSING QUERY
    let queryStr = props.match.params.queryStr;
    let query = {};
    if(queryStr.length > 1) {
        queryStr = queryStr.substring(2, queryStr.length);
        let queryComponents = queryStr.split('&');
        let subComponents = [];
        queryComponents.forEach(qcomp => {
            if(qcomp.includes('=')) {
                subComponents = qcomp.split('=');
                query[subComponents[0].trim()] = convertStr(subComponents[1]);

            } else if(qcomp.includes('_gt_')) {
                subComponents = qcomp.split('_gt_');
                let attribute = subComponents[0].trim();
                query[attribute] = {};
                query[attribute].$gt = convertStr(subComponents[1]);

            } else {
                subComponents = qcomp.split('_lt_');
                let attribute = subComponents[0].trim();
                query[attribute].$lt = convertStr(subComponents[1]);
            }
        });
    }

    return {
        query
    };
})(Orders);

export default OrdersContainer;