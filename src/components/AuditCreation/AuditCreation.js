import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField, MenuItem, Box, Button, CircularProgress,
  Typography
} from "@mui/material";
import apiServices from '../../ApiServices/ApiServices';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const AuditCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    countryCode: "+971",
    role: "",
    manager: "",
  });

  const [managers, setManagers] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "role" && value === "Auditor") {
      fetchManagers();
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await apiServices.getAuditManagers();
      console.log("Fetched managers:", response.data);
      setManagers(response.data);
    } catch (error) {
      console.error("Failed to fetch managers", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      country_code: formData.countryCode,
      contact_number: formData.contactNumber,
      company_name: localStorage.getItem("company_name") || "VDart",
      role: formData.role,
      manager_id: formData.role === "Auditor" ? formData.manager : null,
    };

    try {
      await apiServices.createAudit(payload);
      setMessage("Audit user created successfully!");
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/AuditList");
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '100%',
          position: 'relative',
          paddingTop: '106px',
          paddingLeft: { xs: 2, sm: 10 },
          paddingRight: { xs: 2, sm: 10 },
          backgroundColor: '#fff',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ color: '#000b58', marginBottom: "1%", fontSize: "18px" }}>
          User Creation
        </h2>

        {message && (
          <Typography color="error" align="center" mt={1} fontSize="0.7rem">
            {message}
          </Typography>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1,
              marginBottom: 2,
            }}
          >
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              size="small"
            />
          </Box>

          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
            margin="normal"
            size="small"
          />

          <TextField
            label="Organization Name"
            name="CompanyName"
            value={localStorage.getItem("company_name") || "VDart"}
            InputProps={{ readOnly: true }}
            fullWidth
            variant="outlined"
            margin="normal"
            size="small"
          />

          <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Mobile <span style={{ color: 'red' }}>*</span>
            </Typography>
            <PhoneInput
              country={'ae'}
              value={formData.contactNumber}
              onChange={(value, country) => {
                setFormData(prev => ({
                  ...prev,
                  contactNumber: value,
                  countryCode: `+${country.dialCode}`,
                }));
              }}
              inputProps={{ required: true }}
              containerStyle={{ width: '100%' }}
              inputStyle={{
                width: '100%',
                height: '40px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                paddingLeft: '48px',
              }}
              buttonStyle={{
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
              }}
            />
          </Box>

          <TextField
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
            margin="normal"
            size="small"
          >
            <MenuItem value="Auditor">Auditor</MenuItem>
            <MenuItem value="Audit Manager">Audit Manager</MenuItem>
          </TextField>

          {formData.role === "Auditor" && (
            <TextField
              select
              label="Manager"
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              margin="normal"
              size="small"
            >
              {managers.length > 0 ? (
                managers.map((mgr) => (
                  <MenuItem key={mgr.id} value={mgr.id}>
                    {mgr.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Managers Available</MenuItem>
              )}
            </TextField>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#5a36a2',
                color: '#fff',
                '&:hover': { backgroundColor: '#462f87' },
                marginRight: 0.5,
                fontSize: '0.7rem'
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
            </Button>

            <Button
              variant="contained"
              sx={{
                backgroundColor: '#95a5a6',
                color: '#fff',
                '&:hover': { backgroundColor: '#7f8c8d' },
                fontSize: '0.7rem'
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default AuditCreation;
