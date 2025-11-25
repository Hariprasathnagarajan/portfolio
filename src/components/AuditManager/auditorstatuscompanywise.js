import React, { useState } from 'react';
import { DialogTitle } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Card, Table, Box, Typography, TableContainer,
  TableRow, TableCell, TableBody, TableHead, OutlinedInput, InputAdornment,
  IconButton, useTheme, Dialog, Button,
  DialogContent, DialogActions, Tooltip, TableSortLabel, TablePagination
} from '@mui/material';
import { styled } from '@mui/material/styles'; // Note: Import from @mui/material/styles
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// Styled components with theme fallbacks
const TabButton = styled(Button)(({ selected, theme }) => ({
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

const BlueUsername = styled('span')(({ theme }) => ({
  color: '#1976d2',
  fontWeight: '500',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const StatusLink = styled('span')(({ theme }) => ({
  color: theme?.palette?.primary?.main || '#1976d2', // Fallback color
  fontWeight: '500',
  cursor: 'pointer',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const AuditStatusTable = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams();
  
  // Dummy data (same as before)
   const userCompanyData = {
    Raja: [
      {
        id: 1,
        companyCode: "AE-2347346576",
        companyName: "Aramex Logistics",
        type: "FZ",
        closed: 12,
        open: 8,
        pendingClient: 3,
        pendingAuditor: 2
      },
      {
        id: 2,
        companyCode: "AE-7634567567",
        companyName: "Gulf Express",
        type: "Mainland",
        closed: 10,
        open: 5,
        pendingClient: 6,
        pendingAuditor: 1
      },
      {
        id: 3,
        companyCode: "AE-7457346573",
        companyName: "Emirates Cargo",
        type: "Broker",
        closed: 6,
        open: 4,
        pendingClient: 7,
        pendingAuditor: 3
      },
      {
        id: 4,
        companyCode: "AE-7846374657",
        companyName: "Middle East Freight",
        type: "Warehouse",
        closed: 15,
        open: 2,
        pendingClient: 5,
        pendingAuditor: 1
      },
      {
        id: 5,
        companyCode: "AE-3847567845",
        companyName: "Al Jaber Logistics",
        type: "Mainland",
        closed: 3,
        open: 12,
        pendingClient: 4,
        pendingAuditor: 2
      }
    ],
    Rajesh: [
      {
        id: 6,
        companyCode: "AE-2347346576",
        companyName: "Agility Logistics",
        type: "FZ",
        closed: 9,
        open: 7,
        pendingClient: 2,
        pendingAuditor: 3
      },
      {
        id: 7,
        companyCode: "AE-7634567567",
        companyName: "Kuehne + Nagel UAE",
        type: "Mainland",
        closed: 11,
        open: 6,
        pendingClient: 1,
        pendingAuditor: 2
      },
      {
        id: 8,
        companyCode: "AE-7457346573",
        companyName: "GWC Logistics",
        type: "Broker",
        closed: 4,
        open: 9,
        pendingClient: 3,
        pendingAuditor: 1
      },
      {
        id: 9,
        companyCode: "AE-7846374657",
        companyName: "Dnata Freight",
        type: "Warehouse",
        closed: 7,
        open: 2,
        pendingClient: 6,
        pendingAuditor: 4
      },
      {
        id: 10,
        companyCode: "AE-3847567845",
        companyName: "RAK Transport",
        type: "Mainland",
        closed: 5,
        open: 3,
        pendingClient: 2,
        pendingAuditor: 2
      }
    ],
    Mani: [
      {
        id: 11,
        companyCode: "AE-2347346576",
        companyName: "Masafi Logistics",
        type: "FZ",
        closed: 8,
        open: 4,
        pendingClient: 3,
        pendingAuditor: 1
      },
      {
        id: 12,
        companyCode: "AE-7634567567",
        companyName: "Qatar Logistics",
        type: "Mainland",
        closed: 6,
        open: 5,
        pendingClient: 4,
        pendingAuditor: 2
      },
      {
        id: 13,
        companyCode: "AE-7457346573",
        companyName: "Al Futtaim Freight",
        type: "Broker",
        closed: 10,
        open: 2,
        pendingClient: 5,
        pendingAuditor: 3
      },
      {
        id: 14,
        companyCode: "AE-7846374657",
        companyName: "Al Naboodah Transport",
        type: "Warehouse",
        closed: 7,
        open: 3,
        pendingClient: 6,
        pendingAuditor: 1
      },
      {
        id: 15,
        companyCode: "AE-3847567845",
        companyName: "Bahri Logistics",
        type: "Mainland",
        closed: 9,
        open: 6,
        pendingClient: 2,
        pendingAuditor: 2
      }
    ],
    Suresh: [
      {
        id: 16,
        companyCode: "AE-2347346576",
        companyName: "Etihad Cargo",
        type: "FZ",
        closed: 13,
        open: 4,
        pendingClient: 1,
        pendingAuditor: 1
      },
      {
        id: 17,
        companyCode: "AE-7634567567",
        companyName: "Trans Gulf Logistics",
        type: "Mainland",
        closed: 6,
        open: 3,
        pendingClient: 2,
        pendingAuditor: 2
      },
      {
        id: 18,
        companyCode: "AE-7457346573",
        companyName: "Noor Shipping",
        type: "Broker",
        closed: 10,
        open: 1,
        pendingClient: 4,
        pendingAuditor: 1
      },
      {
        id: 19,
        companyCode: "AE-7846374657",
        companyName: "Blue Water Express",
        type: "Warehouse",
        closed: 5,
        open: 8,
        pendingClient: 3,
        pendingAuditor: 3
      },
      {
        id: 20,
        companyCode: "AE-3847567845",
        companyName: "Al Masa Movers",
        type: "Mainland",
        closed: 2,
        open: 6,
        pendingClient: 5,
        pendingAuditor: 1
      }
    ],
    Kumar: [
      {
        id: 21,
        companyCode: "AE-2347346576",
        companyName: "Tristar Transport",
        type: "FZ",
        closed: 7,
        open: 5,
        pendingClient: 2,
        pendingAuditor: 2
      },
      {
        id: 22,
        companyCode: "AE-7634567567",
        companyName: "Al Majdouie Logistics",
        type: "Mainland",
        closed: 12,
        open: 6,
        pendingClient: 1,
        pendingAuditor: 1
      },
      {
        id: 23,
        companyCode: "AE-7457346573",
        companyName: "KGL Logistics",
        type: "Broker",
        closed: 4,
        open: 3,
        pendingClient: 2,
        pendingAuditor: 2
      },
      {
        id: 24,
        companyCode: "AE-7846374657",
        companyName: "Gulf Agency Company",
        type: "Warehouse",
        closed: 6,
        open: 4,
        pendingClient: 5,
        pendingAuditor: 1
      },
      {
        id: 25,
        companyCode: "AE-3847567845",
        companyName: "TAS Logistics",
        type: "Mainland",
        closed: 3,
        open: 9,
        pendingClient: 6,
        pendingAuditor: 3
      }
    ]
  };

  // Get data for the specific auditor
  const data = userCompanyData[id] || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('companyCode');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Table headers
  const headLabel = [
    { id: 'companyCode', label: 'Company Code', align: 'left', sortable: true },
    { id: 'companyName', label: 'Company Name', align: 'left', sortable: true },
    { id: 'type', label: 'Type', align: 'left', sortable: true },
    { id: 'closed', label: 'Closed', align: 'center', sortable: true },
    { id: 'open', label: 'Open', align: 'center', sortable: true },
    { id: 'pendingClient', label: 'Pending with Client', align: 'center', sortable: true },
    { id: 'pendingAuditor', label: 'Pending with Auditor', align: 'center', sortable: true },
  ];

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.companyCode.toLowerCase().includes(searchLower) ||
      item.companyName.toLowerCase().includes(searchLower) ||
      item.type.toLowerCase().includes(searchLower)
    );
  });

  const sortedData = filteredData.sort((a, b) => {
    let comparison = 0;
    const aValue = a[orderBy].toString().toLowerCase();
    const bValue = b[orderBy].toString().toLowerCase();
    
    if (typeof a[orderBy] === 'number') {
      comparison = a[orderBy] - b[orderBy];
    } else {
      comparison = aValue.localeCompare(bValue);
    }
    
    return order === 'asc' ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPage(0);
  };

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };

  const handleCompanyCodeClick = (companyCode, e) => {
    e.stopPropagation();
    navigate(`/DeclarationWise/${id}/${companyCode}`);
  };

  const handleStatusClick = (statusType, value, companyCode, e) => {
    e.stopPropagation();
    navigate(`/status-details/${id}/${companyCode}/${statusType}`, {
      state: {
        count: value,
        statusType: statusType
      }
    });
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
      {/* Title Section */}
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
        <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" />}
                  aria-label="breadcrumb"
                  sx={{ fontSize: "12px" }}
                >
                  <Link
                    underline="hover"
                    color="inherit"
                    onClick={() => navigate('/AuditorDash')}
                    sx={{ cursor: 'pointer', fontWeight: 600, fontSize: "14px" }}
                  >
                    Auditor status
                  </Link>
                  <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "14px" }}>
                    Auditor Organization Status
                  </Typography>
                </Breadcrumbs>
        <Typography variant="h6" sx={{ fontSize: "14px" }}>
          Auditor : <Box component="span" sx={{ fontWeight: 'bold' }}>{id}</Box>
        </Typography>      
      </Box>

      {/* Main Table Card - with theme fallbacks */}
      <Card sx={{
        width: '100%',
        padding: '16px',
        backgroundColor: theme?.palette?.background?.paper || '#fff',
        boxShadow: theme?.shadows?.[1] || '0px 2px 1px -1px rgba(0,0,0,0.2)',
        borderRadius: '8px',
        border: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
      }}>
        {/* Search Input */}
        <Box display="flex" justifyContent="flex-start" width="100%" mb={2}>
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search..."
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
                fontSize: '11px',
              },
            }}
          />
        </Box>

        {/* Data Table */}
        <TableContainer sx={{ width: '100%', maxHeight: '350px', overflowY: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: theme?.palette?.grey?.[100] || '#f5f5f5',
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
                      color: theme?.palette?.text?.primary || '#000',
                    }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                        sx={{
                          '&.Mui-active': {
                            color: '#1976d2',
                          },
                          '&:hover': {
                            color: '#1976d2',
                          },
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map(row => (
                  <TableRow
                    hover
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    sx={{
                      height: '56px',
                      '&:nth-of-type(odd)': { 
                        backgroundColor: theme?.palette?.grey?.[50] || '#fafafa' 
                      },
                      '&:hover': { 
                        backgroundColor: theme?.palette?.grey?.[100] || '#f5f5f5' 
                      },
                      '& td': { 
                        fontSize: '12px', 
                        padding: '12px 8px',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle'
                      },
                    }}
                  >
                    <TableCell align="left">
                      <BlueUsername 
                        onClick={(e) => handleCompanyCodeClick(row.companyCode, e)}
                      >
                        {row.companyCode}
                      </BlueUsername>
                    </TableCell>
                    <TableCell align="left">
                      <Tooltip title={row.companyName} arrow>
                        <span>{row.companyName}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="left">{row.type}</TableCell>
                    <TableCell align="center">
                      <StatusLink 
                        onClick={(e) => handleStatusClick('closed', row.closed, row.companyCode, e)}
                      >
                        {row.closed}
                      </StatusLink>
                    </TableCell>
                    <TableCell align="center">
                      <StatusLink 
                        onClick={(e) => handleStatusClick('open', row.open, row.companyCode, e)}
                      >
                        {row.open}
                      </StatusLink>
                    </TableCell>
                    <TableCell align="center">
                      <StatusLink 
                        onClick={(e) => handleStatusClick('pendingClient', row.pendingClient, row.companyCode, e)}
                      >
                        {row.pendingClient}
                      </StatusLink>
                    </TableCell>
                    <TableCell align="center">
                      <StatusLink 
                        onClick={(e) => handleStatusClick('pendingAuditor', row.pendingAuditor, row.companyCode, e)}
                      >
                        {row.pendingAuditor}
                      </StatusLink>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      No companies found for this auditor
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {paginatedData.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 20, 50]}
            component="div"
            count={sortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '12px',
              },
            }}
          />
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ 
          backgroundColor: '#fff',
          color: '#333',
          fontWeight: '600',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Company Details
          <IconButton 
            onClick={handleCloseDetailDialog}
            sx={{
              color: '#333',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          {selectedRow && (
            <Box>
              <Box mb={3}>
                <Typography variant="subtitle2" color="textSecondary">Company Code</Typography>
                <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: '500' }}>
                  {selectedRow.companyCode}
                </Typography>
              </Box>
              <Box mb={3}>
                <Typography variant="subtitle2" color="textSecondary">Company Name</Typography>
                <Typography variant="body1">{selectedRow.companyName}</Typography>
              </Box>
              <Box mb={3}>
                <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                <Typography variant="body1">{selectedRow.type}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Closed</Typography>
                  <Typography variant="body1">{selectedRow.closed}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Open</Typography>
                  <Typography variant="body1">{selectedRow.open}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Pending with Client</Typography>
                  <Typography variant="body1">{selectedRow.pendingClient}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Pending with Auditor</Typography>
                  <Typography variant="body1">{selectedRow.pendingAuditor}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDetailDialog} 
            variant="contained"
            sx={{ borderRadius: '12px' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditStatusTable;