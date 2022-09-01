//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import PropTypes from 'prop-types';

//Component imports
import {Labels} from "../../api/CommitmentsAPI/labels";

//Semantic-UI
import {List, Button, Popup, Grid, Modal, Dropdown, Input} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";

//Component
class LabelsComponent extends Component {
    state = {labelName: '', labelParent: '', editModalOpen: false, selectedLabelId: ''};

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    findLabel = labelId => {
        for (let i = 0; i < this.props.labels.length; i++) {
            if(this.props.labels[i]._id === labelId) {
                return this.props.labels[i];
            }
        }
    };

    deleteLabel = labelId => {
        Meteor.call('Labels.remove', labelId);
    };

    isGrandParent = labelId => {
        //check if labelId is grandparent of id you're trying to nest under
        let labelParent = this.state.labelParent;
        do {
            let label = Labels.findOne({_id: labelParent}, {fields: {_id: 1, parent: 1}});
            if(label._id === labelId) {
                return true; //indicates that user is trying to nest a parent under a child
            }
            labelParent = label.parent;
        } while(typeof labelParent !== 'undefined');
        return false;
    };

    editLabel = labelId => {
        if(this.state.labelName !== '') {
            Meteor.call('Labels.editLabelName', labelId, this.state.labelName);
        }

        if(this.state.labelParent !== '' && typeof this.state.labelParent !== 'undefined') {
            if(this.isGrandParent(labelId)) {
                toast.error("Cannot nest label within it's own sub-tree");
                return;
            } else {
                Meteor.call('Labels.editLabelParent', labelId, this.state.labelParent);
            }
        }

        this.setState({
            editModalOpen: false,
            labelParent: '',
            labelName: ''
        });
        toast.success('Label successfully edited!');
    };

    renderChildren = labelId => {
        let label = this.findLabel(labelId);
        return (
            <List.Item key={labelId}>
                {labelId !== "GENERAL" ?
                    <Popup trigger={<List.Icon className={'labelIcon'} name={'folder open'} size={'large'}/>} position='top left' flowing hoverable>

                        {/*Popup content*/}
                        <Grid centered divided columns={2}>
                            <Grid.Column textAlign='center'>
                                <Button color='blue' content='Edit' onClick={() => this.setState({editModalOpen: true, selectedLabelId: labelId})}/>
                            </Grid.Column>
                            <Grid.Column textAlign='center'>
                                <Button color='red' content='Delete' onClick={() => this.deleteLabel(labelId)}/>
                            </Grid.Column>
                        </Grid>
                    </Popup> : <List.Icon name={'archive'} size={'large'}/>
                }
                {/*Edit Modal*/}
                <Modal size={'tiny'} open={this.state.editModalOpen}>
                    <Modal.Header>Edit Label</Modal.Header>
                    <Modal.Content>
                        <Input placeholder={'Edit Label Name'} name={'labelName'} onChange={this.handleChange} value={this.state.labelName} fluid />
                        <br/>
                        <Dropdown
                            fluid selection search
                            options={this.props.labelsList}
                            value={this.state.parent}
                            placeholder={'Nest under...'}
                            onChange={this.handleChange}
                            name={'labelParent'}
                        />
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='red' icon={'remove'} content={'Close'} onClick={() => this.setState({editModalOpen: false})}/>
                        <Button positive icon='checkmark' content='Submit' onClick={() => this.editLabel(this.state.selectedLabelId)}/>
                    </Modal.Actions>
                </Modal>

                <List.Content>
                    <List.Header as={'h4'}>{label.name}</List.Header>
                    <List.List>
                        {label.children.map((childLabelId) => {
                            return this.renderChildren(childLabelId);
                        })}
                    </List.List>
                </List.Content>
            </List.Item>
        );
    };

    render() {
        return (
            <div>
                {this.props.ready ?
                    <div>
                        <List>
                            {this.renderChildren('GENERAL')}
                        </List>
                    </div> : <div>Loading...</div>
                }
            </div>
        )
    }
}

//Type-checking
LabelsComponent.propTypes = {
    labels: PropTypes.array,
    labelsList: PropTypes.array,
    ready: PropTypes.bool
};

//Container to push data to component
const LabelsContainer = withTracker(() => {
    let labelsHandle = Meteor.subscribe('allLabels');
    let labels = [];

    if(labelsHandle.ready) {
        labels = Labels.find().fetch();
    }

    return {
        labels,
        ready: labelsHandle.ready()
    };
})(LabelsComponent);

export default LabelsContainer;