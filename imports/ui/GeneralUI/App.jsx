//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

//Component imports
import LoginPage from "./LoginPage";
import {renderRoutes} from "../routes";

//Semantic-UI
import {Dimmer, Loader} from 'semantic-ui-react';

//Other

class App extends Component {
    render() {
        return (
            <div>
                {this.props.userId ?
                    <div>
                        {this.props.user ?
                            <div>
                                <div>
                                    {renderRoutes()}
                                </div>
                            </div> : <Dimmer active><Loader size='massive'>Preparing Intelline</Loader></Dimmer>
                        }
                    </div> : <LoginPage/>
                }
            </div>
        )
    }
}

App.propTypes = {};
const AppContainer = withTracker(() => {
    let user = Meteor.users.find().fetch();
    user = user[0];

    let userId = Meteor.userId();

    return {
        user,
        userId
    };
})(App);

export default AppContainer;