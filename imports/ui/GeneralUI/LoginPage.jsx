//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';

//Semantic-UI
import {Header, Image, Button} from 'semantic-ui-react';

//Other
const divStyle = {
    padding: "200px 0",
    textAlign: "center"
};

//Component
export default class LoginPage extends Component {
    render() {
        return (
            <div style={divStyle}>
                <Header as='h2' icon textAlign='center'>
                    <Image src='intelline_logo.jpeg' size={'massive'} />
                    <br/>
                    <br/>
                    <Header.Content>
                        Welcome to Intelline
                    </Header.Content>
                    <Header.Subheader>
                        Advance Cryogenics. Enable the Future.
                    </Header.Subheader>
                    <br/>
                    <Button
                        color="green"
                        onClick={() => {
                            Meteor.loginWithGoogle({
                                requestPermissions: [
                                    'https://www.googleapis.com/auth/calendar',
                                    'https://www.googleapis.com/auth/drive'
                                ]
                            }, err => {if(err) {console.log(err);}});
                        }}
                    >Login with Google</Button>
                </Header>
            </div>
        )
    }
}