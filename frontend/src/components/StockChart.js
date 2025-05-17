import React, { useEffect, useState, useRef } from 'react';
import {
  AreaChart, Area, ComposedChart, Line, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../styles/StockChart.css'; // Import CSS khusus untuk StockChart

const StockChart = ({ data, currencySymbol = 'Rp', chartType = 'composed' }) => {
  const [chartData, setChartData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const chartContainerRef = useRef(null);
  // Tambahkan state untuk tren harga
  const [priceTrend, setPriceTrend] = useState('neutral'); // 'up', 'down', atau 'neutral'
  
  // Effect untuk resize handling
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    // Prepare and format data for the chart
    if (!data || data.length === 0) return;

    // Determine date format based on data density
    const firstDate = new Date(data[data.length - 1].Date || data[data.length - 1].Datetime);
    const lastDate = new Date(data[0].Date || data[0].Datetime);
    const dayDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    
    // Format based on time span
    let format;
    if (dayDiff <= 5) {
      format = 'HH:mm DD/MM'; // For intraday or very short spans
    } else if (dayDiff <= 90) {
      format = 'DD/MM'; // For spans under 3 months
    } else if (dayDiff <= 365) {
      format = 'MM/YY'; // For spans under 1 year
    } else {
      format = 'YYYY'; // For spans over a year
    }

    // Reverse data to get chronological order
    const chartReadyData = [...data]
      .map(item => {
        const date = new Date(item.Date || item.Datetime);
        
        // Format date string based on determined format
        let formattedDate;
        if (format === 'HH:mm DD/MM') {
          formattedDate = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else if (format === 'DD/MM') {
          formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        } else if (format === 'MM/YY') {
          formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
        } else {
          formattedDate = `${date.getFullYear()}`;
        }
        
        // Calculate daily change and percentage change
        let change = null;
        let percentChange = null;
        
        // Calculate volume colors
        const volumeColor = item.Close > item.Open ? '#4CAF50' : '#E53935';
        
        return {
          date: formattedDate,
          rawDate: date,
          open: item.Open,
          high: item.High,
          low: item.Low,
          close: item.Close,
          volume: item.Volume,
          change,
          percentChange,
          volumeColor
        };
      })
      .reverse(); // Put in chronological order

    // Calculate daily changes
    for (let i = 1; i < chartReadyData.length; i++) {
      const prevClose = chartReadyData[i - 1].close;
      
      if (prevClose && chartReadyData[i].close) {
        chartReadyData[i].change = chartReadyData[i].close - prevClose;
        chartReadyData[i].percentChange = ((chartReadyData[i].close - prevClose) / prevClose) * 100;
      }
    }
    
    // Determine overall trend by comparing first and last data points
    if (chartReadyData.length >= 2) {
      const firstClose = chartReadyData[0].close;
      const lastClose = chartReadyData[chartReadyData.length - 1].close;
      
      if (lastClose > firstClose) {
        setPriceTrend('up');
      } else if (lastClose < firstClose) {
        setPriceTrend('down');
      } else {
        setPriceTrend('neutral');
      }
    }
    
    setChartData(chartReadyData);
  }, [data]);

  // Early return if no data
  if (!chartData || chartData.length === 0) {
    return <div className="chart-loading">No data available for chart</div>;
  }

  // Define chart height based on available data and screen width
  const getChartHeight = () => {
    // Responsif untuk ukuran layar berbeda
    if (windowWidth < 480) return 300;
    if (windowWidth < 768) return 350;
    
    // Default height for larger screens
    return Math.min(500, Math.max(350, chartData.length * 8));
  };
  
  // Get min chart width based on data points
  const getMinChartWidth = () => {
    // More data points need more width to be readable
    const dataPoints = chartData.length;
    const baseWidth = 500; // Base minimum width
    
    // 20px per data point is a good rule of thumb for readability
    const calculatedWidth = dataPoints * 20;
    
    // Use the larger of the two values
    return Math.max(baseWidth, calculatedWidth);
  };

  // Format price for tooltip
  const formatPrice = (value) => {
    if (value === null || value === undefined) return '-';
    return `${currencySymbol} ${value.toLocaleString('id-ID')}`;
  };

  // Format volume for tooltip
  const formatVolume = (value) => {
    if (value === null || value === undefined) return '-';
    
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)} B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} K`;
    } else {
      return value.toString();
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date"><strong>{label}</strong></p>
          <div className="tooltip-grid">
            <div className="tooltip-row">
              <span>Open:</span>
              <span>{formatPrice(data.open)}</span>
            </div>
            <div className="tooltip-row">
              <span>High:</span>
              <span>{formatPrice(data.high)}</span>
            </div>
            <div className="tooltip-row">
              <span>Low:</span>
              <span>{formatPrice(data.low)}</span>
            </div>
            <div className="tooltip-row">
              <span>Close:</span>
              <span>{formatPrice(data.close)}</span>
            </div>
            <div className="tooltip-row">
              <span>Volume:</span>
              <span>{formatVolume(data.volume)}</span>
            </div>
            
            {data.change !== null && (
              <div className="tooltip-row">
                <span>Change:</span>
                <span className={data.change >= 0 ? "positive-change" : "negative-change"}>
                  {data.change >= 0 ? '+' : ''}{formatPrice(data.change)} ({data.percentChange >= 0 ? '+' : ''}{data.percentChange.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // Define chart colors based on price trend
  const getChartColor = () => {
    switch(priceTrend) {
      case 'up':
        return '#10B981'; // Hijau sesuai tema untuk harga naik
      case 'down':
        return '#EF4444'; // Merah untuk harga turun
      default:
        return '#10B981'; // Default hijau
    }
  };
  
  const lineColor = getChartColor();
  const gridColor = '#eeeeee';
  
  // Determine min and max values for better visualization
  const allCloses = chartData.map(d => d.close).filter(v => v !== null && v !== undefined);
  const minClose = Math.min(...allCloses) * 0.99; // 1% below minimum
  const maxClose = Math.max(...allCloses) * 1.01; // 1% above maximum
  
  // Determine tick values for volume axis (to show in millions/billions)
  const maxVolume = Math.max(...chartData.map(d => d.volume || 0));
  const volumeFormatter = (value) => {
    if (value === 0) return '0';
    
    if (maxVolume >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (maxVolume >= 1000000) {
      return `${(value / 1000000000).toFixed(1)}M`;
    } else if (maxVolume >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    
    return value.toString();
  };

  // Wrapper component that ensures horizontal scrolling works on all devices
  return (
    <div className="stock-chart-outer-container">
      <div ref={chartContainerRef} className="stock-chart-container">
        <div className={`stock-chart-wrapper ${priceTrend}`} style={{ minWidth: getMinChartWidth() }}>
          {/* Render different chart types based on props */}
          {chartType === 'area' ? (
            <ResponsiveContainer width="100%" height={getChartHeight()}>
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 10,
                  bottom: 30,
                }}
              >
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={lineColor} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#ccc' }}
                  axisLine={{ stroke: '#ccc' }}
                  height={50}
                  minTickGap={windowWidth < 768 ? 20 : 40}
                />
                <YAxis 
                  domain={[minClose, maxClose]}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#ccc' }}
                  axisLine={{ stroke: '#ccc' }}
                  tickFormatter={(value) => `${currencySymbol} ${value.toLocaleString('id-ID')}`}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={lineColor}
                  fill="url(#colorClose)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: lineColor, stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : chartType === 'line' ? (
            <ResponsiveContainer width="100%" height={getChartHeight()}>
              <ComposedChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 10,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#ccc' }}
                  axisLine={{ stroke: '#ccc' }}
                  height={50}
                  minTickGap={windowWidth < 768 ? 20 : 40}
                />
                <YAxis 
                  domain={[minClose, maxClose]}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#ccc' }}
                  axisLine={{ stroke: '#ccc' }}
                  tickFormatter={(value) => `${currencySymbol} ${value.toLocaleString('id-ID')}`}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: lineColor, stroke: 'white', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            // Default chart type: composed chart with line + volume bars
            <ResponsiveContainer width="100%" height={getChartHeight()}>
              <ComposedChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 10,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#ccc' }}
                  axisLine={{ stroke: '#ccc' }}
                  height={50}
                  minTickGap={windowWidth < 768 ? 20 : 40}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[minClose, maxClose]}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickLine={{ stroke: '#ccc' }}
                  axisLine={{ stroke: '#ccc' }}
                  tickFormatter={(value) => `${currencySymbol} ${value.toLocaleString('id-ID')}`}
                  width={80}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={volumeFormatter}
                  domain={[0, maxVolume * 1.2]}
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickLine={{ stroke: '#ccc' }}
                  axisLine={{ stroke: '#ccc' }}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="right"
                  dataKey="volume"
                  name="Volume"
                  fill={priceTrend === 'down' ? "rgba(239, 68, 68, 0.3)" : "rgba(158, 158, 158, 0.5)"}
                  fillOpacity={0.6}
                  barSize={windowWidth < 768 ? 3 : 5}
                  strokeWidth={0}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="close"
                  name="Close"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: lineColor, stroke: 'white', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockChart;