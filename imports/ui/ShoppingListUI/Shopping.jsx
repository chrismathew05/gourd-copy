//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import ShoppingList from "./ShoppingList";

//Semantic-UI
import {Grid, Button, Header, Popup, Confirm, Card, Divider} from "semantic-ui-react";

//Other

//Component
class Shopping extends Component {
    state = {
        confirmOpen: false
    };

    //confirm controls for deletion
    confirmRemoval = () => this.setState({ confirmOpen: true });
    closeConfirm = () => this.setState({ confirmOpen: false });

    render() {
        return (
            <div>
                <Grid>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            <Header
                                content='Shopping Lists'
                                subheader='Manage planned item purchases and service fees'/>
                        </Grid.Column>
                        <Grid.Column width={8} textAlign='right'>
                            {/*Assign internal item*/}
                            <Popup
                                trigger={<Button circular color={'blue'} icon={'tag'} onClick={
                                    () => {

                                    }
                                }/>}
                                content='Assign internal item'
                                position='bottom center'
                                inverted
                            />

                            {/*Assign budget category*/}
                            <Popup
                                trigger={<Button circular color={'green'} icon={'pie chart'} onClick={() => console.log('test')}/>}
                                content='Assign budget category'
                                position='bottom center'
                                inverted
                            />

                            {/*Delete*/}
                            <Popup
                                trigger={<Button circular color='red' icon='trash alternate' onClick={this.confirmRemoval}/>}
                                content='Delete selected item(s)'
                                position='bottom center'
                                inverted
                            />
                            <Confirm size={'mini'} open={this.state.confirmOpen} onCancel={this.closeConfirm} onConfirm={() => console.log('test')} />

                            {/*Push task*/}
                            <Popup
                                trigger={<Button circular color={'violet'} icon={'credit card'} onClick={() => console.log('test')}/>}
                                content='Add to new order'
                                position='bottom center'
                                inverted
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Divider/>
                <Card.Group centered doubling>
                    <ShoppingList/>
                    <ShoppingList/>
                    <ShoppingList/>
                    {/*<ShoppingList/>*/}
                    {/*<ShoppingList/>*/}
                    {/*<ShoppingList/>*/}
                    {/*<ShoppingList/>*/}
                    {/*<ShoppingList/>*/}
                </Card.Group>
                <br/>
                <br/>
                <br/>
                <br/>
            </div>
        )
    }
}

//Type-checking
Shopping.propTypes = {};

//Container to push data to component
const ShoppingContainer = withTracker(props => {
    return {
        user: Meteor.user(),
    };
})(Shopping);

export default ShoppingContainer;