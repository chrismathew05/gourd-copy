//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports
import AddCostObjForm from "../CostObjUI/AddCostObjForm";

//Semantic-UI
import {Button, Modal} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class AddCostObjModal extends Component {
    state = {
        selectedCostObjType: 1
    };

    submitCostObj = () => {
        let name = document.getElementById('costObj-name').value;
        if(name === '') {
            toast.error('Name must be non-empty!');
            return;
        }

        let newCostObj = {
            name,
            unitDesc: document.getElementById('costObj-unitDesc').value,
            balance: document.getElementById('costObj-balance').value,
            itemType: this.state.selectedCostObjType,
            notes: document.getElementById('costObj-notes').value
        };

        Meteor.call('CostObj.insert', newCostObj, err => {
            if(err) {
                toast.error('Something went wrong! Cost Object Name is probably already taken!');
            } else {
                toast.success('Cost Object successfully added!');
            }
        });
    };

    handleSelection = selectedCostObjType => this.setState({selectedCostObjType});

    render() {
        return (
            <Modal trigger={<Button content='Add Cost Object'/>} closeIcon closeOnDimmerClick={false}>
                <Modal.Header>
                    Add Cost Object
                </Modal.Header>
                <Modal.Content>
                    <AddCostObjForm
                        selectedCostObjType={this.handleSelection}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.submitCostObj} icon='checkmark' labelPosition='right'
                            content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default AddCostObjModal;