//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Modal, Button, Header, Input} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class EditItemFXModal extends Component {

    updateFX = () => {
        let fx = document.getElementById('fx').value;

        if(fx === '' || fx === null) {fx = 0;}

        Meteor.call(
            'Expenditure.updateFX',
            [...this.props.expIdList],
            fx,
            err => {
                if(err) {
                    toast.error('Something went wrong! FX not updated!');
                } else {
                    toast.success('FX successfully updated!');
                }
            }
        );
    };

    render() {
        return (
            <Modal size={'mini'} trigger={this.props.trigger} closeIcon closeOnDimmerClick={false}>
                <Header icon={'pound sign'} content={'Edit FX'}/>
                <Modal.Content>
                    <Input id={'fx'} fluid placeholder={'FX'} defaultValue={this.props.fx} type={'number'} min={0}/>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.updateFX} icon='checkmark' labelPosition='right' content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

//Type-checking
EditItemFXModal.propTypes = {
    expIdList: PropTypes.object,
    fx: PropTypes.number,
    trigger: PropTypes.element
};

export default EditItemFXModal;