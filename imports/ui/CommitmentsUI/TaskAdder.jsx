//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';
import {Labels} from '../../api/CommitmentsAPI/labels';
import {Tasks} from "../../api/CommitmentsAPI/tasks";


//Component imports

//Semantic-UI
import {Grid, Input, Button, Dropdown, TextArea, Form} from "semantic-ui-react";

//Other
import {toast} from 'react-toastify';

//Component
class TaskAdder extends Component {
    state = {
        options: [
            { key: 'task', icon: 'tasks', text: 'Task', value: 'task' },
            { key: 'event', icon: 'calendar check outline', text: 'Event', value: 'event' },
            { key: 'label', icon: 'tag', text: 'Label', value: 'label' }
        ],
        itemToAdd: 'task',
        description: '',
        notes: '',
        hours: '',
        event: '',
        from: '',
        to: '',
        newLabel: '',
        parent: 'GENERAL'
    };

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    addTask = () => {
        //error-check inputs
        let hours = this.state.hours;
        if(hours <= 0) { hours = 1; }

        if(this.state.description === '') {
            toast.error('Description is a required field!');
            return;
        }

        let task = {
            member: Meteor.user()._id, //add task to the first selected user
            weekStart: this.props.weekStart,
            description: this.state.description,
            notes: this.state.notes,
            hours
        };

        //Insert task for each selected user
        Meteor.call('Tasks.insert', task, (err, res) => {
            if(err) {
                toast.error('Something went wrong. Task not added.');
            } else {
                toast.success('Task successfully added!', {
                    position: "top-right",
                    autoClose: 1400,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: false
                });
            }
        });

        //Reset form
        this.setState({
            description: '',
            notes: '',
            hours: ''
        });

        //jump to description after clearing fields
        document.querySelector('#addDesc').focus();
    };

    addLabel = () => {
        //sanitize inputs
        if(this.state.newLabel === '') {
            toast.error('Label name required!');
            return;
        }

        Meteor.call('Labels.insertChildLabel', this.state.newLabel, this.state.parent, (err) => {
           if(err) {
               toast.error('Something went wrong (probably attempted to add duplicate names). Label not added.');
           } else {
               this.setState({newLabel: '', parent: ''});
               toast.success('Label successfully added!');
           }
        });

        document.querySelector('#addLabel').focus();
    };

    addNewItem = () => {
        if(this.state.itemToAdd === 'task') {
            this.addTask();
        } else if(this.state.itemToAdd === 'event') {
            toast.error('Event addition still not set up.');
        } else {
            this.addLabel();
        }
    };

    render() {
        const typeSwitcher = (
            <Grid.Column width={2}>
                <Button.Group color='teal'>
                    <Button onClick={this.addNewItem}>Add</Button>
                    <Dropdown name={'itemToAdd'} onChange={this.handleChange}
                              options={this.state.options} floating button
                              className='icon' value={this.state.itemToAdd}/>
                </Button.Group>
            </Grid.Column>
        );

        return (
            <div>
                {/*Add new task*/}
                {this.state.itemToAdd === 'task' ?
                    <Grid columns={4} stackable>
                        <Grid.Column width={4}>
                            <Input id={'addDesc'} placeholder={'Add Description'} name={'description'}
                                   value={this.state.description} onChange={this.handleChange} fluid/>
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <Form>
                                <TextArea placeholder={'Add Notes'} name={'notes'} value={this.state.notes}
                                          rows={1} onChange={this.handleChange} autoHeight/>
                            </Form>
                        </Grid.Column>
                        <Grid.Column width={2}>
                            <Input type={'number'} placeholder={'Add Hours'} name={'hours'}
                                   value={this.state.hours} onChange={this.handleChange} min={0} fluid/>
                        </Grid.Column>
                        {typeSwitcher}
                    </Grid> : <span>
                        {/*Add new event*/}
                        {this.state.itemToAdd === 'event' ?
                            <Grid columns={4} stackable>
                                <Grid.Column width={6}>
                                    <Input placeholder={'Event Name'} name={'event'} value={this.state.event}
                                           onChange={this.handleChange} fluid/>
                                </Grid.Column>
                                <Grid.Column width={4}>
                                    <Input placeholder={'From'} name={'from'} value={this.state.from}
                                           onChange={this.handleChange} fluid/>
                                </Grid.Column>
                                <Grid.Column width={4}>
                                    <Input placeholder={'To'} name={'to'} value={this.state.to}
                                           onChange={this.handleChange} fluid/>
                                </Grid.Column>
                                {typeSwitcher}
                            </Grid> :
                            //Add new label
                            <Grid columns={2} stackable>
                                <Grid.Column width={7}>
                                    <Input id={'addLabel'} placeholder={'New Label'} name={'newLabel'} value={this.state.newLabel}
                                           onChange={this.handleChange} fluid/>
                                </Grid.Column>
                                <Grid.Column width={7}>
                                    {this.props.labelsReady ?
                                        <Dropdown
                                            fluid selection search
                                            options={this.props.labelsList}
                                            value={this.state.parent}
                                            placeholder={'Nest under'}
                                            onChange={this.handleChange}
                                            name={'parent'}
                                        /> : <div>Loading...</div>
                                    }
                                </Grid.Column>
                                {typeSwitcher}
                            </Grid>
                        }
                    </span>
                }
            </div>
        )
    }
}

//Type-checking
TaskAdder.propTypes = {
    weekStart: PropTypes.instanceOf(Date),
    labelsList: PropTypes.array,
    labelsReady: PropTypes.bool,
    selectedUsers: PropTypes.array
};

export default TaskAdder;