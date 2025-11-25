import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Box,
  Button,
  CircularProgress,
  Typography,
  MenuItem,
  Card,
  Avatar,
  Divider, FormControl, FormHelperText,
} from "@mui/material";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import authService from '../../ApiServices/ApiServices';
import apiServices from '../../ApiServices/ApiServices';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const ORGANIZATION_TYPES = [
  { value: 'Freezone', label: 'Freezone' },
  { value: 'Mainland', label: 'Mainland' },
  { value: 'Warehouse', label: 'Warehouse' },
  { value: 'Broker', label: 'Broker' }
];

const ORGANIZATION_ROLL = [
  { value: 'Client Admin', label: 'Client Admin' },
  { value: 'Reconciliation Admin', label: 'Reconciliation Admin' }
];

// Username: allow only numbers, up to 15 digits
const handleUsernameKeyDown = (e) => {
  const { selectionStart, selectionEnd } = e.target;
  const username = e.target.value;
  const prefixLength = 'AE-'.length;

  // Prevent backspace or delete from removing the prefix
  if (e.key === 'Backspace' && selectionStart <= prefixLength) {
    e.preventDefault();
  }
  if (e.key === 'Delete' && selectionEnd <= prefixLength) {
    e.preventDefault();
  }
  // Prevent cutting the prefix
  if (e.ctrlKey && (e.key === 'x' || e.key === 'X')) {
    if (selectionStart < prefixLength) {
      e.preventDefault();
    }
  }

  // Allow only numbers after the prefix
  if (
    e.key.length === 1 &&
    !/[0-9]/.test(e.key) &&
    !e.ctrlKey &&
    !e.altKey &&
    e.key !== 'ArrowLeft' &&
    e.key !== 'ArrowRight' &&
    e.key !== 'Tab'
  ) {
    e.preventDefault();
  }
};

const handleUsernamePaste = (e) => {
  const pasted = e.clipboardData.getData('text');
  if (!/^\d{1,15}$/.test(pasted)) {
    e.preventDefault();
  }
};

const handleAlphaKeyDown = (e) => {
  if (
    e.key.length === 1 &&
    !/[a-zA-Z]/.test(e.key)
  ) {
    e.preventDefault();
  }
};

const handleAlphaPaste = (e) => {
  const pasted = e.clipboardData.getData('text');
  if (!/^[a-zA-Z]+$/.test(pasted)) {
    e.preventDefault();
  }
};

const checkEmailExists = async (email) => {
  try {
    const response = await authService.checkEmail(email);
    return response.exists;
  } catch (error) {
    console.error('Email check failed', error);
    return false;
  }
};

