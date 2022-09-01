//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import TaskLine from "./TaskLine";
import {Tasks} from "../../api/CommitmentsAPI/tasks";
import {Labels} from "../../api/CommitmentsAPI/labels";

//Semantic UI React imports
import {Divider, Header} from "semantic-ui-react";

class CommitmentsList extends Component {
    //renders tasks corresponding to label
    renderTasks = labelId => {
        let tasks = Tasks.find({labelId}).fetch();
        return tasks.map(task => <TaskLine key={task._id} task={task} ready={this.props.ready} labelsList={this.props.labelsList}/>);
    };

    //prints parent header and recursively prints children labels and corresponding tasks
    renderChildren = (label, indentation) => {
        if(typeof label !== 'undefined' && label !== null) {
            return (
                <div key={label._id}>
                    {/*Label generation*/}
                    <Header as='h3' content={'-'.repeat(indentation) + label.name} />

                    {/*Tasks under label*/}
                    {this.renderTasks(label._id)}
                    <Divider/>

                    {/*Generate label children*/}
                    {label.children.map((childLabelId) => {
                        let childLabel = this.props.labels.find(label => label._id === childLabelId);
                        return this.renderChildren(childLabel, indentation + 2);
                    })}
                </div>
            );
        }
    };

    render() {
        return (
            <div>
                {this.props.ready ?
                    <div>
                        {this.renderChildren(this.props.generalLabel, 0)}
                    </div> :
                    <div>Loading...</div>
                }
            </div>
        );
    }
}

CommitmentsList.propTypes = {
    tasksReady: PropTypes.bool,
    users: PropTypes.array,
    weekStart: PropTypes.instanceOf(Date),
    labelsReady: PropTypes.bool,
    labelsList: PropTypes.array,
    ready: PropTypes.bool,
    labels: PropTypes.array
};

//Container to push data to component
const CommitmentsListContainer = withTracker(props => {
    let tasksHandle = Meteor.subscribe('tasksForWeekAndUsers', props.weekStart, props.users);

    let ready = tasksHandle.ready() && props.labelsReady;
    let tasks = [];
    let labels = [];
    let generalLabel = {};


    if(ready) {
        let tasks = Tasks.find().fetch();

        let totalHours = 0;
        let completedHours = 0;
        let percentageCompleted = 0;

        //FOR PROGRESS BAR: Calculate total hours
        totalHours = tasks.reduce((totalHours, currTask) => {
            if (typeof(currTask.hours) !== 'undefined' && currTask.hours !== null) {
                return totalHours + currTask.hours;
            } else {
                return totalHours;
            }
        }, 0);

        //FOR PROGRESS BAR: Calculate completed hours
        if(totalHours > 0) {
            completedHours = tasks.reduce((totalHours, currTask) => {
                if (typeof(currTask.hours) !== 'undefined' && currTask.hours !== null && currTask.complete) {
                    return totalHours + currTask.hours;
                } else {
                    return totalHours;
                }
            }, 0);
            percentageCompleted = Math.round(100*completedHours/totalHours);
        }

        Session.set('PERCENT_COMPLETE', percentageCompleted);
        Session.set('TOTAL_HOURS_COMMITTED', totalHours);

        //loop through each task
        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];

            let labelId = task.labelId; //start at task's corresponding label
            while (labelId !== '') {
                //if label not already added
                if (labels.findIndex(l => l._id === labelId) < 0) {
                    //find label corresponding to label id and add to array
                    let label = props.labels.find(l => l._id === labelId);

                    if(typeof label !== 'undefined' && label !== null) {
                        labels.push(label);

                        //transition to parent
                        labelId = label.parent;
                    } else {
                        labelId = '';
                    }
                } else {
                    break;
                }
            }
        }
        generalLabel = Labels.findOne({_id: 'GENERAL'});
    }

    return {
        tasks,
        ready,
        labels,
        generalLabel
    };
})(CommitmentsList);

export default CommitmentsListContainer;