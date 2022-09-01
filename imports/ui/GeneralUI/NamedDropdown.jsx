//Core imports
import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Dropdown} from "semantic-ui-react";

//Other

//Component: General dropdown component for named lists
class NamedDropdown extends Component {
    state = {
        selectedItem: ''
    };

    passDataToParent = (e, { value }) => {
        this.setState({selectedItem: value});
        this.props.selectedItem(value);
    };

    render() {
        return (
            <Dropdown
                fluid selection search
                options={this.props.namedList}
                value={this.state.selectedItem}
                placeholder={'Select ' + this.props.objName}
                onChange={this.passDataToParent}
            />
        )
    }
}

//Type-checking
NamedDropdown.propTypes = {
    namedList: PropTypes.array, //organized version for dropdown usage
    objList: PropTypes.array, //original list passed down
    objName: PropTypes.string
};

//Container to push data to component
const NamedDropdownContainer = withTracker(props => {
    let namedList = [];
    let objList = props.objList;

    for (let i = 0; i < objList.length; i++) {
        namedList[i] = {
            key: objList[i]._id,
            value: objList[i]._id,
            text: objList[i].name
        }
    }

    return {
        namedList
    };
})(NamedDropdown);

export default NamedDropdownContainer;