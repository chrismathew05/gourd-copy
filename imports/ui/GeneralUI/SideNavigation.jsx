//Core imports
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

//Component imports

//Semantic-UI
import {Menu, Icon} from 'semantic-ui-react';

//Other

//Component
export default class SideNavigation extends Component {
    state = {
        activeItem: ''
    };

    componentDidMount() {
        let url = window.location.href;
        let activeItem = 'Dashboard';
        if(url.includes('dashboard')) {
            activeItem = 'Dashboard';
        } else if(url.includes('commitments')) {
            activeItem = 'Commitments';
        } else if(url.includes('budget')) {
            activeItem = 'Budget';
        } else if(url.includes('orders')) {
            activeItem = 'Orders';
            Session.setDefault('searchLimit', 12);
        } else if(url.includes('log')) {
            activeItem = 'Log List';
        } else if(url.includes('accounting')) {
            activeItem = 'Accounting';
        }

        this.setState({activeItem});
    }

    handleItemClick = (e, {name}) => this.setState({activeItem: name});

    //TODO: modify username
    render() {
        return (
            <Menu borderless inverted vertical id='sideNav'>
                <Menu.Item>
                    <Icon name='user'/>
                    <b>Chris Mathew</b>
                </Menu.Item>
                <Menu.Item name='Dashboard' active={this.state.activeItem === 'Dashboard'}
                           onClick={this.handleItemClick} as={Link} to='/' color={'teal'}>
                    <Icon name='rocket'/>
                    Dashboard
                </Menu.Item>
                <Menu.Item name='Commitments' active={this.state.activeItem === 'Commitments'}
                           onClick={this.handleItemClick} as={Link} to='/commitments' color={'teal'}>
                    <Icon name='tasks'/>
                    Commitments

                </Menu.Item>
                <Menu.Item name='Budget' active={this.state.activeItem === 'Budget'}
                           onClick={this.handleItemClick} as={Link} to='/budgets' color={'teal'}>
                    <Icon name='pie chart'/>
                    Budget
                </Menu.Item>
                {/*<Menu.Item name='Shopping Lists' active={this.state.activeItem === 'Shopping Lists'}*/}
                           {/*onClick={this.handleItemClick}  as={Link} to='/shoppinglists' color={'teal'}>*/}
                    {/*<Icon name='shop'/>*/}
                    {/*Shopping Lists*/}
                {/*</Menu.Item>*/}
                <Menu.Item name='Accounting' active={this.state.activeItem === 'Accounting'}
                           onClick={this.handleItemClick}  as={Link} to='/accounting' color={'teal'}>
                    <Icon name='calculator'/>
                    Accounting
                </Menu.Item>
                <Menu.Item name='Orders' active={this.state.activeItem === 'Orders'}
                           onClick={this.handleItemClick}  as={Link} to='/orders/list/q' color={'teal'}>
                    <Icon name='payment'/>
                    Orders
                </Menu.Item>
                <Menu.Item name='Log List' active={this.state.activeItem === 'Log List'}
                           onClick={this.handleItemClick}  as={Link} to='/log' color={'teal'}>
                    <Icon name='bug'/>
                    Log List
                </Menu.Item>
            </Menu>
        )
    }
}