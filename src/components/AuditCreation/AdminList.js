
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Table, Button, TableBody, Box, Typography, TableContainer,
  TablePagination, TableRow, TableCell, TableHead, OutlinedInput, InputAdornment,
  IconButton, Menu, ListItemIcon, ListItemText, TableSortLabel, useTheme, Popover,
  Tooltip, MenuItem, Snackbar, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import apiServices from '../../ApiServices/ApiServices';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/system';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Loader from "react-js-loader";
import RestoreIcon from '@mui/icons-material/Restore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';

// Constants
const VIEW_TYPES = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
};

const ROLE_TYPES = {
  ADMIN: 'Product Admin',
  MANAGER: 'Audit Manager',
  AUDITOR: 'Auditor'
};

// Status indicator component
const StatusIndicator = styled(Box)(({ status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: 'black',
  backgroundColor: status === 'Active' ? '#A5D6A7' : 
                 status === 'Inactive' ? '#F44336' : 
                 status === 'Deleted' ? '#9E9E9E' : '#9E9E9E',
  height: '24px',
  minWidth: '80px',
}));

// Table column configuration
const headLabel = [
  { id: 'checkbox', label: '', align: 'center', width: '5%' },
  { id: 'name', label: 'Name', align: 'left', width: '15%' },
  { id: 'username', label: 'Username', align: 'left', width: '15%' },
  { id: 'email', label: 'Email', align: 'left', width: '15%' },
  { id: 'phoneNumber', label: 'Phone', align: 'left', width: '15%' },
  { id: 'role', label: 'Role', align: 'center', width: '10%' },
  { id: 'createdAt', label: 'Created Date', align: 'left', width: '15%' },
  { id: 'status', label: 'Status', align: 'center', width: '10%' },
  { id: 'actions', label: 'Actions', align: 'center', width: '15%' },
];

