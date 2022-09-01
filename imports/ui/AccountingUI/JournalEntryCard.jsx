//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

//Component imports

//Semantic-UI
import {Segment, Grid, Modal, List} from "semantic-ui-react";

//Other
import moment from "moment";

//Component
class JournalEntryCard extends Component {
    state = {
        supportLinksModalOpen: false
    };

    getAccountName = accountId => this.props.accountsList.find(acct => acct._id === accountId).name;

    render() {
        return (
            <React.Fragment>
                <Modal open={this.state.supportLinksModalOpen} onClose={() => this.setState({supportLinksModalOpen: false})}>
                    <Modal.Header>Support Links</Modal.Header>
                    <Modal.Content>
                        <List>
                            {this.props.supportLinks.map((supportLink, index) => <List.Item key={index}>
                                {supportLink.substring(0,1) === '/' ?
                                    <Link to={supportLink}>{supportLink}</Link> : <a href={supportLink} target={'_blank'}>{supportLink}</a>
                                }
                            </List.Item>)}
                        </List>
                    </Modal.Content>
                </Modal>
                <Segment onClick={() => this.setState({supportLinksModalOpen: true})} style={{cursor:'pointer'}}>
                    <Grid>
                        {/*Debits*/}
                        <Grid.Row>
                            <Grid.Column width={4}>
                                {moment(this.props.txnDate).format('MMM DD/YY')}
                            </Grid.Column>
                            <Grid.Column width={7}>
                                <Grid>
                                    {this.props.debits.map(d => <Grid.Row key={d._id}>
                                            DR {this.getAccountName(d.accountId)}
                                        </Grid.Row>
                                    )}
                                </Grid>
                            </Grid.Column>
                            <Grid.Column width={5} textAlign={'right'}>
                                <Grid>
                                    {this.props.debits.map(d => <Grid.Row key={d._id}>{(+d.amount).toFixed(2)}{d.currency}</Grid.Row>)}
                                </Grid>
                            </Grid.Column>
                        </Grid.Row>

                        {/*Credits*/}
                        <Grid.Row>
                            <Grid.Column width={5}>

                            </Grid.Column>
                            <Grid.Column width={8}>
                                <Grid>
                                    {this.props.credits.map(c => <Grid.Row key={c._id}>CR {this.getAccountName(c.accountId)}</Grid.Row>)}
                                </Grid>
                            </Grid.Column>
                            <Grid.Column width={3} textAlign={'right'}>
                                <Grid>
                                    {this.props.credits.map(c => <Grid.Row key={c._id}>{(-c.amount).toFixed(2)}{c.currency}</Grid.Row>)}
                                </Grid>
                            </Grid.Column>
                        </Grid.Row>
                        {this.props.description && this.props.description !== "" ?
                            <Grid.Row>
                                <Grid.Column>
                                    Description: <i>{this.props.description}</i>
                                </Grid.Column>
                            </Grid.Row> : <span/>
                        }
                    </Grid>
                </Segment>
            </React.Fragment>
        )
    }
}

//Type-checking
JournalEntryCard.propTypes = {
    txnDate: PropTypes.instanceOf(Date),
    debits: PropTypes.array,
    credits: PropTypes.array,
    accountsList: PropTypes.array,
    description: PropTypes.string,
    supportLinks: PropTypes.array
};


export default JournalEntryCard;