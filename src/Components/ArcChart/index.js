import React, {
    Component
} from 'react';
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
        const {
            select: d3Select,
            range: d3Range,
            rgb: d3Rgb,
            scaleLinear: d3ScaleLinear,
            line: d3Line,
            curveLinear: d3CurveLinear,
            arc: d3Arc,
            interpolateHsl: d3InterpolateHsl,
            easeElastic: d3EaseElastic,
        } = d3

        const {
            values,
            curValue,
            height,
            angles
        } = this.props;
        const [minValue, maxValue] = values;
        const [minAngle, maxAngle] = angles;
        const range = maxAngle - minAngle;
        const element = this.element;
        const radius = height - 10;
        const innerRadius = radius / 2;
        const majorTicks = 5;
        const DURATION = 1000;
        const ringWidth = 15;
        const ringInset = 20;
        const arcColorFn = d3InterpolateHsl(d3Rgb('red'), d3Rgb('#8abe6e'));
        const arrowColor = '#dae7f5';

        const svgData = d3Select(element).data([null]);
        const tickData = d3Range(majorTicks).map(() => 1 / majorTicks);
        const svgMerge = svgData.merge(svgData);
        const centerTx = this.centerTranslation(radius);

        //#region Outer arc
        const outerArcPath = d3Arc()
            .innerRadius(radius - ringWidth - ringInset)
            .outerRadius(radius - ringInset)
            .startAngle(this.deg2rad(minAngle))
            .endAngle(this.deg2rad(maxAngle));

        const outerArcsData = svgMerge.selectAll('g.outer_arc').data([null]);
        const outerArcEnter = outerArcsData.enter()
            .append('g')
            .attr('class', 'outer_arc')
            .attr('transform', centerTx)

        outerArcEnter.append('path')
            .attr('fill', 'transparent')
            .attr('stroke', 'black')
            .attr('d', outerArcPath)

        outerArcsData.merge(outerArcEnter)

        //#endregion

        //#region Inner arcs
        const innerArcPath = d3Arc()
            .innerRadius(innerRadius - ringWidth - ringInset)
            .outerRadius(innerRadius - ringInset)
            .startAngle((d, i) => {
                const ratio = d * i
                return this.deg2rad(minAngle + (ratio * range))
            })
            .endAngle((d, i) => {
                const ratio = d * (i + 1)
                return this.deg2rad(minAngle + (ratio * range))
            });

        const innerArcsData = svgMerge.selectAll('g.inner_arc').data(tickData);
        const innerArcsEnter = innerArcsData.enter()
            .append('g')
            .attr('class', 'inner_arc')
            .attr('transform', centerTx)

        innerArcsEnter.append('path')
            .attr('fill', (d, i) => arcColorFn(d * (i + 1)))
            .attr('d', innerArcPath)

        innerArcsData.merge(innerArcsEnter)

        //#endregion

        //#region Labels
        const scaleValue = d3ScaleLinear()
            .range([0, 1])
            .domain([minValue, maxValue]);
        const ticks = scaleValue.ticks(majorTicks);
        const labelsData = svgMerge.selectAll('g.label').data(ticks);
        const labelsEnter = labelsData.enter()
            .append('g')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .attr('transform', (d) => {
                const ratio = scaleValue(d);
                const Pi = Math.PI;
                const innerRadiusOuterStroke = innerRadius - ringInset;
                const outerRadiusinnerStroke = radius - ringWidth - ringInset;
                const middlePointArcs = (innerRadiusOuterStroke + outerRadiusinnerStroke) / 2;
                const minAngleRad = this.deg2rad(minAngle);
                const edgeSize = this.deg2rad(range);

                // Adding the radius in the end to use the center of the svg as the point of reference
                const x = middlePointArcs * Math.cos(ratio * edgeSize + minAngleRad - (Pi / 2)) + radius;
                const y = middlePointArcs * Math.sin(ratio * edgeSize + minAngleRad - (Pi / 2)) + radius;

                return `translate(${x},${y})`;
            });

        labelsData.exit().remove()
        labelsEnter
            .append('text')
            .text(d => d);

        // const labelsMerge = labelsData.merge(labelsEnter)

        // labelsMerge.selectAll('text')
        //     .text(d => d)
        //     .transition()
        //     .duration(DURATION)
        //     .attr('transform', (d) => {
        //         const ratio = scaleValue(d);
        //         const newAngle = minAngle + (ratio * range);
        //         return 'rotate(' + newAngle + ') translate(0,' + (innerRadius-radius-40) + ')';
        //     })

        //#endregion

        //#region Pointer

        const pointerWidth = 10;
        const pointerHeadLengthPercent = 1.5;
        const pointerHeadLength = Math.round(innerRadius * pointerHeadLengthPercent)
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


        //#endregion

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
            <svg ref={element => this.element = element} width={width} height={'100%'} className='gauge' >
            </svg>
        );
    };
}

export default ArcChart;