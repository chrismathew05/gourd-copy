//Core imports
import React from 'react';

//Component imports

//Semantic-UIs
import {Form} from "semantic-ui-react";

//Other

//Component
const SupplierForm = () =>
    <Form>
        <Form.Group widths={'equal'}>
            <Form.Input id='supplier-nickname' placeholder='Nickname'/>
            <Form.Input id='supplier-officialName' placeholder='Official Name'/>
        </Form.Group>
        <Form.Group widths={'equal'}>
            <Form.Input id='supplier-hstNumber' placeholder='HST Number'/>
            <Form.Input id='supplier-email' placeholder='Email'/>
            <Form.Input id='supplier-phoneNumber' placeholder='Phone #'/>
        </Form.Group>
        <Form.Input id='supplier-streetAddress' placeholder='Street Address'/>
        <Form.Group widths={'equal'}>
            <Form.Input id='supplier-city' placeholder='City'/>
            <Form.Input id='supplier-province' placeholder='Province'/>
        </Form.Group>
        <Form.Group widths={'equal'}>
            <Form.Input id='supplier-country' placeholder='Country'/>
            <Form.Input id='supplier-postalCode' placeholder='Postal Code'/>
        </Form.Group>
        <Form.TextArea id='supplier-notes' placeholder='Supplier Notes'/>
    </Form>;

export default SupplierForm;