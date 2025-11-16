import React, { useRef } from 'react';
import useD3 from './useD3';
import styles from './InteractiveBubbleChart.module.css';

/**
 * InteractiveBubbleChart component displays a D3-powered bubble chart
 * where users can drag bubbles to modify their positions.
 */
const InteractiveBubbleChart = ({ points, onPointMove, showRangeAnimation, rangeMin, rangeMax, ruleOperator }) => {
  const svgRef = useRef();

  // Use custom D3 hook to handle all visualization logic
  useD3(svgRef, points, onPointMove, showRangeAnimation, rangeMin, rangeMax, ruleOperator);

  return (
    <div className={styles.chartWrapper}>
      <svg
        ref={svgRef}
        width={800}
        height={450}
        className={styles.chart}
      />
    </div>
  );
};

export default InteractiveBubbleChart;
