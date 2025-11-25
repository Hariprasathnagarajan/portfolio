import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import Loader from "react-js-loader";
import apiServices from '../../ApiServices/ApiServices';

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', severity: 'info' });
  const [formData, setFormData] = useState({
    username: '',
    company_name: '',
    first_name: '',
    mobile: '',
    email: '',
    created_at: '',
    role: '',
    countryCode: '+971'
  });
  const [roleOptions] = useState([
    { value: "Uploader", label: "Uploader" },
    { value: "Reviewer", label: "Reviewer" },
    { value: "Viewer", label: "Viewer" },
    // { value: "Auditor", label: "Auditor" },
    // { value: "Audit Manager", label: "Audit Manager" }
  ]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true);
        const response = await apiServices.getUsersbyId(id);
        console.log("API Response:", response);
        
        if (response) {
          // Map the backend response to our form fields
          const userData = {
            username: response.details?.auth_user?.username || '',
            company_name: response.details?.organization?.company_name || '',
            first_name: response.details?.auth_user?.first_name || '',
            mobile: response.details?.user?.mobile || response.organization?.mobile || '',
            email: response.details?.auth_user?.email || '',
            created_at: response.details?.user?.created_at ? 
              new Date(response.details?.user.created_at).toISOString().split('T')[0] : '',
            role: response.details?.role?.name || '',
            countryCode: response.details?.organization?.country_code || '+971'
          };

          // Convert role name to match our dropdown options
          if (userData.role === "REVIEWER") userData.role = "Reviewer";
          if (userData.role === "UPLOADER") userData.role = "Uploader";
          if (userData.role === "VIEWER") userData.role = "Viewer";
          if (userData.role === "AUDITOR") userData.role = "Auditor";
          if (userData.role === "AUDIT_MANAGER") userData.role = "Audit Manager";

          setFormData(userData);
          setMessage({ text: '', severity: 'info' });
        } else {
          setMessage({ text: 'User data not found', severity: 'error' });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setMessage({ text: 'Failed to load user data', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchUserDetails();
  }, [id]);

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'first_name':
        if (!value) error = 'Name is required';
        else if (/[^a-zA-Z\s]/.test(value)) error = 'Only letters allowed';
        break;
      case 'mobile':
        if (!value) error = 'Mobile is required';
        else if (!/^\d+$/.test(value)) error = 'Only numbers allowed';
        else if (value.length < 8) error = 'Minimum 8 digits required';
        else if (value.length > 15) error = 'Maximum 15 digits allowed';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'role':
        if (!value) error = 'Role is required';
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'company_name' && key !== 'created_at') {
        newErrors[key] = validateField(key, formData[key]);
      }
    });
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      setMessage({ text: 'Please fix the errors', severity: 'error' });
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        first_name: formData.first_name,
        mobile: formData.mobile,
        email: formData.email,
        role: formData.role,
        countryCode: formData.countryCode
      };

      const response = await apiServices.updateAdmin(id, payload);
      
      if (response.error) {
        setMessage({ text: response.error, severity: 'error' });
      } else {
        setMessage({ text: 'User updated successfully!', severity: 'success' });
        setTimeout(() => navigate('/user-list'), 1500);
      }
    } catch (error) {
      console.error('Update error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Update failed';
      setMessage({ text: errorMsg, severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/user-list');
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        paddingTop: "9vh",
        paddingX: 4,
        width: '100vw',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: '800px',
          borderRadius: '1px',
          boxShadow: 'none',
          padding: 3,
        }}
      >
        <CardContent sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontSize: '18px',
              color: '#000b58',
              marginTop: '10px',
              marginBottom: '20px',
              textAlign: 'left',
              width: '100%',
            }}
          >
            Update User Access
          </Typography>

          {message.text && (
            <Alert severity={message.severity} sx={{ width: '100%', mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              label="Username"
              name="username"
              value={formData.username || ''}
              onChange={handleChange}
              fullWidth
              disabled
              size="small"
              margin="dense"
              error={!!errors.username}
              helperText={errors.username}
            />

            <TextField
              label="Company Name"
              name="company_name"
              value={formData.company_name || ''}
              onChange={handleChange}
              fullWidth
              disabled
              size="small"
              margin="dense"
            />

            <TextField
              label="Person Name *"
              name="first_name"
              value={formData.first_name || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              margin="dense"
              error={!!errors.first_name}
              helperText={errors.first_name}
            />

            <TextField
              label="Mobile *"
              name="mobile"
              value={formData.mobile || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              margin="dense"
              inputProps={{
                maxLength: 15,
                inputMode: 'numeric'
              }}
              error={!!errors.mobile}
              helperText={errors.mobile}
            />

            <TextField
              label="Email *"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              margin="dense"
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              label="Access Creation Date"
              name="created_at"
              type="date"
              value={formData.created_at || ''}
              onChange={handleChange}
              fullWidth
              disabled
              size="small"
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth size="small" margin="dense" error={!!errors.role}>
              <InputLabel>Role *</InputLabel>
              <Select
                label="Role *"
                name="role"
                value={formData.role || ''}
                onChange={handleChange}
                required
              >
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error">
                  {errors.role}
                </Typography>
              )}
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleCancel}
                disabled={isLoading}
                sx={{ 
                  backgroundColor: '#95a5a6', 
                  color: '#fff', 
                  '&:hover': { backgroundColor: '#7f8c8d' }, 
                  fontSize: '0.7rem' 
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={isLoading}
                sx={{ 
                  backgroundColor: '#5a36a2', 
                  color: '#fff', 
                  '&:hover': { backgroundColor: '#462f87' }, 
                  fontSize: '0.7rem' 
                }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : "Update"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <Box sx={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Loader type="box-up" bgColor={'#000b58'} color={'#000b58'} size={100} />
            <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UpdateUser;
