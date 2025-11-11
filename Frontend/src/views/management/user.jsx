import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Modal, Spinner } from 'react-bootstrap';
import Card from '../../components/Card/MainCard';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { api } from 'views/api';

const UserList = () => {
  const navigate = useNavigate();
  const [apiList, setApiList] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState(null);
  const [loading, setLoading] = useState(false);

  // form states for add user
  const [newEmail, setNewEmail] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');

   // Role filter state
  const [filterRole, setFilterRole] = useState('');

    // Update role modal state
  const [showUpdateRoleModal, setShowUpdateRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [updatedRole, setUpdatedRole] = useState('');

  useEffect(() => {
    getApiList(currentPage, perPage, search ,filterRole);
  }, [currentPage, perPage, search , filterRole]);

  useEffect(() => {
    getRoles();
  }, []);

  const getApiList = async (page = 1, limit = 10, keyword = '' ,roleId = '') => {
    try {
      const res = await axios.get(`${api}/get-user?page=${page}&limit=${limit}&search=${keyword}&roleId=${roleId}`, {
        withCredentials: true,
      });
      console.log("res" , res.data)
      setApiList(res.data.data);
      setPermission(res.data.permission);
      setTotalRows(res.data.total || 0);
    } catch (err) {
      console.log(err);

      if (err.response && err.response.status === 403) {
        navigate(`/error/${err.response.status}`);
        toast.error(err.response?.data?.message || 'Access denied');
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch user list');
      }
    }
  };

  const getRoles = async () => {
    try {
      const res = await axios.get(`${api}/get-roles-name`, { withCredentials: true });
      setRoles(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load roles');
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

  const handleStatusChange = async () => {
    if (!selectedAPI) return;
    try {
      const updatedStatus = !selectedAPI.status;

      await axios.put(`${api}/user-status/${selectedAPI._id}`, {
        status: updatedStatus,
      });

      toast.success(`Status updated to ${updatedStatus ? 'Active' : 'Inactive'}`);
      getApiList(currentPage, perPage, search); // Refresh list
      setShowStatusModal(false);
    } catch (error) {
      toast.error('Failed to update status');
      setShowStatusModal(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newDesignation || !selectedRole) {
      toast.error('All fields are required');
      return;
    }
setLoading(true);
    try {
      await axios.post(
        `${api}/add-user`,
        {
          email: newEmail,
          designation: newDesignation,
          roleId: selectedRole,
        },
        { withCredentials: true }
      );

      toast.success('User added successfully');
      setShowAddUserModal(false);
      setNewEmail('');
      setNewDesignation('');
      setSelectedRole('');
      getApiList(currentPage, perPage, search);
    } catch (error) {
      toast.error('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Role Update Modal open
  const handleOpenRoleModal = (user) => {
    setSelectedUserForRole(user);
    setUpdatedRole(user.roleId || '');
    setShowUpdateRoleModal(true);
  };

  // ✅ Handle Update Role API call
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!updatedRole || !selectedUserForRole) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${api}/update-user-role/${selectedUserForRole._id}`,
        { roleId: updatedRole },
        { withCredentials: true }
      );

      toast.success('User role updated successfully');
      setShowUpdateRoleModal(false);
      setSelectedUserForRole(null);
      getApiList(currentPage, perPage, search);
    } catch (error) {
      toast.error('Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: 'No.',
      selector: (row, index) => index + 1 + (currentPage - 1) * perPage,
      width: '60px',
    },

    { name: 'Email', selector: (row) => row.email },
        { name: 'Name', selector: (row) => row.name },
    { name: 'Designation', selector: (row) => row.designation },
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
      ),
    },
{
      name: 'Role',
      cell: (row) => (
        <Button
          size="sm"
          variant="dark"
          onClick={() => handleOpenRoleModal(row)}
        >
          {row.roleName || 'N/A'}
        </Button>
      ),
    },
  ];

  document.title = 'User list';
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
        <Col>
          <Card title="User List">
            <Row className="align-items-center mb-3">
              <Col md={6}>
                <Form onSubmit={handleSearch} className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Search by Name or Email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="me-1"
                  />
                </Form>
              </Col>
               {/* Role Filter */}
              <Col md={3}>
                <Form.Select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="" >All Roles</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.roleName}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3} className="d-flex justify-content-end  gap-2">
                {permission[0]?.action?.includes('Add') && (
                  <Button
                    variant="dark"
                    onClick={() => {
                      setShowAddUserModal(true);
                      getRoles();
                    }}
                  >
                    + Add User
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

      {/* Status Change Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header>
          <Modal.Title>Confirm Status Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to change the status of <strong>{selectedAPI?.email}</strong> from{' '}
          <strong>{selectedAPI?.status ? 'Active' : 'Inactive'}</strong> to{' '}
          <strong>{selectedAPI?.status ? 'Inactive' : 'Active'}</strong>?
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

      {/* Add User Modal */}
      <Modal show={showAddUserModal} onHide={() => setShowAddUserModal(false)}>
        <Form onSubmit={handleAddUser}>
          <Modal.Header closeButton>
            <Modal.Title>Add User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter email"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Control
                type="text"
                value={newDesignation}
                onChange={(e) => setNewDesignation(e.target.value)}
                placeholder="Enter designation"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="" hidden={selectedRole ?  false : true}>Select Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.roleName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            {loading ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              <Button variant="primary" type="submit">
                Add User
              </Button>
            )}
          
          </Modal.Footer>
        </Form>
      </Modal>
       {/* ✅ Update Role Modal */}
      <Modal
        show={showUpdateRoleModal}
        onHide={() => setShowUpdateRoleModal(false)}
        centered
      >
        <Form onSubmit={handleUpdateRole}>
          <Modal.Header closeButton>
            <Modal.Title>Update User Role</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Updating role for: <strong>{selectedUserForRole?.email}</strong>
            </p>
            <Form.Group>
              <Form.Label>Select New Role</Form.Label>
              <Form.Select
                value={updatedRole}
                onChange={(e) => setUpdatedRole(e.target.value)}
              >
                <option value="" hidden >Select Role</option>
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.roleName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowUpdateRoleModal(false)}
            >
              Cancel
            </Button>
            {loading ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              <Button variant="primary" type="submit">
                Update Role
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default UserList;