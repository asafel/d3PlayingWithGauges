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
            barWidth,
            hasSecondTicks,
            isTriangleShape
        } = this.props;

        const [minValue, maxValue] = values;
        const svgData = d3Select(this.element).data([null]);
        const scaleValue = d3ScaleLinear()
            .range([0, 1])
            .domain([maxValue, minValue]);
        const DURATION = 1200;
        const ticksWidth = 16;
        const marginRight = width / 2 - barWidth;
        const ticks = scaleValue.ticks(majorTicks);
        const ratio = scaleValue(curValue);

        //#region bar

        const colorRange = d3Range(colors.length).map(() => 1 / colors.length);
        if (!isTriangleShape) {
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
        } else {
            const triangleBarData = svgData.select('g.bar').selectAll('path').data(colorRange);
            triangleBarData.exit().remove();
            triangleBarData.enter()
                .append('path')
                .merge(triangleBarData)
                .attr('d', `M0,0L0,${height}L${barWidth},0`)
                .attr('fill', 'url(#triangle_bar)')
                .attr('transform', `translate(${marginRight},${0})`)
        }

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
                        return ticksWidth * 0.375;
                    } else {
                        return ticksWidth * 0.625;
                    }
                }
                return ticksWidth;
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

        if (hasSecondTicks) {
            // Right side ticks
            const rightTicksData = svgData.select('g.ticks_container').selectAll('line.right').data(extendedTicksArr);
            rightTicksData.exit().remove();
            rightTicksData.enter()
                .append('line')
                .merge(rightTicksData)
                .attr('class', (d) => {
                    let className = 'right tick';
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
                            return ticksWidth * 0.375;
                        } else {
                            return ticksWidth * 0.625;
                        }
                    }
                    return ticksWidth;
                })
                .attr('transform', (d) => {
                    const val = typeof d === "number" ? d : d.val;
                    const ratio = scaleValue(val);
                    return `translate(${barWidth + marginRight + 4},${ratio * height - 1})`;
                });


            // Right vertical ticks line
            const verticalRightLine = svgData.select('g.ticks_container').selectAll('line.right.vertical').data([null]);
            verticalRightLine.exit().remove();
            verticalRightLine.enter()
                .append('line')
                .merge(verticalRightLine)
                .attr('class', 'right vertical')
                .attr('stroke', 'black')
                .attr('opacity', 0.6)
                .attr('y1', -1)
                .attr('y2', height)
                .attr('transform', (d) => {
                    return `translate(${barWidth + marginRight + 4},0)`;
                });
        }

        //#endregion

        //#region Labels
        const labelsData = svgData.select('g.labels').selectAll('text').data(ticks);
        labelsData.exit().remove();
        labelsData.enter()
            .append('text')
            .merge(labelsData)
            .attr('class', 'gauge_label')
            .attr('dominant-baseline', 'central')
            .attr('font-size', 12)
            .attr('text-anchor', 'middle')
            .text(d => d)
            .attr('transform', (d) => {
                const ratio = scaleValue(d);
                return `translate(${marginRight - (ticksWidth * 2) - 8},${ratio * height - 2})`;
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
            .attr('transform', `translate(${barWidth + marginRight + 5},${height})`)
            .merge(pointerData)
            .transition()
            .duration(DURATION)
            .ease(d3EaseSin)
            .attr('transform', `translate(${barWidth + marginRight + 5},${ratio * height})`);
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
        const { width, height, isTriangleShape } = this.props;

        const defs = !isTriangleShape ? null :
            <defs>
                <linearGradient gradientTransform="rotate(90)" id="triangle_bar" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#8abe6e', stopOpacity: 1 }} />
                    <stop offset="33%" style={{ stopColor: '#8abe6e', stopOpacity: 1 }} />
                    <stop offset="33%" style={{ stopColor: '#f0bf2c', stopOpacity: 1 }} />
                    <stop offset="67%" style={{ stopColor: '#f0bf2c', stopOpacity: 1 }} />
                    <stop offset="67%" style={{ stopColor: '#de4b25', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#de4b25', stopOpacity: 1 }} />
                </linearGradient>
            </defs>


        return (
            <svg viewBox="0 -40 300 300" width={width} height={height + 80} className='cylinder_gauge' ref={element => this.element = element} >
                {defs}
                <g className="ticks_container" />
                <g className="pointer" />
                <g className="labels" />
                <g className="bar" />
                <text className="value" textAnchor={'middle'} />
            </svg>
        );
    };
}

export default CylinderChart;