const CompanyCreation = () => {
  const [mobileError, setMobileError] = useState('');
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessError, setAccessError] = useState('');
  const [disabledRoles, setDisabledRoles] = useState([]);

  const [managersList, setManagersList] = useState([]);
  const [auditorsList, setAuditorsList] = useState([]);
  const [auditorToManagerMap, setAuditorToManagerMap] = useState({});
  const [auditorManagerMapping, setAuditorManagerMapping] = useState([]);

  const [formData, setFormData] = useState({
    username: 'AE-',
    companyName: '',
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      countryCode: '+971'
    },
    companyType: '',
    companyRoll: 'Client Admin',
    auditFrequency: '',
    auditStartDate: '',
    isAdhoc: true,
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

  // Keep role and toggles in sync
  useEffect(() => {
    const { dms, audit, reconciliation } = formData.services;
    let newRole = formData.companyRoll;

    // If only Reconciliation is enabled, switch to Reconciliation Admin
    if (!dms && !audit && reconciliation) {
      newRole = 'Reconciliation Admin';
    }
    // If DMS is enabled, always switch to Client Admin
    else if (dms) {
      newRole = 'Client Admin';
    }
    // If all are off, keep role as is (should not happen in UI)
    setFormData(prev => ({
      ...prev,
      companyRoll: newRole
    }));

    // Prevent Audit and Reconciliation from being enabled together without DMS
    let accessMsg = '';
    if (audit && reconciliation && !dms) {
      accessMsg = 'Audit and Reconciliation cannot be enabled together';
    }
    setAccessError(accessMsg);
  }, [formData.services.dms, formData.services.audit, formData.services.reconciliation]);

  // Handle organization role change
const handleRoleChange = (e) => {
  const role = e.target.value;
  let newServices = { ...formData.services };

  if (role === 'Reconciliation Admin') {
    // Only Reconciliation ON
    newServices = {
      audit: false,
      dms: false,
      reconciliation: true,
      auditDetails: { manager: '', auditor: '' }
    };
  } else if (role === 'Client Admin') {
    // All ON
    newServices = {
      audit: true,
      dms: true,
      reconciliation: true,
      auditDetails: formData.services.auditDetails
    };
  }

  setFormData(prev => ({
    ...prev,
    companyRoll: role,
    services: newServices
  }));

  setError(null);
};


  // Toggle logic for DMS, Audit, Reconciliation
  const handleServiceToggle = (service) => {
    setFormData(prev => {
      let { dms, audit, reconciliation } = prev.services;
      let newServices = { ...prev.services };

      if (service === 'dms') {
        // Toggle DMS
        dms = !dms;
        newServices.dms = dms;
        // If DMS is turned off, turn off Audit and switch to Reconciliation Admin
        if (!dms) {
          newServices.audit = false;
          newServices.reconciliation = true;
        } else {
          // If DMS is turned on, switch to Client Admin
          newServices.reconciliation = true;
        }
      } else if (service === 'audit') {
        // Audit can only be enabled if DMS is enabled
        if (!prev.services.dms && !prev.services.audit) {
          newServices.dms = true;
          newServices.audit = true;
        } else if (prev.services.dms) {
          newServices.audit = !prev.services.audit;
        }
      } else if (service === 'reconciliation') {
        newServices.reconciliation = !prev.services.reconciliation;
      }

      // If only Reconciliation is enabled, switch to Reconciliation Admin
      if (!newServices.dms && !newServices.audit && newServices.reconciliation) {
        return {
          ...prev,
          companyRoll: 'Reconciliation Admin',
          services: {
            ...newServices,
            audit: false,
            dms: false,
            reconciliation: true
          }
        };
      }
      // If DMS is enabled, always switch to Client Admin
      if (newServices.dms) {
        return {
          ...prev,
          companyRoll: 'Client Admin',
          services: newServices
        };
      }
      // If all are off, keep as is (should not happen)
      return {
        ...prev,
        services: newServices
      };
    });
    setError(null);
  };

  // 1. Fetch auditors and managers
  const fetchManagersAndAuditors = useCallback(async () => {
    try {
      const [auditorRes, managerRes] = await Promise.all([
        apiServices.getAuditor(),
        apiServices.getManager()
      ]);

      const formattedManagers = (managerRes || []).map((manager) => ({
        id: manager.id,
        email: manager.email,
        name: typeof manager.name === 'string'
          ? manager.name
          : Array.isArray(manager.name)
            ? manager.name.join('')
            : typeof manager.name === 'object'
              ? JSON.stringify(manager.name)
              : ''
      }));

      const formattedAuditors = (auditorRes || []).map((auditor) => ({
        id: auditor.id,
        email: auditor.email,
        name: typeof auditor.name === 'string'
          ? auditor.name
          : Array.isArray(auditor.name)
            ? auditor.name.join('')
            : typeof auditor.name === 'object'
              ? JSON.stringify(auditor.name)
              : ''
      }));

      setAuditorsList(formattedAuditors);
      setManagersList(formattedManagers);
    } catch (error) {
      console.error("❌ Error fetching auditors/managers:", error);
    }
  }, []);

  // 2. Fetch mapping of auditor → manager
  const fetchAuditorManagerMapping = useCallback(async () => {
    try {
      const mappingData = await apiServices.getManagerlistAuditor();
      setAuditorManagerMapping(mappingData?.auditors || []);
    } catch (error) {
      console.error("❌ Error fetching auditor-manager mapping:", error);
    }
  }, []);

  // 3. useEffect triggers both on mount
  useEffect(() => {
    const fetchData = async () => {
      await fetchManagersAndAuditors();
      await fetchAuditorManagerMapping();
    };
    fetchData();
  }, [fetchManagersAndAuditors, fetchAuditorManagerMapping]);

  const handlePhoneChange = (value, country) => {
    setFormData(prev => ({ ...prev, contact: { ...prev.contact, mobile: value, countryCode: `+${country.dialCode}` } }));
    setMobileError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle role change separately
    const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle the username field specifically
    if (name === 'username') {
      // Ensure the value always starts with 'AE-'
      if (!value.startsWith('AE-')) {
        // If the user tries to delete the prefix, reset it
        setFormData(prev => ({
          ...prev,
          username: 'AE-' + value.replace('AE-', '')
        }));
      } else {
        // If the value is valid, update the state
        setFormData(prev => ({
          ...prev,
          username: value
        }));
      }
      return;
    }
    
    // ... rest of the original handleChange logic
    if (name.includes('.')) {
      const keys = name.split('.');

      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

    // Handle auditor selection with manager mapping
    if (name === 'services.auditDetails.auditor') {
      const mapping = auditorManagerMapping.find(a => a.auditor_id === value);

      if (mapping && mapping.managers && mapping.managers.length > 0) {
        const matchedManager = managersList.find((m) =>
          mapping.managers[0] &&
          (
            m.name?.toLowerCase().includes(mapping.managers[0].toLowerCase()) ||
            m.email?.toLowerCase() === mapping.managers[0].toLowerCase()
          )
        );

        setFormData(prev => ({
          ...prev,
          services: {
            ...prev.services,
            auditDetails: {
              ...prev.services.auditDetails,
              auditor: value,
              manager: matchedManager ? matchedManager.id : ''
            }
          }
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        services: {
          ...prev.services,
          auditDetails: {
            ...prev.services.auditDetails,
            auditor: value,
            manager: ''
          }
        }
      }));
      return;
    }

    // Handle nested fields (like contact.firstName)
    if (name.includes('.')) {
      const keys = name.split('.');

      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const renderName = (name, fallback = 'Not provided') => {
    if (!name) return fallback;
    if (typeof name === 'string') return name;
    if (Array.isArray(name)) return name.join('');
    if (typeof name === 'object') {
      try {
        return JSON.stringify(name);
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  const handleManagerChange = (e) => {
    const selectedManagerId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        auditDetails: {
          ...prev.services.auditDetails,
          manager: selectedManagerId,
          auditor: '',
        }
      }
    }));
  };

  const handleAuditorChange = (e) => {
    const selectedAuditorId = e.target.value;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        services: {
          ...prevData.services,
          auditDetails: {
            ...prevData.services.auditDetails,
            auditor: selectedAuditorId,
          },
        },
      };

      const managerId = auditorToManagerMap[selectedAuditorId];
      if (managerId) {
        updatedData.services.auditDetails.manager = managerId;
      }

      return updatedData;
    });
  };

  const validateMobileNumber = () => {
    const mobile = formData.contact.mobile;

    if (!mobile || mobile.trim() === '') {
      setMobileError('Mobile number is required');
      return false;
    }

    try {
      const fullNumber = `+${mobile}`;
      const phoneNumber = parsePhoneNumberFromString(fullNumber);

      if (!phoneNumber || !phoneNumber.isValid()) {
        setMobileError('Enter a valid phone number');
        return false;
      }

      if (phoneNumber.country === 'IN' && phoneNumber.nationalNumber.length !== 10) {
        setMobileError('Indian numbers must have exactly 10 digits');
        return false;
      }

      if (phoneNumber.country === 'AU' && (phoneNumber.nationalNumber.length < 8 || phoneNumber.nationalNumber.length > 9)) {
        setMobileError('Australian numbers must have 8 or 9 digits');
        return false;
      }

      setMobileError('');
      return true;
    } catch (error) {
      setMobileError('Invalid phone number format');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) {
      setError('Please enter a valid email.');
      setIsLoading(false);
      return;
    }

    if (!validateMobileNumber()) {
      setError('Please Enter valid Number.');
      return;
    }
    setError(null);
    if (accessError) return;
    const { audit, dms, reconciliation, auditDetails } = formData.services;
    if (!audit && !dms && !reconciliation) {
      setError("Select at least one service."); return;
    }
    if ((audit || reconciliation) && (!auditDetails.manager || !auditDetails.auditor)) {
      setError("Select both Manager and Auditor."); return;
    }

    setIsLoading(true);

    try {
      const submissionData = {
        username: formData.username,
        personName: formData.contact.firstName,
        email: formData.contact.email,
        mobile: formData.contact.mobile,
        firstname: formData.contact.firstName,
        lastname: formData.contact.lastName,
        countryCode: formData.contact.countryCode,
        companyName: formData.companyName,
        companyType: formData.companyType,
        companyRoll: formData.companyRoll,
        accessCreationDate: new Date().toISOString().split('T')[0],
        expired_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        requiresAudit: audit,
        isDmsNeeded: dms,
        isReconciliationNeeded: reconciliation,
        auditFrequency: formData.auditFrequency,
        auditStartDate: formData.auditStartDate,
        auditor_id: formData.services.auditDetails.auditor,
        isAdhoc: formData.isAdhoc
      };

      await authService.createOrganization(submissionData);

      const enabledServices = [];
      if (dms) enabledServices.push("Document Management");
      if (audit) enabledServices.push("Audit");
      if (reconciliation) enabledServices.push("Reconciliation");

      const successMsg = `Organization created with ${enabledServices.join(', ')} service${enabledServices.length > 1 ? 's' : ''}.`;
      alert(successMsg);

      navigate('/OrganizationList');

    } catch (error) {
      setError(error.message || 'Email already exists.');
      console.error('Submission error:', error);
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
      maxWidth: '100vw',
      overflowX: 'hidden',
      backgroundColor: '#fff',
      padding: '0px',
      marginTop: '64px',
      position: 'relative',
      top: '40px'
    }}>
      <Card sx={{
        width: '100%',
        maxWidth: '100%',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: 'fit-content',
        overflow: 'hidden'
      }}>
        {/* Left Profile Column - Only shown on desktop */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          width: '300px',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <Avatar sx={{
            width: 100,
            height: 100,
            bgcolor: '#5a36a2',
            fontSize: '2.5rem',
            mb: 2
          }}>
            {formData.companyName ? formData.companyName.charAt(0).toUpperCase() : 'O'}
          </Avatar>

          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {formData.companyName || 'Organization Name'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d', mb: 3 }}>
            {ORGANIZATION_TYPES.find(type => type.value === formData.companyType)?.label || 'Organization Type'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d', mb: 3 }}>
            {ORGANIZATION_ROLL.find(type => type.value === formData.companyRoll)?.label || 'Organization Role'}
          </Typography>

          <Divider sx={{ width: '100%', my: 2 }} />

          <Box sx={{ width: '100%', textAlign: 'left' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Personal Information
            </Typography>

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Username</strong><br />
              {formData.username || 'Not provided'}
            </Typography>

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>FIRST NAME</strong><br />
              {formData.contact.firstName || 'Not provided'}
            </Typography>

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>LAST NAME</strong><br />
              {formData.contact.lastName || 'Not provided'}
            </Typography>

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>EMAIL ADDRESS</strong><br />
              {formData.contact.email || 'Not provided'}
            </Typography>

            <Divider sx={{ width: '100%', my: 2 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Services
            </Typography>

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>ORGANIZATION TYPE</strong><br />
              {ORGANIZATION_TYPES.find(type => type.value === formData.companyType)?.label || 'Not provided'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>ORGANIZATION ROLE</strong><br />
              {ORGANIZATION_ROLL.find(type => type.value === formData.companyRoll)?.label || 'Not provided'}
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

            {showAuditDetails && (
              <>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>MANAGER</strong><br />
                  {renderName(managersList.find(m => m.id === formData.services.auditDetails.manager)?.name)}
                </Typography>

                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>AUDITOR</strong><br />
                  {renderName(auditorsList.find(a => a.id === formData.services.auditDetails.auditor)?.name)}
                </Typography>

              </>
            )}
          </Box>
        </Box>

        {/* Right Form Column */}
        <Box sx={{
          flex: 1,
          minWidth: 0,
          padding: '20px',
          overflow: 'hidden'
        }}>
          <Typography variant="h6" sx={{
            color: '#000b58',
            marginBottom: 3,
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Organization Creation
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box sx={{
              display: 'grid',
              gap: '12px',
              width: '100%',
              maxWidth: '100%'
            }}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onKeyDown={handleUsernameKeyDown}
                onPaste={handleUsernamePaste}
                inputProps={{ maxLength: 15 }}
                required
                fullWidth
                size="small"
                style={{ zIndex: 0 }}
              />

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                width: '100%',
                maxWidth: '100%'
              }}>
                <TextField
                  label="First Name"
                  name="contact.firstName"
                  value={formData.contact.firstName}
                  onChange={handleChange}
                  onKeyDown={handleAlphaKeyDown}
                  onPaste={handleAlphaPaste}
                  inputProps={{ maxLength: 30 }}
                  required
                  fullWidth
                  size="small"
                  style={{ zIndex: 0 }}

                />
                <TextField
                  label="Last Name"
                  name="contact.lastName"
                  value={formData.contact.lastName}
                  onChange={handleChange}
                  onKeyDown={handleAlphaKeyDown}
                  onPaste={handleAlphaPaste}
                  inputProps={{ maxLength: 30 }}
                  required
                  fullWidth
                  size="small"
                  style={{ zIndex: 0 }}
                />
              </Box>

              <TextField
                label="Organization Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                inputProps={{ maxLength: 35 }}
                style={{ zIndex: "0" }}
                required
                fullWidth
                size="small"
              />
              {/* Mobile and Email Fields - Now side-by-side */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: '16px',
                  width: '100%',
                  alignItems: 'flex-start',
                }}
              >
                <FormControl fullWidth size="small" error={Boolean(mobileError)} sx={{ zIndex: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      fontSize: '0.75rem',
                      color: 'rgba(0, 0, 0, 0.6)',
                      fontWeight: 500,
                    }}
                  >
                    Mobile <span>*</span>
                  </Typography>
                  <PhoneInput
                    country={'ae'}
                    value={formData.contact.mobile}
                    onChange={handlePhoneChange}
                    inputProps={{ required: true }}
                    containerStyle={{
                      width: '100%',
                    }}
                    inputStyle={{
                      width: '100%',
                      height: '40px',
                      fontSize: '14px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      boxShadow: 'none',
                      paddingLeft: '50px',
                    }}
                    buttonStyle={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderRadius: '4px 0 0 4px',
                    }}
                  />
                  {mobileError && <FormHelperText>{mobileError}</FormHelperText>}
                </FormControl>

                <TextField
                  label='Email'
                  name="contact.email"
                  value={formData.contact.email}
                  style={{ marginTop: "20px",zIndex:"0" }}

                  onChange={handleChange}
                  onBlur={async (e) => {
                    const email = e.target.value.trim();
                    if (!email) {
                      setEmailError('');
                      return;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                      setEmailError('Enter a valid email address');
                      return;
                    }
                    if (formData.companyRoll !== 'Reconciliation Admin') {
                      const exists = await checkEmailExists(email);
                      setEmailError(exists ? 'Email already exists' : '');
                    }
                    else {
                      setEmailError('');
                    }
                  }}
                  error={Boolean(emailError)}
                  helperText={emailError || " "}
                  required
                  fullWidth
                  size="small"
                  type="email"
                />
              </Box>

              {/* Services Section */}
              <Box sx={{ mt: '4px', width: '100%', maxWidth: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Services
                </Typography>

                <TextField
                  select
                  label="Organization Type"
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleChange}
                  required
                  fullWidth
                  style={{ zIndex: "0" }}
                  size="small"
                  sx={{ mb: 2 }}
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
  value={formData.companyRoll}
  onChange={handleRoleChange}   // ✅ Use handleRoleChange, not handleChange
  required
  fullWidth
  style={{ zIndex: "0" }}
  size="small"
  sx={{ mb: 2 }}
>
  {ORGANIZATION_ROLL.map((type) => (
    <MenuItem
      key={type.value}
      value={type.value}
      disabled={disabledRoles.includes(type.value)}
    >
      {type.label}
    </MenuItem>
  ))}
</TextField>

                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Access
                </Typography>
                {accessError && <Typography color="error" sx={{ mb: 2 }}>{accessError}</Typography>}
                {/* Document Management Toggle */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: formData.services.dms ? '#f0faf5' : 'transparent',
                  width: '98%'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Document Management
                  </Typography>
                  <Box
                    onClick={() => handleServiceToggle('dms')}
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: formData.services.dms ? '#00b359' : '#e0e0e0',
                      position: 'relative',
                      cursor: 'pointer',
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
                      bgcolor: 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: 1
                    }} />
                  </Box>
                </Box>

                {/* Audit Service Toggle */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: formData.services.audit ? '#f0faf5' : 'transparent',
                  width: '98%'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Audit Service
                  </Typography>
                  <Box
                    onClick={() => {
                      // Only allow enabling Audit if DMS is enabled
                      if (formData.services.dms || !formData.services.audit) {
                        handleServiceToggle('audit');
                      }
                    }}
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: formData.services.audit ? '#00b359' : '#e0e0e0',
                      position: 'relative',
                      cursor: formData.services.dms || formData.services.audit ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      opacity: formData.services.dms || formData.services.audit ? 1 : 0.5
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      top: 2,
                      left: formData.services.audit ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: 1
                    }} />
                  </Box>
                </Box>

                {/* Reconciliation Toggle */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: formData.services.reconciliation ? '#f0faf5' : 'transparent',
                  width: '98%'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Reconciliation
                  </Typography>
                  <Box
                    onClick={() => handleServiceToggle('reconciliation')}
                    sx={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      bgcolor: formData.services.reconciliation ? '#00b359' : '#e0e0e0',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Box sx={{
                      position: 'absolute',
                      top: 2,
                      left: formData.services.reconciliation ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: 1
                    }} />
                  </Box>
                </Box>

                {/* Audit Details */}
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
                        ? 'Audit & Reconciliation'
                        : formData.services.audit
                          ? 'Audit Manager'
                          : 'Reconciliation Manager'}
                    </Typography>

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
                          <MenuItem key={auditor.id} value={auditor.id}>
                            {auditor.name}
                          </MenuItem>
                        ))}
                      </TextField>

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
                          <MenuItem key={manager.id} value={manager.id}>
                            {manager.name}
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

              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                mt: 4,
                width: '100%'
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    fontSize: '0.8rem',
                    color: '#5a36a2',
                    borderColor: '#5a36a2',
                    '&:hover': {
                      borderColor: '#462f87',
                    }
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
                  {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Card>
    </Box>
  );
};

export default CompanyCreation;