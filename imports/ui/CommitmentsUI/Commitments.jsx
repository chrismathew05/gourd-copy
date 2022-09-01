//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import TaskAdder from "./TaskAdder";
import CommitmentsListContainer from './CommitmentsList';
import LabelsComponent from "../CommitmentsUI/Labels";
import {Labels} from "../../api/CommitmentsAPI/labels";
import BannerContainer from "./Banner";

//Semantic-UI
import {Grid, Progress, Modal, Button, Label, Icon, Dropdown, Segment, Popup} from "semantic-ui-react";

//Other
import Calendar from 'react-calendar';
import moment from 'moment';

//Component
class Commitments extends Component {
    state = {
        weekStart: moment().startOf('week').add(moment().utcOffset(), 'minutes').toDate(),
        value: [],
        initial: true
    };

    static getDerivedStateFromProps(props, state) {
        if (props.ready && state.initial) {
            return {
                value: [Meteor.user()._id],
                initial: false
            };
        }

        // Return null to indicate no change to state.
        return null;
    }

    handleChange = (e, { value }) => this.setState({ value });

    //display range of days on label
    weekRange = () => {
        let w = this.state.weekStart;
        let weekStart = moment(w).format('ll');
        let extraDesc = "";


        if(Meteor.Device.isDesktop()) {
            if (weekStart === moment().utc().startOf('week').format('ll')) {
                extraDesc = " | This Week";
            } else if (weekStart === moment().utc().startOf('week').subtract(1, 'week').format('ll')) {
                extraDesc = " | Last Week";
            } else if (weekStart === moment().utc().startOf('week').add(1, 'week').format('ll')) {
                extraDesc = " | Next Week";
            }
        }

        return weekStart + " - " + moment(w).add(6, 'd').format('ll') + extraDesc;
    };

    //calendar control
    onSelectDate = date => {
        let w = moment(date).utc().startOf('week').toDate();
        this.setState({weekStart: w});
    };

    //week increment/decrement
    addWeek = () => {
        let w = moment(this.state.weekStart).add(7,'d').toDate();
        this.setState({weekStart: w});
    };
    subtractWeek = () => {
        let w = moment(this.state.weekStart).subtract(7,'d').toDate();
        this.setState({weekStart: w});
    };

    render() {
        return (
            <div>
                <BannerContainer/>
                <Segment>
                    <Grid columns={2} stackable>
                        <Grid.Column width={'11'}>
                            {/*Week picker controls*/}
                            <Modal size='mini' trigger={<Label color={'blue'} as={'a'} size='large'><Icon name='calendar'/>{this.weekRange()}</Label>}>
                                <Modal.Header>Jump to a Week</Modal.Header>
                                <Modal.Content>
                                    <Calendar
                                        calendarType="US"
                                        onChange={this.onSelectDate}
                                        value={this.state.weekStart}
                                    />
                                </Modal.Content>
                            </Modal>
                            <Button size={'small'} floated='right' icon='chevron right' onClick={this.addWeek}/>
                            <Button size={'small'} floated='right' icon='chevron left' onClick={this.subtractWeek}/>

                            {/*Label Hierarchy Controls*/}
                            {Meteor.Device.isDesktop() ?
                                <Modal size={'tiny'} trigger={<Button size={'small'} floated='right'>View Hierarchy</Button>}>
                                    <Modal.Header>Label Hierarchy</Modal.Header>
                                    <Modal.Content>
                                        <Modal.Description>
                                            <LabelsComponent labelsList={this.props.labelsList}/>
                                        </Modal.Description>
                                    </Modal.Content>
                                </Modal> :<span/>
                            }
                        </Grid.Column>

                        {/*User selection*/}
                        <Grid.Column width={'5'}>
                            {this.props.ready ?
                                <Dropdown
                                    fluid selection multiple search
                                    options={this.props.users}
                                    value={this.state.value}
                                    placeholder={'Filter tasks for'}
                                    onChange={this.handleChange}
                                /> : <div>Loading...</div>
                            }
                        </Grid.Column>
                    </Grid>

                    <TaskAdder weekStart={this.state.weekStart} labelsList={this.props.labelsList} labelsReady={this.props.labelsReady} selectedUsers={this.state.value}/>

                    {/*Progress display*/}
                    <Popup
                        trigger={<Progress percent={this.props.percentComplete} attached='bottom' indicating size='small'/>}
                        content={this.props.totalHours + ' Hours Committed - ' + this.props.percentComplete + '% Complete'}
                        position={'bottom center'}
                        flowing
                        inverted
                    />
                </Segment>

                {/*List of commitments*/}
                <CommitmentsListContainer weekStart={this.state.weekStart} users={this.state.value} labelsReady={this.props.labelsReady}
                                          labelsList={this.props.labelsList} labels={this.props.labels}/>
                <br/>
                <br/>
                <br/>
                <br/>
            </div>
        )
    }
}

//Type-checking
Commitments.propTypes = {
    ready: PropTypes.bool,
    users: PropTypes.array,
    labelsList: PropTypes.array,
    labelsReady: PropTypes.bool,
    labels: PropTypes.array,
    percentComplete: PropTypes.number,
    totalHours: PropTypes.number
};

//Container to push data to component
const CommitmentsContainer = withTracker(() => {
    let usersHandle = Meteor.subscribe('allUsers');
    let labelsHandle = Meteor.subscribe('allLabels');
    Session.setDefault('PERCENT_COMPLETE', 0);
    Session.setDefault('TOTAL_HOURS_COMMITTED', 0);

    let percentComplete = Session.get('PERCENT_COMPLETE');
    let totalHours = Session.get('TOTAL_HOURS_COMMITTED');

    let ready = usersHandle.ready();
    let users = Meteor.users.find().fetch();

    let labelsReady = labelsHandle.ready();
    let labels = Labels.find().fetch();
    let labelsList = [];

    if(labelsReady) {
        for (let i = 0; i < labels.length; i++) {
            labelsList[i] = {
                key: labels[i]._id,
                value: labels[i]._id,
                text: labels[i].name
            }
        }
    }

    if(ready) {
        for (let i = 0; i < users.length; i++) {
            users[i] = {
                key: users[i]._id,
                value: users[i]._id,
                text: users[i].services.google.email.replace('@intelline.ca','')
            }
        }
    }

    return {
        users,
        ready,
        labelsList,
        labelsReady,
        labels,
        percentComplete,
        totalHours
    };
})(Commitments);

export default CommitmentsContainer;