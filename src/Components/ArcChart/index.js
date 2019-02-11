import React, { Component } from 'react';
import * as d3 from 'd3'
import './style.scss';

class ArcChart extends Component {

    constructor(props) {
        super(props)

        this.createArcChart = this.createArcChart.bind(this)
    }

    componentDidMount() {
        this.createArcChart()
    }

    componentDidUpdate() {
        this.createArcChart()
    }

    createArcChart() {
        const { select: d3Select, range: d3Range, rgb: d3Rgb, scaleLinear: d3ScaleLinear,
            line: d3Line, curveLinear: d3CurveLinear, arc: d3Arc, interpolateHsl: d3InterpolateHsl,
            easeElastic: d3EaseElastic, } = d3

        const { values, curValue, width, height } = this.props;
        const [minValue, maxValue] = values;
        const element = this.element;
        const radius = height - 10;
        const majorTicks = 5;
        const DURATION = 1000;
        const labelInset = 15;
        const ringWidth = 40;
        const ringInset = 20;
        const minAngle = -90;
        const maxAngle = 90;
        const range = maxAngle - minAngle;
        const arcColorFn = d3InterpolateHsl(d3Rgb('#8abe6e'), d3Rgb('#f05757'));
        const arrowColor = '#dae7f5';

        const arc = d3Arc()
            .innerRadius(radius - ringWidth - ringInset)
            .outerRadius(radius - ringInset)
            .startAngle((d, i) => {
                const ratio = d * i
                return this.deg2rad(minAngle + (ratio * range))
            })
            .endAngle((d, i) => {
                const ratio = d * (i + 1)
                return this.deg2rad(minAngle + (ratio * range))
            });
        
        const svgData = d3Select(element).data([null]);
        const tickData = d3Range(majorTicks).map(() => 1 / majorTicks);
        const svgMerge = svgData.merge(svgData);
        const centerTx = this.centerTranslation(radius);
        
        // Arcs
        const arcsData = svgMerge.selectAll('g.arc').data(tickData);
        const arcsEnter = arcsData.enter()
            .append('g')
            .attr('class', 'arc')
            .attr('transform', centerTx)

        arcsEnter.append('path')
            .attr('fill', (d, i) => arcColorFn(d * (i + 1)))
            .attr('d', arc)

        arcsData.merge(arcsEnter)

        // Labels on Arcs
        const scaleValue = d3ScaleLinear()
            .range([0, 1])
            .domain([minValue, maxValue]);
        const ticks = scaleValue.ticks(majorTicks);
        const labelsData = svgMerge.selectAll('g.label').data(ticks);
        const labelsEnter = labelsData.enter()
            .append('g')
            .attr('class', 'label')
            .attr('transform', centerTx);

        labelsData.exit().remove()
        labelsEnter
            .append('text')
            .text(d => d);

        const labelsMerge = labelsData.merge(labelsEnter)
        labelsMerge.select('text')
            .text(d => d)
            .transition()
            .duration(DURATION)
            .attr('transform', (d) => {
                const ratio = scaleValue(d);
                const newAngle = minAngle + (ratio * range);
                return 'rotate(' + newAngle  + ') translate(0,' + (labelInset - radius ) + ')';
            })
        
        // Pointer
        const pointerWidth = 10
        const pointerHeadLengthPercent = 0.9
        const pointerHeadLength = Math.round(radius * pointerHeadLengthPercent)
        const pointerTailLength = 5
        const lineData = [
            [pointerWidth / 2, 0],
            [0, -pointerHeadLength],
            [-(pointerWidth / 2), 0],
            [0, pointerTailLength],
            [pointerWidth / 2, 0]
        ]
        const pointerLine = d3Line().curve(d3CurveLinear)
        const pointerData = svgMerge.selectAll('g.pointer').data([lineData])
        const pointerEnter = pointerData.enter()
            .append('g')
            .attr('class', 'pointer')
            .attr('transform', centerTx)
        pointerEnter.append('path')
            .attr('d', pointerLine)
            .attr('transform', 'rotate(' + minAngle + ')')
            .attr('fill', arrowColor)
        const pointerMerge = pointerData.merge(pointerEnter)
        const ratio = scaleValue(curValue)
        const newAngle = minAngle + (ratio * range)
        pointerMerge.select('path')
            .transition()
            .duration(DURATION)
            .ease(d3EaseElastic)
            .attr('transform', 'rotate(' + newAngle + ')')
    }

    deg2rad = (deg) => {
        return deg * Math.PI / 180
    }

    centerTranslation = (r) => {
        return 'translate(' + r + ',' + r + ')'
    }

    render() {
        const { width, height } = this.props;
        return (
            <svg ref={element => this.element = element}
                width={width} height={300} className='gauge'>
            </svg>
        );
    };
}

export default ArcChart;
