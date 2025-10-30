import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Modal, Button, Form } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RiDraggable } from 'react-icons/ri';
import Select from 'react-select';
import { api } from 'views/api';
import { GrTableAdd } from 'react-icons/gr';
import MainCard from 'components/Card/MainCard';
import * as XLSX from 'xlsx';
import { FaEdit, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';
import { saveAs } from 'file-saver';

const EditableColumnTableWithModal = ({ id }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [originalColumns, setOriginalColumns] = useState([]);
  const [modalColumns, setModalColumns] = useState([]);
  const [permission, setPermission] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  // 🔹 Initial Load
  useEffect(() => {
    fetchAPISampleData();
  }, []);

  const fetchAPISampleData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/get-api-sample-data/${id}`, { withCredentials: true });
      console.log(res.data.data);
      if (res.data.data) {
        const data = res.data.data.map((item, index) => ({
          No: index + 1,
          ...item
        }));
        setTableData(data);

        const cols = Object.keys(data[0]).map((key) => ({
          key,
          label: key,
          visible: true,
          editing: false
        }));

        setColumns(cols);
        setOriginalColumns(cols);
        setModalColumns(cols);
        setPermission(res.data.permission);
      }
    } catch (err) {
      handleAPIError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAPIError = (err) => {
    if (err.response && err.response.status === 403) {
      navigate(`/error/${err.response.status}`);
    } else {
      toast.error(err.response?.data?.message || 'Failed to fetch data');
    }
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'null';
    if (Array.isArray(val)) return `Array[${val.length}]`;
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  };

  const dataTableColumns = columns
    .filter((col) => col.visible)
    .map((col) => ({
      name: col.label,
      selector: (row) => formatValue(row[col.key]),
      width: '100px',
      sortable: true
    }));

  // 🔹 Modal Helpers
  const toggleVisibility = (key) => {
    setModalColumns((prev) => prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)));
  };

  const handleEditClick = (key) => {
    setModalColumns((prev) => prev.map((col) => (col.key === key ? { ...col, editing: !col.editing } : col)));
  };

  const handleLabelChange = (key, newLabel) => {
    setModalColumns((prev) => prev.map((col) => (col.key === key ? { ...col, label: newLabel } : col)));
  };

  const saveChanges = () => {
    setColumns(modalColumns.map(({ editing, ...rest }) => rest));
    setShowModal(false);
  };

  const resetChanges = () => {
    setModalColumns(originalColumns.map((col) => ({ ...col, editing: false })));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(modalColumns);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);
    setModalColumns(items);
  };
  const exportToExcel = () => {
    if (!tableData || tableData.length === 0) {
      toast.warning('No data available to export!');
      return;
    }

    // ✅ Only include visible columns
    const visibleCols = columns.filter((col) => col.visible);
    const headers = visibleCols.map((col) => col.label);

    // ✅ Map data rows with updated column names
    const exportData = tableData.map((row) => {
      const newRow = {};
      visibleCols.forEach((col) => {
        newRow[col.label] = row[col.key];
      });
      return newRow;
    });

    // ✅ Create sheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Table Data');

    // ✅ Create and download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'table_data.xlsx');
  };

  return (
    <>
      <MainCard title="Data Sample" cardClass="mb-3">
        {columns && columns.length > 0 ? (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button variant="outline-dark" onClick={() => setShowModal(true)} className="me-2 d-flex align-items-center">
                <GrTableAdd className="me-2" />
                Edit Table
              </Button>

              {/* 🟢 Export Button */}
              <Button variant="outline-dark" onClick={exportToExcel} className="d-flex align-items-center">
                📤 Export Excel
              </Button>
            </div>

            {/* 🔹 Data Table */}
            <DataTable
              columns={dataTableColumns}
              data={tableData}
              progressPending={loading}
              pagination
              highlightOnHover
              dense
              onRowClicked={(row) => {
                // use modalColumns or columns (both have updated labels & visibility)
                const activeColumns = modalColumns.length ? modalColumns : columns;

                // filter only visible ones
                const visibleCols = activeColumns.filter((col) => col.visible);

                // build filtered row data using UPDATED labels
                const visibleRowData = {};
                visibleCols.forEach((col) => {
                  visibleRowData[col.label] = row[col.key];
                });

                console.log('🟢 Visible Row Data with Updated Column Names:', visibleRowData);
                setSelectedRow(visibleRowData);
                setShowJsonModal(true);
              }}
            />

            {/* 🔹 Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Edit Table Columns</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="columns">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {modalColumns.map((col, index) => (
                          <Draggable key={col.key} draggableId={col.key} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginBottom: 10,
                                  ...provided.draggableProps.style
                                }}
                              >
                                {col.editing ? (
                                  <Form.Control
                                    type="text"
                                    value={col.label}
                                    onChange={(e) => handleLabelChange(col.key, e.target.value)}
                                    style={{ marginRight: 10 }}
                                  />
                                ) : (
                                  <span style={{ flex: 1 }}>
                                    <RiDraggable size={20} className="me-2" />
                                    {col.label}
                                  </span>
                                )}

                                <Button
                                  variant="outline-dark"
                                  size="sm"
                                  onClick={() => handleEditClick(col.key)}
                                  style={{ marginRight: 5 }}
                                >
                                  {col.editing ? <FaCheck /> : <FaEdit />}
                                </Button>

                                <Button
                                  variant={col.visible ? 'outline-success' : 'outline-danger'}
                                  size="sm"
                                  onClick={() => toggleVisibility(col.key)}
                                >
                                  {col.visible ? <FaEye /> : <FaEyeSlash />}
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={resetChanges}>
                  Reset
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={saveChanges}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>
            <Modal show={showJsonModal} onHide={() => setShowJsonModal(false)} size="lg" centered>
              <Modal.Header closeButton>
                <Modal.Title>Row Details (JSON View)</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {selectedRow ? (
                  <pre
                    style={{
                      backgroundColor: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '10px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      fontSize: '14px'
                    }}
                  >
                    {JSON.stringify(selectedRow, null, 2)}
                  </pre>
                ) : (
                  <p>No row selected.</p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowJsonModal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        ) : (
          <>
            <h5 className="text-center mt-3">No data available</h5>
          </>
        )}
      </MainCard>
    </>
  );
};

export default EditableColumnTableWithModal;
