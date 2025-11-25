import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Box,
  Button,
  CircularProgress,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { FaCloudUploadAlt } from 'react-icons/fa';
import authService from '../../ApiServices/ApiServices';

const CompanyCreation = () => {
  const [company, setCompany] = useState({
    username: 'AE-',
    companyName: '',
    firstname: '',
    Lastname: '',
    mobile: '',
    email: '',
    accessCreationDate: '',
  });

  const [contractDocuments, setContractDocuments] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany({ ...company, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setContractDocuments(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(company).forEach((key) => formData.append(key, company[key]));
    if (contractDocuments) formData.append('contractDocuments', contractDocuments);
    formData.append('personName', `${company.firstname} ${company.Lastname}`);
    setIsLoading(true);
    try {
      await authService.createOrganization(formData);
      alert('Company registered successfully!');
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Something went wrong.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        minHeight: '100vh',
        paddingTop: '9vh',
        paddingX: 4,
        backgroundColor: '#f4f4f4',
      }}
    >
      <Card
        sx={{
          width: '100%',
          borderRadius: '8px',
          boxShadow: 3,
          backgroundColor: '#fff',
        }}
      >
        <CardContent
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <h3
            className="company-title"
            style={{ color: '#000b58', width: '100%', marginBottom: '1%' }}
          >
            Company Creation
          </h3>

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
                name="firstname"
                onChange={handleChange}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Last Name"
                name="Lastname"
                onChange={handleChange}
                required
                fullWidth
                size="small"
              />
            </Box>

            <TextField
              label="Username"
              name="username"
              value={company.username}
              onChange={handleChange}
              required
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              label="Company Name"
              name="companyName"
              onChange={handleChange}
              required
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              label="Mobile"
              name="mobile"
              onChange={handleChange}
              required
              fullWidth
              margin="dense"
              size="small"
            />
            <TextField
              label="Email"
              name="email"
              onChange={handleChange}
              required
              fullWidth
              margin="dense"
              size="small"
              type="email"
            />
            <TextField
              label="Access Creation Date"
              name="accessCreationDate"
              onChange={handleChange}
              required
              fullWidth
              margin="dense"
              size="small"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Box
              sx={{
                border: '2px dashed #ddd',
                borderRadius: '8px',
                backgroundColor: '#f8f9fc',
                padding: 2,
                cursor: 'pointer',
                marginTop: 2,
                textAlign: 'center',
              }}
            >
              <label htmlFor="contractDocuments" style={{ cursor: 'pointer' }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <FaCloudUploadAlt size={20} color="#777" />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    mt={0.5}
                    fontSize="0.7rem"
                  >
                    Drag and Drop your Master Services Agreement (MSA) Doc here
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    fontSize="0.7rem"
                  >
                    -OR-
                  </Typography>
                  <Button
                    variant="contained"
                    component="span"
                    sx={{
                      mt: 0.5,
                      backgroundColor: '#5a36a2',
                      '&:hover': { backgroundColor: '#462f87' },
                      fontSize: '0.65rem',
                    }}
                  >
                    Browse files
                  </Button>
                </Box>
                <input
                  id="contractDocuments"
                  type="file"
                  name="contractDocuments"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </Box>

            {error && (
              <Typography
                color="error"
                align="center"
                mt={1}
                fontSize="0.7rem"
              >
                {error}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#5a36a2',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#462f87' },
                  marginRight: 0.5,
                  fontSize: '0.7rem',
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Submit'
                )}
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#95a5a6',
                  color: '#fff',
                  '&:hover': { backgroundColor: '#7f8c8d' },
                  fontSize: '0.7rem',
                }}
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanyCreation;
