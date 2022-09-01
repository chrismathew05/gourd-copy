//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Modal, Button, Header} from "semantic-ui-react";

//Other
import DateTimePicker from "react-datetime-picker";
import {toast} from "react-toastify";

//Component
class EditItemDateRecdModal extends Component {
    state = {
        dateRecd: ''
    };

    handleDateTimeChange = date => this.setState({ dateRecd: date });

    updateDateRecd = () => {
        let dateRecd = this.state.dateRecd;

        if(dateRecd === null || dateRecd === '') {
            Meteor.call('Expenditure.cancelDateRecd', [...this.props.expIdList], err => {
               if(err) {
                   toast.error('Something went wrong! Date Received not updated.');
               } else {
                   toast.success('Date Received successfully removed!');
               }
            });
            return;
        }

        if(dateRecd < this.props.dateOrdered) {
            toast.error('Date received cannot be before Date Ordered!');
            return;
        }

        Meteor.call('Expenditure.updateDateRecd', [...this.props.expIdList], this.state.dateRecd,
            err => {
                if(err) {
                    toast.error('Something went wrong! Date Received not updated!');
                } else {
                    toast.success('Date Received successfully updated!');
                }
            }
        );
    };

    render() {
        return (
            <Modal size={'tiny'} trigger={this.props.trigger} closeIcon closeOnDimmerClick={false}>
                <Header icon={'dolly flatbed'} content={'Edit Date Received'}/>
                <Modal.Content>
                    <div>
                        <DateTimePicker
                            locale="en-US"
                            maxDetail={'second'}
                            onChange={this.handleDateTimeChange}
                            value={this.state.dateRecd}
                            minDate={this.props.dateOrdered}
                        />
                        <Button
                            style={{marginLeft: '5px'}}
                            size={'tiny'}
                            onClick={() => this.setState({dateRecd: new Date()})}
                        >Set to Now</Button>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.updateDateRecd} icon='checkmark' labelPosition='right' content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

//Type-checking
EditItemDateRecdModal.propTypes = {
    expIdList: PropTypes.object,
    dateOrdered: PropTypes.instanceOf(Date),
    trigger: PropTypes.element
};

export default EditItemDateRecdModal;