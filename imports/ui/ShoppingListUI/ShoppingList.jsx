//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import ShoppingListItem from "./ShoppingListItem";

//Semantic-UI
import {Card, Grid} from "semantic-ui-react";

//Other

//Component
class ShoppingList extends Component {
    state = {};

    method = () => {

    };

    render() {
        return (
            <Card fluid={!Meteor.Device.isDesktop()}>
                <Card.Content>
                    <Card.Header>List #1</Card.Header>
                </Card.Content>
                <Card.Content>
                    <Grid divided='vertically'>
                        <ShoppingListItem/>
                    </Grid>
                </Card.Content>
            </Card>
        )
    }
}

//Type-checking
ShoppingList.propTypes = {};

//Container to push data to component
const ShoppingListContainer = withTracker(props => {
    return {
        user: Meteor.user(),
    };
})(ShoppingList);

export default ShoppingListContainer;