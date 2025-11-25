
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  Box, TextField, Button, Typography, Card, CircularProgress,
  MenuItem, Avatar, Divider
} from '@mui/material';
import { FaCloudUploadAlt } from 'react-icons/fa';
import Loader from 'react-js-loader';
import authService from '../../ApiServices/ApiServices';
import apiServices from '../../ApiServices/ApiServices';
import { Switch, FormControlLabel } from '@mui/material';

const getMobileMaxLength = (country) => {
  switch (country) {
    case 'US': return 10;
    case 'AE': return 9;
    case 'IN': return 10;
    default: return 15;
  }
};
const getCountryCodePrefix = (country) => {
  switch (country) {
    case 'US': return '+1';
    case 'AE': return '+971';
    case 'IN': return '+91';
    default: return '';
  }
};
const ORGANIZATION_TYPES = [
  { value: 'FREEZONE', label: 'Freezone' },
  { value: 'MAINLAND', label: 'Mainland' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'BROKER', label: 'Broker' }
];
const ORGANIZATION_ROLL = [
  { value: 'CLIENT ADMIN', label: 'Client Admin' },
  { value: 'RECONCILIATION', label: 'Reconciliation' }
];

const CompanyUpdate = () => {
  const [company, setCompany] = useState({});
  const [requiresAudit, setRequiresAudit] = useState(false);
  const [dmsEnabled, setDmsEnabled] = useState(false);
  const [reconciliationEnabled, setReconciliationEnabled] = useState(false);
  const { id } = useParams();
  const [contractDocuments, setContractDocuments] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); 
  const [country, setCountry] = useState('AE');
  const [phoneValue, setPhoneValue] = useState('');
  const [tempCountryCode, setTempCountryCode] = useState('+971');
  const [managersList, setManagersList] = useState([]);
  const [auditorsList, setAuditorsList] = useState([]);

  const [formData, setFormData] = useState({
    username: 'AE-',
    companyName: '',
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: ''
    },
    companyType: '',
    companyRoll: '',
    services: {
      audit: true,
      dms: true,
      reconciliation: true,
      auditDetails: {
        manager: '',
        auditor: ''
      }
    }
  });

  // Fetch managers and auditors
  const fetchManagers = useCallback(async () => {
    try {
      const response = await apiServices.getManager();
      setManagersList(response.data || response);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  }, []);

  const fetchAuditors = useCallback(async () => {
    try {
      const response = await apiServices.getAuditor();
      setAuditorsList(response.data || response);
    } catch (error) {
      console.error("Error fetching auditors:", error);
    }
  }, []);

  const getFileNameFromPath = (path) => {
    if (!path) return '';
    return path.split(/[\\/]/).pop();
  };

  useEffect(() => {
    fetchManagers();
    fetchAuditors();
  }, [fetchManagers, fetchAuditors]);

  useEffect(() => {
    console.log("phoneValue state changed:", phoneValue);
  }, [phoneValue]);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        const response = await authService.getOrganizationById(id);
        console.log("Fetched organization:", response);
        if (response) {
          const org = response.details;
          const rawMobile = (org.mobile || '').trim();
          let inferredCountry = 'US';
          let fetchedCountryCode = '';
          let actualMobile = rawMobile;

          if (rawMobile.startsWith('+971')) {
            fetchedCountryCode = '+971';
            actualMobile = rawMobile.slice(4);
            inferredCountry = 'AE';
          } else if (rawMobile.startsWith('+91')) {
            fetchedCountryCode = '+91';
            actualMobile = rawMobile.slice(3);
            inferredCountry = 'IN';
          } else if (rawMobile.startsWith('+1')) {
            fetchedCountryCode = '+1';
            actualMobile = rawMobile.slice(2);
            inferredCountry = 'US';
          } else {
            inferredCountry = country;
            fetchedCountryCode = getCountryCodePrefix(inferredCountry);
            actualMobile = rawMobile;
          }
          actualMobile = actualMobile.replace(/\D/g, '');

          setTempCountryCode(fetchedCountryCode);
          setCountry(inferredCountry);
          setPhoneValue(fetchedCountryCode + actualMobile);
          console.log("Setting phoneValue:", fetchedCountryCode + actualMobile, "from rawMobile:", rawMobile);
          setContractDocuments(org.contract_doc);

          // Set all company fields
          setCompany({
            id: org.auth_user?.id || '',
            username: org.auth_user?.username || '',
            company_name: org.company_name || '',
            first_name: org.auth_user?.first_name || '',
            last_name: org.auth_user?.last_name || '',
            mobile: actualMobile,
            email: org.auth_user?.email || '',
            contract_doc: org.contract_doc || '',
            created_at: org.created_at ? new Date(org.created_at).toISOString().split('T')[0] : '',
            companyType: org.company_type || '',
            companyRoll: org.company_roll || '',
          });

          // Set all formData fields
          setFormData({
            username: org.auth_user?.username || '',
            companyName: org.company_name || '',
            contact: {
              firstName: org.auth_user?.first_name || '',
              lastName: org.auth_user?.last_name || '',
              email: org.auth_user?.email || '',
              mobile: actualMobile
            },
            companyType: org.company_type || '',
            companyRoll: org.company_roll || ORGANIZATION_ROLL[0].value,
            services: {
              audit: org.is_auditing_enabled || false,
              dms: org.is_dms_needed || false,
              reconciliation: org.is_reconciliation_needed || false,
              auditDetails: {
                manager: org.manager_id || '',
                auditor: org.auditor_id || ''
              }
            }
          });

          setRequiresAudit(org.requires_audit || false);
          setDmsEnabled(org.dms_enabled || false);
          setReconciliationEnabled(org.reconciliation_enabled || false);
        }
      } catch (error) {
        console.error("Error fetching organization:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchOrganization();
  }, [id, country]);

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service]
      }
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '');
      setCompany(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'tempCountryCode') {
      let sanitizedValue = value.replace(/[^\d+]/g, '');
      if (sanitizedValue.indexOf('+') > 0) {
        sanitizedValue = '+' + sanitizedValue.replace(/\+/g, '');
      }
      if (sanitizedValue.startsWith('++')) {
        sanitizedValue = '+' + sanitizedValue.substring(2);
      }
      setTempCountryCode(sanitizedValue);
    } else if (name === 'country') {
      setCountry(value);
      setTempCountryCode(getCountryCodePrefix(value));
      setCompany(prev => ({ ...prev, mobile: '' }));
    } else if (name.startsWith('services.auditDetails')) {
      const [, , key] = name.split('.');
      setFormData(prev => ({
        ...prev,
        services: {
          ...prev.services,
          auditDetails: {
            ...prev.services.auditDetails,
            [key]: value
          }
        }
      }));
    } else if (name === 'companyType') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (name === 'companyRoll') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setCompany(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContractDocuments(file);
      setCompany(prev => ({ ...prev, contract_doc: file.name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contractDocuments) {
      setError("Please upload the Master Services Agreement (MSA).");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const requiredLength = getMobileMaxLength(country);
    if ((company.mobile || "").length !== requiredLength) {
      setError(`Mobile must be exactly ${requiredLength} digits (excluding country code).`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const formdata = new FormData();
    Object.entries(company).forEach(([key, value]) => {
      if (key !== 'mobile' && key !== 'contract_doc') {
        formdata.append(key, value);
      }
    });

    formdata.append('mobile', tempCountryCode + company.mobile);

    if (contractDocuments instanceof File) {
      formdata.append('contract_doc', contractDocuments);
    } else if (contractDocuments) {
      formdata.append('contract_doc', contractDocuments);
    }

    formdata.append('requires_audit', formData.services.audit);
    formdata.append('dms_enabled', formData.services.dms);
    formdata.append('reconciliation_enabled', formData.services.reconciliation);
    formdata.append('company_type', formData.companyType);
    formdata.append('company_roll', formData.companyRoll);

    if (formData.services.auditDetails?.manager)
      formdata.append('manager_id', formData.services.auditDetails.manager);
    if (formData.services.auditDetails?.auditor)
      formdata.append('auditor_id', formData.services.auditDetails.auditor);

    setIsLoading(true);
    try {
      await authService.updateOrganization(id, formdata);
      alert("Company Details updated successfully!");
      navigate('/OrganizationList');
    } catch (error) {
      console.error("Error updating organization:", error);
      setError(error.message || "Something went wrong.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const showAuditDetails = formData.services.audit || formData.services.reconciliation;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 64px)',
      width: '100%',
      backgroundColor: '#fff',
      padding: '0px',
      top: '20px',
      position: 'relative',
      marginTop: '64px',
    }}>
      <Card sx={{
        width: '100%',
        maxWidth: 'unset',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        minHeight: 'fit-content',
      }}>
        <Box sx={{
          width: '300px',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
        }}>
          <Avatar sx={{
            width: 100,
            height: 100,
            bgcolor: '#5a36a2',
            fontSize: '2.5rem',
            mb: 2,
          }}>
            {company.company_name ? company.company_name.charAt(0).toUpperCase() : 'O'}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {company.company_name || 'Organization Name'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d', mb: 3 }}>
            {company.companyType || 'Organization Type'}
          </Typography>
          <Divider sx={{ width: '100%', my: 2 }} />
          <Box sx={{ width: '100%', textAlign: 'left' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Personal Information
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>User Name</strong><br />
              {company.username || 'Not provided'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>FIRST NAME</strong><br />
              {company.first_name || 'Not provided'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>LAST NAME</strong><br />
              {company.last_name || 'Not provided'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>PHONE NUMBER</strong><br />
              {tempCountryCode}{company.mobile || 'Not provided'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>EMAIL ADDRESS</strong><br />
              {company.email || 'Not provided'}
            </Typography>
            <Divider sx={{ width: '100%', my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Organization Information
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>ORGANIZATION TYPE</strong><br />
              {ORGANIZATION_TYPES.find(type => type.value === formData.companyType)?.label || 'Not provided'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>DOCUMENT MANAGEMENT</strong><br />
              {formData.services.dms ? 'Enabled' : 'Disabled'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>AUDIT SERVICE</strong><br />
              {formData.services.audit ? 'Enabled' : 'Disabled'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>RECONCILIATION</strong><br />
              {formData.services.reconciliation ? 'Enabled' : 'Disabled'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{
          flex: 1,
          padding: '20px',
        }}>
          <Typography variant="h6" sx={{
            color: '#000b58',
            marginBottom: 3,
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Update Organization Details
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              <TextField
                label="User Name"
                name="username"
                value={company.username || ''}
                style={{ zIndex: "0" }}
                onChange={handleChange}
                required
                fullWidth
                size="small"
                InputProps={{
    readOnly: true,
  }}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="First Name"
                  name="first_name"
                  value={company.first_name || ''}
                  onChange={handleChange}
                  style={{ zIndex: "0" }}
                  required
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Last Name"
                  name="last_name"
                  value={company.last_name || ''}
                  onChange={handleChange}
                  style={{ zIndex: "0" }}
                  required
                  fullWidth
                  size="small"
                />
              </Box>
              <TextField
                label="Organization Name"
                name="company_name"
                value={company.company_name || ''}
                onChange={handleChange}
                style={{ zIndex: "0" }}
                required
                fullWidth
                size="small"
              />
              <Box>
                <Typography
                  variant="body2"
                  required
                  sx={{
                    mb: 0.5,
                    fontSize: '0.75rem',
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontWeight: 500,
                  }}
                >
                  Mobile
                </Typography>
                {/* ----------- PHONE INPUT WITH SAFE HANDLING ----------- */}
                <PhoneInput
                  country={country.toLowerCase()}
                  value={phoneValue}
                  onChange={(value, countryData) => {
                    console.log("PhoneInput onChange - value:", value, "countryData:", countryData);
                    const cleanNumber = value.replace(`+${countryData?.dialCode || ''}`, '').replace(/\D/g, '');
                    const dialCode = `+${countryData?.dialCode || ''}`;

                    setCountry(countryData?.iso2?.toUpperCase() || country);
                    setTempCountryCode(dialCode);
                    setPhoneValue(value);
                    setCompany(prev => ({
                      ...prev,
                      mobile: cleanNumber
                    }));
                  }}
                  inputProps={{
                    required: true,
                    name: 'mobile'
                  }}
                  containerStyle={{
                    width: '100%',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  inputStyle={{
                    width: '100%',
                    height: '40px',
                    fontSize: '14px',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    borderRadius: '4px',
                    paddingLeft: '50px'
                  }}
                  buttonStyle={{
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                />
              </Box>
              <TextField
                label="Email"
                name="email"
                value={company.email || ''}
                onChange={handleChange}
                required
                fullWidth
                size="small"
                type="email"
                sx={{ position: 'relative', zIndex: 0 }}
              />
              <Box sx={{ mt: 2, width: '100%', maxWidth: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Services
                </Typography>
                <TextField
                  select
                  label="Organization Type"
                  name="companyType"
                  value={formData.companyType || ORGANIZATION_TYPES[0].value}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                  sx={{ position: 'relative', zIndex: 0, mb: 2 }}
                >
                  {ORGANIZATION_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Organization Role"
                  name="companyRoll"
                  value={formData.companyRoll || ORGANIZATION_ROLL[0].value}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                  sx={{ position: 'relative', zIndex: 0, mb: 2 }}
                >
                  {ORGANIZATION_ROLL.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </TextField>
                {/* Document Management Toggle - GREEN */}

                <Box 
                onClick={() => handleServiceToggle('dms')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: formData.services.dms ? '#d4edda' : 'transparent',
                  width: '98%',
                  cursor: 'default',
                }}>

                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Document Management 
                  </Typography>
                  <Box
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: formData.services.dms ? '#d4edda' : '#e0e0e0',
                      position: 'relative',
                      cursor: 'default',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      top: 2,
                      left: formData.services.dms ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: formData.services.dms ? '#28a745' : 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: 1
                    }} />
                  </Box>
                </Box>
                {/* Audit Service Toggle - GREEN */}
                <Box
                onClick={() => handleServiceToggle('audit')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: formData.services.audit ? '#d4edda' : 'transparent',
                  width: '98%',
                  cursor: 'default',
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Audit Service
                  </Typography>
                  <Box
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: formData.services.audit ? '#d4edda' : '#e0e0e0',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      cursor:'default',
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      top: 2,
                      left: formData.services.audit ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: formData.services.audit ? '#28a745' : 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: 1
                    }} />
                  </Box>
                </Box>
                {/* Reconciliation Toggle - GREEN */}
                <Box 
                onClick={() => handleServiceToggle('reconciliation')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: formData.services.reconciliation ? '#d4edda' : 'transparent',
                  width: '98%',
                  cursor: 'default',
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Reconciliation
                  </Typography>
                  <Box
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: formData.services.reconciliation ? '#d4edda' : '#e0e0e0',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      cursor:'default'
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      top: 2,
                      left: formData.services.reconciliation ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: formData.services.reconciliation ? '#28a745' : 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: 1
                    }} />
                  </Box>
                </Box>
                {/* Audit Details - Shown when either Audit or Reconciliation is enabled */}
                {showAuditDetails && (
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                    width: '97%',
                    mt: 2,
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    borderRadius: 1,
                    border: '1px solid #eee'
                  }}>
                    <Typography variant="subtitle2" sx={{
                      fontWeight: 'bold',
                      gridColumn: '1 / -1',
                      mb: 1
                    }}>
                      {formData.services.audit && formData.services.reconciliation
                        ? 'Audit & Reconciliation Manager'
                        : formData.services.audit
                          ? 'Audit Manager'
                          : 'Reconciliation Manager'}
                    </Typography>
                    <TextField
                      select
                      label="Manager"
                      name="services.auditDetails.manager"
                      value={formData.services.auditDetails.manager}
                      onChange={handleChange}
                      required={showAuditDetails}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="">Select Manager</MenuItem>
                      {managersList.map((manager) => (
                        <MenuItem
                          key={manager.id || manager._id}
                          value={manager.id || manager._id}
                        >
                          {manager.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Auditor"
                      name="services.auditDetails.auditor"
                      value={formData.services.auditDetails.auditor}
                      onChange={handleChange}
                      required={showAuditDetails}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="">Select Auditor</MenuItem>
                      {auditorsList.map((auditor) => (
                        <MenuItem
                          key={auditor.id || auditor._id}
                          value={auditor.id || auditor._id}
                        >
                          {auditor.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                )}
              </Box>
              {error && (
                <Typography color="error" align="center" fontSize="0.8rem" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
              <Box mt={2}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Contract Document <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Button
                  onClick={() => document.getElementById('contract_doc').click()}
                  startIcon={<FaCloudUploadAlt />}
                  variant="outlined"
                  size="small"
                  sx={{
                    color: '#5a36a2',
                    borderColor: '#5a36a2',
                    '&:hover': {
                      borderColor: '#462f87',
                    }
                  }}
                >
                  {contractDocuments?.name ||
                    (contractDocuments ? `Change ${getFileNameFromPath(contractDocuments)}` : 'Upload File')}
                </Button>
                <input type="file" id="contract_doc" hidden onChange={handleFileChange} />
                {contractDocuments && (
                  <Typography variant="caption" display="block" mt={1}>
                    {contractDocuments.name || getFileNameFromPath(contractDocuments)}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button
                  variant="outlined"
                  sx={{
                    fontSize: '0.8rem',
                    color: '#5a36a2',
                    borderColor: '#5a36a2',
                    cursor:'pointer'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    backgroundColor: '#5a36a2',
                    color: '#fff',
                    fontSize: '0.8rem',
                    '&:hover': {
                      backgroundColor: '#462f87'
                    },
                    '&:disabled': {
                      backgroundColor: '#b39ddb'
                    }
                  }}
                >
                  {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Update'}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Card>
      {isLoading && (
        <Box textAlign="center" mt={4}>
          <Loader type="box-up" bgColor="#000b58" color="#000b58" size={100} />
          <Typography mt={1}>Loading...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CompanyUpdate;
