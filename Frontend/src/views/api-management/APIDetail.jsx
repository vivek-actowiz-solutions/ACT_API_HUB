import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Nav } from 'react-bootstrap';
import Apisampledata from './APIDetail/ApiSampleData';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api } from 'views/api';
import Apitest from './APIDetail/Apitest';
import ApikeyDetails from './APIDetail/ApikeyDetails';
import ApiDataDictionary from './APIDetail/ApiDataDictionary';
import { FaDatabase, FaBookOpen, FaFlask, FaKey } from 'react-icons/fa'; // added icons

const ViewAPI = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apiDetails, setApiDetails] = useState(null);
  const [permission, setPermission] = useState([]);
  const [activeTab, setActiveTab] = useState('data-sample');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAPIDetails();
  }, [id]);

  const fetchAPIDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${api}/getAPIDetailsById/${id}`, {
        withCredentials: true
      });
      setApiDetails(res.data.data);
      setPermission(res.data.permission);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        navigate(`/error/${err.response.status}`);
      }
      toast.error('Failed to fetch API details');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'data-sample':
        return <Apisampledata id={id} />;
      case 'dictionary':
        return <ApiDataDictionary id={id} />;
      case 'testApi':
        return <Apitest id={id} />;
      case 'apikey':
        return <ApikeyDetails id={id} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* --- API Header --- */}
      <Row className="align-items-center mb-3 mt-4">
        <Col xs="auto">
          <div
            className="d-flex justify-content-center align-items-center bg-success text-white fw-bold"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '15px',
              fontSize: '24px'
            }}
          >
            {apiDetails?.apiName?.charAt(0) || 'A'}
          </div>
        </Col>
        <Col>
          <h5 className="mb-1 fw-semibold">{apiDetails?.apiName || 'API Name'}</h5>
          <p className="text-muted mb-1" style={{ fontSize: '14px' }}>
            {apiDetails?.Description || 'No description available'}
          </p>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(apiDetails?.domainName || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '14px' }}
          >
            {apiDetails?.domainName}
          </a>
        </Col>
      </Row>

      {/* <hr /> */}

      {/* --- Stats Section --- */}
      {/* <Row className="text-center mb-3">
        <Col md={3} sm={6} className="mb-3">
          <div className="text-muted small">Data-fields</div>
          <div className="fw-semibold">{apiDetails?.dataFields || 33}</div>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <div className="text-muted small">Latest Updated records</div>
          <div className="fw-semibold">{apiDetails?.totalRecords || 30}</div>
        </Col>
      </Row> */}

      <hr />

      {/* --- Navigation Tabs --- */}
      <Nav
        activeKey={activeTab}
        onSelect={(selectedKey) => setActiveTab(selectedKey)}
        className="justify-content-start mb-4 "
        // style={{ borderBottom: '2px solid #dee2e6' }}
      >
        <Nav.Item>
          <Nav.Link
            eventKey="data-sample"
            className="text-center px-4 py-3"
            style={{
              color: activeTab === 'data-sample' ? '#3F4D67' : '#6c757d',
              border: 'none',
              borderBottom: activeTab === 'data-sample' ? '3px solid #3F4D67' : '3px solid transparent',
              fontWeight: activeTab === 'data-sample' ? '600' : '500',
              transition: 'all 0.3s ease'
            }}
          >
            <FaDatabase className="me-2" />
            Data Sample
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link
            eventKey="dictionary"
            className="text-center px-4 py-3"
            style={{
              color: activeTab === 'dictionary' ? '#3F4D67' : '#6c757d',
              border: 'none',
              borderBottom: activeTab === 'dictionary' ? '3px solid #3F4D67' : '3px solid transparent',
              fontWeight: activeTab === 'dictionary' ? '600' : '500',
              transition: 'all 0.3s ease'
            }}
          >
            <FaBookOpen className="me-2" />
            Dictionary
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link
            eventKey="testApi"
            className="text-center px-4 py-3"
            style={{
              color: activeTab === 'testApi' ? '#3F4D67' : '#6c757d',
              border: 'none',
              borderBottom: activeTab === 'testApi' ? '3px solid #3F4D67' : '3px solid transparent',
              fontWeight: activeTab === 'testApi' ? '600' : '500',
              transition: 'all 0.3s ease'
            }}
          >
            <FaFlask className="me-2" />
            Test API
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link
            eventKey="apikey"
            className="text-center px-4 py-3"
            style={{
              color: activeTab === 'apikey' ? '#3F4D67' : '#6c757d',
              border: 'none',
              borderBottom: activeTab === 'apikey' ? '3px solid #3F4D67' : '3px solid transparent',
              fontWeight: activeTab === 'apikey' ? '600' : '500',
              transition: 'all 0.3s ease'
            }}
          >
            <FaKey className="me-2" />
            API Key Usage
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* --- Toast + Content --- */}
      <ToastContainer position="top-right" autoClose={2000} />

      {loading ? <div className="text-center mt-4">Loading...</div> : renderContent()}
    </>
  );
};

export default ViewAPI;
