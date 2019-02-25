import React, {
    Component
} from 'react';
import ArcChart from '../ArcChart';
import CylinderChart from '../CylinderChart';
import './style.scss';

class Gauge extends Component {
    constructor() {
        super();

        this.state = {
            curValue: 250
        }
    }

    componentDidMount() {
        // setInterval(() => {
        //     const curValue = Math.random() * 250;
        //     this.setState({
        //         curValue
        //     })
        // }, 3000);
    }

    render() {
        const bands = [
            {
                min: 0,
                max: 120,
                color: '#de4b25'
            },
            {
                min: 120,
                max: 180,
                color: '#f0bf2c'
            },
            {
                min: 180,
                max: 250,
                color: '#8abe6e'
            },
        ]
        const arcChart = <ArcChart
            values={bands}
            angles={[-60, 60]}
            majorTicks={5}
            colors={['#de4b25', '#f0bf2c', '#8abe6e']}
            height={250}
            width={500}
            curValue={this.state.curValue} />;

        const cylinderChart = <CylinderChart
            values={bands}
            majorTicks={5}
            height={220}
            width={300}
            barWidth={20}
            hasSecondTicks={true}
            curValue={this.state.curValue} />;

        const cylinderChart2 = <CylinderChart
        values={bands}
            majorTicks={5}
            height={220}
            width={300}
            barWidth={20}
            isTriangleShape={false}
            hasSecondTicks={false}
            curValue={this.state.curValue} />;

        const cylinderChart3 = <CylinderChart
        values={bands}
            majorTicks={5}
            height={220}
            width={300}
            barWidth={22}
            isTriangleShape={true}
            hasSecondTicks={false}
            curValue={this.state.curValue} />;

        return (
            <div className="gauge-main" >
                {cylinderChart}
                {cylinderChart2}
                {cylinderChart3}
                {arcChart}
            </div>
        );
    }
}

export default Gauge;