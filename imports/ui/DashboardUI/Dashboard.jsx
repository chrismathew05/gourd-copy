//Core imports
import React, {Component} from 'react';

//Component imports
import Countdown from "./Countdown";

//Semantic-UI
import {Header, Grid, Segment} from 'semantic-ui-react';

//Other

//Component
export default class Dashboard extends Component {
    state = {};

    method = () => {

    };

    render() {
        return (
            <div>
                <Countdown/>
                <Grid columns={2} stackable>
                    <Grid.Column>
                        <Segment>
                            Content
                        </Segment>
                    </Grid.Column>
                    <Grid.Column>
                        <Segment>Content</Segment>
                    </Grid.Column>
                    <Grid.Row columns={3}>
                        <Grid.Column>
                            <Segment>Content</Segment>
                        </Grid.Column>
                        <Grid.Column>
                            <Segment>Content</Segment>
                        </Grid.Column>
                        <Grid.Column>
                            <Segment>Content</Segment>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Column width={10}>
                        <Segment>Content</Segment>
                    </Grid.Column>
                    <Grid.Column width={6}>
                        <Segment>Content</Segment>
                    </Grid.Column>
                </Grid>
            </div>
        )
    }
}

//Type-checking
Dashboard.propTypes = {};

//Container to push data to component
// const DashboardContainer = withTracker(props => {
//     return {
//         user: Meteor.user(),
//     };
// })(Dashboard);
//
// export default DashboardContainer;