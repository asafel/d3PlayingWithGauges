import React, {
    Component
} from 'react';
import ArcChart from '../ArcChart'
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
        return (
            <div className="gauge-main" >
                <ArcChart
                    size={[500, 500]}
                    values={[0, 250]}
                    angles={[-120, 120]}
                    height={250}
                    width={500}
                    curValue={this.state.curValue} />
            </div>
        );
    }
}

export default Gauge;