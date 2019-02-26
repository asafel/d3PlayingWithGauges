import React, {
    Component
} from 'react';
import * as d3 from 'd3'

class CylinderChart extends Component {

    componentDidMount() {
        this.createCylinderChart();
    }

    componentDidUpdate() {
        this.createCylinderChart();
    }

    createCylinderChart() {
        const {
            select: d3Select,
            scaleLinear: d3ScaleLinear,
            line: d3Line,
            curveLinear: d3CurveLinear,
            easeSin: d3EaseSin,
        } = d3

        const {
            values,
            curValue,
            height,
            majorTicks,
            barWidth,
            hasSecondTicks,
            isTriangleShape
        } = this.props;

        const minValue = values[0].min || 0;
        const maxValue = values[values.length - 1].max || 100;
        const svgData = d3Select(this.element).data([null]);
        const scaleValue = d3ScaleLinear()
            .range([0, 1])
            .domain([maxValue, minValue]);
        const pointerWidth = 18;
        const duration = 1200;
        const ticksWidth = 16;
        const marginLeft = 0;
        const ticks = scaleValue.ticks(majorTicks);
        const ratio = scaleValue(curValue);

        //#region bar

        let barData = svgData.select('g.bar')
            .attr('clip-path', isTriangleShape ? 'polygon(0 0, 100% 0, 0 100%)' : null);

        barData = barData.selectAll('rect')
            .data(values);

        barData.exit().remove();
        barData.enter()
            .append('rect')
            .merge(barData)
            .attr('x', marginLeft)
            .attr('y', d => (scaleValue(d.max) * height) + pointerWidth)
            .attr('width', barWidth)
            .attr('height', d => (scaleValue(d.min) - scaleValue(d.max)) * height)
            .attr('fill', d => d.color)

        //#endregion

        //#region ticks

        const tickClassifier = (d) => {
            let className = 'tick';
            if (typeof d === "object") {
                if (d.size === "S") {
                    className += ' small';
                } else {
                    className += ' medium';
                }
            }
            return className;
        };
        const tickStrokeClassifier = (d) => {
            if (typeof d === "object") {
                if (d.size === "S") {
                    return ticksWidth * 0.375;
                } else {
                    return ticksWidth * 0.625;
                }
            }
            return ticksWidth;
        };
        const createBarTicks = (selection, leftSide = true) => {
            selection.exit().remove();
            selection.enter()
                .append('line')
                .merge(selection)
                .attr('class', tickClassifier)
                .attr('stroke', 'black')
                .attr('opacity', 0.6)
                .attr('x2', tickStrokeClassifier)
                .attr('transform', (d) => {
                    const val = typeof d === "number" ? d : d.val;
                    const ratio = scaleValue(val);
                    return `translate(${leftSide ? marginLeft - 5 : barWidth + marginLeft + 5},${ratio * height + pointerWidth}) ${leftSide ? ' rotate(180)' : ''}`;
                });
        };
        const createDomainTickLines = (selection, leftSide = true) => {
            selection.exit().remove();
            selection.enter()
                .append('line')
                .merge(selection)
                .attr('class', `${leftSide ? '' : 'right '}vertical`)
                .attr('stroke', 'black')
                .attr('opacity', 0.6)
                .attr('y1', pointerWidth)
                .attr('y2', height + pointerWidth)
                .attr('transform', _ => {
                    return `translate(${leftSide ? marginLeft - 5 : barWidth + marginLeft + 5},0)`;
                });
        };

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
        };

        const leftTicksData = svgData.select('g.ticks-container').selectAll('line').data(extendedTicksArr);
        createBarTicks(leftTicksData);
        const verticalLeftLine = svgData.select('g.ticks-container').selectAll('line.vertical').data([null]);
        createDomainTickLines(verticalLeftLine);

        if (hasSecondTicks) {
            const rightTicksData = svgData.select('g.ticks-container').selectAll('line.right').data(extendedTicksArr);
            const verticalRightLine = svgData.select('g.ticks-container').selectAll('line.right.vertical').data([null]);
            createBarTicks(rightTicksData, false);
            createDomainTickLines(verticalRightLine, false);
        };

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
            .attr('transform', d => {
                const ratio = scaleValue(d);
                return `translate(${marginLeft - (ticksWidth * 2) - 6},${ratio * height + pointerWidth})`;
            });

        //#endregion

        //#region Pointer

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
            .attr('transform', `translate(${barWidth + marginLeft + 5},${height + pointerWidth})`)
            .merge(pointerData)
            .transition()
            .duration(duration)
            .ease(d3EaseSin)
            .attr('transform', `translate(${barWidth + marginLeft + 5},${ratio * height + pointerWidth})`);
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
            .attr('transform', `translate(${(barWidth / 2) + marginLeft},${height + pointerWidth + 50})`)
            .text(Math.ceil(curValue));
        //#endregion
    }

    render() {
        const { width, height } = this.props;

        return (
            <svg viewBox="0 0 350 350" width={width} height={height} className='cylinder_gauge' ref={element => this.element = element} >
                <g className="ticks-container" />
                <g className="pointer" />
                <g className="labels" />
                <g className="bar" />
                <text className="value" textAnchor={'middle'} />
            </svg>
        );
    };
}

export default CylinderChart;