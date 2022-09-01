//Core imports
import React, {Component} from 'react';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI
import {Icon, Popup} from "semantic-ui-react";

//Other

//Component
class IconIndicators extends Component {

    render() {
        return (
            <div>
                {this.props.dateRecd ?
                    <Popup
                        trigger={<Icon name={'dolly flatbed'}/>}
                        content='Received'
                        position='bottom center'
                        size='tiny'
                        inverted
                    /> : <span/>
                }

                {this.props.budgetId && this.props.budgetId !== '' ?
                    <Popup
                        trigger={<Icon name={'chart pie'}/>}
                        content='Budgeted'
                        position='bottom center'
                        size='tiny'
                        inverted
                    /> : <span/>
                }

                {this.props.datePaid ?
                    <Popup
                        trigger={<Icon name={'payment'}/>}
                        content='Paid'
                        position='bottom center'
                        size='tiny'
                        inverted
                    /> : <span/>
                }

                {this.props.costObjId && this.props.costObjId !== '' ?
                    <Popup
                        trigger={<Icon name={'tag'}/>}
                        content='Cost Object Assigned'
                        position='bottom center'
                        size='tiny'
                        inverted
                    /> : <span/>
                }
            </div>
        )
    }
}

//Type-checking
IconIndicators.propTypes = {
    budgetId: PropTypes.string,
    datePaid: PropTypes.instanceOf(Date),
    dateRecd: PropTypes.instanceOf(Date),
    costObjId: PropTypes.string
};

export default IconIndicators;