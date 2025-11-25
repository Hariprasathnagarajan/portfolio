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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
 
  backgroundColor: status === 'Active' ? "#E8F5E9" : 
                 status === 'Inactive' ? "#FFEBEE" : 
                 status === 'Deleted' ? '#9E9E9E' : '#9E9E9E',
                 color: status === 'Active' ? "#2E7D32" : 
                    status === 'Inactive' ? "#C62828" :
                    status === 'Deleted' ? '#424242' : '#424242',

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
  // Reset search handler
  const handleResetSearch = () => {
    setSearchTerm('');
    setSelectedDate(null);
    setPage(0);
  };
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const anchorRef = React.useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key state
const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  // Determine view type
  const selectedOption = useMemo(() => {
    if (id === 'admin-active') return VIEW_TYPES.ACTIVE;
    if (id === 'admin-inactive') return VIEW_TYPES.INACTIVE;
    if (id === 'admin-deleted') return VIEW_TYPES.DELETED;
    return VIEW_TYPES.ALL;
  }, [id]);

  // Clear selected users when switching tabs
  useEffect(() => {
    setSelected([]);
  }, [selectedOption]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const adminsResponse = await apiServices.getAlluser();
      console.log(adminsResponse);
      const allUsers = adminsResponse.map(admin => ({
        id: admin.id,
         name: admin.full_name || 'Unknown User',
        username: admin.username || 'N/A',
        email: admin.email || 'N/A',
        phoneNumber: admin.mobile || 'N/A',
        role: admin.role || ROLE_TYPES.ADMIN,
        is_frozen: admin.is_frozen || false,
        is_delete: admin.is_delete === true,
        createdAt: admin.updated_at || admin.createdAt || null,
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


const filteredData = useMemo(() => {
  const formattedSearchTerm = searchTerm.toLowerCase();

  return users.filter(user => {
    // Status calculation
    const statusText = user.is_delete
      ? 'deleted'
      : user.is_frozen
      ? 'inactive'
      : 'active';

    // Date filter (if selectedDate is set)
    const dateMatch = selectedDate
      ? dayjs(user.createdAt).format('DD-MM-YYYY') === dayjs(selectedDate).format('DD-MM-YYYY')
      : true;

    // Search filter
    const matchesSearch =
      !searchTerm ||
      (user.name && user.name.toLowerCase().includes(formattedSearchTerm)) ||
      (user.username && user.username.toLowerCase().includes(formattedSearchTerm)) ||
      (user.email && user.email.toLowerCase().includes(formattedSearchTerm)) ||
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(formattedSearchTerm)) ||
      (user.role && user.role.toLowerCase().includes(formattedSearchTerm)) ||
      statusText.includes(formattedSearchTerm) ||
      (user.createdAt && dayjs(user.createdAt).format('DD-MM-YYYY').includes(formattedSearchTerm));

    // View type filter
    switch (selectedOption) {
      case VIEW_TYPES.ALL:
        return matchesSearch && !user.is_delete && dateMatch;
      case VIEW_TYPES.ACTIVE:
        return matchesSearch && !user.is_frozen && !user.is_delete && dateMatch;
      case VIEW_TYPES.INACTIVE:
        return matchesSearch && user.is_frozen && !user.is_delete && dateMatch;
      case VIEW_TYPES.DELETED:
        return matchesSearch && user.is_delete && dateMatch;
      default:
        return matchesSearch && dateMatch;
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
}, [users, searchTerm, selectedDate, selectedOption, order, orderBy]);


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
  if (event.target.checked) {
    // Select all filtered users
    setSelected(filteredData.map(row => row.id));
  } else {
    // Deselect all
    setSelected([]);
  }
};

const handleclearsearch = () => {
  setSearchTerm('');
  setSelectedDate(null);
  setPage(0);
};

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleDateChange = (date) => {
  // If user clears or the value is invalid, clear the filter
  if (!date || !dayjs(date).isValid()) {
    setSelectedDate(null);
    setSearchTerm('');
    setPage(0);
    return;
  }

  setSelectedDate(date);
  setSearchTerm(dayjs(date).format('DD/MM/YYYY').toLowerCase());
  setPage(0);
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
    const response = await apiCall(id);

    console.log(`${action} response:`, response); // Log API response

    if (response && (response.message || response.success || Object.keys(response).length > 0)) {

      refreshData();
      setSnackbar({
        open: true,
        message: response.message || `User ${action} successfully`,
        severity: 'success',
      });
    } else {
      // Force success if API didn't return message but didn't throw
      setSnackbar({
        open: true,
        message: `User ${action} assumed successful`,
        severity: 'success',
      });
      refreshData();
    }
  } catch (error) {
    console.error(`Error ${action} user:`, error);
    setSnackbar({
      open: true,
      message: error?.message || `Failed to ${action} user`,
      severity: 'error',
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
const PermanentDelete = async (id) => {
  try {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;

    setIsLoading(true);
    const response = await apiServices.permanentUserDelete(id);

    if (response?.message) {
      refreshData(); // re-fetch list
      setSnackbar({
        open: true,
        message: response.message,
        severity: 'success',
      });
    } else {
      throw new Error('Permanent delete failed');
    }
  } catch (error) {
    setSnackbar({
      open: true,
      message: error?.error || error?.message || 'Permanent delete failed',
      severity: 'error',
    });
  } finally {
    setIsLoading(false);
  }
};


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
      const response = await apiServices.softDeleteUser(id);
      
      if (response && response.message) {
        refreshData(); // Use refreshData instead of fetchAllData
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
  try {
    setIsLoading(true);
    const response = await apiServices.freezeUser(id);
    refreshData();
    setSnackbar({
      open: true,
      message: 'User deactivated successfully',
      severity: 'success'
    });
  } catch (error) {
    setSnackbar({
      open: true,
      message: error.message || 'Failed to deactivate user',
      severity: 'error'
    });
  } finally {
    setIsLoading(false);
  }
};

const handleUnfreezeUser = async (id) => {
  try {
    setIsLoading(true);
    const response = await apiServices.unfreezeUser(id);
    refreshData();
    setSnackbar({
      open: true,
      message: 'User activated successfully',
      severity: 'success'
    });
  } catch (error) {
    setSnackbar({
      open: true,
      message: error.message || 'Failed to activate user',
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
          '&:hover': { backgroundColor: theme.palette.grey[100] }, zIndex: 0,
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
 {row.createdAt
  ? new Date(row.createdAt).toLocaleDateString("en-GB")
  : "N/A"}

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
             {/* Edit option (only if not deleted) */}
{!row.is_delete && (
  <MenuItem onClick={() => { handleEdit(row.id); setAnchorEl(null); }}>
    <ListItemIcon><EditIcon /></ListItemIcon>
    <ListItemText>Edit</ListItemText>
  </MenuItem>
)}

{/* Active / Inactive toggle (only if not deleted) */}
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

{/* Restore and Permanent Delete (only if deleted) */}
{row.is_delete ? (
  <>
    <MenuItem onClick={() => { handleRestore(row.id); setAnchorEl(null); }}>
      <ListItemIcon><RestoreIcon /></ListItemIcon>
      <ListItemText>Restore</ListItemText>
    </MenuItem>

    <MenuItem onClick={() => { PermanentDelete(row.id); setAnchorEl(null); }}>
      <ListItemIcon><DeleteIcon /></ListItemIcon>
      <ListItemText> Delete</ListItemText>
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
  <TableHead
    sx={{
      background: theme.palette.grey[100],
      borderBottom: `1px solid ${theme.palette.divider}`,
      position: 'sticky',
      top: 0,
      zIndex: 2,
    }}
  >
      <TableRow>
        <TableCell 
          padding="checkbox" 
          sx={{
            padding: '0px 4px',
            position: 'sticky',
            top: 0,
            background: theme.palette.grey[100],
            zIndex: 11
          }}
        >
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
          headCell.id === 'actions' ? (
            <TableCell
              key={headCell.id}
              align={headCell.align}
              sx={{
                fontWeight: '600',
                padding: '12px 8px',
                whiteSpace: 'nowrap',
                fontSize: '12px',
                width: headCell.width,
                color: theme.palette.text.primary,
                position: 'sticky',
                top: 0,
                background: theme.palette.grey[100],
                zIndex: 10,
              }}
            >
              {headCell.label}
            </TableCell>
          ) : (
            <TableCell
              key={headCell.id}
              align={headCell.align}
              sx={{
                fontWeight: '600',
                padding: '12px 8px',
                whiteSpace: 'nowrap',
                fontSize: '12px',
                width: headCell.width,
                color: theme.palette.text.primary,
                position: 'sticky',
                top: 0,
                background: theme.palette.grey[100],
                zIndex: 10,
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
          )
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
                             onClick={handleclearsearch}
                       disabled={!searchTerm && !selectedDate}
                           >
                             Reset
                           </Button>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              PaperProps={{ sx: { p: 1 } }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
  <DatePicker
    value={selectedDate}
    onChange={handleDateChange}
    inputFormat="DD/MM/YYYY"        // explicit parse/format
    mask="__/__/____"               // mask for manual typing
    disableMaskedInput={false}     // keep masked input enabled
    onError={() => {}}             // swallow transient errors (optional)
    slots={{ openPickerIcon: CalendarMonthIcon }}
    slotProps={{
      textField: {
        size: "small",
        sx: { width: 160 },
        placeholder: "Filter by date",
        helperText: '',            // hide helper text that might show error
        inputProps: { inputMode: 'numeric' } // numeric keyboard on mobile
      }
    }}
  />
</LocalizationProvider>


            </Popover>
          </Box>
          {/* Context-specific Bulk Actions for each tab */}
          {selected.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selectedOption === VIEW_TYPES.DELETED ? (
                <>
                  <Button
                    variant="outlined"
                    color="success"
                    sx={{ fontSize: '12px', borderRadius: '7px', height: '35px', minWidth: '120px' }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to restore ${selected.length} users?`)) {
                        Promise.all(selected.map(id => handleRestore(id)));
                      }
                    }}
                    disabled={selected.length === 0}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ fontSize: '12px', borderRadius: '7px', height: '35px', minWidth: '120px' }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete ${selected.length} users?`)) {
                        Promise.all(selected.map(id => PermanentDelete(id)));
                      }
                    }}
                    disabled={selected.length === 0}
                  >
                     Delete
                  </Button>
                </>
              ) : selectedOption === VIEW_TYPES.ACTIVE ? (
                <Button
                  variant="outlined"
                  color="warning"
                  sx={{ fontSize: '12px', borderRadius: '7px', height: '35px', minWidth: '120px' }}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to deactivate ${selected.length} users?`)) {
                      Promise.all(selected.map(id => handleFreezeUser(id)));
                    }
                  }}
                  disabled={selected.length === 0}
                >
                  Inactive
                </Button>
              ) : selectedOption === VIEW_TYPES.INACTIVE ? (
                <Button
                  variant="outlined"
                  color="success"
                  sx={{ fontSize: '12px', borderRadius: '7px', height: '35px', minWidth: '120px' }}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to activate ${selected.length} users?`)) {
                      Promise.all(selected.map(id => handleUnfreezeUser(id)));
                    }
                  }}
                  disabled={selected.length === 0}
                >
                  Activate
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    color="warning"
                    sx={{ fontSize: '12px', borderRadius: '7px', height: '35px', minWidth: '120px' }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to deactivate ${selected.length} users?`)) {
                        Promise.all(selected.map(id => handleFreezeUser(id)));
                      }
                    }}
                    disabled={selected.length === 0}  
                  >
                    Inactive
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ fontSize: '12px', borderRadius: '7px', height: '35px', minWidth: '120px' }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${selected.length} users?`)) {
                        Promise.all(selected.map(id => handleDelete(id)));
                      }
                    }}
                    disabled={selected.length === 0}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>

  {/* Removed duplicate Popover and DatePicker to prevent double calendar field opening */}

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
                    No results found.
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