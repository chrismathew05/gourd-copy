//Core imports
import React, {Component} from 'react';

//Component imports
import {Progress} from "semantic-ui-react";

//Semantic-UI

//Other
import moment from "moment";

//Component
const startDate = '2019-12-01';
const endDate = '2020-03-15';
const daysAvailable = moment(endDate).diff(moment(startDate), 'days');
export default class Countdown extends Component {
    state = {
        duration: 'Calculating Countdown...'
    };

    //lifecycle hooks
    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    };

    componentWillUnmount() {
        clearInterval(this.interval);
    };

    calcPercentageCompletion = () => {
        let elapsedTime = moment().diff(moment(startDate), 'days');
        return Math.round(100*elapsedTime/daysAvailable);
    };

    tick = () => {
        let sUntil = moment(endDate).diff(moment(), 'seconds');
        const sInM = 60;
        const sInH = 3600;
        const sInD = 86400;

        let d = Math.floor(sUntil/sInD);
        let h = Math.floor((sUntil % sInD)/sInH);
        let m = Math.floor((sUntil % sInH)/sInM);
        let s = sUntil % sInM;

        this.setState({
            duration: d+"d " + h+"h " + m+"m " + s+"s" + " until Demo Day"
        });
    };

    render() {
        return (
            <Progress percent={this.calcPercentageCompletion()} color='blue' size='small' active>
                {this.state.duration}
            </Progress>
        )
    }
}