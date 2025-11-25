import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  MenuItem,
  Box,
  Button,
  Card,
  CircularProgress,
  Typography,
  CardContent,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import apiServices from "../../ApiServices/ApiServices";
import "./UpdateAdmin.css";
import Loader from "react-js-loader";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const ROLE_TYPES = {
  ADMIN: 'Product Admin',
  MANAGER: 'Audit Manager',
  AUDITOR: 'Auditor'
};

const UpdateAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobile: "",
    countryCode: "+971",
    role: "",
    manager: "",
    organization: "VDart"
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setLoadingManagers(true);

        // Fetch both admin data and managers in parallel
        const [adminResponse, managersResponse] = await Promise.all([
          apiServices.getAdminsbyID(id),
          apiServices.getManager()
        ]);

        console.log("=== DEBUG INFO ===");
        console.log("Admin API Response:", adminResponse);
        console.log("Managers API Response:", managersResponse);

        // Process managers data - the manager API returns a different structure
        const formattedManagers = managersResponse.map(manager => ({
          id: manager.id, // Use the direct id from manager API
          username: manager.username,
          name: manager.name,
          email: manager.email,
          phoneNumber: manager.phoneNumber,
          role: manager.role
        }));

        console.log("Formatted Managers:", formattedManagers);
        setManagers(formattedManagers);
        
        // Always set loadingManagers to false after managers are fetched
        setLoadingManagers(false);

        if (adminResponse) {
          const { details } = adminResponse;
          const authUser = details?.auth_user;
          const user = details?.user; // Get user object
          const organization = details?.organization;
          const role = details?.role;
          
          console.log("Admin Details:", details);
          console.log("User Details:", user);
          console.log("Auth User Details:", authUser);
          console.log("Admin Manager Info:", details?.manager);
          
          // Get mobile from user -> mobile
          let mobileNumber = "";
          if (user?.mobile) {
            mobileNumber = user.mobile;
            console.log("Mobile from user->mobile:", mobileNumber);
          } else if (authUser?.mobile) {
            // Fallback to the original path if the new path doesn't exist
            mobileNumber = authUser.mobile;
            console.log("Mobile from authUser->mobile (fallback):", mobileNumber);
          }
          
          // Find the matching manager by comparing with manager data
          let matchedManager = null;
          let selectedManagerId = "";
          
          if (details?.manager?.auth_user) {
            const adminManagerUsername = details.manager.auth_user.username;
            const adminManagerEmail = details.manager.auth_user.email;
            const adminManagerFirstName = details.manager.auth_user.first_name;
            const adminManagerLastName = details.manager.auth_user.last_name;
            
            console.log("Looking for manager with:");
            console.log("- Username:", adminManagerUsername);
            console.log("- Email:", adminManagerEmail);
            console.log("- Name:", `${adminManagerFirstName} ${adminManagerLastName}`);
            
            // First try to match by username
            matchedManager = formattedManagers.find(m => 
              m.username === adminManagerUsername
            );
            console.log("Match by username:", matchedManager);
            
            // If not found, try to match by email
            if (!matchedManager) {
              matchedManager = formattedManagers.find(m => 
                m.email === adminManagerEmail
              );
              console.log("Match by email:", matchedManager);
            }
            
            // If still not found, try to match by name
            if (!matchedManager) {
              const adminManagerName = `${adminManagerFirstName} ${adminManagerLastName}`.trim();
              matchedManager = formattedManagers.find(m => 
                m.name === adminManagerName
              );
              console.log("Match by name:", matchedManager);
            }
            
            // If still not found, try case-insensitive matching
            if (!matchedManager) {
              matchedManager = formattedManagers.find(m => 
                m.username?.toLowerCase() === adminManagerUsername?.toLowerCase() ||
                m.email?.toLowerCase() === adminManagerEmail?.toLowerCase()
              );
              console.log("Match by case-insensitive:", matchedManager);
            }
            
            selectedManagerId = matchedManager?.id || "";
          }

          const newFormData = {
            firstName: authUser?.first_name || "",
            lastName: authUser?.last_name || "",
            username: authUser?.username || "",
            email: authUser?.email || "",
            mobile: mobileNumber, // Use the mobile number from user->mobile
            countryCode: organization?.country_code || "+971",
            role: role?.name || "",
            manager: selectedManagerId, // Use the matched manager's ID
            organization: organization?.company_name || "VDart"
          };

          console.log("Setting form data:", newFormData);
          console.log("Final Mobile Number:", mobileNumber);
          console.log("Final Matched Manager:", matchedManager);
          console.log("Selected Manager ID:", selectedManagerId);
          
          setFormData(newFormData);
          setSelectedManager(matchedManager || null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Error loading user data");
      } finally {
        setIsLoading(false);
        // Ensure loadingManagers is always set to false in finally block
        setLoadingManagers(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update selected manager when dropdown changes
    if (name === 'manager') {
      const newManager = managers.find(m => m.id === value);
      setSelectedManager(newManager || null);
      console.log("Selected manager updated:", newManager);
    }
  };

  const handleManagerChange = (event) => {
    const value = event.target.value;
    console.log("Manager dropdown changed to:", value);
    console.log("Available managers:", managers);
    console.log("Loading state:", loadingManagers);
    
    setFormData(prev => ({ ...prev, manager: value }));
    const newManager = managers.find(m => m.id === value);
    setSelectedManager(newManager || null);
  };

  const handlePhoneChange = (value, country) => {
    setFormData(prev => ({
      ...prev,
      mobile: value,
      countryCode: `+${country.dialCode}`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      username: formData.username,
      email: formData.email,
      mobile: formData.mobile,
      country_code: formData.countryCode,
      role: formData.role,
      manager_uuid: formData.role === ROLE_TYPES.AUDITOR ? formData.manager : null,
      company_name: formData.organization
    };

    try {
      await apiServices.updateAdmin(id, payload);
      setMessage("User updated successfully!");
      setTimeout(() => navigate("/AdminList"), 2000);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/AdminList");
  };

  const getManagerDisplayName = (manager) => {
    if (!manager) return "No manager assigned";
    return manager.name || manager.username || `${manager.first_name} ${manager.last_name}`.trim();
  };

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      minHeight: "100vh",
      paddingTop: "9vh",
      paddingX: 4,
      width: '100vw',
    }}>
      <Card sx={{
        width: '100%',
        maxWidth: 800,
        height: 'auto',
        borderRadius: '1px',
        boxShadow: 'none',
        padding: 3,
      }}>
        <CardContent sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Typography variant="h6" sx={{ 
            color: "#000b58", 
            width: "100%", 
            mb: 1,
            textAlign: 'left',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '20px'
          }}>
            UPDATE USER
          </Typography>

          {message && (
            <Typography
              variant="body2"
              color={message.includes("Error") ? "error" : "primary"}
              sx={{
                mb: 2,
                fontSize: "0.7rem",
                fontWeight: "bold",
                color: message.includes("Error") ? "error.main" : "#28a745",
                textAlign: 'center',
                width: '100%',
              }}
            >
              {message}
            </Typography>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%", zIndex: 0 }}>
            <Box display="flex" gap={2}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                margin="normal"
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
                margin="normal"
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
              margin="normal"
              size="small"
              InputProps={{ readOnly: true }}
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
              label="Organization"
              value={formData.organization}
              InputProps={{ readOnly: true }}
              fullWidth
              variant="outlined"
              margin="normal"
              size="small"
            />

            <Box sx={{ mt: 2, mb: 1 }}>
              <PhoneInput
                country={'ae'}
                value={formData.mobile}
                onChange={handlePhoneChange}
                inputProps={{ required: true, name: 'mobile' }}
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

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                {Object.values(ROLE_TYPES).map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Manager Selection for Auditor Role */}
            {formData.role === ROLE_TYPES.AUDITOR && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth size="small" error={!formData.manager}>
                  <InputLabel id="manager-label">Manager *</InputLabel>
                  <Select
                    labelId="manager-label"
                    label="Manager *"
                    value={formData.manager}
                    onChange={handleManagerChange}
                    disabled={loadingManagers}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          zIndex: 1301,
                        },
                      },
                      disablePortal: false,
                    }}
                    sx={{
                      '& .MuiSelect-select': {
                        minHeight: '20px',
                      },
                    }}
                  >
                    {loadingManagers ? (
                      <MenuItem value="" disabled>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                          Loading managers...
                        </Box>
                      </MenuItem>
                    ) : managers.length === 0 ? (
                      <MenuItem value="" disabled>
                        No managers available
                      </MenuItem>
                    ) : (
                      [
                        <MenuItem key="empty" value="">
                          <em>Select a manager</em>
                        </MenuItem>,
                        ...managers.map((manager) => (
                          <MenuItem 
                            key={manager.id} 
                            value={manager.id}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'action.hover' 
                              } 
                            }}
                          >
                            {manager.name || manager.username || `Manager ${manager.id}`}
                          </MenuItem>
                        ))
                      ]
                    )}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Show manager info for non-auditor roles too, but as read-only */}
            {formData.role !== ROLE_TYPES.AUDITOR && selectedManager && (
              <TextField
                label="Manager"
                value={getManagerDisplayName(selectedManager)}
                InputProps={{ readOnly: true }}
                fullWidth
                variant="outlined"
                margin="normal"
                size="small"
              />
            )}

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#5a36a2",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#462f87" },
                  fontSize: "0.7rem",
                  px: 3,
                }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : "Update"}
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#95a5a6",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#7f8c8d" },
                  fontSize: "0.7rem",
                  px: 3,
                }}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="admincreation-loading-popup">
          <div className="admincreation-loading-popup-content">
            <Loader type="box-up" bgColor={"#000b58"} color={"#000b58"} size={100} />
            <p>Loading...</p>
          </div>
        </div>
      )}
    </Box>
  );
};

export default UpdateAdmin;