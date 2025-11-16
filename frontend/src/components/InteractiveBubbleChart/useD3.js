import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Custom hook to encapsulate D3 logic for the interactive bubble chart.
 * This hook handles rendering, data updates, and drag interactions.
 */
const useD3 = (svgRef, data, onPointMove, showRangeAnimation, rangeMin, rangeMax, ruleOperator) => {
  // Store the previous data to detect changes
  const previousDataRef = useRef();
  const isDraggingRef = useRef(false);
  // Store initial scale domains to prevent shifting on re-renders
  const scaleDomainsRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Don't redraw if we're currently dragging
    if (isDraggingRef.current) {
      return;
    }

    // Chart dimensions and margins
    const margin = { top: 30, right: 30, bottom: 50, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Select the SVG
    const svg = d3.select(svgRef.current);

    // Only clear and recreate if this is the first render or a reset
    const isFirstRender = !previousDataRef.current;
    if (isFirstRender) {
      svg.selectAll('*').remove();
    }

    // Get or create main group element
    let g = svg.select('g.chart-group');
    if (g.empty() || isFirstRender) {
      g = svg
        .append('g')
        .attr('class', 'chart-group')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    }

    // Define scales
    const xExtent = d3.extent(data, d => d.x);
    const yExtent = d3.extent(data, d => d.y);
    const zExtent = d3.extent(data, d => d.z);

    // Store initial scale domains on first render to prevent shifting
    if (!scaleDomainsRef.current) {
      scaleDomainsRef.current = {
        x: [0, Math.ceil(xExtent[1] * 1.1 / 50) * 50],
        y: [0, Math.ceil(yExtent[1] * 1.1 / 100) * 100],
        z: zExtent
      };
    }

    // Create scales with fixed domains to prevent shifting
    const xScale = d3
      .scaleLinear()
      .domain(scaleDomainsRef.current.x)
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain(scaleDomainsRef.current.y)
      .range([height, 0]);

    const radiusScale = d3
      .scaleSqrt()
      .domain(scaleDomainsRef.current.z)
      .range([8, 30]);

    // Only create axes and labels on first render
    if (isFirstRender) {
      // Create axes
      const xAxis = d3.axisBottom(xScale).ticks(10);
      const yAxis = d3.axisLeft(yScale).ticks(10);

      // Append X axis
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

      // Append Y axis
      g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

      // Add X axis label
      g.append('text')
        .attr('class', 'axis-label x-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .text('Number of Stations');

      // Add Y axis label
      g.append('text')
        .attr('class', 'axis-label y-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -55)
        .text('Total System Length (km)');

      // Add grid lines
      g.append('g')
        .attr('class', 'grid grid-x')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3.axisBottom(xScale)
            .ticks(10)
            .tickSize(-height)
            .tickFormat('')
        );

      g.append('g')
        .attr('class', 'grid grid-y')
        .call(
          d3.axisLeft(yScale)
            .ticks(10)
            .tickSize(-width)
            .tickFormat('')
        );
    }

    // Create guide lines and tooltip (initially hidden)
    if (isFirstRender) {
      // Horizontal guide line
      g.append('line')
        .attr('class', 'guide-line guide-horizontal')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('stroke', '#ff0000')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0)
        .style('pointer-events', 'none');

      // Vertical guide line
      g.append('line')
        .attr('class', 'guide-line guide-vertical')
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#ff0000')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0)
        .style('pointer-events', 'none');

      // Tooltip for showing coordinates
      const tooltip = g.append('g')
        .attr('class', 'drag-tooltip')
        .attr('opacity', 0)
        .style('pointer-events', 'none');

      tooltip.append('rect')
        .attr('fill', '#333')
        .attr('rx', 4)
        .attr('ry', 4);

      tooltip.append('text')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle');

      // Create range window overlay (initially hidden)
      g.append('rect')
        .attr('class', 'range-window')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', 0)
        .attr('fill', '#3182ce')
        .attr('opacity', 0)
        .style('pointer-events', 'none');
    }

    // Snapping function - snaps to nearest 10 for easier positioning
    const snapValue = (value, snapInterval = 10) => {
      return Math.round(value / snapInterval) * snapInterval;
    };

    // Define drag behavior using d3.pointer for reliable positioning
    const dragBehavior = d3.drag()
      .on('start', function(event, d) {
        isDraggingRef.current = true;
        d3.select(this).raise();
        d3.select(this).select('.bubble').classed('dragging', true);

        // Show guide lines and tooltip
        g.select('.guide-horizontal').attr('opacity', 0.6);
        g.select('.guide-vertical').attr('opacity', 0.6);
        g.select('.drag-tooltip').attr('opacity', 1);
      })
      .on('drag', function(event, d) {
        // Get the mouse position relative to the parent 'g' element
        const [mouseX, mouseY] = d3.pointer(event, g.node());

        // Convert pixel position to data values
        let dataX = xScale.invert(mouseX);
        let dataY = xScale.invert(mouseY);

        // Apply snapping to Y-axis (the important one for range)
        // Snap Y to nearest 10 for easier precise positioning
        let snappedY = snapValue(yScale.invert(mouseY), 10);

        // Constrain to chart bounds
        dataX = Math.max(0, Math.min(xScale.domain()[1], dataX));
        snappedY = Math.max(0, Math.min(yScale.domain()[1], snappedY));

        // Calculate constrained pixel positions
        const constrainedX = xScale(dataX);
        const constrainedY = yScale(snappedY);

        // Update guide lines to follow the bubble
        g.select('.guide-horizontal')
          .attr('y1', constrainedY)
          .attr('y2', constrainedY);

        g.select('.guide-vertical')
          .attr('x1', constrainedX)
          .attr('x2', constrainedX);

        // Update tooltip
        const tooltip = g.select('.drag-tooltip');
        const tooltipText = `Y: ${snappedY.toFixed(0)}km`;

        tooltip.select('text')
          .text(tooltipText)
          .attr('x', constrainedX)
          .attr('y', constrainedY - 45);

        const bbox = tooltip.select('text').node().getBBox();
        tooltip.select('rect')
          .attr('x', bbox.x - 6)
          .attr('y', bbox.y - 3)
          .attr('width', bbox.width + 12)
          .attr('height', bbox.height + 6);

        // Directly update the position visually
        d3.select(this)
          .attr('transform', `translate(${constrainedX},${constrainedY})`);

        // Update React state with snapped value
        onPointMove(d.label, dataX, snappedY);
      })
      .on('end', function(event, d) {
        isDraggingRef.current = false;
        d3.select(this).select('.bubble').classed('dragging', false);

        // Hide guide lines and tooltip
        g.select('.guide-horizontal').attr('opacity', 0);
        g.select('.guide-vertical').attr('opacity', 0);
        g.select('.drag-tooltip').attr('opacity', 0);
      });

    // Create bubble groups using data join pattern
    const bubbleGroups = g
      .selectAll('.bubble-group')
      .data(data, d => d.label)
      .join(
        enter => {
          const group = enter
            .append('g')
            .attr('class', 'bubble-group')
            .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`)
            .style('cursor', 'move')
            .call(dragBehavior);

          // Add circle
          group
            .append('circle')
            .attr('class', 'bubble')
            .attr('r', d => radiusScale(d.z))
            .attr('fill', '#4299e1')
            .attr('stroke', '#2b6cb0')
            .attr('stroke-width', 2)
            .attr('opacity', 0.8);

          // Add label
          group
            .append('text')
            .attr('class', 'bubble-label')
            .attr('text-anchor', 'middle')
            .attr('dy', d => radiusScale(d.z) + 15)
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .attr('fill', '#2d3748')
            .text(d => d.label)
            .style('pointer-events', 'none');

          return group;
        },
        update => {
          update
            .transition()
            .duration(100)
            .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`);

          update.select('.bubble')
            .transition()
            .duration(100)
            .attr('r', d => radiusScale(d.z));

          update.select('.bubble-label')
            .transition()
            .duration(100)
            .attr('dy', d => radiusScale(d.z) + 15);

          return update;
        },
        exit => exit.remove()
      );

    // Store current data for next comparison
    previousDataRef.current = data;

  }, [svgRef, data, onPointMove]);

  // Separate effect to handle range animation
  useEffect(() => {
    if (!svgRef.current || !showRangeAnimation || rangeMin === undefined || !scaleDomainsRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select('g.chart-group');

    // Chart dimensions (must match main effect)
    const margin = { top: 30, right: 30, bottom: 50, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Use the same fixed y-scale domain as the main chart
    const yScale = d3.scaleLinear()
      .domain(scaleDomainsRef.current.y)
      .range([height, 0]);

    // Handle different rule operators
    if (ruleOperator === 'BETWEEN' && rangeMax !== undefined) {
      // Original BETWEEN animation - range window
      const rangeWindow = g.select('.range-window');
      if (rangeWindow.empty()) return;

      const yTop = yScale(rangeMax);
      const yBottom = yScale(rangeMin);
      const rangeHeight = yBottom - yTop;

      rangeWindow
        .attr('x', 0)
        .attr('y', yTop)
        .attr('width', 0)
        .attr('height', rangeHeight)
        .attr('opacity', 0.3)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('width', width)
        .on('end', function() {
          d3.select(this)
            .transition()
            .duration(300)
            .attr('opacity', 0);
        });
    } else if (ruleOperator === 'LESS_THAN' || ruleOperator === 'GREATER_THAN') {
      // Single-bound animation with threshold line and directional arrows
      const yPosition = yScale(rangeMin);
      const isLessThan = ruleOperator === 'LESS_THAN';

      // Create or select threshold line group
      let thresholdGroup = g.select('.threshold-animation-group');
      if (thresholdGroup.empty()) {
        thresholdGroup = g.append('g').attr('class', 'threshold-animation-group');
      }

      // Clear previous animation elements
      thresholdGroup.selectAll('*').remove();

      // Add horizontal threshold line
      const thresholdLine = thresholdGroup
        .append('line')
        .attr('class', 'threshold-line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yPosition)
        .attr('y2', yPosition)
        .attr('stroke', '#e53e3e')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '8,4')
        .attr('opacity', 0);

      // Add threshold label
      const thresholdLabel = thresholdGroup
        .append('text')
        .attr('class', 'threshold-label')
        .attr('x', width / 2)
        .attr('y', yPosition - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e53e3e')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('opacity', 0)
        .text(`${isLessThan ? 'Maximum' : 'Minimum'}: ${rangeMin}`);

      // Create arrows
      const arrowCount = 5;
      const arrowSpacing = width / (arrowCount + 1);

      for (let i = 1; i <= arrowCount; i++) {
        const xPos = arrowSpacing * i;
        const arrowSize = 12;

        // Define arrow path (pointing up or down based on rule operator)
        const arrowPath = isLessThan
          ? `M ${xPos} ${yPosition - 15} L ${xPos - arrowSize/2} ${yPosition - 15 - arrowSize} L ${xPos + arrowSize/2} ${yPosition - 15 - arrowSize} Z`
          : `M ${xPos} ${yPosition + 15} L ${xPos - arrowSize/2} ${yPosition + 15 + arrowSize} L ${xPos + arrowSize/2} ${yPosition + 15 + arrowSize} Z`;

        thresholdGroup
          .append('path')
          .attr('class', 'direction-arrow')
          .attr('d', arrowPath)
          .attr('fill', '#e53e3e')
          .attr('opacity', 0);
      }

      // Animate threshold line appearing
      thresholdLine
        .transition()
        .duration(500)
        .attr('opacity', 0.8);

      // Animate label appearing
      thresholdLabel
        .transition()
        .duration(500)
        .attr('opacity', 1);

      // Animate arrows with staggered delay
      thresholdGroup.selectAll('.direction-arrow')
        .transition()
        .delay((d, i) => 500 + i * 100)
        .duration(400)
        .attr('opacity', 0.9)
        .transition()
        .duration(400)
        .attr('opacity', 0.5)
        .transition()
        .duration(400)
        .attr('opacity', 0.9);

      // Fade out everything after animation
      setTimeout(() => {
        thresholdGroup
          .transition()
          .duration(500)
          .attr('opacity', 0)
          .on('end', function() {
            thresholdGroup.remove();
          });
      }, 2500);
    }

  }, [showRangeAnimation, rangeMin, rangeMax, ruleOperator, svgRef]);

  return null;
};

export default useD3;
