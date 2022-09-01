//Core imports
import React, {Component} from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

//Component imports
import {Bar} from 'react-chartjs-2';

//Semantic-UI

//Other

//Component
class AllocationVSExpensesBarChart extends Component {
    render() {
        return (
            <Bar data={this.props.data} options={this.props.options} height={200}/>
        )
    }
}

//Type-checking
AllocationVSExpensesBarChart.propTypes = {
    categoriesModified: PropTypes.array,
    data: PropTypes.object,
    options: PropTypes.object
};

//Container to push data to component
const AllocationVSExpensesBarChartContainer = withTracker(props => {
    let barLabels = [];
    let allocations = [];
    let expenses = [];

    //just use the immediate children for now
    if(props.categoriesModified) {
        props.categoriesModified[0].children.forEach(c => {
            barLabels.push(c.title);
            allocations.push(+(+c.allocation).toFixed(2));
            expenses.push(+(+c.expenses).toFixed(2));
        });
    }

    let data = {
        labels: barLabels,
        datasets: [
            {
                label: 'Allocation',
                data: allocations,
                backgroundColor: '#5adb1f'
            },
            {
                label: 'Expenses',
                data: expenses,
                backgroundColor: '#de1212'
            },
        ]
    };

    let options = {
        maintainAspectRatio: false,
        legend: {
            display: false
        }
    };

    return {
        data,
        options
    }
})(AllocationVSExpensesBarChart);

export default AllocationVSExpensesBarChartContainer;