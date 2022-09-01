//Core imports
import React, {Component} from 'react';

//Component imports
import SearchBar from "./SearchBar";

//Semantic-UI
import {Image, Responsive, Menu} from 'semantic-ui-react';

//Other

//Component
export default class NavBar extends Component {
    state = {menuOpen: false};

    render() {
        return (
            <Menu id='navBar' borderless size='large' fluid>
                {/*Left Side*/}
                <Menu.Item>
                    {/*Only show logo on mobile*/}
                    <Responsive minWidth={899}>
                        <Image size='mini' src='intelline_logo.jpeg'/>
                    </Responsive>

                    {/*Desktop*/}
                    <Responsive maxWidth={900}>
                        <Image size='mini' src='intelline_logo.jpeg' onClick={() => {
                            if (this.state.menuOpen) {
                                document.getElementById('sideNav').style.left = '-255px';
                            } else {
                                document.getElementById('sideNav').style.left = '-5px';
                            }
                            this.setState({menuOpen: !this.state.menuOpen});
                        }}/>
                    </Responsive>
                </Menu.Item>
                <Menu.Item>
                    <Responsive minWidth={900}>
                        <SearchBar history={this.props.history}/>
                    </Responsive>
                </Menu.Item>

                {/*Right Side*/}
                <Menu.Menu position='right'>
                    <Menu.Item icon='mail' href={'https://mail.google.com/mail/u/1/'} target="_blank"/>
                    <Menu.Item icon='slack hash' href={'https://intellineteam.slack.com'} target="_blank"/>
                    <Menu.Item
                        icon={'calendar alternate outline'}
                        href={'https://calendar.google.com/calendar/b/1/r'}
                        target="_blank"
                    />
                    <Menu.Item icon='lock' href='/' onClick={() => {Meteor.logout();}}/>
                </Menu.Menu>
            </Menu>
        )
    }
}

//Type-checking
NavBar.propTypes = {};