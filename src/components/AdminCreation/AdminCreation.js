import React, { useState, useEffect } from "react";
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import { useNavigate } from "react-router-dom";
import {
  TextField,
  MenuItem,
  Box,
  Button,
  Card,
  CircularProgress,
} from "@mui/material";
import apiServices from "../../ApiServices/ApiServices";
import "./AdminCreation.css";

const AdminCreation = () => {
  const navigate = useNavigate();

  // Define phone number limits based on country codes
  const phoneNumberLimits = {
    "+1": 10, // USA/Canada
    "+91": 10, // India
    "+44": 10, // UK
    "+86": 11, // China
    "+49": 10, // Germany
    "+971": 9, // UAE
  };

  const [emailError, setEmailError] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    UserName: "",
    email: "",
    contactNumber: "",
    countryCode: "+971",
    Country: "UAE",
    role: "",
    manager: "", // Added manager field to formData
    created_at: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState([]); // State for storing managers
  const [loadingManagers, setLoadingManagers] = useState(false); // Loading state for managers

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoadingManagers(true);
        const response = await apiServices.getManager();
        console.log("Fetched managers:", response);  // 🔍 ADD THIS LINE
        setManagers(response || []);
      } catch (error) {
        console.error("Error fetching managers:", error);
        setMessage("Failed to load managers");
      } finally {
        setLoadingManagers(false);
      }
    };

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setFormData((prevData) => ({
      ...prevData,
      created_at: `${year}-${month}-${day}`,
    }));

    fetchManagers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Allow only alphabets for firstName and lastName
    if ((name === "firstName" || name === "lastName") && !/^[a-zA-Z]*$/.test(value)) {
      return;
    }

    if (name === "contactNumber") {
      const currentLimit = phoneNumberLimits[formData.countryCode] || 15;
      if (value.length <= currentLimit && /^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });

      if (name === "email") {
        let noSpaceValue = value.replace(/\s/g, "");

        // Allow only permitted characters in the local-part and domain
        noSpaceValue = noSpaceValue.replace(/[^a-zA-Z0-9._%+-@]/g, "");

        // Prevent consecutive dots
        noSpaceValue = noSpaceValue.replace(/\.{2,}/g, ".");

        // Prevent starting with dot in local-part
        if (noSpaceValue.startsWith(".")) {
          noSpaceValue = noSpaceValue.substring(1);
        }
        setFormData({ ...formData, email: noSpaceValue });
        // Strict regex for final validation (runs while typing, but only shows error if not empty)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
        setEmailError(
          noSpaceValue.length > 0 &&
          noSpaceValue.includes("@") &&
          !emailRegex.test(noSpaceValue)
        );
        return;
      }
    }
  }; 

  const handleEmailBlur = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    setEmailError(formData.email.length > 0 && !emailRegex.test(formData.email));
  }
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setEmailError(true);
    return;
  }

  // Validate all required fields are filled
  if (!formData.firstName || !formData.lastName || !formData.email || 
      !formData.contactNumber || !formData.role) {
    setMessage("Please fill all required fields");
    return;
  }

  setIsLoading(true);

  // Extract country code and phone number from PhoneInput
  const phoneParts = formData.contactNumber.split(' ');
  const countryCode = phoneParts[0]; // Includes the +
  const mobileNumber = phoneParts.slice(1).join('');

  // Prepare payload that exactly matches backend expectations
  const payload = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    email: formData.email,
    contactNumber: formData.contactNumber, // Just the numbers without country code
    countryCode: formData.countryCode,    // The country code with +
    companyname: localStorage.getItem("company_name") ,
    role: formData.role,
    username: formData.UserName || formData.email, // Fallback to email if username not provided
    // Include manager_uuid only for Auditors if manager is selected
    ...(formData.role === 'Auditor' && formData.manager && { manager_uuid: formData.manager }),
    // Include empty auditTypes array if needed
    ...(formData.role === 'Auditor' && { auditTypes: [] })
  };

  try {
    console.log(payload);
    await apiServices.createAudit(payload);
    setMessage("User created successfully!");
    setTimeout(() => navigate("/AdminList"), 2000);
  } catch (error) {
    setMessage(`Error: ${error.response?.data?.error || error.message || "Failed to create user"}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleCancel = () => {
    navigate("/AdminList");
  };

  return (
    <div className="admin-container">
      <div className="admin-box">
        <h2 className="admin-title" style={{ fontSize: '16px' }}>User Creation</h2>

          {message && (
            <Box sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Card
                sx={{
                  px: 3,
                  py: 2,
                  backgroundColor: message.includes('success') ? '#e6f7ee' : '#fdecea',
                  color: message.includes('success') ? '#2e7d32' : '#c62828',
                  boxShadow: 0,
                  borderRadius: 2,
                  minWidth: 250,
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: '1rem',
                }}
                role="alert"
              >
                {message.includes('success')
                  ? 'User created successfully! Redirecting to Admin List...'
                  : message}
              </Card>
            </Box>
          )}
        <form onSubmit={handleSubmit} className="Admin-form">
        
            <Box display="flex" gap={2} >
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ maxLength:30, pattern: "[A-Za-z]*", inputMode: "text"  }}
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
                inputProps={{ maxLength:30, pattern: "[A-Za-z]*", inputMode: "text" }}
                variant="outlined"
                size="small"
              />
            </Box>
            <TextField
              label="UserName"
              name="UserName"
              value={formData.UserName}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ maxLength: 30 }}
              variant="outlined"
              margin="normal"
              size="small"
            />
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
              error={emailError}
              helperText={emailError ? "Please enter a valid email address" : ""}
              inputProps={{ pattern: "[^\\s]+", maxLength: 40, autoComplete:"off" }} // no spaces allowed
            />

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
              <PhoneInput
                country={'ae'}
                value={formData.contactNumber}
                onChange={(value) => {
                  setFormData({ ...formData, contactNumber: value });
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
              label="Organization Name"
              name="CompanyName"
              value={localStorage.getItem("company_name") || "VDart"}
              InputProps={{ readOnly: true }}
              fullWidth
              variant="outlined"
              margin="normal"
              size="small"
            />

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
  InputLabelProps={{ 
    shrink: true,
    style: { textAlign: 'left' }
  }}
  InputProps={{
    style: { textAlign: 'left' },
  }}
  SelectProps={{
    MenuProps: {
      PaperProps: {
        style: {
          maxHeight: 300,
        },
      },
    },
  }}
  size="small"
>
  {/* Auditor */}
  <MenuItem 
    value="Auditor"
    style={{ justifyContent: "flex-start", display: 'flex', paddingLeft: '16px' }}
  >
    Auditor
  </MenuItem>

  {/* Audit Manager */}
  <MenuItem 
    value="Audit Manager"
    style={{ justifyContent: "flex-start", display: 'flex', paddingLeft: '16px' }}
  >
    Audit Manager
  </MenuItem>

  {/* Product Admin → only if current user is Product Owner */}
  {localStorage.getItem("role") === "Product Owner" && (
    <MenuItem 
      value="Product Admin"
      style={{ justifyContent: "flex-start", display: 'flex', paddingLeft: '16px' }}
    >
      Product Admin
    </MenuItem>
  )}
</TextField>


            {formData.role === "Auditor" && (
              <TextField
                select
                label="Select Manager"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                margin="normal"
                InputLabelProps={{ 
                  shrink: true,
                  style: { textAlign: 'left' }
                }}
                InputProps={{
                  style: { textAlign: 'left' },
                }}
                size="small"
                disabled={loadingManagers}
              >
                {loadingManagers ? (
                  <MenuItem disabled>
                    Loading managers...
                  </MenuItem>
                ) : (
                  managers.map((manager) => (
                    <MenuItem 
                      key={manager.id} 
                      value={manager.id}
                      style={{ 
                        justifyContent: "flex-start",
                        display: 'flex',
                        marginLeft: 0,
                        paddingLeft: '16px',
                      }}
                    >
                      {manager.name || `${manager.firstName} ${manager.lastName}`.trim() || `Manager ${manager.uuid}`}
                    </MenuItem>
                  ))
                )}
              </TextField>
            )}

            <Box display="flex" justifyContent="flex-end" gap={2} mt={0.5}>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "Create"}
              </Button>
            </Box>
         
        </form>
      </div>
    </div>
  );
};

export default AdminCreation;