import React, {
    Component
} from 'react';
import * as d3 from 'd3'
import './style.scss';

class CylinderChart extends Component {

    constructor(props) {
        super(props)

        this.createArcChart = this.createArcChart.bind(this)
    }

    componentDidMount() {
        this.createArcChart();
    }

    componentDidUpdate() {
        this.createArcChart();
    }

    createArcChart() {
        const {
            select: d3Select,
            range: d3Range,
            scaleLinear: d3ScaleLinear,
            line: d3Line,
            curveLinear: d3CurveLinear,
            easeSin: d3EaseSin,
        } = d3

        const {
            values,
            curValue,
            height,
            width,
            majorTicks,
            colors,
            barWidth
        } = this.props;

        const [minValue, maxValue] = values;
        const svgData = d3Select(this.element).data([null]);
        const scaleValue = d3ScaleLinear()
            .range([0, 1])
            .domain([maxValue, minValue]);
        const DURATION = 1200;
        const marginRight = width / 2 - barWidth;
        const ticks = scaleValue.ticks(majorTicks);
        const ratio = scaleValue(curValue);

        //#region bar

        const colorRange = d3Range(colors.length).map(() => 1 / colors.length);
        const barData = svgData.select('g.bar').selectAll('rect').data(colorRange);
        barData.exit().remove();
        barData.enter()
            .append('rect')
            .merge(barData)
            .attr('height', height / colors.length)
            .attr('width', barWidth)
            .attr('y', (_, i) => height / colors.length * i)
            .attr('x', marginRight)
            .attr('fill', (_, i) => colors[i])

        //#endregion

        //#region ticks

        const extendedTicksArr = [];
        for (let i = 0; i < ticks.length; i++) {
            if (i === ticks.length - 1) {
                extendedTicksArr.push(ticks[i]);
                break;
            }
            const val = ticks[i];
            const nextVal = ticks[i + 1];
            extendedTicksArr.push(val);
            const margin = (nextVal - val) / 4;
            let newVal = val + margin;

            for (let j = 0; j < 3; j++) {
                extendedTicksArr.push({
                    val: newVal,
                    size: j % 2 === 0 ? 'S' : 'M'
                });
                newVal += margin;
            }
        }

        // Left side ticks
        const leftTicksData = svgData.select('g.ticks_container').selectAll('line').data(extendedTicksArr);
        leftTicksData.exit().remove();
        leftTicksData.enter()
            .append('line')
            .merge(leftTicksData)
            .attr('class', (d) => {
                let className = 'tick';
                if (typeof d === "object") {
                    if (d.size === "S") {
                        className += ' smalltick';
                    } else {
                        className += ' mediumtick';
                    }
                }
                return className;
            })
            .attr('stroke', 'black')
            .attr('opacity', 0.6)
            .attr('x2', (d) => {
                if (typeof d === "object") {
                    if (d.size === "S") {
                        return 10;
                    } else {
                        return 16;
                    }
                }
                return 24;
            })
            .attr('transform', (d) => {
                const val = typeof d === "number" ? d : d.val;
                const ratio = scaleValue(val);
                return `translate(${marginRight - 5},${ratio * height - 1}) rotate(180)`;
            });


        // Left vertical ticks line
        const verticalLeftLine = svgData.select('g.ticks_container').selectAll('line.vertical').data([null]);
        verticalLeftLine.exit().remove();
        verticalLeftLine.enter()
            .append('line')
            .merge(verticalLeftLine)
            .attr('class', 'vertical')
            .attr('stroke', 'black')
            .attr('opacity', 0.6)
            .attr('y1', -1)
            .attr('y2', height)
            .attr('transform', (d) => {
                return `translate(${marginRight - 5},0)`;
            });

        //#endregion

        //#region Pointer

        const pointerWidth = barWidth - 3;
        const pointerColor = '#5eb2d6';
        const pointerLineData = [
            [0, 0],
            [pointerWidth, 8],
            [pointerWidth, -8],
        ];
        const pointerLine = d3Line().curve(d3CurveLinear);
        const pointerData = svgData.select('g.pointer').selectAll('path').data([pointerLineData]);
        pointerData.exit().remove();
        pointerData.enter()
            .append('path')
            .attr('d', pointerLine)
            .attr('fill', pointerColor)
            .attr('transform', `translate(${barWidth + marginRight},${height})`)
            .merge(pointerData)
            .transition()
            .duration(DURATION)
            .ease(d3EaseSin)
            .attr('transform', `translate(${barWidth + marginRight},${ratio * height})`);
        //#endregion

        //#region Value text
        const valueTextEnter = svgData.select('text.value');
        valueTextEnter.exit().remove();
        valueTextEnter.enter()
            .append('text')
            .merge(valueTextEnter)
            .attr('font-size', 30)
            .attr('fill', '#1a88b7')
            .attr('font-weight', 400)
            .attr('transform', `translate(${(barWidth / 2) + marginRight},${height + 40})`)
            .text(Math.ceil(curValue));
        //#endregion
    }

    render() {
        const { width, height } = this.props;

        return (
            <svg viewBox="0 -40 300 300" width={width} height={height + 80} className='cylinder_gauge' ref={element => this.element = element} >
                <g className="ticks_container" />
                <g className="pointer" />
                <g className="bar" />
                <text className="value" textAnchor={'middle'} />
            </svg>
        );
    };
}

export default CylinderChart;