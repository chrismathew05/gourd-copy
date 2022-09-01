//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports
import {Budget} from "../../api/PurchasingAPI/budget";

//Semantic-UI
import {Button, Icon} from "semantic-ui-react";

//Other
// import FileExplorerTheme from 'react-sortable-tree-theme-minimal';
import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import {toast} from "react-toastify";

//Component
const searchTree = (node, matchingTitle) => {
    if(node.title === matchingTitle){
        return node;
    } else if (node.children != null){
        let result = null;
        for(let i = 0; result == null && i < node.children.length; i++){
            result = searchTree(node.children[i], matchingTitle);
        }
        return result;
    }
    return null;
};

class BudgetTree extends Component {
    state = {
        treeViewData: [], //data that represents just how the tree is displayed
        togglingVisibility: false
    };

    static getDerivedStateFromProps(props, state) {
        if(!state.togglingVisibility) {
            return {
                treeViewData: props.categories
            };
        } else {
            return {
                togglingVisibility: false
            }
        }
    }

    convertToCAD = (currency, amount) => {
        if(currency !== 'CAD') {
            return amount*this.props.fx;
        }
        return amount;
    };

    handleTreeChange = moveData => {
        if(moveData.nextParentNode === null || moveData.node.title === 'Buffer') {
            toast.error("Woah, don't move that.");
            return;
        }

        //convert to CAD to do comparison
        let allocationUsed = moveData.nextParentNode.children.reduce(
            (accumulator, currentValue) => {
                if(currentValue.title !== 'Buffer' && currentValue.title !== moveData.node.title) {
                    return accumulator + this.convertToCAD(currentValue.currency, +currentValue.allocation);
                }
                return accumulator;
            }, 0
        );

        allocationUsed += this.convertToCAD(moveData.node.currency, +moveData.node.allocation);
        let allocationAvailable = this.convertToCAD(moveData.nextParentNode.currency, +moveData.nextParentNode.allocation);

        if(allocationUsed > allocationAvailable) {
            toast.error("Illegal move: " + moveData.nextParentNode.title + "'s allocation ($" + moveData.nextParentNode.allocation + moveData.nextParentNode.currency + ") " +
                "is not large enough to support the node you are trying to move!");
        } else {
            Meteor.call('Budget.updateCategories', this.props.budgetId, moveData.treeData, this.props.fx, this.props.viewCurrency);
        }
    };

    removeCategory = catName => {
        Meteor.call('Budget.removeCategory', this.props.budgetId, catName, this.props.fx, this.props.viewCurrency, err => {
            if(err) toast.error('Something went wrong! Budget Category not removed!');
            else toast.success(catName + ' successfully removed!');
        });
    };

    passDataToParent = expendituresDetails => this.props.selectedCategoryDetails(expendituresDetails);

    render() {
        return (
            <div style={{ height: 400}}>
                <SortableTree
                    treeData={this.state.treeViewData}
                    onChange={categories => {}}
                    // theme={FileExplorerTheme}
                    onVisibilityToggle={toggleData => this.setState({treeViewData: toggleData.treeData, togglingVisibility: true})}
                    maxDepth={4}
                    scaffoldBlockPxWidth={30}
                    generateNodeProps={
                        rowInfo => {
                            let c = searchTree(this.props.categoriesModified[0], rowInfo.node.title);

                            return ({
                                buttons: [
                                    <Button onClick={() => this.passDataToParent(c.expendituresDetails)} basic color='green' size={'mini'}>
                                        <Icon name='chart pie'/>
                                        {parseFloat(c.allocation).toFixed(2) + ' ' + this.props.viewCurrency}
                                    </Button>,
                                    <Button basic color='red' size={'mini'} onClick={() => this.passDataToParent(c.expendituresDetails)}
                                        as={'a'} href={'#categoryDetails'}
                                    >
                                        <Icon name='dollar'/>
                                        {parseFloat(c.expenses).toFixed(2) + ' ' + this.props.viewCurrency}
                                    </Button>,
                                    <Button onClick={() => this.passDataToParent(c.expendituresDetails)} basic color='blue' size={'mini'}>
                                        <Icon name='balance'/>
                                        {parseFloat(c.remaining).toFixed(2) + ' ' + this.props.viewCurrency}
                                    </Button>,
                                    <div>
                                        {rowInfo.treeIndex === 0 || rowInfo.node.title === 'Buffer' ?
                                            <span/> :
                                            <Button icon='trash' color={'red'} size={'mini'} onClick={() => this.removeCategory(rowInfo.node.title)}/>
                                        }
                                    </div>,
                                ],
                            });
                        }
                    }
                    onMoveNode={moveData => this.handleTreeChange(moveData)}
                />
            </div>
        )
    }
}

//Type-checking
BudgetTree.propTypes = {
    budgetId: PropTypes.string,
    categories: PropTypes.array,
    expenditures: PropTypes.array,
    categoriesModified: PropTypes.array,
    viewCurrency: PropTypes.string,
    fx: PropTypes.number
};

export default BudgetTree;