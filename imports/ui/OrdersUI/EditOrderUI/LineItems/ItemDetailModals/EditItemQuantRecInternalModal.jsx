//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Button, Header, Input, Modal} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class EditItemQuantRecInternalModal extends Component {

    updateQuantRecInternal = () => {
        let quantRecInternal = document.getElementById('quantRecInternal').value;

        if(quantRecInternal === '' || quantRecInternal === null) {quantRecInternal = 0;}

        Meteor.call(
            'Expenditure.updateQuantRecInternal',
            this.props.expId,
            this.props.quantRecInternal,
            quantRecInternal,
            this.props.costObjId,
            err => {
                if(err) {
                    toast.error('Something went wrong! Cost Object not updated!');
                } else {
                    toast.success('Quantity Received (Internal) successfully updated!');
                }
            }
        );
    };

    render() {
        return (
            <Modal size={'mini'} trigger={<b style={{cursor: 'pointer'}}>Quantity Received</b>} closeIcon closeOnDimmerClick={false}>
                <Header icon={'hashtag'} content={'Edit Quantity Received (Internal)'}/>
                <Modal.Content>
                    <Input id={'quantRecInternal'} fluid placeholder={'Quantity Received Internal'}
                           defaultValue={this.props.quantRecInternal} type={'number'} min={0}/>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.updateQuantRecInternal} icon='checkmark' labelPosition='right' content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

//Type-checking
EditItemQuantRecInternalModal.propTypes = {
    expId: PropTypes.string,
    quantRecInternal: PropTypes.number,
    costObjId: PropTypes.string
};

export default EditItemQuantRecInternalModal;