import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  PieController
} from 'chart.js';

// Register components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  PieController
);

const SampleChart = () => {
  // Data for the chart
  const data = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };

  // Options for the chart
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  return (
    <div style={{ width: '50%', height: '300px' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default SampleChart;
