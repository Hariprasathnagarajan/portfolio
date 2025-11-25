import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Table, Box,Button,TableBody,Typography, TableContainer,
  TableRow, TableCell, TableHead, OutlinedInput, InputAdornment,
  IconButton, useTheme, Breadcrumbs, Link as MuiLink
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  ImportExport as ImportExportIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// Styled components
const TabButton = styled(Button)(({ selected }) => ({
  fontSize: '12px',
  textTransform: 'none',
  color: selected ? '#5C4DFF' : '#888',
  fontWeight: selected ? '600' : '400',
  borderRadius: 0,
  padding: '4px 0',
  minWidth: 'auto',
  borderBottom: selected ? '2px solid #5C4DFF' : '2px solid transparent',
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#5C4DFF',
    borderBottom: '2px solid #5C4DFF',
  },
}));

// Table column configuration
const headLabel = [
  { id: 'declarationNumber', label: 'Declaration Number', align: 'left' },
  { id: 'companyCode', label: 'Company Code', align: 'left' },
  { id: 'companyName', label: 'Company Name', align: 'left' },
  { id: 'type', label: 'Status', align: 'left' },
];

// Updated dummy data with declaration objects
const dummyData = [
  {
    id: 1,
    auditor: 'Raja',
    assigned: 23,
    closed: [
      { declarationNumber: 'DEC-1001', companyCode: 'C001', companyName: 'ABC Corp', type: 'Import' },
      { declarationNumber: 'DEC-1002', companyCode: 'C002', companyName: 'XYZ Ltd', type: 'Export' },
      { declarationNumber: 'DEC-1003', companyCode: 'C003', companyName: 'Global Inc', type: 'Import' },
      { declarationNumber: 'DEC-1004', companyCode: 'C001', companyName: 'ABC Corp', type: 'Export' },
      { declarationNumber: 'DEC-1005', companyCode: 'C004', companyName: 'Trade Solutions', type: 'Import' }
    ],
    open: [
      { declarationNumber: 'DEC-2001', companyCode: 'C005', companyName: 'Ocean Freight', type: 'Export' },
      { declarationNumber: 'DEC-2002', companyCode: 'C001', companyName: 'ABC Corp', type: 'Import' }
    ],
    pendingClient: [
      { declarationNumber: 'DEC-3001', companyCode: 'C006', companyName: 'Air Cargo', type: 'Import' },
      { declarationNumber: 'DEC-3002', companyCode: 'C002', companyName: 'XYZ Ltd', type: 'Export' },
      { declarationNumber: 'DEC-3003', companyCode: 'C007', companyName: 'Logistics Pro', type: 'Import' }
    ],
    pendingAuditor: []
  },
  {
    id: 2,
    auditor: 'Rajesh',
    assigned: 15,
    closed: [
      { declarationNumber: 'DEC-4001', companyCode: 'C008', companyName: 'Shipping Co', type: 'Export' },
      { declarationNumber: 'DEC-4002', companyCode: 'C009', companyName: 'Trade Winds', type: 'Import' }
    ],
    open: [
      { declarationNumber: 'DEC-5001', companyCode: 'C010', companyName: 'Cargo Express', type: 'Export' },
      { declarationNumber: 'DEC-5002', companyCode: 'C011', companyName: 'Global Forwarders', type: 'Import' },
      { declarationNumber: 'DEC-5003', companyCode: 'C008', companyName: 'Shipping Co', type: 'Export' }
    ],
    pendingClient: [
      { declarationNumber: 'DEC-6001', companyCode: 'C012', companyName: 'Maritime Ltd', type: 'Import' }
    ],
    pendingAuditor: [
      { declarationNumber: 'DEC-7001', companyCode: 'C013', companyName: 'Quick Ship', type: 'Export' }
    ]
  },
  {
    id: 3,
    auditor: 'Kumar',
    assigned: 13,
    closed: [
      { declarationNumber: 'DEC-8001', companyCode: 'C014', companyName: 'Trade Link', type: 'Import' },
      { declarationNumber: 'DEC-8002', companyCode: 'C015', companyName: 'Cargo Masters', type: 'Export' }
    ],
    open: [],
    pendingClient: [
      { declarationNumber: 'DEC-9001', companyCode: 'C016', companyName: 'Air Express', type: 'Import' },
      { declarationNumber: 'DEC-9002', companyCode: 'C017', companyName: 'Oceanic', type: 'Export' },
      { declarationNumber: 'DEC-9003', companyCode: 'C018', companyName: 'Global Trade', type: 'Import' }
    ],
    pendingAuditor: [
      { declarationNumber: 'DEC-10001', companyCode: 'C019', companyName: 'Fast Freight', type: 'Export' }
    ]
  },
  {
    id: 4,
    auditor: 'Suresh',
    assigned: 20,
    closed: [
      { declarationNumber: 'DEC-11001', companyCode: 'C020', companyName: 'Trade Net', type: 'Import' },
      { declarationNumber: 'DEC-11002', companyCode: 'C021', companyName: 'Cargo Plus', type: 'Export' },
      { declarationNumber: 'DEC-11003', companyCode: 'C022', companyName: 'Global Logistics', type: 'Import' }
    ],
    open: [
      { declarationNumber: 'DEC-12001', companyCode: 'C023', companyName: 'Shipping Express', type: 'Export' },
      { declarationNumber: 'DEC-12002', companyCode: 'C024', companyName: 'Trade Solutions', type: 'Import' }
    ],
    pendingClient: [
      { declarationNumber: 'DEC-13001', companyCode: 'C025', companyName: 'Marine Cargo', type: 'Export' },
      { declarationNumber: 'DEC-13002', companyCode: 'C026', companyName: 'Air Logistics', type: 'Import' },
      { declarationNumber: 'DEC-13003', companyCode: 'C027', companyName: 'Global Forwarding', type: 'Export' }
    ],
    pendingAuditor: [
      { declarationNumber: 'DEC-14001', companyCode: 'C028', companyName: 'Quick Cargo', type: 'Import' }
    ]
  },
  {
    id: 5,
    auditor: 'Mani',
    assigned: 7,
    closed: [
      { declarationNumber: 'DEC-15001', companyCode: 'C029', companyName: 'Trade Express', type: 'Export' },
      { declarationNumber: 'DEC-15002', companyCode: 'C030', companyName: 'Cargo Network', type: 'Import' }
    ],
    open: [
      { declarationNumber: 'DEC-16001', companyCode: 'C031', companyName: 'Ocean Shipping', type: 'Export' },
      { declarationNumber: 'DEC-16002', companyCode: 'C032', companyName: 'Air Trade', type: 'Import' },
      { declarationNumber: 'DEC-16003', companyCode: 'C033', companyName: 'Global Cargo', type: 'Export' }
    ],
    pendingClient: [
      { declarationNumber: 'DEC-17001', companyCode: 'C034', companyName: 'Maritime Trade', type: 'Import' }
    ],
    pendingAuditor: []
  }
];

