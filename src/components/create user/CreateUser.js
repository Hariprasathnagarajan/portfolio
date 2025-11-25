import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs from 'dayjs';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Box,
  Container,
  Paper,
  Grid
} from "@mui/material";
import apiServices from '../../ApiServices/ApiServices';
import Loader from "react-js-loader";
import './CreateUser.css';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    companyName: localStorage.getItem("company_name") || "",
    name: '',
    mobile: '',
    email: '',
    created_at: dayjs().format('DD/MM/YYYY'),
    role: '',
    countryCode: '+971'
  });

  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({
    mobile: '',
    email: '',
    name: '',
    username: '',
    role: '',
    created_at: ''
  });

  const [emailError, setEmailError] = useState(false);
  const [emailExistsError, setEmailExistsError] = useState('');
  const [usernameExistsError, setUsernameExistsError] = useState('');

  const navigate = useNavigate();

  const roleOptions = [
    { value: "Uploader", label: "Uploader" },
    { value: "Reviewer", label: "Reviewer" },
    { value: "Viewer", label: "Viewer" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === "email") {
      setEmailExistsError('');
      setUsernameExistsError('');
      setEmailError(false);
    }
  };

  const handleEmailBlur = async (e) => {
    const value = e.target.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value.length > 0 && !emailRegex.test(value)) {
      setEmailError(true);
      setEmailExistsError('');
      return;
    } else {
      setEmailError(false);
    }

    setFormData(prev => ({
      ...prev,
      username: value
    }));

    if (value) {
      try {
        const response = await apiServices.checkEmail(value);
        if (response.exists) {
          setEmailExistsError("Email already exists.");
        } else {
          setEmailExistsError('');
        }
      } catch (err) {
        console.error("Error checking email:", err);
        setEmailExistsError("Error checking email");
      }
    }
  };

  const validateMobile = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return 'Mobile number is required';
    if (numericValue.length < 8) return 'Mobile number must be at least 8 digits';
    if (numericValue.length > 15) return 'Mobile number should not exceed 15 digits';
    if (!/^[0-9]+$/.test(numericValue)) return 'Only numbers are allowed';
    return '';
  };

  const validateDate = (dateString) => {
    if (!dateString) return 'Date is required';
    // Accept DD/MM/YYYY only
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateString)) {
      return 'Invalid date format (DD/MM/YYYY)';
    }
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    if (year < 2000 || year > currentYear + 1) {
      return `Year must be between 2000 and ${currentYear + 1}`;
    }
    if (date > currentDate) {
      return 'Date cannot be in the future';
    }
    return '';
  };

  const handleDateChange = (e) => {
  // Accept manual entry in DD/MM/YYYY format
  const value = e.target.value;
  const error = validateDate(value);
  setFormData(prev => ({ ...prev, created_at: value }));
  setErrors(prev => ({ ...prev, created_at: error }));
  };

  const validateForm = () => {
    const newErrors = {
      username: !formData.username ? 'Username is required' : usernameExistsError,
      name: !formData.name ? 'Name is required' : '',
      email: !formData.email ? 'Email is required' :
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'Invalid email format' :
          emailExistsError ? emailExistsError : '',
      mobile: validateMobile(formData.mobile),
      role: !formData.role ? 'Role is required' : '',
      created_at: validateDate(formData.created_at)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage("Please fix the errors before submitting");
      return;
    }


    setMessage('');

    const nameParts = formData.name.trim().split(" ");
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    const payload = {
      username: formData.username,
      companyName: formData.companyName,
      first_name: first_name,
      last_name: last_name,
      email: formData.email,
      mobile: formData.mobile,
      countryCode: formData.countryCode,
      created_at: formData.created_at,
      role: formData.role,
      expired_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    };

    try {
      const response = await apiServices.register(payload);

      if (response.error) {
        const errStr = response.error.toLowerCase();
        if (errStr.includes('email')) {
          setEmailExistsError('Email already exists.');
        } else if (errStr.includes('username')) {
          setUsernameExistsError('Username already exists.');
        } else if (errStr.includes('name')) {
          setErrors(prev => ({ ...prev, name: 'Person name already exists.' }));
        } else {
          setMessage(response.error);
        }
      } else {
        setMessage("User registered successfully!");
        setTimeout(() => navigate("/user-list"), 1500);
      }

    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";

      if (error.response) {
        const { data } = error.response;

        if (typeof data === 'object') {
          const fieldErrors = {
            email: '',
            username: '',
            name: ''
          };

          Object.entries(data).forEach(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            msgArray.forEach((msg) => {
              const lowerMsg = String(msg).toLowerCase();
              if (field === 'email' || lowerMsg.includes('email')) {
                fieldErrors.email = 'Email already exists.';
              } else if (field === 'username' || lowerMsg.includes('username')) {
                fieldErrors.username = 'Username already exists.';
              } else if (field === 'name' || lowerMsg.includes('name')) {
                fieldErrors.name = 'Person name already exists.';
              }
            });
          });

          setEmailExistsError(fieldErrors.email);
          setUsernameExistsError(fieldErrors.username);
          setErrors(prev => ({ ...prev, name: fieldErrors.name || prev.name }));

          if (!fieldErrors.email && !fieldErrors.username && !fieldErrors.name) {
            errorMessage = Object.values(data).flat().join(', ');
            setMessage(errorMessage);
          } else {
            setMessage('');
          }

        } else if (data?.error) {
          const errStr = String(data.error).toLowerCase();
          if (errStr.includes('email')) {
            setEmailExistsError('Email already exists.');
          } else if (errStr.includes('username')) {
            setUsernameExistsError('Username already exists.');
          } else if (errStr.includes('name')) {
            setErrors(prev => ({ ...prev, name: 'Person name already exists.' }));
          }
          setMessage('');
        }
      } else if (error.message) {
        setMessage(error.message);
      } else {
        setMessage(errorMessage);
      }

    } finally {

    }
  };

  const handleCancel = () => {
    navigate("/user-list");
  };

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        paddingTop: '76px',
        zIndex: '0',
        marginLeft: '100px',
        boxSizing: 'border-box'
      }}
    >
      <Paper elevation={0} style={{ width: '100%', maxWidth: '1000px', padding: '16px' }}>
        <h2 className="usercreation-title">Access Management</h2>

        {message && (
  <Box sx={{
    backgroundColor: message === "User registered successfully!" ? 'green' : 'red',
    color: 'white',
    padding: '8px',
    marginBottom: '16px',
    borderRadius: '4px'
  }} role="alert">
    {message}
  </Box>
)}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12}>
              <TextField
                label="UserName *"
                name="username"
                value={formData.username}
                fullWidth
                variant="outlined"
                margin="normal"
                size="small"
                disabled
                error={!!usernameExistsError}
                helperText={usernameExistsError || "Username will always be same as Email"}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name *"
                name="companyName"
                value={formData.companyName}
                InputProps={{ readOnly: true }}
                size="small"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Person Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                inputProps={{ maxLength: 30, pattern: "[A-Za-z ]*", inputMode: "text" }}
                size="small"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                required
                fullWidth
                variant="outlined"
                margin="normal"
                size="small"
                error={emailError || !!emailExistsError}
                helperText={
                  emailError
                    ? "Please enter a valid email address"
                    : emailExistsError
                }
                inputProps={{ maxLength: 40, autoComplete: "off" }}
                sx={{ mt: 1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <PhoneInput
                country={"ae"}
                value={formData.mobile}
                onChange={(value, country) => {
                  setFormData(prev => ({
                    ...prev,
                    mobile: value.replace(/\D/g, ""),
                    countryCode: `+${country.dialCode}`
                  }));
                  setErrors(prev => ({ ...prev, mobile: "" }));
                }}
                inputProps={{
                  name: "mobile",
                  required: true,
                }}
                containerStyle={{ width: "100%" }}
                inputStyle={{ width: "100%" }}
                specialLabel="Mobile Number *"
              />
              {errors.mobile && (
                <span style={{ color: "red", fontSize: "12px" }}>{errors.mobile}</span>
              )}
            </Grid>

            <Grid item xs={12} hidden>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Access Creation Date *"
                  value={dayjs(formData.created_at, 'DD/MM/YYYY')}
                  format="DD/MM/YYYY"
                  maxDate={dayjs()}
                  onChange={(date) => {
                    const formatted = date ? dayjs(date).format('DD/MM/YYYY') : '';
                    setFormData(prev => ({ ...prev, created_at: formatted }));
                    setErrors(prev => ({ ...prev, created_at: validateDate(formatted) }));
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      error: !!errors.created_at,
                      helperText: errors.created_at,
                      placeholder: 'DD/MM/YYYY',
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Role *"
                name="role"
                value={formData.role}
                onChange={handleChange}
                error={!!errors.role}
                helperText={errors.role}
                size="small"
                variant="outlined"
              >
                <MenuItem value="">Select a role</MenuItem>
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
             
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              
              sx={{ minWidth: '100px' }}
            >
              { "create" }
            </Button>
          </Box>
        </form>

        
      </Paper>
    </Container>
  );
};

export default CreateUser;
