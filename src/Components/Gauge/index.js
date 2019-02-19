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
            curValue: 75
        }
    }

    componentDidMount() {
        setInterval(() => {
            const curValue = Math.random() * 250;
            this.setState({
                curValue
            })
        }, 3000);
    }

    render() {

        const arcChart = <ArcChart
            size={[500, 500]}
            values={[0, 250]}
            angles={[-90, 90]}
            majorTicks={5}
            colors={['#de4b25', '#f0bf2c', '#8abe6e']}
            height={250}
            width={500}
            curValue={this.state.curValue} />;

        const cylinderChart = <CylinderChart
            size={[500, 500]}
            values={[0, 250]}
            majorTicks={5}
            colors={['#8abe6e', '#f0bf2c', '#de4b25']}
            height={200}
            width={300}
            barWidth={20}
            hasSecondTicks={true}
            curValue={this.state.curValue} />;

        const cylinderChart2 = <CylinderChart
            size={[500, 500]}
            values={[0, 250]}
            majorTicks={5}
            colors={['#8abe6e', '#f0bf2c', '#de4b25']}
            height={200}
            width={300}
            barWidth={20}
            isTriangleShape={false}
            hasSecondTicks={false}
            curValue={this.state.curValue} />;

        const cylinderChart3 = <CylinderChart
            size={[500, 500]}
            values={[0, 250]}
            majorTicks={5}
            colors={['#8abe6e', '#f0bf2c', '#de4b25']}
            height={200}
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