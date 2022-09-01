//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import PropTypes from 'prop-types';

//Component imports
import {Banner} from "../../api/CommitmentsAPI/banner";

//Semantic-UI
import {Message, Modal, TextArea, Form, Button} from "semantic-ui-react";

//Other

//Component
class BannerComponent extends Component {
    state = {
        content: '',
        open: false,
        initial: true
    };

    static getDerivedStateFromProps(props, state) {
        if (props.ready && state.initial) {
            return {
                content: props.content,
                initial: false
            };
        }

        // Return null to indicate no change to state.
        return null;
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value });

    saveContent = () => {
        Meteor.call('Banner.updateGeneralBannerContent', this.state.content);
        this.setState({
           open: false
        });
    };

    cancelContent = () => {
        this.setState({
            content: this.props.content,
            open: false
        });
    };

    render() {
        return (
            <div>
                <Message onClick={() => this.setState({open: true})}>
                    <span style={{whiteSpace: "pre-wrap"}}>{this.props.content}</span>
                </Message>
                <Modal open={this.state.open}>
                    <Modal.Header>Edit Content</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <TextArea name={'content'} value={this.state.content} onChange={this.handleChange} autoHeight/>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='red' icon={'remove'} content={'Close'} onClick={this.cancelContent}/>
                        <Button positive icon='checkmark' content='Save & Close' onClick={this.saveContent}/>
                    </Modal.Actions>
                </Modal>
            </div>
        )
    }
}

//Type-checking
BannerComponent.propTypes = {
    content: PropTypes.string,
    ready: PropTypes.bool
};

//Container to push data to component
const BannerContainer = withTracker(() => {
    let bannerHandle = Meteor.subscribe('generalBanner');
    let ready = bannerHandle.ready();
    let content = '';

    if(ready) {
        let banner = Banner.findOne();
        if(banner) {
            content = banner.content;
        }
    }

    return {
        content,
        ready
    };
})(BannerComponent);

export default BannerContainer;