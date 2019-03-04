import React, {
    Component
} from 'react';
import * as d3 from 'd3'

class ArcChart extends Component {

    componentDidMount() {
        this.createArcChart();
    }

    componentDidUpdate() {
        this.createArcChart();
    }

    createArcChart() {
        const {
            select: d3Select,
            scaleLinear: d3ScaleLinear,
            line: d3Line,
            curveLinear: d3CurveLinear,
            arc: d3Arc,
            easeElastic: d3EaseElastic,
        } = d3

        const {
            values,
            curValue,
            height,
            angles,
            majorTicks,
            target
        } = this.props;

        const minValue = values[0].min || 0;
        const maxValue = values[values.length - 1].max || 100;
        const [minAngle, maxAngle] = angles;
        const angleRangeDeg = maxAngle - minAngle;
        const Pi = Math.PI;
        const radius = height * 0.85;
        const innerRadius = radius / 2;
        const ringWidth = 15;
        const ringInset = 15;
        const ticksWidth = 24;
        const svgData = d3Select(this.element).data([null]);
        const centerTx = `translate(${radius},${radius})`;
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
        const outerArcData = svgData.select('g.outer_arc').attr('transform', centerTx).selectAll('path').data([null]);
        outerArcData.exit().remove();
        outerArcData.enter()
            .append('path')
            .merge(outerArcData)
            .attr('fill', 'transparent')
            .attr('stroke', 'black')
            .attr('opacity', 0.6)
            .attr('d', outerArcPath);

        //#endregion

        //#region Ticks-

        // Extending our ticks data in order to include new (smaller) ticks
        // "extendedTicksArr" will be an array containing numbers and objects {representing the virtual ticks}
        const extendedTicksArr = [];
        const tickClassifier = (d) => {
            let className = 'tick';
            if (typeof d === "object") {
                if (d.size === "S") {
                    className += ' smalltick';
                } else {
                    className += ' mediumtick';
                }
            }
            return className;
        };
        const tickStrokeClassifier = (d) => {
            if (typeof d === "object") {
                if (d.size === "S") {
                    return ticksWidth * 0.42;
                } else {
                    return ticksWidth * 0.67;
                }
            }
            return ticksWidth;
        };
        const tickTransformer = (d) => {
            const val = typeof d === "number" ? d : d.val;
            const ratio = scaleValue(val);
            const outerRadiusinnerStroke = radius - ringWidth - ringInset;
            const minAngleRad = this.deg2rad(minAngle);
            const edgeSize = this.deg2rad(angleRangeDeg);
            const newAngle = minAngle + (ratio * angleRangeDeg);

            const x = outerRadiusinnerStroke * Math.cos(ratio * edgeSize + minAngleRad - (Pi / 2));
            const y = outerRadiusinnerStroke * Math.sin(ratio * edgeSize + minAngleRad - (Pi / 2));

            return `translate(${x},${y}) rotate(${newAngle + 90})`;
        };

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

        const outerArcTicksData = svgData.select('g.ticks_container').attr('transform', centerTx).selectAll('line').data(extendedTicksArr);
        outerArcTicksData.exit().remove();
        outerArcTicksData.enter()
            .append('line')
            .merge(outerArcTicksData)
            .attr('class', tickClassifier)
            .attr('stroke', 'black')
            .attr('opacity', 0.6)
            .attr('x2', tickStrokeClassifier)
            .attr('transform', tickTransformer);

        //#endregion

        //#region Inner arcs

        const arcScale = d3ScaleLinear().domain([minValue, maxValue]).range([0, 1]);
        const innerArcPath = d3Arc()
            .innerRadius(innerRadius - ringWidth - ringInset)
            .outerRadius(innerRadius - ringInset)
            .startAngle(d => this.deg2rad(minAngle + (arcScale(d.min) * angleRangeDeg)))
            .endAngle(d => this.deg2rad(minAngle + (arcScale(d.max) * angleRangeDeg)));

        const innerArcsData = svgData.select('g.inner_arcs').attr('transform', centerTx).selectAll('path').data(values);
        innerArcsData.exit().remove();
        innerArcsData.enter()
            .append('path')
            .merge(innerArcsData)
            .attr('class', 'inner_arc')
            .attr('fill', d => d.color)
            .attr('d', innerArcPath)

        //#endregion

        //#region Labels

        const labelsData = svgData.select('g.labels').selectAll('text').data(ticks);
        labelsData.exit().remove();
        labelsData.enter()
            .append('text')
            .merge(labelsData)
            .attr('class', 'gauge_label')
            .attr('dominant-baseline', 'central')
            .attr('text-anchor', 'middle')
            .attr('font-size', 14)
            .text(d => d)
            .attr('transform', (d) => {
                const ratio = scaleValue(d);
                const innerRadiusOuterStroke = innerRadius - ringInset;
                const outerRadiusinnerStroke = radius - ringWidth - ringInset - ticksWidth;
                const middlePointArcs = (innerRadiusOuterStroke + outerRadiusinnerStroke) * 0.53;
                const minAngleRad = this.deg2rad(minAngle);
                const edgeSize = this.deg2rad(angleRangeDeg);

                // Adding the radius in the end to use the center of the svg as the point of reference
                const x = middlePointArcs * Math.cos(ratio * edgeSize + minAngleRad - (Pi / 2)) + radius;
                const y = middlePointArcs * Math.sin(ratio * edgeSize + minAngleRad - (Pi / 2)) + radius;

                return `translate(${x},${y})`;
            });

        //#endregion

        //#region Pointer

        const pointerWidth = 8;
        const pointerHeadLengthPercent = 1.5;
        const pointerHeadLength = Math.round(innerRadius * pointerHeadLengthPercent);
        const pointerTailLength = 5;
        const pointerColor = '#5eb2d6';
        const lineData = [
            [pointerWidth / 2, 0],
            [0, -pointerHeadLength],
            [-(pointerWidth / 2), 0],
            [0, pointerTailLength],
            [pointerWidth / 2, 0]
        ];

        const pointerLine = d3Line().curve(d3CurveLinear);
        const ratio = scaleValue(curValue);
        const newAngle = minAngle + (ratio * angleRangeDeg);
        const DURATION = 2500;

        const pointerData = svgData.select('g.pointer').attr('transform', centerTx).selectAll('path').data([lineData]);
        pointerData.exit().remove();
        pointerData.enter()
            .append('path')
            .attr('d', pointerLine)
            .attr('fill', pointerColor)
            .attr('transform', `rotate(${minAngle})`)
            .merge(pointerData)
            .transition()
            .duration(DURATION)
            .ease(d3EaseElastic)
            .attr('transform', `rotate(${newAngle})`);

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
            .attr('transform', `translate(${radius},${radius + 80})`)
            .text(Math.ceil(curValue));

        //#endregion

        //#region target
        if (target != null) {
            const targetCircleSelection = svgData.select('g.target-container').attr('transform', centerTx).selectAll('circle').data([null]);
            targetCircleSelection.exit().remove();
            targetCircleSelection.enter()
                .append('circle')
                .attr('class', 'traget-circle')
                .attr('stroke', 'red')
                .attr('fill', 'transparent')
                .attr('r', 8)
                .attr('transform', () => {
                    const ratio = scaleValue(target);
                    const outerRadiusinnerStroke = radius - ringWidth - ringInset;
                    const minAngleRad = this.deg2rad(minAngle);
                    const edgeSize = this.deg2rad(angleRangeDeg);

                    const x = (outerRadiusinnerStroke - 12) * Math.cos(ratio * edgeSize + minAngleRad - (Pi / 2));
                    const y = (outerRadiusinnerStroke - 12) * Math.sin(ratio * edgeSize + minAngleRad - (Pi / 2));
                    return `translate(${x},${y})`;
                })
        }
        //#endregion
    }

    deg2rad = (deg) => {
        return deg * Math.PI / 180
    }

    render() {
        const { width, height } = this.props;

        return (
            <svg
                viewBox={`0 0 400 400`}
                width={width}
                height={height}
                className='gauge'
                ref={element => this.element = element} >
                <g className="outer_arc" />
                <g className="ticks_container" />
                <g className="target-container" />
                <g className="inner_arcs" />
                <g className="labels" />
                <g className="pointer" />
                <text className="value" textAnchor={'middle'} />
            </svg>
        );
    };
}

export default ArcChart;