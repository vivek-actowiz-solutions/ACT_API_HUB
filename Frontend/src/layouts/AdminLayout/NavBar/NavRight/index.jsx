// import React, { useEffect, useState } from 'react';
// import { ListGroup, Dropdown, Modal, Button, Form } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import { jwtDecode } from 'jwt-decode';
// import { IoKeyOutline } from 'react-icons/io5';
// import ChatList from './ChatList';
// import avatar1 from '../../../../assets/images/user/avatar-1.jpg';

// const NavRight = () => {
//   const [listOpen, setListOpen] = useState(false);
//   const [userName, setUserName] = useState('User');
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [showProfileModal, setShowProfileModal] = useState(false);
//   const [newPassword, setNewPassword] = useState('');
//   const [updatedName, setUpdatedName] = useState('');
//   const [updatedEmail, setUpdatedEmail] = useState('');

//   useEffect(() => {
//     const token = Cookies.get('token'); // Make sure cookie name is correct (e.g., 'token')
//     console.log('token', token);
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         console.log('decoded', decoded);
//         setUserName(decoded.name || 'User'); // Adjust according to your token payload
//       } catch (error) {
//         console.error('Invalid JWT token:', error);
//       }
//     }
//   }, []);

//   const logout = () => {
//     Cookies.remove('token');

//     window.location.href = '/API-management/login';
//   };
//   return (
//     <>
//       <ListGroup as="ul" bsPrefix=" " className="navbar-nav ml-auto" id="navbar-right">
//         <ListGroup.Item as="li" bsPrefix=" ">
//           <Dropdown align="end" className="drp-user">
//             <Dropdown.Toggle variant="" id="dropdown-basic">
//               <img src={avatar1} className="img-radius" alt="User Profile" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
//               <span>{userName}</span>
//             </Dropdown.Toggle>
//             <Dropdown.Menu align="end" className="profile-notification">
//               <div className="pro-head">
//                 {/* <img src={avatar1} className="img-radius" alt="User Profile" />
//                 <span>{userName}</span> */}
//                 {/* <Link to="#" className="dud-logout" title="Logout">
//                   <i className="feather icon-log-out" />
//                 </Link> */}
//               </div>
//               <ListGroup as="ul" bsPrefix=" " variant="flush" className="pro-body">
//                 <ListGroup.Item as="li" bsPrefix=" ">
//                   <Link to="#" className="dropdown-item" onClick={() => setShowPasswordModal(true)}>
//                     <IoKeyOutline size={15} /> <span style={{ marginLeft: '9px' }}>Change Password</span>
//                   </Link>
//                 </ListGroup.Item>
//                 <ListGroup.Item as="li" bsPrefix=" ">
//                   <Link to="#" className="dropdown-item" onClick={() => setShowProfileModal(true)}>
//                     <i className="feather icon-user" /> Profile
//                   </Link>
//                 </ListGroup.Item>

//                 <ListGroup.Item as="li" bsPrefix=" ">
//                   <Link to="#" className="dropdown-item" onClick={logout}>
//                     <i className="feather icon-lock" /> log out
//                   </Link>
//                 </ListGroup.Item>
//               </ListGroup>
//             </Dropdown.Menu>
//           </Dropdown>
//         </ListGroup.Item>
//       </ListGroup>
//       <ChatList listOpen={listOpen} closed={() => setListOpen(false)} />
//       <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Change Password</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>current Password</Form.Label>
//             <Form.Control
//               type="password"
//               s
//               placeholder="Enter new password"
//               value={currentPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//             />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>New Password</Form.Label>
//             <Form.Control
//               type="password"
//               s
//               placeholder="Enter new password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={''}>
//             Update
//           </Button>
//         </Modal.Footer>
//       </Modal>
//       <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Profile Info</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group>
//               <Form.Label>Name</Form.Label>
//               <Form.Control type="text" value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} />
//             </Form.Group>
//             <Form.Group className="mt-2">
//               <Form.Label>Email</Form.Label>
//               <Form.Control type="email" value={updatedEmail} onChange={(e) => setUpdatedEmail(e.target.value)} />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={''}>
//             Save
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default NavRight;

import React, { useEffect, useState } from 'react';
import { ListGroup, Dropdown, Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // fix import, jwtDecode is default export
import axios from 'axios';
import { IoKeyOutline } from 'react-icons/io5';
import ChatList from './ChatList';
import avatar1 from '../../../../assets/images/user/avatar-1.jpg';
import { api } from 'views/api';
import { toast, ToastContainer } from 'react-toastify';

const NavRight = () => {
  const [listOpen, setListOpen] = useState(false);
  const [userName, setUserName] = useState('User');

  // Password Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.name || 'User');
        setUpdatedName(decoded.name || '');
        setUpdatedEmail(decoded.email || '');
      } catch (error) {
        console.error('Invalid JWT token:', error);
      }
    }
  }, []);

  const logout = () => {
    Cookies.remove('token');
    window.location.href = '/API-management/login';
  };

  // Change Password handlers
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Both fields are required.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${api}/change-password`,
        {
          currentPassword,
          newPassword
        },
        { withCredentials: true }
      );
      setLoading(false);

      if (res.status === 200) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        logout();
        // Optionally close modal after success:
        // setShowPasswordModal(false);
      } else {
        toast.error(res.data.message || 'Failed to update password.');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.message || 'Error updating password.');
    }
  };

  const handlePasswordModalClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setError('');
    setSuccess('');
    setLoading(false);
    setShowPasswordModal(false);
  };

  // Profile modal save handler (example, adapt to your API)
  const handleProfileSave = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/update-profile', {
        name: updatedName,
        email: updatedEmail
      });
      setLoading(false);
      if (res.data.success) {
        setShowProfileModal(false);
        setUserName(updatedName);
        // Optionally show success toast/message here
      } else {
        alert(res.data.message || 'Failed to update profile');
      }
    } catch (error) {
      setLoading(false);
      alert('Error updating profile');
    }
  };

  return (
    <>
      <ListGroup as="ul" bsPrefix=" " className="navbar-nav ml-auto" id="navbar-right">
        <ToastContainer />
        <ListGroup.Item as="li" bsPrefix=" ">
          <Dropdown align="end" className="drp-user">
            <Dropdown.Toggle variant="" id="dropdown-basic">
              <img src={avatar1} className="img-radius" alt="User Profile" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
              <span>{userName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="profile-notification">
              <ListGroup as="ul" bsPrefix=" " variant="flush" className="pro-body">
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item" onClick={() => setShowPasswordModal(true)}>
                    <IoKeyOutline size={15} /> <span style={{ marginLeft: '9px' }}>Change Password</span>
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item" onClick={() => setShowProfileModal(true)}>
                    <i className="feather icon-user" /> Profile
                  </Link>
                </ListGroup.Item>

                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item" onClick={logout}>
                    <i className="feather icon-lock" /> Log out
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>
      </ListGroup>

      <ChatList listOpen={listOpen} closed={() => setListOpen(false)} />

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={handlePasswordModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form.Group className="mb-3" controlId="currentPassword">
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="newPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handlePasswordModalClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordUpdate} disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Updating...
              </>
            ) : (
              'Update'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Profile Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Profile Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="profileName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="profileEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={updatedEmail} onChange={(e) => setUpdatedEmail(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleProfileSave} disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NavRight;