const statusLabels = {
  closed: 'Closed',
  open: 'Open',
  pendingClient: 'Pending Client',
  pendingAuditor: 'Pending Auditor'
};

const DetailsPage = () => {
  const { id, status } = useParams();
   const auditorData = dummyData.find(item => item.id === parseInt(id));
  const auditorName = auditorData?.auditor || `Auditor ID: ${id}`;
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch data based on URL params
  useEffect(() => {
    const fetchData = () => {
      const auditor = dummyData.find(a => a.id === parseInt(id));
      if (auditor && status && auditor[status]) {
        setData(auditor[status]);
      } else {
        setData([]);
      }
    };
    
    fetchData();
  }, [id, status]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    const formattedSearchTerm = searchTerm.toLowerCase();
    return data.filter(item => {
      return !searchTerm ||
        item.declarationNumber.toLowerCase().includes(formattedSearchTerm) ||
        item.companyCode.toLowerCase().includes(formattedSearchTerm) ||
        item.companyName.toLowerCase().includes(formattedSearchTerm) ||
        item.type.toLowerCase().includes(formattedSearchTerm);
    });
  }, [data, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  return (
    <Box sx={{
      padding: "20px",
      position: "absolute",
      top: "75px",
      width: '100%',
      fontSize: '12px',
      paddingRight: '50px',
      boxSizing: 'border-box'
    }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
        </Breadcrumbs>
      </Box>

      {/* Title */}
      <Box sx={{
        width: '98%',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        padding: '10px 24px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        backgroundColor: '#fafafa',
        my: 2,
      }}>
        <Typography variant="h6" sx={{ fontSize:"14px",fontWeight:"bold" }}>
          {statusLabels[status] || status} Declarations for Auditor: {auditorName}
        </Typography>
      </Box>

      {/* Main Content */}
      <Card sx={{
        width: '100%',
        padding: '16px',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
      }}>
        {/* Search Section */}
        <Box display="flex" justifyContent="flex-start" mb={2} alignItems="center">
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search declarations..."
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
            sx={{
              width: '120px',
              maxWidth: '400px',
              height: 36,
              fontSize: '12px',
              '& .MuiOutlinedInput-input': {
                padding: '0px 1px',
                fontSize: '12px',
              },
            }}
          />
        </Box>

        {/* Data Table */}
        <TableContainer sx={{ width: '100%', maxHeight: '350px', overflowY: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: theme.palette.grey[100],
                height: '56px'
              }}>
                {headLabel.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align}
                    sx={{
                      fontWeight: "600",
                      fontSize: "12px",
                      padding: "16px 12px",
                      whiteSpace: "nowrap",
                      color: theme.palette.text.primary,
                    }}
                  >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow
                  hover
                  key={index}
                  sx={{
                    height: '56px',
                    '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
                    '&:hover': { backgroundColor: theme.palette.grey[100] },
                    '& td': { 
                      fontSize: '12px', 
                      padding: '12px 8px',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'middle'
                    },
                  }}
                >
                  <TableCell align="left">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {row.declarationNumber}
                    </Box>
                  </TableCell>
                  <TableCell align="left">{row.companyCode}</TableCell>
                  <TableCell align="left">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {row.companyName}
                    </Box>
                  </TableCell>
                  <TableCell align="left">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={headLabel.length} align="center">
                    No declarations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Count of records */}
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredData.length} of {data.length} records
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default DetailsPage;