// Main component
const AdminList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key state

  // Determine view type
  const selectedOption = useMemo(() => {
    if (id === 'admin-active') return VIEW_TYPES.ACTIVE;
    if (id === 'admin-inactive') return VIEW_TYPES.INACTIVE;
    if (id === 'admin-deleted') return VIEW_TYPES.DELETED;
    return VIEW_TYPES.ALL;
  }, [id]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const adminsResponse = await apiServices.getAlluser();
      console.log(adminsResponse);
      const allUsers = adminsResponse.map(admin => ({
        id: admin.id,
        name: admin.username || 'Unknown User',
        username: admin.username || 'N/A',
        email: admin.email || 'N/A',
        phoneNumber: admin.mobile || 'N/A',
        role: admin.role || ROLE_TYPES.ADMIN,
        is_frozen: admin.is_frozen || false,
        is_delete: admin.is_delete || false,
        createdAt: admin.created_at || admin.createdAt || new Date().toISOString(),
        OrgId: admin.organization?.id || null
      }));

      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({ open: true, message: 'Error fetching data', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data based on view type
  useEffect(() => {
    setPage(0);
    fetchAllData();
  }, [fetchAllData, selectedOption, id, refreshKey]); // Add refreshKey to dependencies

  // Filter and sort data
  const filteredData = useMemo(() => {
    const formattedSearchTerm = searchTerm.toLowerCase();
    
    return users.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        (user.name && user.name.toLowerCase().includes(formattedSearchTerm)) ||
        (user.username && user.username.toLowerCase().includes(formattedSearchTerm)) ||
        (user.email && user.email.toLowerCase().includes(formattedSearchTerm)) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(formattedSearchTerm));

      // View type filter
      switch (selectedOption) {
        case VIEW_TYPES.ALL:
          return matchesSearch && !user.is_delete;
        case VIEW_TYPES.ACTIVE:
          return matchesSearch && !user.is_frozen && !user.is_delete;
        case VIEW_TYPES.INACTIVE:
          return matchesSearch && user.is_frozen && !user.is_delete;
        case VIEW_TYPES.DELETED:
          return matchesSearch && user.is_delete;
        default:
          return matchesSearch;
      }
    }).sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (orderBy === 'username') {
        comparison = (a.username || '').localeCompare(b.username || '');
      } else if (orderBy === 'email') {
        comparison = (a.email || '').localeCompare(b.email || '');
      } else if (orderBy === 'phoneNumber') {
        comparison = (a.phoneNumber || '').localeCompare(b.phoneNumber || '');
      } else if (orderBy === 'role') {
        comparison = (a.role || '').localeCompare(b.role || '');
      } else if (orderBy === 'createdAt') {
        comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return order === 'asc' ? comparison : -comparison;
    });
  }, [users, searchTerm, selectedOption, order, orderBy]);

  const visibleRows = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const isSelected = (id) => selected.includes(id);

  const handleSelectAllClick = (event) => {
    setSelected(event.target.checked ? visibleRows.map(row => row.id) : []);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSearchTerm(date ? dayjs(date).format('DD-MM-YYYY').toLowerCase() : '');
    setPage(0);
    setAnchorEl(null);
  };

  const handleCreateAdmin = () => navigate('/AdminCreation');

  // Refresh function
  const refreshData = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

 const handleAction = async (action, id, confirmMsg, apiCall) => {
  if (!window.confirm(confirmMsg)) return;
  try {
    setIsLoading(true);
    const response = await apiCall(); // ✅ Use the passed function

    if (response && (response.message || response.success)) {
      refreshData();
      setSnackbar({
        open: true,
        message: response.message || `User ${action} successfully`,
        severity: 'success'
      });
    } else if (response && response.error) {
      throw new Error(response.error);
    } else {
      throw new Error(`Action completed but no success message received`);
    }
  } catch (error) {
    console.error(`Error ${action} user:`, error);
    setSnackbar({
      open: true,
      message: error?.message || `Failed to ${action} user`,
      severity: 'error'
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleRestore = (id) => handleAction(
    'restored', 
    id, 
    "Are you sure you want to restore this user?", 
    apiServices.restoreAll
  );

  const PermanentDelete = (id) => handleAction(
    'permanently deleted', 
    id, 
    "Are you sure you want to permanently delete this user?", 
   () => apiServices.permanentAdminDelete(id)
  );

  const handleEdit = (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    navigate(`/updateadmin/${id}`);
  };
const handleDelete = async (id) => {
  try {
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }

    if (!window.confirm(`Are you sure you want to delete ${user.name || 'this user'}?`)) {
      return;
    }

    setIsLoading(true);
    const response = await apiServices.deleteAdmin(id);
 // ✅ Use correct function
    
    if (response && response.message) {
      refreshData();
      setSnackbar({
        open: true,
        message: response.message,
        severity: 'success'
      });
    } else {
      throw new Error(response?.error || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Delete error:', error);
    setSnackbar({
      open: true,
      message: error.message || 'Failed to delete user',
      severity: 'error'
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleFreezeUser = async (id) => {
    if (!window.confirm('Are you sure you want to Inactive this user?')) return;
    
    try {
      setIsLoading(true);
      const response = await apiServices.freezeUser(id);
      if (response.success) {
        refreshData(); // Use refreshData instead of fetchAllData
        setSnackbar({
          open: true,
          message: response.message,
          severity: 'success'
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Deactivate error:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfreezeUser = async (id) => {
    if (!window.confirm('Are you sure you want to active this user?')) return;
    
    try {
      setIsLoading(true);
      const response = await apiServices.unfreezeUser(id);
      if (response.success) {
        refreshData(); // Use refreshData instead of fetchAllData
        setSnackbar({
          open: true,
          message: response.message,
          severity: 'success'
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Activate error:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const UserTableRow = ({ row, isSelected, handleClick }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const getStatus = () => {
      if (row.is_delete) return 'Deleted';
      if (row.is_frozen) return 'Inactive';
      return 'Active';
    };

    return (
      <TableRow
        hover
        role="checkbox"
        aria-checked={isSelected}
        selected={isSelected}
        sx={{
          '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
          '&:hover': { backgroundColor: theme.palette.grey[100] },
          '& td': { fontSize: '12px', padding: '8px', whiteSpace: 'nowrap' },
        }}
      >
        <TableCell padding="checkbox" sx={{ padding: '0px 4px' }}>
          <Checkbox 
            checked={isSelected} 
            onChange={() => handleClick(row.id)} 
          />
        </TableCell>
        <TableCell>
          <Tooltip title={row.name} arrow>
            <span>{row.name.length > 20 ? `${row.name.substring(0, 20)}...` : row.name}</span>
          </Tooltip>
        </TableCell>
        <TableCell>
          <Tooltip title={row.username || 'N/A'} arrow>
            <span>{row.username || 'N/A'}</span>
          </Tooltip>
        </TableCell>
        <TableCell>
          <Tooltip title={row.email} arrow>
            <span>{row.email}</span>
          </Tooltip>
        </TableCell>
        <TableCell>{row.phoneNumber || 'N/A'}</TableCell>
        <TableCell align="center">{row.role}</TableCell>
        <TableCell>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </TableCell>
        <TableCell align="center">
          <StatusIndicator status={getStatus()}>
            {getStatus()}
          </StatusIndicator>
        </TableCell>
        <TableCell align="center">
          <IconButton
            aria-label="more actions"
            aria-controls={open ? 'actions-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
              id="actions-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                style: {
                  width: 'auto',
                  boxShadow: theme.shadows[3],
                },
              }}
            >
              {/* Only show Edit option if not deleted */}
              {!row.is_delete && (
                <MenuItem onClick={() => { handleEdit(row.id); setAnchorEl(null); }}>
                  <ListItemIcon><EditIcon /></ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
              )}

              {!row.is_delete && (
                row.is_frozen ? (
                  <MenuItem onClick={() => { handleUnfreezeUser(row.id); setAnchorEl(null); }}>
                    <ListItemIcon><FontAwesomeIcon icon={faToggleOn} /></ListItemIcon>
                    <ListItemText>Active</ListItemText>
                  </MenuItem>
                ) : (
                  <MenuItem onClick={() => { handleFreezeUser(row.id); setAnchorEl(null); }}>
                    <ListItemIcon><FontAwesomeIcon icon={faToggleOff} /></ListItemIcon>
                    <ListItemText>Inactive</ListItemText>
                  </MenuItem>
                )
              )}

              {row.is_delete ? (
                <>
                  <MenuItem onClick={() => { handleRestore(row.id); setAnchorEl(null); }}>
                    <ListItemIcon><RestoreIcon /></ListItemIcon>
                    <ListItemText>Restore</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => { PermanentDelete(row.id); setAnchorEl(null); }}>
                    <ListItemIcon><DeleteIcon /></ListItemIcon>
                    <ListItemText>Permanent Delete</ListItemText>
                  </MenuItem>
                </>
              ) : (
                <MenuItem onClick={() => { handleDelete(row.id); setAnchorEl(null); }}>
                  <ListItemIcon><DeleteIcon /></ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              )}
          </Menu>
        </TableCell>
      </TableRow>
    );
  };

  // Table header component
  const UserTableHead = React.memo(({ 
    order, 
    orderBy, 
    onRequestSort, 
    onSelectAllClick, 
    numSelected, 
    rowCount 
  }) => {
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead sx={{
        background: theme.palette.grey[100],
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <TableRow>
          <TableCell padding="checkbox" sx={{ padding: '0px 4px' }}>
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all users' }}
              sx={{
                color: theme.palette.grey[600],
                '&.Mui-checked': { color: theme.palette.primary.main },
              }}
            />
          </TableCell>
          {headLabel.slice(1).map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.align}
              sx={{
                fontWeight: '600',
                padding: '12px 8px',
                whiteSpace: 'nowrap',
                fontSize:'12px',
                width: headCell.width,
                color: theme.palette.text.primary,
                '& .MuiTableSortLabel-root': {
                  color: theme.palette.text.primary,
                  '&:hover': { color: theme.palette.primary.main },
                  '&.Mui-active': { color: theme.palette.primary.main },
                },
              }}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  });

  // Option labels
  const optionLabelMap = {
    [VIEW_TYPES.ALL]: 'All Users',
    [VIEW_TYPES.ACTIVE]: 'Active ',
    [VIEW_TYPES.INACTIVE]: 'Inactive ',
    [VIEW_TYPES.DELETED]: 'Deleted Users'
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
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '10px 24px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        backgroundColor: '#fafafa',
        my: 2,
      }}>
        <Box sx={{
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {Object.entries(optionLabelMap).map(([value, label]) => (
              <Button
                key={value}
                onClick={() => navigate(`/AdminList/${value === VIEW_TYPES.ALL ? '' : `admin-${value}`}`)}
                disableRipple
                sx={{
                  fontSize: '12px',
                  textTransform: 'none',
                  color: selectedOption === value ? '#5C4DFF' : '#888',
                  fontWeight: selectedOption === value ? '600' : '400',
                  borderRadius: 0,
                  padding: '4px 0',
                  minWidth: 'auto',
                  borderBottom: selectedOption === value ? '2px solid #5C4DFF' : '2px solid transparent',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#5C4DFF',
                    borderBottom: '2px solid #5C4DFF',
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={handleCreateAdmin}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: 'black',
              color: 'white',
              fontSize: '12px',
              borderRadius: '7px',
              height: '36px',
              minWidth: '150px',
              '&:hover': { backgroundColor: '#424242' },
            }}
          >
            User Creation
          </Button>
        </Box>
      </Box>

      <Card sx={{
        width: '100%',
        padding: '1%',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search"
            sx={{
              maxWidth: 128,
              height: '35px',
              fontSize:"12px",
              paddingLeft:"3px",
              paddingRight:"0px", 
              background: theme.palette.common.white,
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton 
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  aria-label="select date"
                >
                  <CalendarMonthIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </Box>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              format="DD-MM-YYYY"
            />
          </LocalizationProvider>
        </Popover>

        <TableContainer sx={{ 
          width: '100%', 
          maxHeight: '350px', 
          overflowY: 'auto',
        }}>
          <Table stickyHeader size="small" sx={{ zIndex: 0 }}>
            <UserTableHead 
              order={order}
              orderBy={orderBy}
              onRequestSort={handleSort}
              onSelectAllClick={handleSelectAllClick}
              numSelected={selected.length}
              rowCount={filteredData.length}
            />
            <TableBody>
              {visibleRows.map(row => (
                <UserTableRow
                  key={row.id}
                  row={row}
                  isSelected={isSelected(row.id)}
                  handleClick={handleClick}
                />
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
   
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            background: theme.palette.common.white,
          }}
        />
      </Card>

      {isLoading && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
        }}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Loader type="box-up" bgColor={'#000b58'} color={'#000b58'} size={100} />
            <Typography>Loading...</Typography>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminList;