//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Grid, Input, Confirm, Modal, Button, TextArea, Form, Dropdown, Popup} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class TaskLine extends Component {
    state = {
        hovered: false,
        description: '',
        prevNotes: '',
        notes: '',
        hours: '',
        initial: true,
        confirmOpen: false,
        parent: '',
        modalOpen: false
    };

    static getDerivedStateFromProps(props, state) {
        if (props.ready && state.initial) {
            return {
                description: props.task.description,
                notes: props.task.notes,
                hours: props.task.hours,
                initial: false
            };
        }

        // Return null to indicate no change to state.
        return null;
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    updateDescription = () => {
        if(this.state.description === '') {
            toast.error('Task Description is a required field!');
            Meteor.call('Tasks.updateDescription',this.props.task._id, 'FILLER');
        } else {
            Meteor.call('Tasks.updateDescription',this.props.task._id, this.state.description);
        }
    };

    updateNotes = () => {
        if(this.state.prevNotes !== this.state.notes) {
            Meteor.call('Tasks.updateNotes', this.props.task._id, typeof this.state.notes === 'undefined' ? '' : this.state.notes);
            this.setState({
                prevNotes: this.state.notes
            });
        }
    };

    updateHours = () => Meteor.call('Tasks.updateHours', this.props.task._id, this.state.hours);

    completeTask = () => Meteor.call('Tasks.completeTask', this.props.task._id);

    //confirm controls for deletion
    confirmRemoval = () => this.setState({ confirmOpen: true });
    closeConfirm = () => this.setState({ confirmOpen: false });
    removeTask = () => Meteor.call('Tasks.removeTask', this.props.task._id, this.props.task.member, this.props.task.prevLinkedTask, this.props.task.nextLinkedTask);

    //reassigns label for task
    modifyLabel = () => {
        Meteor.call('Tasks.updateLabel', this.props.task._id, this.state.parent);
        this.setState({parent: '', modalOpen: false});
        toast.success('Task successfully re-labeled!');
    };

    //pushes task to next week
    pushTask = () => {
        if(typeof this.props.task.nextLinkedTask !== 'undefined' && this.props.task.nextLinkedTask !== null) {
            //already pushed
            toast.error('Task already pushed. Cannot push again!');
        } else {
            Meteor.call('Tasks.pushTask', this.props.task._id, (err) => {
                if(err) {
                    toast.error('Task not pushed. Something went wrong.')
                } else {
                    toast.success('Task successfully pushed!');
                }
            });
        }
    };

    render() {
        const trigger = <Button circular size={'tiny'} color='blue' icon='list ul' onClick={() => this.setState({modalOpen: true})}/>;

        return (
            <Grid stackable onMouseLeave={() => this.setState({hovered: false})} onMouseEnter={() => this.setState({hovered: true})}>
                <Grid.Row columns={this.state.hovered && this.props.task.member === Meteor.user()._id ? 4 : 3}>

                    {/*Description*/}
                    <Grid.Column width={4}>
                        {!this.props.task.complete ?
                            <Input placeholder={'Description'} name={'description'} onChange={this.handleChange}
                                   onBlur={this.updateDescription} value={this.state.description} fluid /> :
                            <Input icon={'check'} iconPosition={'left'} placeholder={'Description'} name={'description'} onChange={this.handleChange}
                                   onBlur={this.updateDescription} value={this.state.description} fluid/>
                        }
                    </Grid.Column>

                    {/*Notes*/}
                    <Grid.Column width={this.state.hovered && this.props.task.member === Meteor.user()._id ? 8 : 10}>
                        <Form>
                            <TextArea placeholder={'Notes'} name={'notes'} rows={1} onChange={this.handleChange} autoHeight
                                      value={this.state.notes === null ? '' : this.state.notes} onBlur={this.updateNotes}/>
                        </Form>
                    </Grid.Column>

                    {/*Hours*/}
                    <Grid.Column width={2}>
                        <Input placeholder={'Hours'} name={'hours'} onChange={this.handleChange} type={'number'} min={'0'}
                               onBlur={this.updateHours} value={this.state.hours} fluid/>
                    </Grid.Column>

                    {/*Task controls*/}
                    {this.state.hovered && this.props.task.member === Meteor.user()._id ?
                        <Grid.Column width={2}>
                            {/*Delete*/}
                            <Popup
                                trigger={<Button circular size={'tiny'} color='red' icon='trash alternate' onClick={this.confirmRemoval}/>}
                                content='Delete task'
                                position='bottom center'
                                inverted
                            />
                            <Confirm size={'mini'} open={this.state.confirmOpen} onCancel={this.closeConfirm} onConfirm={this.removeTask} />

                            {/*Re-label*/}
                            <Modal size={'tiny'} open={this.state.modalOpen}>
                                <Modal.Header>Nest task under: </Modal.Header>
                                <Modal.Content>
                                    <Dropdown
                                        fluid selection search
                                        options={this.props.labelsList}
                                        value={this.state.parent}
                                        placeholder={'Nest under'}
                                        onChange={this.handleChange}
                                        name={'parent'}
                                    />
                                </Modal.Content>
                                <Modal.Actions>
                                    <Button color='red' icon={'remove'} content={'Close'} onClick={() => this.setState({modalOpen: false})}/>
                                    <Button positive icon='checkmark' content='Submit' onClick={this.modifyLabel}/>
                                </Modal.Actions>
                            </Modal>
                            <Popup trigger={trigger} content='Re-label task' position='bottom center' inverted/>

                            {/*Push task*/}
                            <Popup
                                trigger={<Button circular size={'tiny'} color={'purple'} icon={'arrow circle right'} onClick={this.pushTask}/>}
                                content='Push task'
                                position='bottom center'
                                inverted
                            />

                            {/*Complete task*/}
                            <Popup
                                trigger={<Button circular size={'tiny'} color={'green'} icon={'check'} onClick={this.completeTask}/>}
                                content='Complete task'
                                position='bottom center'
                                inverted
                            />
                        </Grid.Column> : <span/>
                    }
                </Grid.Row>
            </Grid>
        )
    }
}

//Type-checking
TaskLine.propTypes = {
    task: PropTypes.object,
    ready: PropTypes.bool,
    labelsList: PropTypes.array
};

export default TaskLine;