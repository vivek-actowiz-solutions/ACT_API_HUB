import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Form, Modal, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import MainCard from 'components/Card/MainCard';
import axios from 'axios';
// import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import { api } from 'views/api';
import DataTable from 'react-data-table-component';
import { Line } from 'react-chartjs-2';
import { FcSearch } from 'react-icons/fc';
import { AiOutlineClear } from 'react-icons/ai';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { format } from 'date-fns';
import Select from 'react-select';
import { tr } from 'date-fns/locale';
// import { wait } from '@testing-library/user-event/dist/types/utils';
const statusOptions = [
  { value: '200', label: '200 ' },
  { value: '404', label: '404 ' },
  { value: '408', label: '408 ' },
  { value: '401', label: '401 ' },
  { value: '429', label: '429 ' },
  { value: '400', label: '400 ' },
  { value: '502', label: '502 ' },
  { value: '504', label: '504 ' },
  { value: '500', label: '500 ' },
  { value: '422', label: '422 ' }
];
const exportOptions = [
  { value: "excel", label: "Export as Excel" },
  { value: "json", label: "Export as JSON" },
];
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, Filler);

const KeyManagement = () => {
  const navigate = useNavigate();
  const { key, id, domain } = useParams();
  const [loading, setLoading] = useState(true);
  const [logData, setLogData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [exportLoader, setExportLoader] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [dataloder, setDataloader] = useState(false);

  const fetchKeyDetails = async (filter = false) => {
    setLoading(true);
    console.log('id', id);
    try {
      const res = await axios.get(`${api}/get-logs-details/${key}`, {
        withCredentials: true,
        params: {
          id,
          domain,
          page: currentPage,
          limit: perPage,
          ...(filter && startDate && endDate && { startDate, endDate }),
          ...(statusFilter && { status: statusFilter.toLowerCase() })
        }
      });

      setLogData(res.data.logdata || []);
      // setFilteredData(res.data.logdata?.data || []);
      setChartData(res.data.logdata.chartData || []);
    } catch (err) {
      console.log(err);
      if (err.response && err.response.status === 403) {
        navigate(`/error/${err.response.status}`);
        // toast.error(err.response?.data?.message || 'Access denied');
      }
      toast.error(err.response.data.message || 'Failed to load API logs');
    } finally {
      setLoading(false);
    }
  };
  const fetchLogDetails = async (filter = false) => {
    console.log('filter', filter);
setDataloader(true);
    console.log('id', id);
    try {
      const res = await axios.get(`${api}/get-logs-data/${key}`, {
        withCredentials: true,
        params: {
          id,
          domain,
          page: currentPage,
          limit: perPage,
          ...(filter && startDate && endDate && { startDate, endDate }),
          ...(statusFilter && { status: statusFilter.toLowerCase() })
        }
      });
console.log('res', res.data.logdata?.data);
      // setLogData(res.data.logdata || []);
      setFilteredData(res.data.logdata?.data);

    } catch (err) {
      console.log(err);
      if (err.response && err.response.status === 403) {
        navigate(`/error/${err.response.status}`);
        // toast.error(err.response?.data?.message || 'Access denied');
      }
      toast.error(err.response.data.message || 'Failed to load API logs');
    }  finally {
      setDataloader(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchKeyDetails();
  }, [statusFilter]);
  useEffect(() => {
    fetchLogDetails();
  }, [currentPage ,perPage ,statusFilter])
  const truncateForExcel = (text) => {
    if (!text) return '';
    const str = text.toString();
    return str.length > 32767
      ? str.substring(0, 32767 - 3) + '...' // keep size safe
      : str;
  };

  const downloadExcel = async () => {
    toast.info('Exporting logs... please wait');
    setExportLoader(true);
    try {
      const res = await axios.get(
        `${api}/exportLogsData/${key}`,

        {
          withCredentials: true,
          params: {
            id,
            ...(startDate && endDate ? { startDate, endDate } : {})
          }
        }
      );

      const exportData = Array.isArray(res?.data?.data) ? res.data.data : [];

      if (exportData.length === 0) {
        toast.warn('No data found for export');
        return;
      }

      const formattedData = exportData.map((rest, index) => ({
        No: index + 1,
        IP: rest.ip || '',
        Params: truncateForExcel(rest.params ? JSON.stringify(rest.params) : ''),
        Request_Time: rest.request_time || '',
        Status_Code: rest.status_code ?? '',
        Key: rest.key || '',
        Response: truncateForExcel(rest.response ? JSON.stringify(rest.response) : '')
      }));

      // Create sheet & workbook
      const worksheet = XLSX.utils.json_to_sheet(formattedData, { skipHeader: false });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Log List');

      // Auto-adjust column width
      const columnWidths = Object.keys(formattedData[0]).map((key) => ({
        wch: Math.max(key.length, ...formattedData.map((row) => (row[key] ? row[key].toString().length : 0))) + 2
      }));
      worksheet['!cols'] = columnWidths;

      // Save file
      XLSX.writeFile(workbook, `log_list_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast.success('Export successful');
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.response?.data?.message || 'Export failed. Please try again.');
    } finally {
      setExportLoader(false);
    }
  };
  const downloadJSON = async () => {
    toast.info('Exporting logs... please wait');
    setExportLoader(true);
    try {
      const res = await axios.get(`${api}/exportLogsData/${key}`, {
        withCredentials: true,
        params: {
          id,
          ...(startDate && endDate && { startDate, endDate })
        }
      });
      const exportData = res.data.data || [];
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      saveAs(blob, 'api_list.json');
      toast.success('Export successful');
    } catch (err) {
      toast.error('export failed');
    } finally {
      setExportLoader(false);
    }
  };
  const handleFilter = () => {
    if (!startDate || !endDate) {
      toast.warning('Please select both start and end dates');
      return;
    }
    fetchKeyDetails(true);
    fetchLogDetails(true);

  };

  const handleViewResponse = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleclearFilter = () => {
    setEndDate(null);
    setStartDate(null);
    setStatusFilter(null);

    fetchKeyDetails();
  };

  const columns = [
    {
      name: 'Request Time',
      selector: (row) => row.request_time,
      sortable: true
    },
    {
      name: 'Status',
      selector: (row) => row.status_code,
      sortable: true
    },
    {
      name: 'Execution Time',
      selector: (row) => `${String(Math.round(row.execution_time * 1000 || 0)).padStart(4)} ms`,
      sortable: true
    },
    {
      name: 'Message',
      selector: (row) => row.message,
      wrap: true
    },
    {
      name: 'Response',
      cell: (row) => (
        <Button size="sm" variant="info" onClick={() => handleViewResponse(row)}>
          View
        </Button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    }
  ];

  const lineChartData = {
    labels: chartData.map((item) => item.interval),
    datasets: [
      {
        label: 'Total',
        data: chartData.map((item) => item.total),
        borderColor: 'rgba(0, 123, 255, 1)', // Blue
        backgroundColor: 'rgba(255, 255, 255, 0)',
        fill: true,
        tension: 0.3,
        pointRadius: 3
      },
      {
        label: 'Success',
        data: chartData.map((item) => item.success),
        borderColor: 'rgba(40, 167, 69, 1)', // Green
        backgroundColor: 'rgba(255, 255, 255, 0)',
        fill: true,
        tension: 0.3,
        pointRadius: 3
      },
      {
        label: 'Failure',
        data: chartData.map((item) => item.failure),
        borderColor: 'rgba(220, 53, 69, 1)', // Red
        backgroundColor: 'rgba(255, 255, 255, 0)',
        fill: true,
        tension: 0.3,
        pointRadius: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    // maintainAspectRatio: false,
    plugins: {
      ticks: {
        color: '#a9b7d0'
      },
      title: {
        color: '#a9b7d0'
      },
      legend: {
        display: true,
        labels: {
          color: '#434953ff' // legend text color
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: '#434953ff'
        },
        grid: {
          display: false
        },
        title: {
          display: true,
          text: ' Number of Requests',
          color: '#434953ff',
          font: {
            size: 18,
            family: 'Times New Roman'
          }
        }
      },
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
          color: '#434953ff'
        },
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Date',
          color: '#434953ff',
          font: {
            size: 18,
            family: 'Times New Roman'
          }
        }
      }
    },
    layout: {
      padding: 10
    }
  };
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
        <Col>
          <MainCard
            title={
              <>
                <span className="fw-bold ">{key}</span> Key Logs
              </>
            }
          >
            {loading ? (
              <div className="text-center my-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <>
                <Row className="mb-3">
                  <Col md={5} xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Row className="g-2">
                        <Col xs={6}>
                          <label className="form-label d-block mb-1">Start Date Time</label>
                          <DateTimePicker
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            format="dd/MM/yyyy hh:mm a" // controls how selected value is displayed
                            slotProps={{
                              textField: {
                                placeholder: 'DD/MM/YYYY HH:MM AM/PM',
                                size: 'small',
                                fullWidth: true,
                                sx: {
                                  minHeight: '40px',
                                  borderRadius: '5px'
                                }
                              }
                            }}
                          />
                        </Col>
                        <Col xs={6}>
                          <label className="form-label d-block mb-1">End Date Time</label>
                          <DateTimePicker
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
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
                    {/* <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </Form.Group> */}
                  </Col>
                  <Col md={5} className="d-flex align-items-end mb-0">
                    <Select
                      isClearable={true} // allows clearing the selection
                      value={statusOptions.find((option) => option.value === statusFilter) || null}
                      onChange={(selectedOption) => setStatusFilter(selectedOption ? selectedOption.value : '')}
                      options={statusOptions}
                      placeholder="Filter by Status"
                    />
                    <Button variant="outline-dark mb-0 ms-3" onClick={handleFilter} style={{ borderColor: '#D9D9D9' }}>
                      <FcSearch /> Search
                    </Button>
                    <Button variant="outline-dark mb-0 ms-2" onClick={handleclearFilter} style={{ borderColor: '#D9D9D9' }}>
                      <AiOutlineClear /> Clear
                    </Button>
                  </Col>
                  <Col md={2} className="d-flex justify-content-end mt-4 mb-0">
                    <Select
                      isClearable={false} 
                      isLoading={exportLoader} 
                      placeholder="Export"
                      options={exportOptions}
                      onChange={(selectedOption) => {
                        if (!selectedOption) return;
                        if (selectedOption.value === 'excel') {
                          downloadExcel();
                        } else if (selectedOption.value === 'json') {
                          downloadJSON();
                        }
                      }}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderColor: '#D9D9D9', // border color
                          minWidth: 150,
                          cursor: 'pointer'
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: '#000'
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isFocused ? '#f0f0f0' : '#fff',
                          color: '#000',
                          cursor: 'pointer'
                        })
                      }}
                    />
                  </Col>
                  <Row className="mt-4">
                    <Col xs={12} sm={6} md={6} xl={4}>
                      <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h7 className="mb-0 text-muted">Total log</h7>
                            <h6 className="mb-0 text-primary">{logData.totalDocs || 0}</h6>
                          </div>
                          <div className="progress mt-3" style={{ height: '7px', backgroundColor: '#f0f0f0' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${logData.totalDocs || 44}%`, backgroundColor: '#0D6EFD' }}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 " style={{ color: '#ffffffff' }}>
                              0
                            </h6>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Repeat for 3 more cards */}
                    <Col xs={12} sm={6} md={6} xl={4}>
                      <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h7 className="mb-0 text-muted">Success log</h7>
                            <h6 className="mb-0 text-success">{logData.successCount || 0}</h6>
                          </div>
                          <div className="progress mt-3" style={{ height: '7px', backgroundColor: '#f0f0f0' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${logData.successPercentage || 44}%`, backgroundColor: '#198754' }}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 text-success">{logData.successPercentage > 0 ? logData.successPercentage : 0}%</h6>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col xs={12} sm={6} md={6} xl={4}>
                      <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h7 className="mb-0 text-muted">Failure log</h7>
                            <h6 className="mb-0 text-danger">{logData.failureCount > 0 ? logData.failureCount : 0}</h6>
                          </div>
                          <div className="progress mt-3" style={{ height: '7px', backgroundColor: '#f0f0f0' }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${logData.failurePercentage || 0}%`, backgroundColor: '#e91d1dff' }}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 text-danger">{logData.failurePercentage > 0 ? logData.failurePercentage : 0}%</h6>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Row>
                {chartData.length > 0 && (
                  <div
                    className="mb-4 p-3 bg-light rounded shadow-sm"
                    style={{ minHeight: '300px', backgroundColor: '#f3f6fa', overflowX: 'auto' }}
                  >
                    <div
                      style={{
                        minWidth: '700px', // You can increase this if needed
                        height: '400px',
                        position: 'relative'
                      }}
                    >
                      <Line data={lineChartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
                    </div>
                  </div>
                )}
                {dataloder ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (

                  <><DataTable
                  columns={columns}
                  data={filteredData}
                  pagination
                  paginationServer
                  paginationTotalRows={logData.totalDocs || 0}
                  paginationDefaultPage={currentPage}
                  paginationPerPage={perPage}
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  highlightOnHover
                  striped
                  responsive
                  persistTableHead
                />
                  </>
                )}
                
              </>
            )}
          </MainCard>
        </Col>
      </Row>

      {/* Modal for Full Response */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>API Response Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && <pre className="bg-light p-3 rounded">{JSON.stringify(selectedLog.response, null, 2)}</pre>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default KeyManagement;
