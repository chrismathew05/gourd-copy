//Core imports
import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports

//Semantic-UI

//Other
import {Pie} from 'react-chartjs-2';

//Component

class BudgetAllocationChart extends Component {
    render() {
        return (
            <Pie data={this.props.data} options={this.props.options}/>
        )
    }
}

//Type-checking
BudgetAllocationChart.propTypes = {
    categoriesModified: PropTypes.array,
    data: PropTypes.object,
    options: PropTypes.object
};

const BudgetAllocationChartContainer = withTracker(props => {
    let pieLabels = [];
    let pieData = [];

    //just use the immediate children for now
    if(props.categoriesModified) {
        props.categoriesModified[0].children.forEach(c => {
            pieLabels.push(c.title);
            pieData.push(+(+c.allocation).toFixed(2));
        });
    }

    let data = {
        labels: pieLabels,
        datasets: [{
            data: pieData,
            backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#ff8c66', '#6666ff', '#ff66d9', '#66ff66', '#ff6666', '#ff66b3', '#ffd966', '#ffff66', '#66ffb3'],
        }]
    };

    let options = {
        legend: {
            position: 'left'
        }
    };

    return {
        data,
        options
    }
})(BudgetAllocationChart);

export default BudgetAllocationChartContainer;