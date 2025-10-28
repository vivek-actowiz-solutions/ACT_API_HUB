import React, { useState, useEffect ,useCallback } from 'react';
import { Row, Col, Form, Button, Modal, Spinner , ListGroup } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { getData } from 'country-list';
import Card from '../../components/Card/MainCard';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { api } from 'views/api';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

const Apiconfigration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    domainName: '',
    categoryName: '',
    type: '',
    subType: '',
    url: '',
    method: 'GET',
    applicationType: '',
    dbName: '',
    country: '',
    github_link: ''
  });
 const [file, setFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [params, setParams] = useState([{ key: '', value: '' }]);
  const [headerParams, setHeaderParams] = useState([{ key: '', value: '' }]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryList, setCountryList] = useState([]);
  const [payloadType, setPayloadType] = useState('form');
  const [headerPayloadType, setHeaderPayloadType] = useState('form');
  // const [params, setParams] = useState([{ key: '', value: '' }]);
  const [rawJson, setRawJson] = useState('');
  const [headerRawJson, setHeaderRawJson] = useState('');

  useEffect(() => {
    const countries = getData();
    const options = countries.map(({ name, code }) => ({ label: name, value: code })).sort((a, b) => a.value.localeCompare(b.value));
    setCountryList(options);
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const res = await axios.get(`${api}/get-apiconfigration`, { withCredentials: true });
    } catch (err) {
      console.log(err);
      if (err.response && err.response.status === 403) {
        navigate(`/error/${err.response.status}`);
        // toast.error(err.response?.data?.message || 'Access denied');
      }
    }
  };

  const handleParamChange = (index, field, value) => {
    const updatedParams = [...params];
    updatedParams[index][field] = value;
    setParams(updatedParams);

    if (index === params.length - 1 && updatedParams[index].key.trim() !== '' && updatedParams[index].value.trim() !== '') {
      setParams([...updatedParams, { key: '', value: '' }]);
    }
  };
  const handleHeaderParamChange = (index, field, value) => {
    const updatedParams = [...headerParams];
    updatedParams[index][field] = value;
    setHeaderParams(updatedParams);

    if (index === headerParams.length - 1 && updatedParams[index].key.trim() !== '' && updatedParams[index].value.trim() !== '') {
      setHeaderParams([...updatedParams, { key: '', value: '' }]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' });
  };

  // Drag and drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false, // Only one file
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]); // Replace existing file
    },
  });
  const payloadObject = params
    .filter((item) => item.key?.trim())
    .reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  const headerPayloadObject = headerParams
    .filter((item) => item.key?.trim())
    .reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['domainName', 'categoryName', 'type', 'url', 'method', 'applicationType', 'dbName', 'subType', 'country'];
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = `Please enter ${field}`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirm(true);
    }
  };
  // const handleSubmit = async () => {
  //   const APIdata = {
  //     domainName: formData.domainName,
  //     categoryName: formData.categoryName,
  //     type: formData.type,
  //     subType: formData.subType,
  //     apiEndpoint: formData.url,
  //     method: formData.method,
  //     applicationType: formData.applicationType,
  //     dbName: formData.dbName,
  //     country: formData.country,
  //     payload: payloadType === 'form' ? payloadObject : JSON.parse(rawJson),
  //     header: headerPayloadType === 'form' ? headerPayloadObject : JSON.parse(headerRawJson),
  //     github_link: formData.github_link
  //   };

  //   try {
  //     setIsLoading(true);
  //     const res = await axios.post(
  //       `
  //       ${api}/apiconfigration`,
  //       APIdata,
  //       { withCredentials: true }
  //     );
  //     if (res.status === 200) {
  //       toast.success(res.data.message);
  //       setFormData({
  //         domainName: '',
  //         categoryName: '',
  //         type: '',
  //         url: '',
  //         method: 'GET',
  //         applicationType: '',
  //         subType: '',
  //         dbName: '',
  //         country: ''
  //       });
  //       setParams([{ key: '', value: '' }]);
  //       setShowConfirm(false);
  //     }
  //   } catch (err) {
  //     console.log('Error:', err);
  //     const msg = err?.response?.data?.message || '❌ API request failed';
  //     toast.error(`Error: ${msg}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmit = async () => {
  try {
    setIsLoading(true);

    const formPayload = new FormData();

    // Append form fields
    formPayload.append("domainName", formData.domainName);
    formPayload.append("categoryName", formData.categoryName);
    formPayload.append("type", formData.type);
    formPayload.append("subType", formData.subType);
    formPayload.append("apiEndpoint", formData.url);
    formPayload.append("method", formData.method);
    formPayload.append("applicationType", formData.applicationType);
    formPayload.append("dbName", formData.dbName);
    formPayload.append("country", formData.country);
    formPayload.append("github_link", formData.github_link);

    // Append payload and header as JSON strings
    formPayload.append("payload", payloadType === "form" ? JSON.stringify(payloadObject) : rawJson);
    formPayload.append(
      "header",
      headerPayloadType === "form" ? JSON.stringify(headerPayloadObject) : headerRawJson
    );

    // Append uploaded files
      if (file) {
      formPayload.append("file", file); // Use singular key 'file'
    }

    const res = await axios.post(`${api}/apiconfigration`, formPayload, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data", // Axios sets boundary automatically
      },
    });

    if (res.status === 200) {
      toast.success(res.data.message);

      // Reset form
      setFormData({
        domainName: "",
        categoryName: "",
        type: "",
        url: "",
        method: "GET",
        applicationType: "",
        subType: "",
        dbName: "",
        country: "",
        github_link: "",
      });
      setFile(""); // clear uploaded files
      setParams([{ key: "", value: "" }]);
      setShowConfirm(false);
    }
  } catch (err) {
    console.log("Error:", err);
    const msg = err?.response?.data?.message || "❌ API request failed";
    toast.error(`Error: ${msg}`);
  } finally {
    setIsLoading(false);
  }
};

  document.title = 'API Integration';
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {/* <Container className=""> */}
      <Card title="API Integration">
        <Form onSubmit={handleFormSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="required">Domain Name</Form.Label>
                <Form.Control
                  type="text"
                  name="domainName"
                  value={formData.domainName}
                  onChange={handleChange}
                  placeholder="e.g. flipkart.com"
                  isInvalid={!!formErrors.domainName}
                />
                <Form.Control.Feedback type="invalid">{formErrors.domainName}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="required">Category</Form.Label>
                <Form.Select
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  isInvalid={!!formErrors.categoryName}
                  placeholder="Select Category"
                >
                  <option value="" disabled hidden>
                    Select Type
                  </option>

                  <option value="E-com">E-com</option>
                  <option value="Food">Food</option>
                  <option value="Q-com">Q-com</option>
                  <option value="Sports">Sports</option>
                  <option value="Travel">Travel</option>
                  <option value="OTT">OTT</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Gov">Gov</option>
                  <option value="Event">Event</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Music">Music</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.categoryName}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label className="required">Type</Form.Label>
                <Form.Select name="type" value={formData.type} onChange={handleChange} isInvalid={!!formErrors.type}>
                  <option value="" disabled hidden>
                    Select Type
                  </option>
                  <option value="PL">PL</option>
                  <option value="PDP">PDP</option>
                  <option value="Search">Search</option>
                  <option value="Review">Review</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.type}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label className="required">Sub Type</Form.Label>
                <Form.Select name="subType" value={formData.subType} onChange={handleChange} isInvalid={!!formErrors.subType}>
                  <option value="" disabled hidden>
                    Select Type
                  </option>
                  <option value="BY URL">By URL</option>
                  <option value="BY ASIN">By ASIN</option>
                  <option value="BY UPC">By UPC</option>
                  <option value="BY MPN">By MPN</option>
                  <option value="BY EAN">By EAN</option>
                  <option value="BY SKU">By SKU</option>
                  <option value="BY Keyword">By Keyword</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.subType}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group>
                <Form.Label className="required">Application Type</Form.Label>
                <Form.Select
                  name="applicationType"
                  value={formData.applicationType}
                  onChange={handleChange}
                  isInvalid={!!formErrors.applicationType}
                >
                  <option value="" disabled hidden>
                    Select Type
                  </option>
                  <option value="WEB">Web</option>
                  <option value="APP">App</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.applicationType}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={9}>
              <Form.Group>
                <Form.Label className="required">API Endpoint</Form.Label>
                <Form.Control
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="http://example.com/api/endpoint"
                  isInvalid={!!formErrors.url}
                />
                <Form.Control.Feedback type="invalid">{formErrors.url}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label className="required">Method</Form.Label>
                <Form.Select name="method" value={formData.method} onChange={handleChange} isInvalid={!!formErrors.method}>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  {/* <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option> */}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{formErrors.method}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {['POST'].includes(formData.method) && (
            <div className="mb-4">
              <h6 className="mb-2 required">Payload Format</h6>
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
                  <h6 className="mt-3 mb-2 required">Payload Parameters</h6>
                  <Row className="fw-bold  py-2 text-secondary">
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
          )}
          <Row className="mb-4">
            <Col>
              <div className="mb-4">
                <h6 className="mb-2 required">Header </h6>
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
                    <h6 className="mt-3 mb-2 required">Header Parameters</h6>
                    <Row className="fw-bold  py-2 text-secondary">
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
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="required">Database Name</Form.Label>
                <Form.Control
                  type="text"
                  name="dbName"
                  value={formData.dbName}
                  onChange={handleChange}
                  placeholder="myDatabase"
                  isInvalid={!!formErrors.dbName}
                />
                <Form.Control.Feedback type="invalid">{formErrors.dbName}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="">GitHub URL</Form.Label>
                <Form.Control
                  type="text"
                  name="github_link"
                  value={formData.github_link}
                  onChange={handleChange}
                  placeholder="https://github.com/......"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="required">Country</Form.Label>
                <Select
                  name="country"
                  options={countryList}
                  value={countryList.find((opt) => opt.value === formData.country) || null}
                  onChange={(selected) => {
                    setFormData({
                      ...formData,
                      country: selected ? selected.value : ''
                    });
                    setFormErrors({
                      ...formErrors,
                      country: ''
                    });
                  }}
                  placeholder="Select Country"
                  isClearable
                />
                {formErrors.country && (
                  <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>
                    {formErrors.country}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
          {/* ---------- File Upload Section ---------- */}
  <Row className="mb-4">
      <Col>
        <h6 className="mb-2 required">Upload Sample File</h6>

        <div
          {...getRootProps()}
          className={`sow-upload-box ${isDragActive ? "active" : ""}`}
          style={{ cursor: "pointer" }}
        >
          <input {...getInputProps()} />
          {file ? (
            <p className="file-name">{file.name}</p>
          ) : (
            <p>Drag & Drop Sample File here or click to upload</p>
          )}
        </div>
      </Col>
    </Row>


          <div className="d-flex justify-content-end">
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#00cfe8',
                border: 'none',
                padding: '10px 20px',
                fontWeight: 500
              }}
            >
              {isLoading ? <Spinner animation="border" size="sm" /> : 'Save API Configuration'}
            </Button>
          </div>
        </Form>
      </Card>
      {/* </Container> */}

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm API Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to send this API configuration?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Spinner animation="border" size="sm" /> : 'Yes, Send'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Apiconfigration;
