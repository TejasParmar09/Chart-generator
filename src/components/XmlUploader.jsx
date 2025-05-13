import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Plotly from 'react-plotly.js';
import jsPDF from 'jspdf';

Chart.register(ChartDataLabels);

const XmlUploader = ({ data, chartType, xAxis, yAxis, xAxisOptions, yAxisOptions }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const plotlyRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('XmlUploader props:', { data, chartType, xAxis, yAxis, xAxisOptions, yAxisOptions });

    // Clear the error state at the start of validation
    setError(null);

    if (!data || data.length === 0 || !xAxis || !yAxis || yAxis.length === 0) {
      setError('Invalid data or axis selection. Please select valid X and Y axes.');
      return;
    }

    const aiValidateAxes = () => {
      const xValues = data.map(item => item[xAxis]);
      const isXNumerical = xValues.every(val => typeof val === 'number' && !isNaN(val));
      const isXTemporal = xValues.every(val => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      });
      const uniqueXValues = new Set(xValues);
      const isXCategorical = !isXNumerical || isXTemporal || uniqueXValues.size <= 10;

      const yValues = yAxis.map(yKey => data.map(item => item[yKey]));
      const areYValuesNumerical = yValues.every(yVals => yVals.every(val => typeof val === 'number' && !isNaN(val)));

      if (['bar', 'line', 'pie'].includes(chartType)) {
        if (!isXCategorical) {
          const suggestedXAxis = xAxisOptions.find(opt => {
            const values = data.map(item => item[opt.value]);
            const isNumerical = values.every(val => typeof val === 'number' && !isNaN(val));
            const isTemporal = values.every(val => {
              const date = new Date(val);
              return !isNaN(date.getTime());
            });
            const uniqueValues = new Set(values);
            return !isNumerical || isTemporal || uniqueValues.size <= 10;
          })?.value || 'a categorical field';

          return {
            isValid: false,
            message: `AI Validation Error: Invalid axis selection for ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart. The X-axis ('${xAxis}') is numerical, but it should be categorical for this chart type.`,
            suggestion: `Suggestion: Use '${suggestedXAxis}' as the X-axis and keep '${yAxis.join("', '")}' as the Y-axis. Alternatively, switch to a Scatter or 3D chart to plot numerical data on the X-axis.`,
          };
        }
      }

      if (!areYValuesNumerical) {
        return {
          isValid: false,
          message: `AI Validation Error: Invalid axis selection. The Y-axis (${yAxis.join(', ')}) contains non-numerical data. The Y-axis must be numerical for all chart types.`,
          suggestion: `Suggestion: Select numerical fields for the Y-axis, such as ${yAxisOptions.map(opt => `'${opt.value}'`).join(', ')}.`,
        };
      }

      if (chartType === 'pie' && yAxis.length > 1) {
        return {
          isValid: false,
          message: `AI Validation Error: Invalid axis selection for Pie Chart. Only one Y-axis field is allowed, but ${yAxis.length} fields (${yAxis.join(', ')}) were selected.`,
          suggestion: `Suggestion: Select a single numerical field for the Y-axis, such as '${yAxis[0]}'.`,
        };
      }

      return { isValid: true };
    };

    const validation = aiValidateAxes();
    if (!validation.isValid) {
      setError(`${validation.message}\n\n${validation.suggestion}`);
      return;
    }

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (chartType !== '3d' && chartRef.current) {
      try {
        const ctx = chartRef.current.getContext('2d');

        const colors = [
          'rgba(79, 70, 229, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(251, 146, 60, 0.7)',
          'rgba(147, 51, 234, 0.7)',
        ];

        const pieGradients = yAxis.map((_, index) => {
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, colors[index % colors.length].replace('0.7', '0.9'));
          gradient.addColorStop(1, colors[index % colors.length].replace('0.7', '0.4'));
          return gradient;
        });

        const datasets = yAxis.map((yKey, index) => {
          const dataset = {
            label: yKey.charAt(0).toUpperCase() + yKey.slice(1),
            data: data.map((item) => (typeof item[yKey] === 'number' ? item[yKey] : 0)),
            borderWidth: chartType === 'line' || chartType === 'scatter' ? 2 : 1,
            fill: chartType === 'line' ? true : false,
            pointRadius: chartType === 'scatter' ? 5 : 3,
            pointHoverRadius: chartType === 'scatter' ? 8 : 5,
            tension: chartType === 'line' ? 0.4 : 0,
            borderRadius: chartType === 'bar' ? 8 : 0,
          };

          if (chartType === 'pie') {
            dataset.backgroundColor = pieGradients;
            dataset.borderColor = '#ffffff';
            dataset.borderWidth = 2;
            dataset.hoverOffset = 20;
          } else {
            dataset.backgroundColor = chartType === 'line' || chartType === 'scatter' ? colors[index % colors.length].replace('0.7', '0.2') : colors[index % colors.length];
            dataset.borderColor = colors[index % colors.length].replace('0.7', '1');
          }

          return dataset;
        });

        const config = {
          type: chartType,
          data: {
            labels: data.map((item) => (item[xAxis] != null ? item[xAxis].toString() : 'Unknown')),
            datasets,
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: chartType === 'pie' ? 'right' : 'top',
                labels: {
                  font: { size: 12, family: "'Roboto', sans-serif" },
                  color: '#1f2937',
                  padding: 15,
                },
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                cornerRadius: 8,
                titleFont: { size: 12, family: "'Roboto', sans-serif" },
                bodyFont: { size: 11, family: "'Roboto', sans-serif" },
                padding: 10,
                callbacks: {
                  label: (context) => `${context.dataset.label}: ${context.raw}`,
                },
              },
              datalabels: {
                display: chartType !== 'pie',
                color: '#1f2937',
                font: { size: 10, family: "'Roboto', sans-serif" },
                anchor: 'end',
                align: 'top',
                formatter: (value) => value.toLocaleString(),
              },
            },
            animation: {
              duration: 1000,
              easing: 'easeOutQuart',
            },
            layout: {
              padding: 20,
            },
          },
        };

        if (chartType === 'pie') {
          config.type = 'doughnut';
          config.options = {
            ...config.options,
            scales: undefined,
            plugins: {
              ...config.options.plugins,
              legend: { position: 'right' },
              datalabels: {
                display: true,
                color: '#fff',
                font: { size: 12, family: "'Roboto', sans-serif", weight: 'bold' },
                formatter: (value, context) => {
                  const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${percentage}% (${value})`;
                },
              },
            },
            cutout: '50%',
            elements: {
              arc: {
                borderWidth: 2,
                borderColor: '#ffffff',
                shadowOffsetX: 3,
                shadowOffsetY: 3,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
          };
        } else {
          config.options.scales = {
            x: {
              title: {
                display: true,
                text: xAxis.charAt(0).toUpperCase() + xAxis.slice(1),
                font: { size: 14, family: "'Roboto', sans-serif", weight: 'bold' },
                color: '#1f2937',
              },
              grid: { display: false },
              ticks: { font: { size: 11, family: "'Roboto', sans-serif" }, color: '#1f2937' },
            },
            y: {
              title: {
                display: true,
                text: yAxis.length > 0 ? yAxis.join(', ') : 'Values',
                font: { size: 14, family: "'Roboto', sans-serif", weight: 'bold' },
                color: '#1f2937',
              },
              grid: { color: '#e5e7eb' },
              ticks: { font: { size: 11, family: "'Roboto', sans-serif" }, color: '#1f2937' },
              beginAtZero: true,
            },
          };
        }

        chartInstanceRef.current = new Chart(ctx, config);
      } catch (err) {
        console.error('Chart.js rendering error:', err);
        setError(`Failed to render chart: ${err.message}`);
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data, chartType, xAxis, yAxis, xAxisOptions, yAxisOptions]);

  const downloadChartJsChartAsPNG = () => {
    if (chartInstanceRef.current) {
      const url = chartInstanceRef.current.toBase64Image('image/png', 1.0);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${chartType}-chart.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setError('Chart is not available for download. Please ensure the chart is rendered.');
    }
  };

  const downloadChartJsChartAsPDF = () => {
    if (chartInstanceRef.current) {
      const url = chartInstanceRef.current.toBase64Image('image/png', 1.0);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const pdf = new jsPDF('landscape');
        const imgWidth = 280;
        const imgHeight = (img.height * imgWidth) / img.width;
        pdf.addImage(url, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`${chartType}-chart.pdf`);
      };
    } else {
      setError('Chart is not available for download. Please ensure the chart is rendered.');
    }
  };

  const downloadPlotlyChartAsPNG = () => {
    if (plotlyRef.current && plotlyRef.current.el) {
      Plotly.downloadImage(plotlyRef.current.el, {
        format: 'png',
        filename: '3d-chart',
        width: 800,
        height: 500,
      }).catch(err => {
        console.error('Plotly download error:', err);
        setError(`Failed to download Plotly chart: ${err.message}`);
      });
    } else {
      setError('3D chart is not available for download. Please ensure the chart is rendered.');
    }
  };

  const downloadPlotlyChartAsPDF = () => {
    if (plotlyRef.current && plotlyRef.current.el) {
      Plotly.toImage(plotlyRef.current.el, { format: 'png', width: 800, height: 500 }).then(url => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const pdf = new jsPDF('landscape');
          const imgWidth = 280;
          const imgHeight = (img.height * imgWidth) / img.width;
          pdf.addImage(url, 'PNG', 10, 10, imgWidth, imgHeight);
          pdf.save('3d-chart.pdf');
        };
      }).catch(err => {
        console.error('Plotly toImage error:', err);
        setError(`Failed to download Plotly chart as PDF: ${err.message}`);
      });
    } else {
      setError('3D chart is not available for download. Please ensure the chart is rendered.');
    }
  };

  if (chartType === '3d' && data.length > 0 && xAxis && yAxis.length > 0) {
    try {
      const yValues = yAxis.map(yKey => data.map(item => item[yKey]));
      const areYValuesNumerical = yValues.every(yVals => yVals.every(val => typeof val === 'number' && !isNaN(val)));

      if (!areYValuesNumerical) {
        setError(`AI Validation Error: Invalid axis selection. The Y-axis (${yAxis.join(', ')}) contains non-numerical data. The Y-axis must be numerical for 3D charts.\n\nSuggestion: Select numerical fields for the Y-axis, such as ${yAxisOptions.map(opt => `'${opt.value}'`).join(', ')}.`);
        return;
      }

      const xData = data.map((item) => (item[xAxis] != null ? item[xAxis].toString() : 'Unknown'));
      const yData = yAxis.length > 0 ? data.map((item) => (typeof item[yAxis[0]] === 'number' ? item[yAxis[0]] : 0)) : [];
      const zData = yAxis.length > 1 ? data.map((item) => (typeof item[yAxis[1]] === 'number' ? item[yAxis[1]] : 0)) : [];
      const zFallback = yAxis.length > 2 ? data.map((item) => (typeof item[yAxis[2]] === 'number' ? item[yAxis[2]] : 0)) : yData;

      const plotlyData = [
        {
          x: xData,
          y: yData,
          z: zData.length > 0 ? zData : zFallback,
          type: 'scatter3d',
          mode: 'markers',
          marker: {
            size: 8,
            color: yData,
            colorscale: 'Viridis',
            showscale: true,
            colorbar: { title: yAxis[0] || 'Value' },
            opacity: 0.8,
          },
          text: xData.map((state, i) => `${xAxis}: ${xData[i]}<br>${yAxis[0]}: ${yData[i]}<br>${yAxis[1] || yAxis[0]}: ${zData[i] || zFallback[i]}`),
          hoverinfo: 'text',
        },
      ];

      const layout = {
        margin: { l: 0, r: 0, b: 0, t: 30 },
        scene: {
          xaxis: {
            title: {
              text: xAxis.charAt(0).toUpperCase() + xAxis.slice(1),
              font: { size: 14, family: "'Roboto', sans-serif", color: '#1f2937' },
            },
          },
          yaxis: {
            title: {
              text: yAxis[0] || 'Y-Axis 1',
              font: { size: 14, family: "'Roboto', sans-serif", color: '#1f2937' },
            },
          },
          zaxis: {
            title: {
              text: yAxis[1] || yAxis[0],
              font: { size: 14, family: "'Roboto', sans-serif", color: '#1f2937' },
            },
          },
          camera: {
            eye: { x: 1.5, y: 1.5, z: 1 },
          },
        },
        height: 500,
      };

      return (
        <div className="w-full h-[500px]">
          <div className="mb-4 space-x-2">
            <button
              onClick={downloadPlotlyChartAsPNG}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Download 3D Chart as PNG
            </button>
            <button
              onClick={downloadPlotlyChartAsPDF}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Download 3D Chart as PDF
            </button>
          </div>
          <Plotly
            ref={plotlyRef}
            data={plotlyData}
            layout={layout}
            config={{ responsive: true }}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      );
    } catch (err) {
      console.error('Plotly.js rendering error:', err);
      setError(`Failed to render 3D chart: ${err.message}`);
      return <div className="text-red-500 text-center whitespace-pre-line">{error}</div>;
    }
  }

  if (error) {
    return <div className="text-red-500 text-center whitespace-pre-line">{error}</div>;
  }

  return (
    <div className="w-full h-[400px] md:h-[500px]">
      <div className="mb-4 space-x-2">
        <button
          onClick={downloadChartJsChartAsPNG}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download Chart as PNG
        </button>
        <button
          onClick={downloadChartJsChartAsPDF}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Download Chart as PDF
        </button>
      </div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default XmlUploader;