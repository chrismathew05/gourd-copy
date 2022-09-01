//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Button, Input, Popup} from "semantic-ui-react";

//Other
import {toast} from "react-toastify";
import {HTTP} from "meteor/http";

//Component
let toastIds = [];
let complete = [];
const notify = (filesLength, index) => {
    toastIds[index] = toast("Uploading file " + (index+1) + "/" + filesLength + " to GDrive. Please wait...", { autoClose: false });
    complete[index] = false;
};

const update = (filesLength, index, orderId, gDriveFolderId) => {
    toast.update(toastIds[index], {
        render: 'File upload ' + (index+1) + "/" + filesLength + ' successful!',
        type: toast.TYPE.SUCCESS,
        autoClose: 5000
    });
    complete[index] = true;
    let ready = complete.reduce((acc, current) => acc && current);
    if(ready) {
        Meteor.call('Order.updateAttachmentIds', orderId, gDriveFolderId);
    }
};

const updateError = index => toast.update(toastIds[index], {
    render: 'Something went wrong! Probably authorization failure (expired refresh token): Please retry login!',
    type: toast.TYPE.ERROR,
    autoClose: 5000
});

class UploadOrderFiles extends Component {

    uploadFiles = () => {
        const files = document.getElementById('uploadOrderFile').files;
        const filesLength = files.length;
        complete = new Array(filesLength);
        for (let i = 0; i < filesLength; i++) {
            let file = files[i];
            this.fileUpload(filesLength, i, file);
        }
    };

    //performing http request on client to avoid any large file transfer to server
    fileUpload = (filesLength, index, file) => {
        //POST metadata (parent anchor) to Drive endpoint
        notify(filesLength, index);
        const postURL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
        HTTP.call('POST', postURL, {
            data: {parents: [this.props.gDriveFolderId], name: this.props.poNum + '-' + file.name},
            headers: {
                'Authorization': 'Bearer ' + this.props.accessToken,
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }, (err, res) => {
            if(!err) {
                //upload content to anchor with a PUT call
                const putURL = res.headers.location;

                HTTP.call('PUT', putURL, {
                    content: file,
                    headers: {
                        'Authorization': 'Bearer ' + this.props.accessToken
                    }
                }, (err) => {
                    if (!err) {
                        update(filesLength, index, this.props.orderId, this.props.gDriveFolderId);
                    } else {
                        updateError(index);
                    }
                });
            } else {
                updateError(index);
            }
        });
    };

    render() {
        return (
            <span>
                <Popup
                    trigger={<Button circular icon='google drive' color={'google plus'} onClick={() => document.getElementById('uploadOrderFile').click()}/>}
                    content='Upload Files'
                    position='bottom center'
                    inverted
                />
                <Input
                    id={'uploadOrderFile'}
                    onChange={this.uploadFiles}
                    type={'file'} style={{display:'none'}} multiple
                />
            </span>
        )
    }
}

//Type-checking
UploadOrderFiles.propTypes = {
    ready: PropTypes.bool,
    supplier: PropTypes.string,
    gDriveFolderId: PropTypes.string,
    accessToken: PropTypes.string,
    orderId: PropTypes.string
};


export default UploadOrderFiles;