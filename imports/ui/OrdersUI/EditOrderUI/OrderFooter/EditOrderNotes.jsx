//Core imports
import React, {Component} from 'react';
import {Meteor} from "meteor/meteor";
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Modal, Header, Form, TextArea, Button, Popup} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class EditOrderNotes extends Component {
    state = {
        showModal: false
    };

    editOrderNotes = () => {
        Meteor.call('Order.updateOrderNotes', this.props.orderId, document.getElementById('editOrder-OrderNotes').value,
            err => {
                if(err) {
                    toast.error('Something went wrong! Order notes not updated.');
                } else {
                    this.setState({showModal: false});
                    toast.success('Notes successfully updated.');
                }
            }
        );
    };

    closeModal = () => this.setState({ showModal: false });

    render() {
        return (
            <React.Fragment>
                <Popup
                    trigger={<Button color={'green'} circular icon='clipboard list' onClick={() => this.setState({showModal: true})}/>}
                    content='Edit Order Notes'
                    position='bottom center'
                    inverted
                />
                <Modal open={this.state.showModal} onClose={this.closeModal} size={'tiny'} closeIcon closeOnDimmerClick={false}>
                    <Header icon={'sticky note'} content={'Edit Order Notes'}/>
                    <Modal.Content>
                        <Form>
                            <TextArea id={'editOrder-OrderNotes'} defaultValue={this.props.orderNotes} autoHeight/>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button positive onClick={this.editOrderNotes} icon='checkmark' labelPosition='right'
                                content='Submit'/>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        )
    }
}

//Type-checking
EditOrderNotes.propTypes = {
    orderId: PropTypes.string,
    orderNotes: PropTypes.string
};

export default EditOrderNotes;