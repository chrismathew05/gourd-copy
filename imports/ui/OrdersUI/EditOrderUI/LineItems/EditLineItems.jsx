//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports
import EditItemNotes from "./EditItemNotes";
import EditPaymentDetails from "./EditPaymentDetails";
import EditInternalMetricsContainer from "./EditInternalMetrics";
import EditCostBreakdown from "./EditCostBreakdown";

import IconIndicators from "./IconIndicators";
import EditPropertiesDropdown from "./EditPropertiesDropdown";

//Semantic-UI
import {Accordion, Checkbox, Grid, Button, Confirm} from "semantic-ui-react";
import {toast} from "react-toastify";
import {Meteor} from "meteor/meteor";

//Other

//Component
class EditLineItems extends Component {
    state = {
        activeIndex: -1,
        selectedItems: new Set(),
        confirmOpen: false
    };

    //controls Accordion expansion
    handleClick = (e, titleProps) => {
        const { index } = titleProps;
        const activeIndex = this.state.activeIndex;
        const newIndex = activeIndex === index ? -1 : index;

        if(this.state.selectedItems.size === 0) {
            this.setState({ activeIndex: newIndex });
        } else {
            this.setState({activeIndex: -1});
        }
    };

    //adds expenditure to selectedItems set if checked
    handleCheck = (e, checked, expId) => {
        let selectedItems = this.state.selectedItems;

        if(checked) {
            selectedItems.add(expId);
        } else {
            selectedItems.delete(expId)
        }

        this.setState({selectedItems});
    };

    toggleSelectAll = (e, checked) => {
        let selectedItems = this.state.selectedItems;

        if(checked) {
            let expIdList = this.props.expenditures.map(exp => exp._id);
            selectedItems = new Set(expIdList);
        } else {
            selectedItems.clear();
        }

        this.setState({selectedItems});
    };

    setEqualDates = () => {
        Meteor.call('Expenditure.updateDatePaid', [...this.state.selectedItems], this.props.dateOrdered, err => {
            if(err) {
                toast.error('Something went wrong! Date paid not updated.');
            }  else {
                toast.success('Date paid successfully updated!');
            }
        });

        Meteor.call('Expenditure.updateDateRecd', [...this.state.selectedItems], this.props.dateOrdered,
            err => {
                if(err) {
                    toast.error('Something went wrong! Date Received not updated!');
                } else {
                    toast.success('Date Received successfully updated!');
                }
            }
        );
    };

    deleteSelected = () => {
        Meteor.call('Expenditure.remove', [...this.state.selectedItems], err => {
            if(err) {
                toast.error('Something went wrong! Expenditures not removed.');
            }  else {
                toast.success('Expenditures successfully removed!');
            }
        });
        this.setState({confirmOpen: false});
        this.toggleSelectAll(null, false);
    };

    render() {
        return (
            <div>
                {this.state.selectedItems.size > 0 ?
                    <Grid columns={2}>
                        <Grid.Row>
                            <Grid.Column verticalAlign={'middle'}>
                                <Checkbox
                                    onChange={(e, {checked}) => this.toggleSelectAll(e, checked)} label={'Select/Unselect all?'}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <EditPropertiesDropdown
                                    selectedItems={this.state.selectedItems}
                                    dateOrdered={this.props.dateOrdered}
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid> : <span/>
                }
                <br/>
                <div style={{marginLeft: '2px', marginRight: '3px'}}>
                    <Accordion fluid styled>
                        {this.props.expenditures.map((exp, index) => {
                            return <span key={exp._id}>
                            <Accordion.Title active={this.state.activeIndex === index} index={index} onClick={this.handleClick}>
                                <Grid stackable>
                                    <Grid.Row>
                                        <Grid.Column width={3}>{exp.extNum}</Grid.Column>
                                        <Grid.Column width={7}>{exp.extDesc}</Grid.Column>
                                        <Grid.Column width={3} textAlign={'right'}>
                                            ${exp.unitPrice.toFixed(2)} x {exp.quantOrd} = ${(exp.unitPrice*exp.quantOrd).toFixed(2)}
                                        </Grid.Column>
                                        <Grid.Column width={2} textAlign={'right'}>
                                            <IconIndicators
                                                budgetId={exp.budgetId}
                                                datePaid={exp.datePaid}
                                                dateRecd={exp.dateRecd}
                                                costObjId={exp.costObjId}
                                            />
                                        </Grid.Column>
                                        <Grid.Column width={1} textAlign={'right'}>
                                            <Checkbox
                                                id={'check-' + index}
                                                checked={this.state.selectedItems.has(exp._id)}
                                                onChange={(e, {checked}) => this.handleCheck(e, checked, exp._id)}
                                            />
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Accordion.Title>
                            <Accordion.Content active={this.state.activeIndex === index}>
                                <Grid columns={3} stackable>
                                    <Grid.Row stretched>
                                        <Grid.Column>
                                            <EditItemNotes expId={exp._id} notes={exp.notes}/>
                                            <EditPaymentDetails
                                                expId={exp._id}
                                                budgetId={exp.budgetId}
                                                budgetCat={exp.budgetCat}
                                                datePaid={exp.datePaid}
                                                dateOrdered={this.props.dateOrdered}
                                            />
                                        </Grid.Column>

                                        <Grid.Column>
                                            <EditInternalMetricsContainer
                                                expId={exp._id}
                                                costObjId={exp.costObjId}
                                                quantRecInternal={exp.quantRecInternal}
                                                dateRecd={exp.dateRecd}
                                                dateOrdered={this.props.dateOrdered}
                                            />
                                        </Grid.Column>

                                        <Grid.Column>
                                            <EditCostBreakdown
                                                expId={exp._id}
                                                shipping={exp.shipping}
                                                extraCharges={exp.extraCharges}
                                                tax={exp.tax}
                                                hstEligible={exp.hstEligible}
                                                fxRate={exp.fxRate}
                                            />
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Accordion.Content>
                        </span>;
                        })}
                    </Accordion>
                </div>
                {this.state.selectedItems.size > 0 ?
                    <div>
                        <br/>
                        <Confirm open={this.state.confirmOpen} onCancel={() => this.setState({confirmOpen: false})} onConfirm={this.deleteSelected}/>
                        <Button basic color={'red'} onClick={() => this.setState({confirmOpen: true})}>Delete</Button>
                        <Button basic color={'blue'} onClick={this.setEqualDates}>Set Equal Dates</Button>
                    </div> : <span/>
                }
            </div>
        )
    }
}

//Type-checking
EditLineItems.propTypes = {
    expenditures: PropTypes.array,
    dateOrdered: PropTypes.instanceOf(Date)
};

export default EditLineItems;