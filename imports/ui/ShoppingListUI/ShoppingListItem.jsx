//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Grid, Label, Checkbox} from "semantic-ui-react";


//Other

//Component
class ShoppingListItem extends Component {
    state = {};

    method = () => {

    };

    render() {
        return (
            <Grid.Row columns={3}>
                <Grid.Column width={2}>
                    <Checkbox/>
                </Grid.Column>
                <Grid.Column width={9}>
                    Item One &nbsp;
                    <Label as={'a'}  basic size={'mini'} color={'blue'}>A</Label>
                    <Label as={'a'}  basic size={'mini'} color={'green'}>B</Label>
                </Grid.Column>
                <Grid.Column width={3}>
                    $342.25
                </Grid.Column>
            </Grid.Row>
        )
    }
}

//Type-checking
ShoppingListItem.propTypes = {};

export default ShoppingListItem;