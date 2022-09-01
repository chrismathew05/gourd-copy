//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {Labels} from "../../api/CommitmentsAPI/labels";

//Semantic-UI
import {Dropdown} from "semantic-ui-react";

//Component
class LabelsDropdown extends Component {
    state = {
        selectedLabel: 'GENERAL'
    };

    passDataToParent = (e, { value }) => {
        this.setState({selectedLabel: value});
        this.props.selectedLabel(value);
    };

    render() {
        return (
            <Dropdown
                fluid selection search
                options={this.props.labelsList}
                value={this.state.selectedLabel}
                placeholder={'Nest under...'}
                onChange={this.passDataToParent}
            />
        )
    }
}

LabelsDropdown.propTypes = {
    labelsList: PropTypes.array
};

//Container to push data to component
const LabelsDropdownContainer = withTracker(() => {
    let labelsHandle = Meteor.subscribe('allLabelNames');

    let labelsReady = labelsHandle.ready();
    let labelsList = [];

    if(labelsReady) {
        let labels = Labels.find().fetch();

        for (let i = 0; i < labels.length; i++) {
            labelsList[i] = {
                key: labels[i]._id,
                value: labels[i]._id,
                text: labels[i].name
            }
        }
    }

    return {
        labelsList
    };
})(LabelsDropdown);

export default LabelsDropdownContainer;