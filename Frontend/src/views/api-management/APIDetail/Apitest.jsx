import React , { useState, useEffect } from 'react';

import { Row, Col, Button, Table, Form, Modal, Spinner, OverlayTrigger, Tooltip, Accordion } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import MainCard from '../../../components/Card/MainCard'
import axios from 'axios';
import { api } from 'views/api';
import { toast, ToastContainer } from 'react-toastify';


const Apitest = ({ id }) => {
  const apiId = id;
  console.log("testpageidpasss 12345555" , apiId)
      const [apiDetails, setApiDetails] = useState(null);
  const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState([]);
     const navigate = useNavigate();
     const [testloading, settestLoading] = useState(false);
     const [response, setResponse] = useState(null);
     console.log("response" ,response)
// Headers
  const [headerPayloadType, setHeaderPayloadType] = useState('form');
  const [headerParams, setHeaderParams] = useState([{ key: '', value: '' }]);
  const [headerRawJson, setHeaderRawJson] = useState('{}');
   const [activeKey, setActiveKey] = useState(null);
   // Payload
  const [payloadType, setPayloadType] = useState('form');
  const [params, setParams] = useState([{ key: '', value: '' }]);
  const [rawJson, setRawJson] = useState('{}');



  useEffect(() => {
    fetchAPIDetails();

  }, [apiId]);



  const fetchAPIDetails = async () => {
    console.log('fetchAPIDetails1658419684169846984869489');
    setLoading(true);
    // settestLoading(true);
    try {
      const res = await axios.get(`${api}/getAPIDetailsById/${id}`, {
        withCredentials: true,
      });
      setApiDetails(res.data.data);
      console.log("hello setApiDetails" , setApiDetails)
      setPermission(res.data.permission);
      const data = res.data.data;
      if (Array.isArray(data.header)) {
        setHeaderParams([...data.header, { key: '', value: '' }]);
        setHeaderRawJson(JSON.stringify(objectFromArray(data.header), null, 2));
        setHeaderPayloadType('form');
      } else if (typeof data.header === 'object') {
        setHeaderParams([...arrayFromObject(data.header), { key: '', value: '' }]);
        setHeaderRawJson(JSON.stringify(data.header, null, 2));
        setHeaderPayloadType('raw');
      }

      // Normalize payload
      if (Array.isArray(data.payload)) {
        setParams([...data.payload, { key: '', value: '' }]);
        setRawJson(JSON.stringify(objectFromArray(data.payload), null, 2));
        setPayloadType('form');
      } else if (typeof data.payload === 'object') {
        setParams([...arrayFromObject(data.payload), { key: '', value: '' }]);
        setRawJson(JSON.stringify(data.payload, null, 2));
        setPayloadType('raw');
      }
      // setKeys(res.data.keyData.docs);
      // setTotalRows(res.data.keyData.totalDocs);
    } catch (err) {
      console.log("log", err)
      if (err.response && err.response.status === 403) {
        navigate(`/error/${err.response.status}`);
        // toast.error(err.response?.data?.message || 'Access denied');
      }
      toast.error('Failed to fetch API details dbniushbifuohsdfhnios');
    } finally {
      setLoading(false);
    }
  };
    const arrayFromObject = (obj) => {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  };
   const handleTestAPI = async () => {
    settestLoading(true);
    try {
      // Build headers
      let headers = {};
      if (headerPayloadType === 'form') {
        headers = objectFromArray(headerParams);
      } else {
        try {
          headers = JSON.parse(headerRawJson);
        } catch {
          toast.error('Invalid JSON in headers');
          settestLoading(false);
          return;
        }
      }

      // Build payload
      let payload = {};
      if (payloadType === 'form') {
        payload = objectFromArray(params);
      } else {
        try {
          payload = JSON.parse(rawJson);
        } catch {
          toast.error('Invalid JSON in payload');
          settestLoading(false);
          return;
        }
      }

      // Send request
      const res = await axios.post(`${api}/gettestapi`, {
        method: apiDetails.method,
        apiEndpoint: apiDetails.apiEndpoint,
        headers,
        payload
      });

      if (res.status === 200) {
        setResponse(res.data);
        toast.success('API tested successfully')
      }
    } catch (err) {
      const errorMsg = err.response?.data || err.message;
      setResponse(errorMsg);
      toast.error(errorMsg.details || 'Failed to test API');
    } finally {
      settestLoading(false);
    }
  };
  const handleParamChange = (index, field, value) => {
    const updated = [...params];
    updated[index][field] = value;
    setParams(updated);

    if (index === params.length - 1 && updated[index].key.trim() !== '' && updated[index].value.trim() !== '') {
      setParams([...updated, { key: '', value: '' }]);
    }
  };
    const handleHeaderParamChange = (index, field, value) => {
    const updated = [...headerParams];
    updated[index][field] = value;
    setHeaderParams(updated);

    if (index === headerParams.length - 1 && updated[index].key.trim() !== '' && updated[index].value.trim() !== '') {
      setHeaderParams([...updated, { key: '', value: '' }]);
    }
  };
    const objectFromArray = (arr) => {
    const obj = {};
    arr.forEach(({ key, value }) => {
      if (key && value) obj[key.trim()] = value.trim();
    });
    return obj;
  };

const handleCopyCurl = () => {
    const curlCmd = generateCurlCommand();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(curlCmd)
        .then(() => toast.success('cURL command copied!'))
        .catch(() => toast.error('Failed to copy cURL'));
    } else {
      // fallback
      const textarea = document.createElement('textarea');
      textarea.value = curlCmd;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('cURL command copied!');
    }
  };
      const generateCurlCommand = () => {
    let curl = `curl --location --request ${apiDetails?.method?.toUpperCase()} '${apiDetails?.apiEndpoint}' \\\n`;

    // Build headers
    let headerObj = {};
    if (headerPayloadType === 'form') {
      headerParams.forEach((param) => {
        if (param.key && param.value) headerObj[param.key] = param.value;
      });
    } else if (headerPayloadType === 'raw' && headerRawJson) {
      try {
        headerObj = JSON.parse(headerRawJson);
      } catch {
        toast.error('Invalid Header JSON');
      }
    }

    Object.entries(headerObj).forEach(([key, value]) => {
      curl += `--header '${key}: ${value}' \\\n`;
    });

    // Build payload
    let payloadObj = {};
    if (payloadType === 'form') {
      params.forEach((param) => {
        if (param.key && param.value) payloadObj[param.key] = param.value;
      });
    } else if (payloadType === 'raw' && rawJson) {
      try {
        payloadObj = JSON.parse(rawJson);
      } catch {
        toast.error('Invalid Payload JSON');
      }
    }

    if (Object.keys(payloadObj).length > 0) {
      curl += `--data '${JSON.stringify(payloadObj, null, 2)}'`;
    }

    return curl;
  };
      
  return (
    <>
      <Row>
        <Col md={12}>
        <ToastContainer />
          <MainCard className="mb-4 p-4 shadow-sm border-0 rounded-3" title=" Test API">
            <div className="table-responsive">
              <Table striped bordered hover>
                <tbody>
                  <tr>
                    <th>Method</th>
                    <td>{apiDetails?.method}</td>
                  </tr>
                  <tr>
                    <th>Endpoint</th>
                    <td>{apiDetails?.apiEndpoint}</td>
                  </tr>
                </tbody>
              </Table>
            </div>

            <Row>
              <div>
                <p className="m-2">
                  Enter your <span style={{ color: 'red', fontWeight: 'bold' }}>YOUR_API_KEY</span> in the headers, customize the payload as
                  needed, and then run the <span style={{ fontWeight: 'bold' }}>Test API</span>.
                </p>
              </div>
              <Col xs={12} md={6}>
                <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="custom-accordion">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <span className="fw-bold ">Headers</span>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-4">
                        <Form.Check
                          inline
                          label="Form Data"
                          name="headerPayloadType"
                          type="radio"
                          id="form-data"
                          checked={headerPayloadType === 'form'}
                          onChange={() => setHeaderPayloadType('form')}
                        />
                        <Form.Check
                          inline
                          label="Raw JSON"
                          name="headerPayloadType"
                          type="radio"
                          id="raw-data"
                          checked={headerPayloadType === 'raw'}
                          onChange={() => setHeaderPayloadType('raw')}
                        />
                        {headerPayloadType === 'form' && (
                          <>
                            <Row className="fw-bold border-bottom py-2 text-secondary">
                              <Col md={6}>Key</Col>
                              <Col md={6}>Value</Col>
                            </Row>

                            {headerParams.map((param, index) => (
                              <Row key={index} className="mb-2">
                                <Col md={6}>
                                  <Form.Control
                                    type="text"
                                    placeholder="Key"
                                    value={param.key}
                                    onChange={(e) => handleHeaderParamChange(index, 'key', e.target.value)}
                                  />
                                </Col>
                                <Col md={6}>
                                  <Form.Control
                                    type="text"
                                    placeholder="Value"
                                    value={param.value}
                                    onChange={(e) => handleHeaderParamChange(index, 'value', e.target.value)}
                                  />
                                </Col>
                              </Row>
                            ))}
                          </>
                        )}{' '}
                        {headerPayloadType === 'raw' && (
                          <div className="mt-3">
                            <Form.Control
                              as="textarea"
                              rows={6}
                              placeholder='{"x-api-key":"xyz","Content-Type":"application/json"}'
                              value={headerRawJson}
                              onChange={(e) => setHeaderRawJson(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Col>
              <Col xs={12} md={6}>
                <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="custom-accordion">
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>
                      <span className="fw-bold">Payload</span>{' '}
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-4">
                        <Form.Check
                          inline
                          label="Form Data"
                          name="payloadType"
                          type="radio"
                          id="form-data"
                          checked={payloadType === 'form'}
                          onChange={() => setPayloadType('form')}
                        />
                        <Form.Check
                          inline
                          label="Raw JSON"
                          name="payloadType"
                          type="radio"
                          id="raw-data"
                          checked={payloadType === 'raw'}
                          onChange={() => setPayloadType('raw')}
                        />
                        {payloadType === 'form' && (
                          <>
                            <Row className="fw-bold border-bottom py-2 text-secondary">
                              <Col md={6}>Key</Col>
                              <Col md={6}>Value</Col>
                            </Row>

                            {params.map((param, index) => (
                              <Row key={index} className="mb-2">
                                <Col md={6}>
                                  <Form.Control
                                    type="text"
                                    placeholder="Key"
                                    value={param.key}
                                    onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                                  />
                                </Col>
                                <Col md={6}>
                                  <Form.Control
                                    type="text"
                                    placeholder="Value"
                                    value={param.value}
                                    onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                                  />
                                </Col>
                              </Row>
                            ))}
                          </>
                        )}{' '}
                        {payloadType === 'raw' && (
                          <div className="mt-3">
                            <Form.Control
                              as="textarea"
                              rows={6}
                              placeholder='{"name": "value"}'
                              value={rawJson}
                              onChange={(e) => setRawJson(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Col>
            </Row>
            {permission[0]?.action.includes('Test_api') && (
              <div className="d-flex justify-content-end mt-3">
                <Button variant="dark" onClick={handleCopyCurl}>
                  Copy as cURL
                </Button>
                <Button variant="dark" onClick={handleTestAPI} disabled={apiDetails?.status ? false : true}>
                  Test API
                </Button>
              </div>
            )}

            {testloading ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2">Testing API...</div>
              </div>
            ) : (
              <>
                {' '}
                {response && (
                  <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                      <h6 className="text-success mb-0">Response:</h6>

                      <div className="d-flex align-items-center gap-3 flex-wrap">
                        <span className="badge bg-success fs-8">
                          {response.status} {response.statusText}
                        </span>
                        <span className="text-muted">⏱️ {response.executionTime}</span>
                        <span className="text-muted">📦 {response.size || 'N/A'}</span>
                      </div>
                    </div>
                    <pre className="bg-light p-3 border rounded" style={{ maxHeight: '300px', overflow: 'auto', fontSize: '0.9rem' }}>
                      {JSON.stringify(response.data ? response.data : response?.details, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}
          </MainCard>
        </Col>
      </Row>
    </>
  );
};

export default Apitest;
