//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';

//Component imports
import {Expenditure} from "../../../../../api/PurchasingAPI/expenditure";

//Semantic-UI
import {Button, Form, Header, Modal, TextArea} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class EditItemNotesModal extends Component {

    editLineItemNotes = () => {
        Meteor.call('Expenditure.updateNotes', [...this.props.expIdList], document.getElementById('editOrder-Notes').value,
            err => {
                if(err) {
                    toast.error('Something went wrong! Notes not updated for this line item.');
                } else {
                    toast.success('Notes successfully updated.');
                }
            }
        );
    };

    render() {
        return (
            <div>
                <Modal size={'tiny'} trigger={this.props.trigger} closeIcon closeOnDimmerClick={false}>
                    <Header icon={'sticky note'} content={'Edit Notes'}/>
                    <Modal.Content>
                        <Form>
                            <TextArea id={'editOrder-Notes'} defaultValue={this.props.notes} autoHeight/>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button positive onClick={this.editLineItemNotes} icon='checkmark' labelPosition='right'
                                content='Submit'/>
                    </Modal.Actions>
                </Modal>
            </div>
        )
    }
}

//Type-checking
EditItemNotesModal.propTypes = {
    expIdList: PropTypes.object,
    notes: PropTypes.string,
    trigger: PropTypes.element
};

export default EditItemNotesModal;