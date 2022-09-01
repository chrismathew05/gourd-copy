//Core imports
import React from 'react';
import PropTypes from 'prop-types';

//Component imports
import EditItemNotesModal from "./ItemDetailModals/EditItemNotesModal";

//Semantic-UI
import {Label, Segment} from "semantic-ui-react";

//Other

//Component
const EditItemNotes = props => (
    <Segment>
        <Label color='blue'>Notes</Label>
        <EditItemNotesModal
            expIdList={new Set([props.expId])}
            notes={props.notes}
            trigger={
                <p style={{cursor: 'pointer', whiteSpace: 'pre-wrap'}}>
                    <br/>
                    {props.notes}
                </p>
            }
        />
    </Segment>
);

//Type-checking
EditItemNotes.propTypes = {
    expId: PropTypes.string,
    notes: PropTypes.string
};

export default EditItemNotes;