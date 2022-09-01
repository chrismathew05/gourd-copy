//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Message, Loader} from "semantic-ui-react";

//Other
import {Waypoint} from "react-waypoint";

//Component
class ItemsList extends Component {
    state = {
        prevLength: 0
    };

    handleWaypointEnter = () => {
        let currentLimit = +Session.get('searchLimit');
        if(this.state.prevLength < this.props.itemsList.length) {
            Session.set('searchLimit', currentLimit + 50);
            this.setState({prevLength: this.props.itemsList.length});
        }
    };

    render() {
        return (
            <div>
                {this.props.itemsList.length === 0 && this.props.ready ?
                    <Message
                        icon='inbox'
                        header='No Items Found'
                        content='Add items or modify query in searchbar.'
                    /> : <div>
                        {this.props.itemsList.map(item => React.cloneElement(this.props.cardComponent, {key: item._id, item, ...this.props.cardProps}))}
                    </div>
                }
                <Waypoint
                    onEnter={this.handleWaypointEnter}
                />
                <br/>
                { !this.props.ready ? <Loader active inline='centered' size='small'/>: <span/>}
                <br/>
                <br/>
                <br/>
            </div>
        )
    }
}

//Type-checking
ItemsList.propTypes = {
    subName: PropTypes.string,
    cardComponent: PropTypes.element,
    cardProps: PropTypes.array,
    listComponent: PropTypes.object,
    sortOrder: PropTypes.object,
    ready: PropTypes.bool
};

//Container to push data to component
const ItemsListContainer = withTracker(props => {
    Session.setDefault('searchLimit', 15);
    Session.set('searchContext', 'orders');

    let searchLimit = +Session.get('searchLimit');

    let handle = Meteor.subscribe(props.subName, props.searchQuery, searchLimit);
    let ready = handle.ready();

    let itemsList = props.listComponent.find({}, {sort: props.sortOrder}).fetch();

    return {
        itemsList,
        ready
    };
})(ItemsList);

export default ItemsListContainer;