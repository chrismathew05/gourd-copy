//Core imports
import React from 'react';
import PropTypes from 'prop-types';

//Component imports
import CurrencyModal from "./CurrencyModal";

//Semantic-UI
import {Button, Grid} from "semantic-ui-react";

//Other

//Component
const EditCurrencies = props => (
    <Grid.Column width={8} textAlign={'right'} verticalAlign={'middle'}>
        <Button.Group size={'tiny'}>
            <CurrencyModal
                orderId={props.orderId}
                trigger={<Button>Order: {props.orderCurrency}</Button>}
                updateType={'Order'}
            />
            <Button.Or text='to' />
            <CurrencyModal
                orderId={props.orderId}
                trigger={<Button positive>Pay: {props.paymentCurrency}</Button>}
                updateType={'Payment'}
            />
        </Button.Group>
    </Grid.Column>
);

//Type-checking
EditCurrencies.propTypes = {
    orderId: PropTypes.string,
    orderCurrency: PropTypes.string,
    paymentCurrency: PropTypes.string
};

export default EditCurrencies;