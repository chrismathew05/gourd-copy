//Core imports
import React, {Component} from 'react';

//Component imports

//Semantic-UI
import {Form, Select} from "semantic-ui-react";

//Other
const typeOptions = [
    {key: 0, value: 0, text: 'Equipment'},
    {key: 1, value: 1, text: 'Part'},
    {key: 2, value: 2, text: 'Supply'},
    {key: 3, value: 3, text: 'Service'}
];

//Component
class AddCostObjModal extends Component {

    passDataToParent = (e, { value }) => this.props.selectedCostObjType(value);

    render() {
        return (
            <Form>
                <Form.Input id='costObj-name' placeholder='Name' fluid/>
                <Form.Group widths={'equal'}>
                    <Form.Input id='costObj-unitDesc' placeholder='Unit Description'/>
                    <Form.Input id='costObj-balance' placeholder='Current Balance' type={'number'}/>
                </Form.Group>
                <Select placeholder='Type' options={typeOptions} onChange={this.passDataToParent} fluid/>
                <br/>
                <Form.TextArea id='costObj-notes' placeholder='Cost Object Notes'/>
            </Form>
        )
    }
}

export default AddCostObjModal;