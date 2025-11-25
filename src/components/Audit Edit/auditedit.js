import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  TextField,
  MenuItem,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import mockUsers from "../mockusers";

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user, onSave } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNumber: "",
    auditType: "",
    role: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      const username = user.email.split("@")[0].replace(/\./g, " ");
      const phoneNumber = user.phoneNumber.replace(/\D/g, "");

      setFormData({
        firstName,
        lastName,
        username,
        email: user.email,
        phoneNumber,
        auditType: user.auditType || "",
        role: user.role === "manager" ? "Audit Manager" : "Auditor",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Update mockUsers array immediately
    updateMockUsers({ [name]: value });
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value }));
    updateMockUsers({ phoneNumber: value });
  };

  // Function to update mockUsers array
  const updateMockUsers = (updatedFields) => {
    const userIndex = mockUsers.findIndex(u => u.id === parseInt(id));
    if (userIndex !== -1) {
      const updatedUser = {
        ...mockUsers[userIndex],
        ...updatedFields,
        // Special handling for name field
        ...(updatedFields.firstName || updatedFields.lastName ? {
          name: `${updatedFields.firstName || formData.firstName} ${updatedFields.lastName || formData.lastName}`,
          first_name: updatedFields.firstName || formData.firstName,
          last_name: updatedFields.lastName || formData.lastName
        } : {}),
        // Special handling for phoneNumber
        ...(updatedFields.phoneNumber ? {
          phoneNumber: `+${updatedFields.phoneNumber}`
        } : {}),
        // Special handling for role
        ...(updatedFields.role ? {
          role: updatedFields.role === "Audit Manager" ? "manager" : "auditor"
        } : {})
      };
      
      mockUsers[userIndex] = updatedUser;
      
      // If onSave callback is provided (from parent component), call it
      if (onSave) {
        onSave(updatedUser);
      }
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Update the user in mockUsers with all form data
    updateMockUsers(formData);
    
    setMessage("User updated successfully!");
    
    // Check the user's role and navigate accordingly
    if (formData.role === "Auditor") {
      setTimeout(() => navigate("/AuditList/user-auditor"), 1500);
    } else if (formData.role === "Audit Manager") {
      setTimeout(() => navigate("/AuditList/user-manager"), 1500);
    } else {
      // Default navigation if role doesn't match expected values
      setTimeout(() => navigate("/AuditList"), 1500);
    }
  } catch (error) {
    setMessage(`Error: ${error.message}`);
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
        display: "flex",
        justifyContent: "column",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "auto",
          position: "relative",
          zIndex: 0,
          backgroundColor: "#fff",
          borderRadius: "1px",
          paddingTop: "106px",
          paddingLeft: 10,
          paddingRight: 10,
          boxShadow: "none",
        }}
      >
        <h2
          className="company-title"
          style={{
            color: "#000b58",
            width: "100%",
            marginBottom: "1%",
            fontSize: "18px",
          }}
        >
          Edit Audit User
        </h2>
        {message && (
          <Typography color="error" align="center" mt={1} fontSize="0.7rem">
            {message}
          </Typography>
        )}
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
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
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            fullWidth
            variant="outlined"
            margin="dense"
            size="small"
            sx={{ mb: 2 }}
          />
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
            value="VDart"
            InputProps={{ readOnly: true }}
            fullWidth
            variant="outlined"
            margin="normal"
            size="small"
          />
          <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Mobile <span style={{ color: "red" }}>*</span>
            </Typography>
            <PhoneInput
              country={"ae"}
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              inputProps={{ required: true }}
              containerStyle={{ width: "100%" }}
              inputStyle={{
                width: "100%",
                height: "40px",
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid rgba(0, 0, 0, 0.23)",
                paddingLeft: "48px",
              }}
              buttonStyle={{
                borderTopLeftRadius: "4px",
                borderBottomLeftRadius: "4px",
                border: "1px solid rgba(0, 0, 0, 0.23)",
              }}
            />
          </Box>

          <TextField
            select
            label="Audit Type"
            name="auditType"
            value={formData.auditType}
            onChange={handleChange}
            required={formData.role === "Auditor"}
            fullWidth
            variant="outlined"
            margin="normal"
            size="small"
          >
            <MenuItem value="Freezone">Freezone</MenuItem>
            <MenuItem value="Mainland">Mainland</MenuItem>
            <MenuItem value="Warehouse">Warehouse</MenuItem>
            <MenuItem value="Broker/Agent">Broker/Agent</MenuItem>
          </TextField>

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

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#5a36a2",
                color: "#fff",
                "&:hover": { backgroundColor: "#462f87" },
                marginRight: 0.5,
                fontSize: "0.7rem",
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Update"
              )}
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#95a5a6",
                color: "#fff",
                "&:hover": { backgroundColor: "#7f8c8d" },
                fontSize: "0.7rem",
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

export default EditUser;
