//Core imports
import React, {Component} from 'react';

//Component imports

//Semantic-UI
import {Dropdown} from "semantic-ui-react";

//Other

//Component
const options = [
    { key: 'suppliers', text: 'context: suppliers', value: 'context: suppliers' },
    { key: 'orders', text: 'context: orders', value: 'context: orders' },
    { key: 'expenditures', text: 'context: expenditures', value: 'context: expenditures' },
];
class SearchBar extends Component {
    state = { options, currentValues: [], query: '' };

    handleAddition = (e, { value }) => this.setState({options: [{ text: value, value }, ...this.state.options]});

    handleChange = (e, { value }) => {
        Session.set('searchLimit', 15);
        let query = this.state.query;

        if(value.length > this.state.currentValues.length) {
            //work with the last element of value
            let lastElement = value[value.length - 1];

            if(lastElement.includes('context: ')) {
                //set search context
                Session.set('searchContext', lastElement.split(':')[1].replace(/\s/g, ''));
            } else {
                //build query url
                query += '&' + lastElement.replace('>', '_gt_').replace('<', '_lt_');
            }
        } else {
            let lastIndex = query.lastIndexOf('&');
            query = query.substring(0, lastIndex);
        }

        let searchContext = Session.get('searchContext');
        if(searchContext === 'orders') {
            this.props.history.push('/orders/list/q' + query);
        }

        this.setState({ currentValues: value, query });
    };

    render() {
        return (
            <Dropdown
                id={'searchInput'}
                options={this.state.options}
                placeholder='Search for: attribute </=/> value'
                search
                selection
                multiple
                allowAdditions
                value={this.state.currentValues}
                onAddItem={this.handleAddition}
                onChange={this.handleChange}
                additionLabel='Search for: '
                icon={null}
            />
        )
    }
}

//Type-checking

export default SearchBar;