
import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Box, Typography, TableContainer,
  TableRow, TableCell, TableBody, TableHead, OutlinedInput, InputAdornment,
  IconButton, useTheme, Dialog, Chip, DialogTitle, Button,
  DialogContent, DialogActions, Tooltip, List, ListItem, ListItemText,
  TableSortLabel, TablePagination
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { API_URL } from '../../ApiServices/ApiServices'; 
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";// Adjust the import path as needed
// Styled components
const StatusChip = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case "closed":
      case "close":
        return { bg: "#E8F5E9", text: "#2E7D32" }; // Green
      case "in-process":
      case "in progress":
        return { bg: "#FFF8E1", text: "#FF8F00" };
      case "open":
       return { bg: "#FFEBEE", text: "#C62828" };
      default:
        return { bg: "#E0E0E0", text: "#666", border: " #999" };       // Fallback
    }
  };

  const colors = getStatusColor();

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 1.5,
        py: 0.5,
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "600",
        color: colors.text,
        backgroundColor: colors.bg,
        border: colors.border,
        minWidth: "80px",
        height: "24px",
        textTransform: 'capitalize',
      }}
    >
      {status}
    </Box>
  );
};

const CountBadge = styled(Chip)(({ theme }) => ({
  minWidth: '24px',
  height: '24px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  backgroundColor: '#f0f0f0',
  color: '#333',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#d0d0d0',
  },
  transition: 'all 0.2s ease-in-out',
}));

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

