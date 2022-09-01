//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Meteor} from "meteor/meteor";

//Component imports

//Semantic-UI
import {Modal, Button, Header} from "semantic-ui-react";

//Other
import DateTimePicker from 'react-datetime-picker';
import {toast} from "react-toastify";

//Component
class EditItemDatePaidModal extends Component {
    state = {
        datePaid: ''
    };

    handleDateTimeChange = date => this.setState({ datePaid: date });

    updateDatePaid = () => {
        let datePaid = this.state.datePaid;

        if(datePaid === null || datePaid === '') {
            Meteor.call('Expenditure.cancelDatePaid', [...this.props.expIdList], err => {
                if(err) {
                    toast.error('Something went wrong! Date Paid not updated.');
                } else {
                    toast.success('Date Paid successfully removed!');
                }
            });
            return;
        }

        if(datePaid < this.props.dateOrdered) {
            toast.error('Date paid cannot be before date ordered!');
            return;
        }

        Meteor.call('Expenditure.updateDatePaid', [...this.props.expIdList], datePaid, err => {
            if(err) {
                toast.error('Something went wrong! Date paid not updated.');
            }  else {
                toast.success('Date paid successfully updated!');
            }
        });
    };

    render() {
        return (
            <Modal size={'tiny'} trigger={this.props.trigger} closeIcon closeOnDimmerClick={false}>
                <Header icon={'credit card'} content={'Edit Date Paid'}/>
                <Modal.Content>
                    <div>
                        <DateTimePicker
                            locale="en-US"
                            maxDetail={'second'}
                            onChange={this.handleDateTimeChange}
                            value={this.state.datePaid}
                            minDate={this.props.dateOrdered}
                        />
                        <Button
                            style={{marginLeft: '5px'}}
                            size={'tiny'}
                            onClick={() => this.setState({datePaid: new Date()})}
                        >Set to Now</Button>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button positive onClick={this.updateDatePaid} icon='checkmark' labelPosition='right'
                            content='Submit'/>
                </Modal.Actions>
            </Modal>
        )
    }
}

//Type-checking
EditItemDatePaidModal.propTypes = {
    expIdList: PropTypes.object,
    dateOrdered: PropTypes.instanceOf(Date),
    trigger: PropTypes.element
};

export default EditItemDatePaidModal;