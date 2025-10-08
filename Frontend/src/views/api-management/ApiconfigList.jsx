import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Modal, Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { FaGithub } from 'react-icons/fa6';
import { IoMdPersonAdd } from 'react-icons/io';
// import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { api } from 'views/api';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();
const ApiconfigrationList = () => {
  const navigate = useNavigate();
  const [apiList, setApiList] = useState([]);
  const [permission, setPermission] = useState([]);
  console.log('permission', permission);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState([]);
  const [editData, setEditData] = useState({});
  useEffect(() => {
    getApiList(currentPage, perPage, search);
  }, [currentPage, perPage, search]);

  const fetchcustomerData = async (inputValue) => {
    try {
      const res = await axios.get(`${api}/customer-by-search`, {
        withCredentials: true
      });
      console.log('res1222222222', res.data.data);

      if (res.status == 200) {
        setOptions(
          res.data?.data?.map((item) => ({
            value: item._id,
            label: item.name
          })) || []
        );
      }
      return (
        res.data?.data?.map((item) => ({
          value: item._id,
          label: item.apiName
        })) || []
      );
    } catch (err) {
      console.error('Error fetching data:', err);
      return [];
    }
  };
  useEffect(() => {
    fetchcustomerData();
  }, []);

  const getApiList = async (page = 1, limit = 10, keyword = '') => {
    try {
      const res = await axios.get(`${api}/getapilist?page=${page}&limit=${limit}&search=${keyword}`, { withCredentials: true });
      console.log('res', res);

      setApiList(res.data.data);
      setPermission(res.data.permission);
      console.log('+++++++++', permission);
      setTotalRows(res.data.total);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        navigate(`/error/${err.response.status}`);
        toast.error(err.response?.data?.message || 'Access denied');
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch API list');
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    getApiList(1, perPage, search);
  };

  const downloadExcel = async () => {
    toast.info('waiting for export');
    try {
      const res = await axios.get(`${api}/getApiListExportData?search=${search}`, { withCredentials: true });
      const formattedData = res.data.data.map((rest, index) => ({
        No: index + 1,
        domainName: rest.domainName,
        categoryName: rest.categoryName,
        platfrom: rest.applicationType,
        type: rest.type,
        subType: rest.subType,
        region: rest.country,
        apiName: rest.apiName,
        status: rest.status,
        method: rest.method,
        apiEndpoint: rest.apiEndpoint,

        payload: rest.payload ? JSON.stringify(rest.payload) : ''
      }));
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'API List');
      XLSX.writeFile(workbook, 'api_list.xlsx');
      toast.success('export successful');
    } catch (err) {
      toast.error('export failed');
    }
  };

  // const downloadPDF = () => {
  //   const doc = new jsPDF();
  //   autoTable(doc, {
  //     head: [['API Name', 'Domain', 'Category', 'Type', 'Method', 'Endpoint']],
  //     body: apiList.map((item) => [item.apiName, item.domainName, item.categoryName, item.type, item.method, item.apiEndpoint])
  //   });
  //   doc.save('api_list.pdf');
  // };

  const downloadJSON = async () => {
    toast.info('waiting for export');
    try {
      const res = await axios.get(`${api}/getApiListExportData?search=${search}`, { withCredentials: true });
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      saveAs(blob, 'api_list.json');
      toast.success('export successful');
    } catch (err) {
      toast.error('export failed');
    }
  };

  const handleClick = async () => {
    // const payload = {
    //   apiName: "testdoc",
    //   apiKey: "N007xxxxx",
    //   apiParams: "{ pid:466997853 }",
    //   apiMethod: "GET",
    //   apiEndpoint: "http://example.com/api",
    //   apiCurl: "curl http://example.com/api?key=123",
    //   apiResponse: "{ success: true, data: [...] }",
    // };

    const res = await axios.get(`${api}/generate-doc`, {
      responseType: 'blob'
    });

    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testdoc_Guide_${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const handleStatusChange = async () => {
    if (!selectedAPI) return;
    try {
      const updatedStatus = !selectedAPI.status;

      await axios.put(
        `${api}/apistatusupdate/${selectedAPI._id}`,
        {
          status: updatedStatus
        },
        { withCredentials: true }
      );

      toast.success(`Status updated to ${updatedStatus ? 'Active' : 'Inactive'}`);
      getApiList(currentPage, perPage, search); // Refresh list
      setShowStatusModal(false);
    } catch (error) {
      toast.error('Failed to update status');
      setShowStatusModal(false);
    }
  };
  const handleAddCustomerToAPI = async () => {
    console.log('handleAddCustomerToAPI', selected);
    if (!selected) {
      toast.error('Please select a customer first!');
      return;
    }
    try {
      const payload = selected.map((item) => ({
        customerId: item.value, // id
        customerName: item.label // name
      }));

      console.log('payload', payload);

      const res = await axios.put(`${api}/add-customer-to-api/${selectedAPI._id}`, payload, { withCredentials: true });
      console.log('res', res);
      if (res.status == 200) {
        toast.success('Customer added successfully');
        setShowAddCustomModal(false);
        getApiList(currentPage, perPage, search);
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  const columns = [
    {
      name: 'No.',
      selector: (row, index) => index + 1 + (currentPage - 1) * perPage,
      width: '60px'
    },
    { name: 'Domain', selector: (row) => row.domainName, width: '100px' },
    { name: 'Category', selector: (row) => row.categoryName },
    { name: 'Platform', selector: (row) => row.applicationType },
    { name: 'Type', selector: (row) => row.type },
    { name: 'SubType', selector: (row) => row.subType },
    { name: 'Region', selector: (row) => row.country, width: '100px' },
    {
      name: 'Platform',
      selector: (row) => row.apiName,
      grow: 3,
      cell: (row) => (
        <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-platform-${row.key}`}>{row.apiName || 'N/A'}</Tooltip>}>
          <span
            style={{
              display: 'inline-block',
              maxWidth: '150px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }}
          >
            {row.apiName || 'N/A'}
          </span>
        </OverlayTrigger>
      )
    },

    // { name: 'Method', selector: (row) => row.method, sortable: true },
    {
      name: 'Status',
      width: '120px',
      cell: (row) => (
        <>
          {permission[0]?.action?.includes('Update') ? (
            <Button
              size="sm"
              variant={row.status ? 'success' : 'danger'}
              onClick={() => {
                setSelectedAPI(row);
                setShowStatusModal(true);
              }}
            >
              {row.status ? 'Active' : 'Inactive'}
            </Button>
          ) : (
            <Button size="sm" variant={row.status ? 'success' : 'danger'}>
              {row.status ? 'Active' : 'Inactive'}
            </Button>
          )}
        </>
      )
    },
    {
      name: 'Action',
      cell: (row) => (
        <>
          {/* <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-${row._id}`}>View</Tooltip>}>
                      <span>
                        <FaEye onClick={() => navigate(`/api-detail/${row._id}`)} style={{ cursor: 'pointer', color: 'green' }} size={20} />
                      </span>
                    </OverlayTrigger>
             <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-${row._id}`}>
              GitHub 
             </Tooltip>}>
                      <span>
                        <FaGithub onClick={() => navigate(`/api-detail/${row._id}`)} style={{ cursor: 'pointer', color: 'black' }} size={20} />
                      </span>
                    </OverlayTrigger> */}
          {/* <Button variant="outline-dark" size="sm" onClick={() => navigate(`/api-detail/${row._id}`)} className="me-2">
            View
          </Button> */}
          {/* <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              setEditData(row);
              setShowEditModal(true);
            }}
          >
            Edit
          </Button> */}
          <div className="d-flex align-items-center gap-3">
            {permission[0]?.action?.includes('View') && (
              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-${row._id}`}>View</Tooltip>}>
                <span>
                  <FaEye onClick={() => navigate(`/api-detail/${row._id}`)} style={{ cursor: 'pointer', color: 'green' }} size={20} />
                </span>
              </OverlayTrigger>
            )}
            {permission[0]?.action?.includes('View') && (
              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-${row._id}`}>Add Customers</Tooltip>}>
                <span>
                  <IoMdPersonAdd
                    onClick={() => {
                      setSelectedAPI(row); // ✅ set the API object
                      setSelected(
      row.customers?.map(c => ({
        value: c.customerId,
        label: c.customerName
      })) || []
    ); // pre-select already assigned customers
                      setShowAddCustomModal(true); // ✅ open modal
                    }}
                    style={{ cursor: 'pointer', color: 'green' }}
                    size={20}
                  />
                </span>
              </OverlayTrigger>
            )}
            {permission[0]?.action?.includes('View_code') && (
              <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-github-${row._id}`}>GitHub</Tooltip>}>
                <span>
                  <FaGithub
                    onClick={() => window.open(row.github_link, '_blank')}
                    style={{ cursor: 'pointer', color: 'black' }}
                    size={20}
                  />
                </span>
              </OverlayTrigger>
            )}

            {permission[0]?.action?.includes('Generate_Doc') && <button onClick={handleClick}>Generate User Guide</button>}
          </div>
        </>
      ),
      width: '150px'
    }
  ];
  document.title = 'API configuration list';
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
        <Col>
          <Card title="API Configuration List">
            <Row className="align-items-center mb-3">
              <Col md={6}>
                <Form onSubmit={handleSearch} className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Search by API Name or Domain..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="me-2"
                  />
                </Form>
              </Col>

              <Col md={6} className="d-flex justify-content-end  gap-2">
                {permission[0]?.action.includes('Export') && (
                  <DropdownButton id="export-dropdown" title="Export" variant="outline-dark">
                    <Dropdown.Item as="button" onClick={downloadExcel}>
                      Export as Excel
                    </Dropdown.Item>
                    <Dropdown.Item as="button" onClick={downloadJSON}>
                      Export as JSON
                    </Dropdown.Item>
                  </DropdownButton>
                )}
                {permission[0]?.action.includes('Create') && (
                  <Button variant="dark" onClick={() => navigate('/api-integration')}>
                    + Add API
                  </Button>
                )}
              </Col>
            </Row>
            <DataTable
              columns={columns}
              data={apiList}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              responsive
              striped
              highlightOnHover
              noHeader
            />
          </Card>
        </Col>
      </Row>
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header>
          <Modal.Title>Confirm Status Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to change the status of <strong>{selectedAPI?.apiName}</strong> from{' '}
          <strong>{selectedAPI?.status ? 'Active' : 'Inactive'}</strong> to <strong>{selectedAPI?.status ? 'Inactive' : 'Active'}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusChange}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit API Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>API Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editData.apiName || ''}
                    onChange={(e) => setEditData({ ...editData, apiName: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Domain</Form.Label>
                  <Form.Control
                    type="text"
                    value={editData.domainName || ''}
                    onChange={(e) => setEditData({ ...editData, domainName: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Add more fields like categoryName, method, type, etc., in the same way */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                await axios.put(`${api}/updateapi/${editData._id}`, editData, { withCredentials: true });
                toast.success('API updated successfully');
                getApiList(currentPage, perPage, search); // refresh
                setShowEditModal(false);
              } catch (err) {
                toast.error('Failed to update API');
              }
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAddCustomModal} onHide={() => setShowAddCustomModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit API Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12}>
                <label className="form-label d-block mb-1">Search customers</label>
                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  loadOptions={fetchcustomerData}
                  // onInputChange={(input) => {
                  //   fetchSearchData(input).then((data) => setOptions(data));
                  // }}
                  options={options}
                  value={selected}
                  onChange={(selectedItems) => setSelected(selectedItems)}
                  placeholder="Search customers..."
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
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCustomModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCustomerToAPI}>
            Add Customer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApiconfigrationList;
