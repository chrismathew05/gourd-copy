//Core imports
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

//Component imports
import EditCurrencies from "./EditCurrencies";

//Semantic-UI
import {Grid, Header, Icon} from "semantic-ui-react";

//Other
import moment from "moment";

//Component
class EditOrderHeader extends Component {
    state = {
        editVisible: false
    };

    render() {
        return (
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width={8}>
                        <Header>
                            <Link to={'/orders/list/q'}>
                                <Icon name={'arrow left'} color={'black'}/>
                            </Link>
                            <Header.Content>{this.props.poNum}</Header.Content>
                            <Header.Subheader
                                onMouseLeave={() => this.setState({editVisible: false})}
                                onMouseEnter={() => this.setState({editVisible: true})}
                                style={{cursor: 'pointer'}}
                                onClick={() => console.log('Test')}
                            >
                                Supplier: {this.props.supplier} |
                                Date Ordered: {moment(this.props.dateOrdered).format("ddd, MMM D, YYYY h:mma (Z)")} |
                                Payment Terms: {this.props.paymentTerms} &nbsp;
                                {this.state.editVisible ? <Icon name={'edit'}/> : <span/>}
                            </Header.Subheader>
                        </Header>
                    </Grid.Column>
                    <EditCurrencies
                        orderId={this.props.orderId}
                        orderCurrency={this.props.orderCurrency}
                        paymentCurrency={this.props.paymentCurrency}
                    />
                </Grid.Row>
            </Grid>
        )
    }
}

//Type-checking
EditOrderHeader.propTypes = {
    orderId: PropTypes.string,
    poNum: PropTypes.string,
    supplier: PropTypes.string,
    dateOrdered: PropTypes.instanceOf(Date),
    paymentTerms: PropTypes.string,
    orderCurrency: PropTypes.string,
    paymentCurrency: PropTypes.string
};

export default EditOrderHeader;