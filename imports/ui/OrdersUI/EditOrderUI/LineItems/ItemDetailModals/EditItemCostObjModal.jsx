//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports
import CostObjDropdownContainer from "../../../CostObjUI/CostObjDropdown";
import AddCostObjModal from "../../../CostObjUI/AddCostObjModal";

//Semantic-UI
import {Button, Header, Modal} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class EditItemCostObjModal extends Component {
    state = {
        selectedCostObj: ''
    };

    handleCostObjSelection = selectedCostObj => this.setState({selectedCostObj});

    updateCostObj = () => {
        Meteor.call(
            'Expenditure.updateCostObjId',
            this.props.expId,
            this.state.selectedCostObj,
            this.props.costObjId,
            this.props.quantRecInternal,
            err => {
                if(err) {
                    toast.error('Something went wrong! Cost Object not updated!');
                } else {
                    toast.success('Cost Object successfully updated!')
                }
            }
        );
    };

    render() {
        return (
            <Modal size={'tiny'} trigger={<b style={{cursor: 'pointer'}}>Cost Object</b>} closeIcon closeOnDimmerClick={false}>
                <Header icon={'tags'} content={'Edit Cost Object'}/>
                <Modal.Content>
                    <CostObjDropdownContainer selectedCostObj={this.handleCostObjSelection}/>
                </Modal.Content>
                <Modal.Actions>
                    <AddCostObjModal/>
                    <Button positive onClick={this.updateCostObj} icon='checkmark' labelPosition='right' content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

//Type-checking
EditItemCostObjModal.propTypes = {
    expId: PropTypes.string,
    costObjId: PropTypes.string,
    quantRecInternal: PropTypes.number
};

export default EditItemCostObjModal;