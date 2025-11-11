import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import GaugeComponent from 'react-gauge-component';
import { addMinutes, addHours } from 'date-fns';
import { FcSearch } from 'react-icons/fc';
import { AiOutlineClear } from 'react-icons/ai';
import { LuTimerReset } from 'react-icons/lu';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { api } from 'views/api';
import { useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { formatISO } from 'date-fns';
// import DashboardTour from './DashboardTour';

const animatedComponents = makeAnimated();
const quickRanges = [
  { label: 'Last 5 minutes', fn: () => [addMinutes(new Date(), -5), new Date()] },
  { label: 'Last 15 minutes', fn: () => [addMinutes(new Date(), -15), new Date()] },
  { label: 'Last 30 minutes', fn: () => [addMinutes(new Date(), -30), new Date()] },
  { label: 'Last 1 hour', fn: () => [addHours(new Date(), -1), new Date()] },
  { label: 'Last 3 hours', fn: () => [addHours(new Date(), -3), new Date()] },
  { label: 'Last 6 hours', fn: () => [addHours(new Date(), -6), new Date()] },
  { label: 'Last 12 hours', fn: () => [addHours(new Date(), -12), new Date()] },
  { label: 'Last 24 hours', fn: () => [addHours(new Date(), -24), new Date()] }
];
const options = [
  {
    label: 'PDP',
    value: 'PDP'
  },
  {
    label: 'Search',
    value: 'Search'
  },
  {
    label: 'SerchAll (web)',
    value: 'SearchAll (web)'
  },
  {
    label: 'SearchAll (mweb)',
    value: 'SearchAll (mweb)'
  }
];
const DashDefault = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [LatencyStats, setLatencyStats] = useState("");
  const [dataloading, setDataLoading] = useState(false);

  const [selected, setSelected] = useState([
    {
      label: 'PDP',
      value: 'PDP'
    }
  ]);
  const [range, setRange] = useState(quickRanges[0].fn());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(quickRanges[0]);
  const [refreshInterval, setRefreshInterval] = useState('1m');
  const [openedOnce, setOpenedOnce] = useState(false);

  const handleClear = () => {
    setSelected([]);
    setRange([null, null]);
    setSelectedDateTime(null);
    fetchDashboardData();
  };
  const fetchDashboardData = async () => {
    try {
      setDataLoading(true);

      // Handle selected IDs
      const ids = Array.isArray(selected) ? selected.map((item) => item.value) : selected ? [selected.value] : [];

      if (!ids.length) {
        console.warn('No IDs selected');
        return;
      }

      // Convert range dates to ISO format
      if (!Array.isArray(range) || range.length < 2) {
        console.warn('Invalid date range');
        return;
      }

      const [startDate, endDate] = range.map((date) => (date ? formatISO(new Date(date)) : null));

      const params = {
        Endpoints: ids.join(','),
        startDate,
        endDate
      };

      console.log('Final Params:', params);

      // Call backend API
      const res = await axios.get(`${api}/Naver-dashboard-data`, {
        withCredentials: true,
        params
      });

      if (res.status === 200) {
        const data = res.data;
        setData(data);

        console.log('Dashboard Data:', data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  };
    const fetchDashboardDataLatencyStats = async () => {
    try {
      setDataLoading(true);

      // Handle selected IDs
      const ids = Array.isArray(selected) ? selected.map((item) => item.value) : selected ? [selected.value] : [];

      if (!ids.length) {
        console.warn('No IDs selected');
        return;
      }

      // Convert range dates to ISO format
      if (!Array.isArray(range) || range.length < 2) {
        console.warn('Invalid date range');
        return;
      }

      const [startDate, endDate] = range.map((date) => (date ? formatISO(new Date(date)) : null));

      const params = {
        Endpoints: ids.join(','),
        startDate,
        endDate
      };

      console.log('Final Params:', params);

      // Call backend API
      const res = await axios.get(`${api}/Naver-dashboard-data-latency`, {
        withCredentials: true,
        params
      });

      if (res.status === 200) {
        const data = res.data;
        setLatencyStats(data);

        console.log('Dashboard Data12346:', data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  };
  const getIntervalMs = (interval) => {
    switch (interval) {
      case '1m':
        return 60000;
      case '5m':
        return 300000;
      case '15m':
        return 900000;
      default:
        return 30000; 
    }
  };

  useEffect(() => {
    if (refreshInterval !== 'manual') {
      fetchDashboardData();
      fetchDashboardDataLatencyStats(); // Initial fetch
      const interval = setInterval(() => {
           const [start, end] = selectedDateTime.fn();
        setRange([start, end]);
        fetchDashboardData();
        fetchDashboardDataLatencyStats();
      }, getIntervalMs(refreshInterval));

      // Cleanup when refreshInterval changes or component unmounts
      return () => clearInterval(interval);
    }
    fetchDashboardData();
    fetchDashboardDataLatencyStats()
  }, [refreshInterval , range ,selected]);

  const formatNumber = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    // if (num >= 1_0000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num;
  };
  return (
    <React.Fragment>
      {/* <DashboardTour /> */}
      <h1 className="mb-4"> Naver Dashboard</h1>
      <Row className="mt-4 g-3 align-items-center mb-3">
        <Col md={3} xs={12}>
          <label className="form-label d-block mb-1">End Point</label>
          <Select
            closeMenuOnSelect={true}
            components={animatedComponents}
            options={options}
            value={selected}
            onChange={(selectedItems) => setSelected(selectedItems)}
            placeholder="Search & select API"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: '40px',
                border: state.isFocused ? '1px solid #070707ff' : '1px solid #ccc',
                boxShadow: 'none',
                fontSize: '14px'
              }),
              menu: (base) => ({
                ...base,
                borderColor: '#070707ff',
                fontSize: '12px'
              }),
              valueContainer: (base) => ({
                ...base,
                padding: '2px 8px'
              })
            }}
          />
        </Col>

        <Col md={5} xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Row className="g-2">
              <Col xs={6}>
                <label className="form-label d-block mb-1">Start Date Time</label>
                <DateTimePicker
                  value={range[0]}
                  onChange={(newValue) => setRange([newValue, range[1]])}
                  format="dd/MM/yyyy hh:mm a" // controls how selected value is displayed
                  slotProps={{
                    textField: {
                      placeholder: 'DD/MM/YYYY HH:MM AM/PM', // ✅ fixed placeholder
                      size: 'small',
                      fullWidth: true,
                      sx: { minHeight: '40px', borderRadius: '5px' }
                    }
                  }}
                />
              </Col>
              <Col xs={6}>
                <label className="form-label d-block mb-1">End Date Time</label>
                <DateTimePicker
                  value={range[1]}
                  onChange={(newValue) => setRange([range[0], newValue])}
                  format="dd/MM/yyyy hh:mm a"
                  slotProps={{
                    textField: {
                      placeholder: 'DD/MM/YYYY HH:MM AM/PM',
                      size: 'small',
                      fullWidth: true,
                      sx: { minHeight: '40px', borderRadius: '5px' }
                    }
                  }}
                />
              </Col>
            </Row>
          </LocalizationProvider>
        </Col>
        <Col md={4} xs={12} className="d-flex justify-content-end">
          <Row className="g-2 w-100 justify-content-end">
            <Col xs={5}>
              <label className="form-label d-block mb-1">Range</label>
              <Select
                isClearable
                closeMenuOnSelect
                components={animatedComponents}
                placeholder="Range"
                value={selectedDateTime ? { label: selectedDateTime.label } : null}
                onChange={(selectedItem) => {
                  if (selectedItem) {
                    const rangeItem = quickRanges.find((q) => q.label === selectedItem.label);
                    if (rangeItem) {
                      const [start, end] = rangeItem.fn();
                      setSelectedDateTime(rangeItem);
                      setRange([start, end]);
                    }
                  } else {
                    setSelectedDateTime(null);
                  }
                }}
                options={quickRanges.map((item) => ({
                  label: item.label,
                  value: item.label
                }))}
              />
            </Col>
            <Col xs={3}>
              <label className="form-label d-block mb-1">Refresh</label>
              <Select
                isClearable={false}
                value={{ label: refreshInterval, value: refreshInterval }}
                onChange={(selectedOption) => setRefreshInterval(selectedOption.value)}
                options={[
            
                  { value: '1m', label: '1 min' },
                  { value: '5m', label: '5 min' },
                  { value: '15m', label: '15 min' },
                  { value: 'Manual', label: 'Manual' }
                ]}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col className="d-flex gap-2 justify-content-end">
          <Button variant="outline-dark" onClick={fetchDashboardData}>
            <FcSearch /> Search
          </Button>
          <Button variant="outline-dark" onClick={handleClear}>
            <AiOutlineClear /> Clear
          </Button>
        </Col>
      </Row>
      <Box sx={{ width: '100%', mb: 3 }}>{dataloading && <LinearProgress />}</Box>
      <Card className="shadow-sm border-1 rounded-3  p-1">
        <Card.Title className="mb-3 p-2">Summary</Card.Title>
        <Card.Body className="p-1">
          <Row className="text-center">
            <Col xs={6} md>
              <div>
                <small className="text-muted">Total Requests</small>
                <h2 className="fw-bold text-primary">{formatNumber(data.total || 0)}</h2>
              </div>
            </Col>
            <Col xs={6} md>
              <div>
                <small className="text-muted">Successful Requests</small>
                <h2 className="fw-bold text-success">{formatNumber(data.successfull || 0)}</h2>
              </div>
            </Col>
            <Col xs={6} md>
              <div>
                <small className="text-muted">Failed Requests</small>
                <h2 className="fw-bold text-danger">{formatNumber(data.unsuccessfull || 0)}</h2>
              </div>
            </Col>
            <Col xs={6} md>
              <div>
                <small className="text-muted">Coupon Requests</small>
                <h2 className="fw-bold text-info">{data.coupon_match_count || 0}</h2>
              </div>
            </Col>
            <Col xs={6} md>
              <div>
                <small className="text-muted">Benefits Requests</small>
                <h2 className="fw-bold text-info">{data.benefits_match_count || 0}</h2>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Row className="mt-4">
        <Col xl={9} className="mb-4">
          <Card className="p-3 shadow-sm rounded-3">
            <Card.Title className="mb-4">Ratios</Card.Title>
            <Row>
              {/* 1️⃣ Success Ratio */}
              <Col xl={4} lg={4} md={6} sm={12} className="mb-4">
                <GaugeComponent
                  className="p-0"
                  type="grafana"
                  arc={{
                    subArcs: [
                      { limit: 50, color: '#FF4D4D' },
                      { limit: 80, color: '#FFA500' },
                      { limit: 100, color: '#4CAF50' }
                    ],
                    width: 0.25,
                    padding: 0.02,
                    cornerRadius: 5
                  }}
                  labels={{
                    valueLabel: { hide: false, style: { fontSize: '23px', fill: '#000000' } },
                    tickLabels: {
                      hide: true,
                      ticks: [
                        { value: 0, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                        { value: 50, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                        { value: 80, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                        { value: 100, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } }
                      ]
                    },
                    tickLines: { hide: true }
                  }}
                  // value={items?.successPercentage ? items.successPercentage : 0}
                  value={data.success_rate ? parseFloat(data.success_rate) : 0}
                  valueLabel={{
                    formatTextValue: (val) => `${val}%`,
                    style: {
                      fontSize: '15px',
                      fontWeight: 'bold',
                      fill: '#cee21dff' // 👈 use fill, not color
                    }
                  }}
                />
                <div
                  
                  style={{
                    fontSize: '25px',
                    fontWeight: '500',
                    marginTop: '8px',
                    textAlign: 'center',
                    padding: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Success Ratio
                </div>
              </Col>

              <Col xl={4} lg={4} md={6} sm={12} className="mb-4">
                <GaugeComponent
                  className="p-0"
                  type="grafana"
                  arc={{
                    subArcs: [
                      { limit: 50, color: '#0DCAF0' },
                      { limit: 80, color: '#0DCAF0' },
                      { limit: 100, color: '#0DCAF0' }
                    ],
                    width: 0.25,
                    padding: 0.02,
                    cornerRadius: 5
                  }}
                  labels={{
                    valueLabel: { hide: false, style: { fontSize: '23px', fill: '#000000' } },
                    tickLabels: {
                      hide: true,
                      ticks: [
                        { value: 0, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                        { value: 50, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                        { value: 80, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                        { value: 100, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } }
                      ]
                    },
                    tickLines: { hide: true }
                  }}
                  // value={items?.successPercentage ? items.successPercentage : 0}
                  value={data.coupon_rate ? parseFloat(data.coupon_rate) : 0}
                  valueLabel={{
                    formatTextValue: (val) => `${val}%`,
                    style: {
                      fontSize: '15px',
                      fontWeight: 'bold',
                      fill: '#cee21dff' // 👈 use fill, not color
                    }
                  }}
                />
                <div
                  style={{
                    fontSize: '25px',
                    fontWeight: '500',
                    marginTop: '8px',
                    textAlign: 'center',
                    padding: '5px'
                  }}
                >
                  Coupon Ratio
                </div>
              </Col>

              {/* 3️⃣ Benefits Ratio */}
              <Col xl={4} lg={4} md={6} sm={12} className="mb-4">
                <GaugeComponent
                  className="p-0"
                  type="grafana"
                  arc={{
                    subArcs: [
                      { limit: 50, color: '#0DCAF0' },
                      { limit: 80, color: '#0DCAF0' },
                      { limit: 100, color: '#0DCAF0' }
                    ],
                    width: 0.25,
                    padding: 0.02,
                    cornerRadius: 5
                  }}
                  labels={{
                    valueLabel: { hide: false, style: { fontSize: '23px', fill: '#000000' } },
                    tickLabels: {
                      hide: true,
                      ticks: [
                        { value: 0, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                        { value: 50, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                        { value: 80, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                        { value: 100, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } }
                      ]
                    },
                    tickLines: { hide: true }
                  }}
                  // value={items?.successPercentage ? items.successPercentage : 0}
                  value={data.benefits_rate ? parseFloat(data.benefits_rate) : 0}
                  valueLabel={{
                    formatTextValue: (val) => `${val}%`,
                    style: {
                      fontSize: '20px',
                      fontWeight: 'bold',
                      fill: '#cee21dff' // 👈 use fill, not color
                    }
                  }}
                />
                <div
                  style={{
                    fontSize: '25px',
                    fontWeight: '500',
                    marginTop: '8px',
                    textAlign: 'center',
                    padding: '5px'
                  }}
                >
                  Benefits Ratio
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xl={3} className="mb-4">
          <Card className="p-3 shadow-sm rounded-3">
            <Card.Title className="mb-4">Avarage Response Time</Card.Title>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '6px',
                fontSize: '16px',
                fontWeight: '500',
                marginTop: '8px',
                marginRight: '10px'
              }}
            ></div>
            <GaugeComponent
              className="p-0"
              type="grafana"
              arc={{
                subArcs: [
                  { limit: 50, color: '#4CAF50' },
                  { limit: 80, color: '#FFA500' },
                  { limit: 100, color: '#FF4D4D' }
                ],
                width: 0.25,
                padding: 0.02,
                cornerRadius: 5
              }}
              labels={{
                valueLabel: { hide: false, style: { fontSize: '23px', fill: '#000000' } },
                tickLabels: {
                  hide: true,
                  ticks: [
                    { value: 0, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                    { value: 50, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                    { value: 80, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } },
                    { value: 100, valueConfig: { style: { fill: '#000000', fontSize: '10px' } } }
                  ]
                },
                tickLines: { hide: true }
              }}
              // value={items?.successPercentage ? items.successPercentage : 0}
              value={LatencyStats? parseFloat(LatencyStats.avg_latency_sec) : 0}
              valueLabel={{
                formatTextValue: (val) => `${val}%`,
                style: {
                  fontSize: '15px',
                  fontWeight: 'bold',
                  fill: '#cee21dff' // 👈 use fill, not color
                }
              }}
            />
            <div
              style={{
                fontSize: '30px',
                fontWeight: '500',
                marginTop: '8px',
                textAlign: 'center',
                padding: '5px'
              }}
            >
              Avarage Response Time
            </div>
          </Card>
        </Col>
      </Row>
      <Card className="shadow-sm border-1 rounded-3  p-1">
        <Card.Title className="mb-3 p-2">Status Vise Count</Card.Title>
        <Card.Body className="p-1">
          <Row className="text-center">
            <Col xs={2} md>
              <div>
                <small className="text-muted">200</small>
                <h2 className="fw-bold text-success">{formatNumber(data.status_200 || 0)}</h2>
              </div>
            </Col>
            <Col xs={2} md>
              <div>
                <small className="text-muted">502</small>
                <h2 className="fw-bold text-danger">{formatNumber(data.status_502 || 0)}</h2>
              </div>
            </Col>
            <Col xs={2} md>
              <div>
                <small className="text-muted">500</small>
                <h2 className="fw-bold text-danger">{formatNumber(data.status_500 || 0)}</h2>
              </div>
            </Col>
            <Col xs={2} md>
              <div>
                <small className="text-muted">400</small>
                <h2 className="fw-bold text-info">{formatNumber(data.status_400 || 0)}</h2>
              </div>
            </Col>
            <Col xs={2} md>
              <div>
                <small className="text-muted">404</small>
                <h2 className="fw-bold text-success">{formatNumber(data.status_404 || 0)}</h2>
              </div>
            </Col>
            <Col xs={2} md>
              <div>
                <small className="text-muted">401</small>
                <h2 className="fw-bold text-info">{formatNumber(data.status_401 || 0)}</h2>
              </div>
            </Col>
            <Col xs={2} md>
              <div>
                <small className="text-muted">403</small>
                <h2 className="fw-bold text-info">{formatNumber(data.status_403 || 0)}</h2>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

export default DashDefault;
