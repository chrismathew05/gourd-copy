//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Header, Segment, Grid, Icon} from "semantic-ui-react";

//Other
import {Link} from 'react-router-dom';
import moment from "moment";

//Component
class OrderCard extends Component {
    render() {
        return (
            <Segment>
                <Link to={'/orders/edit/' + this.props.item._id} params={{ orderId: this.props.item._id }}>
                    <Grid stackable={!Meteor.Device.isDesktop()}>
                        <Grid.Row>
                            <Grid.Column width={13}>
                                <Header as='h3'>
                                    {this.props.item.flag ?
                                        <Icon name={'flag'} color={'red'}/>:<Icon name={'cart'}/>
                                    }
                                    <Header.Content>
                                        {this.props.item.supplier + ' - ' + moment(this.props.item.dateOrdered).format("MMM D")}
                                        <Header.Subheader>
                                            {this.props.item.poNum + ' | ' + moment(this.props.item.dateOrdered).format("ddd, MMM D/YY h:mma (Z)") + ' | ' + this.props.item.paymentTerms}
                                        </Header.Subheader>
                                    </Header.Content>
                                </Header>
                            </Grid.Column>
                            <Grid.Column width={3} textAlign={'right'} verticalAlign={'middle'}>
                                <Header as={'h3'}>${(+this.props.item.orderTotal).toFixed(2) + ' ' + this.props.item.paymentCurrency}</Header>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Link>
            </Segment>
        )
    }
}

//Type-checking
OrderCard.propTypes = {
    item: PropTypes.object
};

export default OrderCard;