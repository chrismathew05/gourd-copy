//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {Logger} from "../../api/GeneralAPI/logger";

//Semantic-UI
import {Message} from "semantic-ui-react";

//Other

//Component
class LogList extends Component {
    render() {
        return (
            <div>
                {this.props.logList.map(log => <Message key={log._id} negative={log.error}>
                    <Message.Header>{log.header}</Message.Header>
                    <Message.List>
                        {log.contentList.map((content, index) => <Message.Item key={index}>{content}</Message.Item>)}
                    </Message.List>
                </Message>
                )}
                <br/>
                <br/>
                <br/>
            </div>
        )
    }
}

//Type-checking
LogList.propTypes = {
    logList: PropTypes.array
};

//Container to push data to component
const LogListContainer = withTracker(() => {
    let logHandle = Meteor.subscribe('allLogs');
    let logList = [];

    if(logHandle.ready()) {
        logList = Logger.find({}).fetch();
    }

    return {
        logList
    };
})(LogList);

export default LogListContainer;