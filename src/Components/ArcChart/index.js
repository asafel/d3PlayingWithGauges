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
        const Pi = Math.PI;
        const radius = height - 10;
        const innerRadius = radius / 2;
        const majorTicks = 5;
        const DURATION = 2500;
        const ringWidth = 15;
        const ringInset = 20;
        const arcColorFn = d3InterpolateHsl(d3Rgb('red'), d3Rgb('#8abe6e'));

        const svgData = d3Select(element).data([null]);
        const tickData = d3Range(majorTicks).map(() => 1 / majorTicks);
        const svgMerge = svgData.merge(svgData);
        const centerTx = this.centerTranslation(radius);
        const scaleValue = d3ScaleLinear()
            .range([0, 1])
            .domain([minValue, maxValue]);
        const ticks = scaleValue.ticks(majorTicks);

        //#region Outer arc

        // Creating the outer arc with no width
        const outerArcPathGenerator = d3Arc()
            .innerRadius(radius - ringWidth - ringInset)
            .outerRadius(radius - ringWidth - ringInset)
            .startAngle(this.deg2rad(minAngle))
            .endAngle(this.deg2rad(maxAngle))().split(/[A-Z]/);

        const outerArcPath = "M" + outerArcPathGenerator[1] + "A" + outerArcPathGenerator[2];

        const outerArcsData = svgMerge.selectAll('g.outer_arc').data([null]);
        const outerArcEnter = outerArcsData.enter()
            .append('g')
            .attr('class', 'outer_arc')
            .attr('transform', centerTx)

        outerArcEnter.append('path')
            .attr('fill', 'transparent')
            .attr('stroke', 'black')
            .attr('opacity', 0.6)
            .attr('d', outerArcPath)

        outerArcsData.merge(outerArcEnter)

        //#endregion

        //#region Ticks-
        const outerArcTicks = svgMerge.selectAll('g.ticks_container').data([null]);
        const outerArcTicksEnter = outerArcTicks.enter()
            .append('g')
            .attr('class', 'ticks_container')
            .attr('transform', centerTx)

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

        const outerArcTicksData = outerArcTicksEnter.selectAll('g.tick').data(extendedTicksArr);
        const outerArcTicksDataEnter = outerArcTicksData.enter()
            .append('line')
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
                const outerRadiusinnerStroke = radius - ringWidth - ringInset;
                const minAngleRad = this.deg2rad(minAngle);
                const edgeSize = this.deg2rad(range);
                const newAngle = minAngle + (ratio * range);

                const x = outerRadiusinnerStroke * Math.cos(ratio * edgeSize + minAngleRad - (Pi / 2));
                const y = outerRadiusinnerStroke * Math.sin(ratio * edgeSize + minAngleRad - (Pi / 2));

                return `translate(${x},${y}) rotate(${newAngle + 90})`;
            });

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

        const innerArcsContainer = svgMerge.selectAll('g.inner_arcs').data([null]);
        const innerArcsContainerEnter = innerArcsContainer.enter()
            .append('g')
            .attr('class', 'inner_arcs')
            .attr('transform', centerTx)

        const innerArcsData = innerArcsContainerEnter.selectAll('g.inner_arc').data(tickData);
        const innerArcsEnter = innerArcsData.enter()
            .append('g')
            .attr('class', 'inner_arc')

        innerArcsEnter.append('path')
            .attr('fill', (d, i) => arcColorFn(d * (i + 1)))
            .attr('d', innerArcPath)

        innerArcsData.merge(innerArcsEnter)

        //#endregion

        //#region Labels
        const labelsContainer = svgMerge.selectAll('g.labels').data([null]);
        const labelsContainerEnter = labelsContainer.enter()
            .append('g')
            .attr('class', 'labels');

        const labelsData = labelsContainerEnter.selectAll('g.label').data(ticks);
        const labelsEnter = labelsData.enter()
            .append('g')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .attr('transform', (d) => {
                const ratio = scaleValue(d);
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

        const pointerWidth = 7;
        const pointerHeadLengthPercent = 1.3;
        const pointerHeadLength = Math.round(innerRadius * pointerHeadLengthPercent);
        const pointerTailLength = 5;
        const arrowColor = '#5eb2d6';
        const lineData = [
            [pointerWidth / 2, 0],
            [0, -pointerHeadLength],
            [-(pointerWidth / 2), 0],
            [0, pointerTailLength],
            [pointerWidth / 2, 0]
        ];

        const pointerLine = d3Line().curve(d3CurveLinear);
        const pointerData = svgMerge.selectAll('g.pointer').data([lineData]);
        const pointerEnter = pointerData.enter()
            .append('g')
            .attr('class', 'pointer')
            .attr('transform', centerTx);

        pointerEnter.append('path')
            .attr('d', pointerLine)
            .attr('transform', `rotate(${minAngle})`)
            .attr('fill', arrowColor);

        const pointerMerge = pointerData.merge(pointerEnter);
        const ratio = scaleValue(curValue);
        const newAngle = minAngle + (ratio * range);

        pointerMerge.select('path')
            .transition()
            .duration(DURATION)
            .ease(d3EaseElastic)
            .attr('transform', `rotate(${newAngle})`);

        //#endregion
    }

    deg2rad = (deg) => {
        return deg * Math.PI / 180
    }

    centerTranslation = (r) => {
        return 'translate(' + r + ',' + r + ')'
    }

    render() {
        const {
            width,
            height
        } = this.props;

        return (
            <svg
                width={width}
                height={'100%'}
                className='gauge'
                ref={element => this.element = element} >
            </svg>
        );
    };
}

export default ArcChart;