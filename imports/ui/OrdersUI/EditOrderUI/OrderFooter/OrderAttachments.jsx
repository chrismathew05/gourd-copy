//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Label, Icon} from "semantic-ui-react";
import {HTTP} from "meteor/http";

//Other
import {toast} from "react-toastify";

//Component
class OrderAttachments extends Component {
    componentDidMount() {
        if(this.props.orderId && this.props.gDriveFolderId) {
            Meteor.call('Order.updateAttachmentIds', this.props.orderId, this.props.gDriveFolderId, err => {
                if(err) {
                    toast.error('Looks like your google access token has expired. Log out and back in to refresh!');
                }
            });
        }
    }

    downloadFile = attachmentId => {
        const url = 'https://www.googleapis.com/drive/v3/files/' + attachmentId + '?fields=webContentLink';
        HTTP.call('GET', url, {
            headers: {
                'Authorization': 'Bearer ' + this.props.accessToken
            }
        }, (err, res) => {
            if (err) {
                toast.error('Download failed!');
                console.log(err);
            } else {
                if(res.data.webContentLink) {
                    window.open(res.data.webContentLink);
                }
            }
        });
    };

    render() {
        return (
            <React.Fragment>
                {this.props.attachmentIds ?
                    <Label.Group size='large'>
                        {this.props.attachmentIds.map((attachment, index) => <Label
                            as='a' key={index}
                            onClick={() => this.downloadFile(attachment.id)}
                        >
                            <Icon name='attach' />
                            {attachment.name}
                        </Label>)}
                    </Label.Group> : <span/>
                }
            </React.Fragment>
        )
    }
}

//Type-checking
OrderAttachments.propTypes = {
    gDriveFolderId: PropTypes.string,
    accessToken: PropTypes.string,
    attachmentIds: PropTypes.array,
    orderId: PropTypes.string,
};

export default OrderAttachments;