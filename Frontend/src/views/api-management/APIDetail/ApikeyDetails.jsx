import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Table, Form, Modal, Spinner, OverlayTrigger, Tooltip, Accordion } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye, FaHistory, FaCopy } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCopy } from 'react-icons/ai';
import { FaTrashArrowUp } from 'react-icons/fa6';
import DataTable from 'react-data-table-component';
import MainCard from '../../../components/Card/MainCard';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { api } from 'views/api';
const animatedComponents = makeAnimated();

const ApikeyDetails = ({ id }) => {
  const navigate = useNavigate();
  const [permission, setPermission] = useState([]);
  console.log('permission', permission);
  const [keys, setKeys] = useState([]);
  const [keyshistory, setKeyshistory] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchhistoryInput, setSearchhistoryInput] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [searchKeyhistory, setSearchKeyhistory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPagehistory, setCurrentPagehistory] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rowsPerPagehistory, setRowsPerPagehistory] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [totalRowshistory, setTotalRowshistory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyloading, setkeyLoading] = useState(false);
  const [keyhistoryloading, setkeyhistoryLoading] = useState(false);
  const [addbtnloading, setaddbtnLoading] = useState(false);
  const [updatebtnloading, setupdatebtnLoading] = useState(false);
  const [deletebtntnloading, setdeletebtnLoading] = useState(false);
  const [permanentdeletebtntnloading, setPermanentdeletebtnLoading] = useState(false);
  const [restorebtntnloading, setrestorebtnLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showpermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [editForm, setEditForm] = useState({ limit: '', status: true });
  const [addForm, setAddForm] = useState({ name: '', key: '', limit: '', status: true });
  const [errors, setErrors] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLogsloading, setHistoryLogsLoading] = useState(false);
  const [selected, setSelected] = useState([]);
    const [apiDetails, setApiDetails] = useState(null);
  console.log('selected', selected);
  const [options, setOptions] = useState([]);
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchKey(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchInput]);
  useEffect(() => {
    // fetchAPIDetails();
    fetchAPIkeyList();
  }, [id, currentPage, rowsPerPage]);
  useEffect(() => {
    fetchAPIkeyhistoryList();
  }, [id, currentPagehistory, rowsPerPagehistory, searchhistoryInput]);
    useEffect(() => {
      fetchcustomerData();
    }, []);
      useEffect(() => {
    fetchAPIDetails();
    // fetchAPIkeyList();
  }, [id]);
    const fetchAPIDetails = async () => {
    console.log('fetchAPIDetails');
    setLoading(true);
    // settestLoading(true);
    try {
      const res = await axios.get(`${api}/getAPIDetailsById/${id}`, {
        withCredentials: true,
        params: { page: currentPage, limit: rowsPerPage, search: searchKey }
      });
      setApiDetails(res.data.data);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        navigate(`/error/${err.response.status}`);
        // toast.error(err.response?.data?.message || 'Access denied');
      }
      toast.error('Failed to fetch API details');
    } finally {
      setLoading(false);
    }
  };
  const fetchcustomerData = async (inputValue) => {
    try {
      const res = await axios.get(`${api}/customer-by-search`, {
        withCredentials: true
      });

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
  const fetchAPIkeyList = async () => {
    setkeyLoading(true);
    try {
      const res = await axios.get(`${api}/get-apikey-List/${id}`, {
        withCredentials: true,
        params: { page: currentPagehistory, limit: rowsPerPagehistory, search: searchKey }
      });
    
      setKeys(res.data.keyData.docs);
    setPermission(res.data.permission);
      setTotalRows(res.data.keyData.totalDocs);
    } catch (err) {
      toast.error('Failed to fetch API details');
    } finally {
      setkeyLoading(false);
    }
  };
  const fetchAPIkeyhistoryList = async () => {
    // console.log('fetchAPIkeyhistoryList');
    setkeyhistoryLoading(true);
    try {
      const res = await axios.get(
        `${api}/get-apikey-history-List/${id}`,
        { withCredentials: true },
        {
          params: { page: currentPagehistory, limit: rowsPerPagehistory, search: searchhistoryInput }
        }
      );
     
      setKeyshistory(res.data.keyData.docs);
      setTotalRowshistory(res.data.keyData.totalDocs);
    } catch (err) {
      toast.error('Failed to fetch API details');
    } finally {
      setkeyhistoryLoading(false);
    }
  };
  const handleViewHistory = async (row) => {
    try {
      setHistoryLogsLoading(true);
      setSelectedKey(row);
      setShowHistory(true);
      const res = await axios.get(`${api}/Key-logs/${row._id}`, { withCredentials: true });
      setHistoryLogs(res.data.keyLogs || []);
    } catch (err) {
      console.error('Error fetching key logs', err);
    } finally {
      setHistoryLogsLoading(false);
    }
  };
  const validateForm = () => {
    let newErrors = {};

    if (!addForm.key.trim()) {
      newErrors.key = 'Key is required';
    }
    if (!addForm.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (addForm.limit === '' || addForm.limit < 1) {
      newErrors.limit = 'Limit must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddKey = async () => {
    if (validateForm()) {
      setaddbtnLoading(true);
      try {
        const res = await axios.post(
          `${api}/addkey`,

          {
            API_id: id,
            name: addForm.name,
            key: addForm.key,
            limit: addForm.limit,
            status: addForm.status
          },
          { withCredentials: true }
        );
        if (res.status === 201) {
          toast.success('Key added successfully');
          setShowAddModal(false);
          setAddForm({ name: '', key: '', limit: '', status: true });
          setSelected([]);
          fetchAPIkeyList();
        }
      } catch (err) {
        toast.error(err?.response?.data?.message);
      } finally {
        setaddbtnLoading(false);
      }
    }
  };

  // Edit key
  const handleEdit = (row) => {
    setSelectedKey(row);
    setEditForm({ limit: row.limit, status: row.status });
    setShowEditModal(true);
  };

  // Delete key
  const handleDelete = (row) => {
    setSelectedKey(row);
    setShowDeleteModal(true);
  };
  const handleparmanentDelete = (row) => {
    setSelectedKey(row);
    setShowPermanentDeleteModal(true);
  };
  const handleRestore = (row) => {
    setSelectedKey(row);
    setShowRestoreModal(true);
  };

  const handleUpdateKey = async () => {
    setupdatebtnLoading(true);
    if (editForm.limit < selectedKey.usage) {
      setShowEditModal(false);
      setupdatebtnLoading(false);
      toast.error('Limit cannot be less than the usege');
      return;
    }

    try {
      const res = await axios.put(
        `${api}/updatekey/${selectedKey._id}`,
        {
          API_id: id,
          limit: editForm.limit,
          status: editForm.status
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.success(res.data.message || 'Key updated successfully');
        setShowEditModal(false);
        fetchAPIkeyList();
      }
    } catch (err) {
      toast.error(err.response.data.message || 'Failed to update key');
    } finally {
      setupdatebtnLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setdeletebtnLoading(true);
    try {
      const res = await axios.post(`${api}/Delete-key/${selectedKey._id}`, { API_id: id }, { withCredentials: true });
      if (res.status === 200) {
        toast.success(res.data.message || 'Key deleted successfully');
        setShowDeleteModal(false);
        fetchAPIkeyList();
        fetchAPIkeyhistoryList();
      }
    } catch (err) {
      toast.error(err.response.data.message || 'Failed to delete key');
    } finally {
      setdeletebtnLoading(false);
    }
  };
  const handleConfirmpermanentDelete = async () => {
    setPermanentdeletebtnLoading(true);
    try {
      const res = await axios.post(`${api}/permanent-Delete-key/${selectedKey._id}`, { API_id: id }, { withCredentials: true });
      if (res.status === 200) {
        toast.success(res.data.message || 'Key deleted successfully');
        setShowPermanentDeleteModal(false);
        fetchAPIkeyList();
        fetchAPIkeyhistoryList();
      }
    } catch (err) {
      toast.error(err.response.data.message || 'Failed to delete key');
    } finally {
      setPermanentdeletebtnLoading(false);
    }
  };
  const handleConfirmRestore = async () => {
    setrestorebtnLoading(true);
    try {
      const res = await axios.post(`${api}/Restore-key/${selectedKey._id}`, { API_id: id }, { withCredentials: true });
      if (res.status === 200) {
        toast.success(res.data.message || 'Key restored successfully');
        setShowRestoreModal(false);
        fetchAPIkeyList();
        fetchAPIkeyhistoryList();
      }
    } catch (err) {
      toast.error(err.response.data.message || 'Failed to delete key');
    } finally {
      setrestorebtnLoading(false);
    }
  };
  const columns = [
    {
      name: 'No.',
      selector: (row, index) => index + 1 + (currentPage - 1) * rowsPerPage,
      width: '70px'
    },
    {
      name: 'API Key',
      cell: (row) => {
        const [showKey, setShowKey] = React.useState(false);

        const handleCopy = async () => {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(row.key);
            } else {
              const textarea = document.createElement('textarea');
              textarea.value = row.key;
              textarea.style.position = 'fixed';
              document.body.appendChild(textarea);
              textarea.focus();
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
            }
            toast.success('Copied to clipboard!');
          } catch (err) {
            console.error('Failed to copy:', err);
            toast.error('Copy failed!');
          }
        };

        // ✅ Masking logic (always fixed: 8 dots + last 4 chars)
        const maskedKey = row.key ? `••••••••${row.key.slice(-4)}` : '';

        return (
          <div className="d-flex align-items-center gap-2">
            {/* API Key (masked/unmasked) */}
            <span style={{ fontFamily: 'monospace' }}>{showKey ? row.key : maskedKey}</span>

            {/* Show/Hide Icon */}
            {/* <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{showKey ? "Hide Key" : "Show Key"}</Tooltip>}
        > */}
            <span onClick={() => setShowKey(!showKey)} style={{ cursor: 'pointer', fontSize: '18px' }}>
              {showKey ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
            {/* </OverlayTrigger> */}

            {/* Copy Icon */}
            {/* <OverlayTrigger placement="top" overlay={<Tooltip>Copy Key</Tooltip>}> */}
            <span onClick={handleCopy} style={{ cursor: 'pointer', fontSize: '18px' }}>
              <AiOutlineCopy />
            </span>
            {/* </OverlayTrigger> */}
          </div>
        );
      }
    },
    { name: 'Client Name', selector: (row) => row.name },
    { name: 'Usage', selector: (row) => row.usage },
    { name: 'Limit', selector: (row) => row.limit },
    {
      name: 'Status',
      selector: (row) => row.status,
      cell: (row) => (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            fontWeight: 'bold',
            color: row.status ? '#155724' : '#721c24',
            backgroundColor: row.status ? '#d4edda' : '#f8d7da'
          }}
        >
          {row.status ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];
  if (
    permission[0]?.action?.includes('View_Logs') ||
    permission[0]?.action?.includes('Update_Key') ||
    permission[0]?.action?.includes('Delete_Key')
  ) {
    columns.push({
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-3">
          {permission[0]?.action?.includes('View_Logs') && (
            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-view-${row.key}`}>View</Tooltip>}>
              <span>
                <FaEye
                  onClick={() => navigate(`/api-detail/${id}/key-detail/${row.key}/${apiDetails.domainName}`)}
                  style={{ cursor: 'pointer', color: 'green' }}
                />
              </span>
            </OverlayTrigger>
          )}

          {permission[0]?.action?.includes('Update_Key') && (
            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-edit-${row.key}`}>Edit</Tooltip>}>
              <span>
                <FaEdit onClick={() => handleEdit(row)} style={{ cursor: 'pointer', color: 'blue' }} />
              </span>
            </OverlayTrigger>
          )}

          {permission[0]?.action?.includes('Delete_Key') && (
            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-delete-${row.key}`}>Delete</Tooltip>}>
              <span>
                <FaTrash onClick={() => handleDelete(row)} style={{ cursor: 'pointer', color: 'red' }} />
              </span>
            </OverlayTrigger>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    });
  }

  const columnshistory = [
    {
      name: 'No.',
      selector: (row, index) => index + 1 + (currentPage - 1) * rowsPerPage,
      width: '70px'
    },
    {
      name: 'API Key',
      cell: (row) => {
        const [showKey, setShowKey] = React.useState(false);

        const handleCopy = async () => {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(row.key);
            } else {
              const textarea = document.createElement('textarea');
              textarea.value = row.key;
              textarea.style.position = 'fixed';
              document.body.appendChild(textarea);
              textarea.focus();
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
            }
            toast.success('Copied to clipboard!');
          } catch (err) {
            console.error('Failed to copy:', err);
            toast.error('Copy failed!');
          }
        };

        // ✅ Masking logic (always fixed: 8 dots + last 4 chars)
        const maskedKey = row.key ? `••••••••${row.key.slice(-4)}` : '';

        return (
          <div className="d-flex align-items-center gap-2">
            {/* API Key (masked/unmasked) */}
            <span style={{ fontFamily: 'monospace' }}>{showKey ? row.key : maskedKey}</span>

            {/* Show/Hide Icon */}
            <OverlayTrigger placement="top" overlay={<Tooltip>{showKey ? 'Hide Key' : 'Show Key'}</Tooltip>}>
              <span onClick={() => setShowKey(!showKey)} style={{ cursor: 'pointer', fontSize: '18px' }}>
                {showKey ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </OverlayTrigger>

            {/* Copy Icon */}
            <OverlayTrigger placement="top" overlay={<Tooltip>Copy Key</Tooltip>}>
              <span onClick={handleCopy} style={{ cursor: 'pointer', fontSize: '18px' }}>
                <AiOutlineCopy />
              </span>
            </OverlayTrigger>
          </div>
        );
      }
    },

    { name: 'Client Name', selector: (row) => row.name },
    { name: 'Usage', selector: (row) => row.usage },
    { name: 'Limit', selector: (row) => row.limit },
    {
      name: 'Status',
      selector: (row) => row.status,
      cell: (row) => (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            fontWeight: 'bold',
            color: row.status ? '#155724' : '#721c24',
            backgroundColor: row.status ? '#d4edda' : '#f8d7da'
          }}
        >
          {row.status ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];
  if (permission[0]?.action?.includes('Restore_Key') || permission[0]?.action?.includes('History_Key')) {
    columnshistory.push({
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-3">
          {permission[0]?.action?.includes('Restore_Key') && (
            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-delete-${row.key}`}>Restore</Tooltip>}>
              <span>
                <FaTrashArrowUp onClick={() => handleRestore(row)} style={{ cursor: 'pointer', color: 'red' }} />
              </span>
            </OverlayTrigger>
          )}
          {permission[0]?.action?.includes('History_Key') && (
            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-history-${row._id}`}>View History</Tooltip>}>
              <span>
                <FaHistory onClick={() => handleViewHistory(row)} style={{ cursor: 'pointer', color: 'blue' }} />
              </span>
            </OverlayTrigger>
          )}
          {permission[0]?.action?.includes('Delete_Key') && (
            <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-delete-${row.key}`}>Delete</Tooltip>}>
              <span>
                <FaTrash onClick={() => handleparmanentDelete(row)} style={{ cursor: 'pointer', color: 'red' }} />
              </span>
            </OverlayTrigger>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true
    });
  }
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
          <Col md={12}>
            <MainCard className="p-4 shadow-sm border-0 rounded-3" title="API Keys">
              <Row className="align-items-center mb-3">
                <Col md={6} className="mb-2">
                  <Form.Control
                    type="text"
                    placeholder="Search by key..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </Col>
                {permission[0]?.action.includes('Add_Key') && (
                  <Col md={6} className="text-end">
                    <Button variant="dark" onClick={() => setShowAddModal(true)} disabled={apiDetails?.status ? false : true}>
                      + Add Key
                    </Button>
                  </Col>
                )}
              </Row>
              {keyloading ? (
                <div className="text-center my-5">
                  <Spinner animation="border" variant="primary" />
                  <div className="mt-2">Loading...</div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <DataTable
                      columns={columns}
                      data={Array.isArray(keys) ? keys : []}
                      pagination
                      paginationServer
                      paginationTotalRows={totalRows}
                      onChangePage={setCurrentPage}
                      onChangeRowsPerPage={(perPage, page) => {
                        setRowsPerPage(perPage);
                        setCurrentPage(page);
                      }}
                      highlightOnHover
                      striped
                      responsive
                      noHeader
                    />
                  </div>
                </>
              )}
            </MainCard>
          </Col>
          <Col md={12}>
            {(permission[0]?.action.includes('Restore_Key') || permission[0]?.action.includes('History_Key')) && (
              <MainCard className="p-4 shadow-sm border-0 rounded-3" title="API Keys History">
                <Row className="align-items-center mb-3">
                  <Col md={6} className="mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Search by key..."
                      value={searchhistoryInput}
                      onChange={(e) => setSearchhistoryInput(e.target.value)}
                    />
                  </Col>
                </Row>
                {keyhistoryloading ? (
                  <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-2">Loading...</div>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <DataTable
                        columns={columnshistory}
                        data={Array.isArray(keyshistory) ? keyshistory : []}
                        pagination
                        paginationServer
                        paginationTotalRows={totalRowshistory}
                        onChangePage={setCurrentPagehistory}
                        onChangeRowsPerPage={(perPage, page) => {
                          setRowsPerPagehistory(perPage);
                          setCurrentPagehistory(page);
                        }}
                        highlightOnHover
                        striped
                        responsive
                        noHeader
                      />
                    </div>
                  </>
                )}
              </MainCard>
            )}
          </Col>                                                                                                                                                                                                                                                                                                                                       
      </Row>

      {/* Modals */}
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Limit</Form.Label>
            <Form.Control
              type="number"
              value={editForm.limit}
              onChange={(e) => setEditForm({ ...editForm, limit: parseInt(e.target.value) })}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Check
              type="checkbox"
              label="Active"
              checked={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.checked })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateKey} disabled={updatebtnloading}>
            {updatebtnloading ? 'Updating...' : 'Update'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this key?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deletebtntnloading}>
            {deletebtntnloading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showpermanentDeleteModal} onHide={() => setShowPermanentDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Permanent Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to permanent delete this key?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPermanentDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmpermanentDelete} disabled={permanentdeletebtntnloading}>
            {permanentdeletebtntnloading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showRestoreModal} onHide={() => setShowRestoreModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Restore</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to restore this key?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRestoreModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmRestore} disabled={restorebtntnloading}>
            {restorebtntnloading ? 'Restore...' : 'Restore'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Key</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="required">Key</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                value={addForm.key}
                isInvalid={!!errors.key}
                onChange={(e) => {
                  setAddForm({ ...addForm, key: e.target.value });
                  setErrors({ ...errors, key: '' });
                }}
              />
              <Button
                variant="outline-primary"
                className="ms-2 "
                onClick={() => {
                  const generatedKey = `${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
                  setAddForm({ ...addForm, key: generatedKey });
                  setErrors({ ...errors, key: '' });
                }}
              >
                Generate
              </Button>
            </div>
            <Form.Control.Feedback type="invalid">{errors.key}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label className="required">Name</Form.Label>
            <Select
              isClearable
              closeMenuOnSelect={true}
              components={animatedComponents}
              loadOptions={fetchcustomerData} // async options fetch function
              options={options} // fallback or static options
              value={selected} // currently selected items
              onChange={(selectedItems) => {
                setSelected(selectedItems);
                setAddForm({ ...addForm, name: selectedItems.label }); // update state
                setErrors({ ...errors, name: '' }); // clear validation error
              }}
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

            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label className="required">Limit</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={addForm.limit}
              isInvalid={!!errors.limit}
              onChange={(e) => {
                setAddForm({ ...addForm, limit: parseInt(e.target.value) });
                setErrors({ ...errors, limit: '' });
              }}
            />
            <Form.Control.Feedback type="invalid">{errors.limit}</Form.Control.Feedback>{' '}
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Check
              type="checkbox"
              label="Active"
              checked={addForm.status}
              onChange={(e) => setAddForm({ ...addForm, status: e.target.checked })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="dark" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddKey} disabled={addbtnloading}>
            {addbtnloading ? 'Adding...' : 'Add key'}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* History Modal */}
      <Modal show={showHistory} onHide={() => setShowHistory(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Key Action History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Show selected key details */}
          {selectedKey && (
            <div className="mb-4 p-3 rounded bg-light shadow-sm border">
              <h5 className="mb-2">🔑 {selectedKey.key || 'N/A'} Key</h5>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Fetching history...</p>
            </div>
          ) : historyLogs.length > 0 ? (
            <Table striped bordered hover responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Action</th>
                  <th>Changed By</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      {log.action === 'Add_Key' && <span className="text-success fw-bold">➕ Key Added</span>}
                      {log.action === 'Update_Key' && <span className="text-primary fw-bold">✏️ Key Update</span>}
                      {log.action === 'Restore_Key' && <span className="text-black fw-bold">♻️ key Restore</span>}
                      {log.action === 'Delete_Key' && <span className="text-danger fw-bold">🗑️ key Deleted</span>}
                    </td>
                    <td>👤 {log.changedBy?.name || 'Unknown'}</td>
                    <td>🕒 {new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted">📭 No history found.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApikeyDetails;