const BlueUsername = styled('span')(({ theme }) => ({
  color: '#1976d2',
  fontWeight: '500',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const NameDisplay = ({ names, dialogTitle }) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!names || names.length === 0) {
    return <CountBadge label="N/A" clickable={false} />;
  }

  const handleOpenDialog = () => {
    if (names.length > 1) {
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Tooltip title={names.length > 1 ? `View all ${dialogTitle}` : ''} arrow>
        <CountBadge
          label={names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`}
          onClick={handleOpenDialog}
          clickable={names.length > 1}
        />
      </Tooltip>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ 
          backgroundColor: '#fff',
          color: '#333',
          fontWeight: '600',
        }}>
          {dialogTitle}
          <IconButton 
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: '#333',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <List dense>
            {names.map((name, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemText primary={name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="contained"
            sx={{ borderRadius: '12px' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const AuditStatusTable = () => {
  const navigate = useNavigate();

  
  const [searchTerm, setSearchTerm] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [Loading, setLoading] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
const [selectedDate, setSelectedDate] = useState(null);
const [datePickerOpen, setDatePickerOpen] = React.useState(false);

const headLabel = [
  { id: 'username', label: 'Organization Code', align: 'left', sortable: true },
  { id: 'organization', label: 'Organization', align: 'left', sortable: true },
  { id: 'uploadDate', label: 'Last updated Date', align: 'left', sortable: true },
  { id: 'role', label: 'Role', align: 'left', sortable: true }, 
  { id: 'manager', label: 'Manager', align: 'left', sortable: false },
  { id: 'auditor', label: 'Auditor', align: 'left', sortable: false },
  { id: 'status', label: 'Current Status', align: 'left', sortable: true },
];
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN");
};

 
 useEffect(() => {
   const fetchReconciliationStatus = async () => {
     try {
       const response = await axios.get(`${API_URL}reconciliation-status/`, {
         headers: {
           Authorization: `Token ${localStorage.getItem("token")}`  // if JWT protected
         }
       });
       console.log("Reconciliation Data:", response.data);
       setData(response.data);
     } catch (error) {
       console.error("Failed to fetch reconciliation data", error);
     } finally {
       setLoading(false);
     }
   };
 
   fetchReconciliationStatus();
 }, []);
 

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
const handleClearSearch = () => {
  setSearchTerm('');
  setSelectedDate(null);
  setPage(0);
};
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

const getStatus = (row) => row.current_status?.toLowerCase() || "open";
const filteredData = data.filter(item => {
  const searchLower = searchTerm.toLowerCase();

  const matchesSearch =
    (item.username?.toLowerCase() || '').includes(searchLower) ||
    (item.organization?.toLowerCase() || '').includes(searchLower) ||
    (item.organization_code?.toLowerCase() || '').includes(searchLower) ||
    (item.role?.toLowerCase() || '').includes(searchLower) ||
    (item.manager?.toLowerCase() || '').includes(searchLower) ||
    (item.auditor?.toLowerCase() || '').includes(searchLower) ||
    (item.current_status?.toLowerCase() || '').includes(searchLower) ||
    (formatDate(item.last_updated_date)?.toLowerCase() || '').includes(searchLower);

  const matchesDate =
    !selectedDate ||
    new Date(item.last_updated_date).toDateString() ===
      new Date(selectedDate).toDateString();

  return matchesSearch && matchesDate;
});

  const sortedData = filteredData.sort((a, b) => {
    let comparison = 0;
    
if (orderBy === 'manager' || orderBy === 'auditor') {
  const aValue = a[orderBy]?.toLowerCase() || "";
  const bValue = b[orderBy]?.toLowerCase() || "";
  comparison = aValue.localeCompare(bValue);
} else if (orderBy === 'status') {
  const aStatus = getStatus(a);
  const bStatus = getStatus(b);
  const statusOrder = { 'open': 1, 'in-process': 2, 'close': 3 };
  comparison = statusOrder[aStatus] - statusOrder[bStatus];
} else {
  const aValue = a[orderBy]?.toString().toLowerCase() || "";
  const bValue = b[orderBy]?.toString().toLowerCase() || "";
  comparison = aValue.localeCompare(bValue);
}

    return order === 'asc' ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
     setSelectedDate(null);   // ✅ clears the datepicker
  setPage(0);  
  };

  const handleRowClick = (row) => {
  navigate('/reconciliation-audit', { 
    state: { 
      organization: row.organization,
      username: row.username 
    } 
  });
};

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };
const getManagerNames = (row) => row.manager || "—";
const getAuditorNames = (row) => row.auditor || "—";


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
      {/* ... (rest of your JSX remains the same) */}
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
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          <TabButton selected>
            Reconciliation Audit Status
          </TabButton>
        </Box>
      </Box>

      <Card sx={{
        width: '100%',
        padding: '16px',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Box display="flex" justifyContent="flex-start" width="100%" mb={2} alignItems="center" gap={1}>
            <Box display="flex" gap={2} alignItems="center" width="100%">
           <LocalizationProvider dateAdapter={AdapterDateFns}>
                <OutlinedInput
                  value={
                    selectedDate
                      ? new Date(selectedDate).toLocaleDateString("en-GB")
                      : searchTerm
                  }
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedDate(null);
                  }}
                  placeholder="Search....."
                   sx={{ width: 150, height: "35px", fontSize: "12px" }} 
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setDatePickerOpen(true)}>
                        <CalendarTodayIcon fontSize="small" />
                      </IconButton>
          
                      {/* Hidden DatePicker that only controls the popup */}
                      <DatePicker
                        open={datePickerOpen}
                        onClose={() => setDatePickerOpen(false)}
                        value={selectedDate}
                        onChange={(newValue) => {
                          setSelectedDate(newValue);
                          setSearchTerm(""); // clear text search if date chosen
                          setDatePickerOpen(false);
                        }}
                        slotProps={{
              textField: { sx: { display: "none" } }, // hide input
              popper: {
                placement: "bottom-end",  // 👈 change popup position
                modifiers: [
                  {
                    name: "offset",
                    options: {
                      offset: [100, 150], // 👈 [x, y] distance from input
                    },
                  },
                ],
              },
            }}
                      />
                    </InputAdornment>
                  }
                />
              </LocalizationProvider>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            sx={{ height: '36px', fontSize: '12px', borderRadius: '7px' }}
            onClick={handleClearSearch}
      disabled={!searchTerm && !selectedDate}
          >
            Reset
          </Button>
        </Box>
        </Box>

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
              {paginatedData.map(row => {
                const status = getStatus(row);
                return (
                  <TableRow
                    hover
                    key={row.id}
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
  <BlueUsername
    onClick={() => navigate('/reconciliation-audit', { 
      state: { 
        organization: row.organization,
        organization_code: row.organization_code 
      } 
    })}
  >
    {row.organization_code || "—"}
  </BlueUsername>
</TableCell>

                <TableCell align="left">
                  <Tooltip title={row.organization} arrow>
                    <span>
                      {row.organization?.length > 20
                        ? `${row.organization.substring(0, 20)}...`
                        : row.organization}
                    </span>
                  </Tooltip>
                </TableCell>

                <TableCell align="left">{formatDate(row.last_updated_date)}</TableCell>

                    <TableCell align="left">
  <Box sx={{ 
    display: 'inline-block',
    px: 1,
    py: 0.5,
    borderRadius: '4px',
    
    fontWeight: '500',
    fontSize: '12px'
  }}>
    {row.role}
  </Box>
</TableCell>
                   <TableCell align="left">
  <Tooltip title={getManagerNames(row)?.[0] || "N/A"} arrow>
    <span>{getManagerNames(row)}</span>
  </Tooltip>
</TableCell>

                    <TableCell align="left">
                      <Tooltip title={getAuditorNames(row)?.[0] || "N/A"} arrow>
  <span>{getAuditorNames(row)}</span>
</Tooltip>

                    </TableCell>
                    <TableCell align="left">
                      <StatusChip status={status} label={status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
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
          Organization Details
          <IconButton 
            onClick={handleCloseDetailDialog}
            sx={{
              color: '#333',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {/* <DialogContent dividers sx={{ py: 2 }}>
          {selectedRow && {
            const status = getStatus(selectedRow);
            return (
              <Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">Username</Typography>
                  <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: '500' }}>
                    {selectedRow.username}
                  </Typography>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">Organization</Typography>
                  <Typography variant="body1">{selectedRow.organization}</Typography>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary">Uploaded Date</Typography>
                  <Typography variant="body1">{selectedRow.uploadDate}</Typography>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Auditor(s)</Typography>
                  <List dense>
                    {selectedRow.auditor.map((auditor, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {auditor.name}
                              {auditor.uploaded ? (
                                <CheckCircleIcon sx={{ color: 'success.main', ml: 1, fontSize: '16px' }} />
                              ) : (
                                <CancelIcon sx={{ color: 'error.main', ml: 1, fontSize: '16px' }} />
                              )}
                              <Typography variant="caption" sx={{ ml: 1, color: auditor.uploaded ? 'success.main' : 'error.main' }}>
                                {auditor.uploaded ? 'Uploaded' : 'Not Uploaded'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box mb={3}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>Manager(s)</Typography>
                  <List dense>
                    {selectedRow.manager.map((manager, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {manager.name}
                              {manager.uploaded ? (
                                <CheckCircleIcon sx={{ color: 'success.main', ml: 1, fontSize: '16px' }} />
                              ) : (
                                <CancelIcon sx={{ color: 'error.main', ml: 1, fontSize: '16px' }} />
                              )}
                              <Typography variant="caption" sx={{ ml: 1, color: manager.uploaded ? 'success.main' : 'error.main' }}>
                                {manager.uploaded ? 'Uploaded' : 'Not Uploaded'}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <StatusChip status={status} label={status} />
                </Box>
              </Box>
            );
          }}
        </DialogContent> */}
        <DialogContent dividers sx={{ py: 2 }}>
  {selectedRow && (() => {
    const status = getStatus(selectedRow);
    return (
      <Box>
        <Box mb={3}>
          <Typography variant="subtitle2" color="textSecondary">Username</Typography>
          <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: '500' }}>
            {selectedRow.username}
          </Typography>
        </Box>

        <Box mb={3}>
          <Typography variant="subtitle2" color="textSecondary">Organization</Typography>
          <Typography variant="body1">{selectedRow.organization}</Typography>
        </Box>

        <Box mb={3}>
  <Typography variant="subtitle2" color="textSecondary">Uploaded Date</Typography>
  <Typography variant="body1">
    {selectedRow.uploadDate
      ? new Date(selectedRow.uploadDate).toLocaleDateString("en-GB") // DD/MM/YYYY
      : "N/A"}
  </Typography>
</Box>

        <Box mb={3}>
  <Typography variant="subtitle2" color="textSecondary">Role</Typography>
  <Typography variant="body1">{selectedRow.role}</Typography>
</Box>

        <Box mb={3}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>Auditor(s)</Typography>
          <List dense>
            {selectedRow.auditor.length > 0 && (
  <ListItem>
    <ListItemText
      primary={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {selectedRow.auditor[0].name}
          {selectedRow.auditor[0].uploaded ? (
            <CheckCircleIcon sx={{ color: 'success.main', ml: 1, fontSize: '16px' }} />
          ) : (
            <CancelIcon sx={{ color: 'error.main', ml: 1, fontSize: '16px' }} />
          )}
          <Typography variant="caption" sx={{ ml: 1, color: selectedRow.auditor[0].uploaded ? 'success.main' : 'error.main' }}>
            {selectedRow.auditor[0].uploaded ? 'Uploaded' : 'Not Uploaded'}
          </Typography>
        </Box>
      }
    />
  </ListItem>
)}

          </List>
        </Box>

        <Box mb={3}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>Manager(s)</Typography>
          <List dense>
            {selectedRow.manager.map((manager, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {manager.name}
                      {manager.uploaded ? (
                        <CheckCircleIcon sx={{ color: 'success.main', ml: 1, fontSize: '16px' }} />
                      ) : (
                        <CancelIcon sx={{ color: 'error.main', ml: 1, fontSize: '16px' }} />
                      )}
                      <Typography variant="caption" sx={{ ml: 1, color: manager.uploaded ? 'success.main' : 'error.main' }}>
                        {manager.uploaded ? 'Uploaded' : 'Not Uploaded'}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="textSecondary">Status</Typography>
          <StatusChip status={status} label={status} />
        </Box>
      </Box>
    );
  })()}
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