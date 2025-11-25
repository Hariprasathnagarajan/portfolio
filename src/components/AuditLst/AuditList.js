import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Table, Button, TableBody, Box, Typography, TableContainer,
  TablePagination, TableRow, TableCell, TableHead,
  TableSortLabel, Tooltip, OutlinedInput, InputAdornment,
  IconButton, Menu, ListItemIcon, ListItemText, useTheme, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  FormControl, InputLabel, Select, Snackbar, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { styled } from '@mui/system';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import Loader from 'react-js-loader';
import apiServices from '../../ApiServices/ApiServices';

const colorMap = {
  Freezone: { bg: "#F0F7FF", text: "#1976D2" },
  Mainland: { bg: "#E8F5E9", text: "#2E7D32" },
  Broker: { bg: "#FFF8E1", text: "#FF8F00" },
  Warehouse: { bg: "#F3E5F5", text: "#7B1FA2" },
  'N/A': { bg: "#f5f5f5", text: "#666666" }
};

const CountBadge = styled(Chip)(({ theme }) => ({
  minWidth: '40px',
  height: '24px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  backgroundColor: theme?.palette?.grey?.[200] || '#f0f0f0',
  color: theme?.palette?.text?.primary || '#000000',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme?.palette?.grey?.[300] || '#e0e0e0',
  },
  transition: 'all 0.2s ease-in-out',
}));

const formatPhoneNumber = (phone) => {
  if (!phone || phone === 'N/A' || phone === 'null') return 'N/A';
  if (phone.includes(' ') || phone.includes('+')) return phone;
  
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('971') && digits.length === 12) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phone;
};

const normalizeRole = (role) => {
  if (!role) return 'auditor';
  const normalized = role.toLowerCase().trim();
  if (normalized.includes('audit') && normalized.includes('manager')) {
    return 'manager';
  }
  if (normalized.includes('manager')) {
    return 'manager';
  }
  return normalized.includes('auditor') ? 'auditor' : 'auditor';
};

const UserTableHead = React.memo(({ order, orderBy, onRequestSort, headLabel }) => {
  const theme = useTheme();
  
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{
      background: theme?.palette?.grey?.[100] || '#f5f5f5',
      borderBottom: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
    }}>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sx={{
              fontWeight: '600',
              fontSize: '12px',
              padding: '12px 8px',
              whiteSpace: 'nowrap',
              width: headCell.width,
              color: theme?.palette?.text?.primary || '#000000',
              '& .MuiTableSortLabel-root': {
                color: theme?.palette?.text?.primary || '#000000',
                '&:hover': {
                  color: theme?.palette?.primary?.main || '#1976d2',
                },
                '&.Mui-active': {
                  color: theme?.palette?.primary?.main || '#1976d2',
                },
              },
            }}
          >
            {headCell.id !== 'actions' ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
                aria-label={`Sort by ${headCell.label}`}
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && createSortHandler(headCell.id)(e)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span style={{ display: 'none' }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
});

const UserTableRow = React.memo(({ 
  row, 
  handleEdit, 
  handleDelete, 
  selectedOption, 
  openCountModal,
  managersList,
  managerSelections,
  setManagerSelections,
  setSnackbar
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleManagerChange = async (userId, managerId) => {
    try {
      await apiServices.updateUserManager(userId, managerId);
      setManagerSelections(prev => ({
        ...prev,
        [userId]: managerId
      }));
      setSnackbar({
        open: true,
        message: 'Manager updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error updating manager:", error);
      setSnackbar({
        open: true,
        message: 'Failed to update manager',
        severity: 'error'
      });
    }
  };

  return (
    <TableRow
      hover
      sx={{
        '&:nth-of-type(odd)': {
          backgroundColor: theme?.palette?.grey?.[50] || '#fafafa',
        },
        '&:hover': {
          backgroundColor: theme?.palette?.grey?.[100] || '#f5f5f5',
        },
        '& td': {
          fontSize: '12px',
          padding: '8px',
          whiteSpace: 'nowrap',
        },
      }}
    >
      <TableCell sx={{ 
        paddingLeft: '12px',
        paddingRight: '8px',
        paddingTop: '8px',
        paddingBottom: '8px',
        whiteSpace: 'nowrap', 
        fontSize:'12px' 
      }}>
        {row.name || 'N/A'}
      </TableCell>
      <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', fontSize:'12px' }}>
        <Tooltip title={row.email} arrow>
          <span>{row.email?.length > 25 ? `${row.email.substring(0, 25)}...` : row.email || 'N/A'}</span>
        </Tooltip>
      </TableCell>
      
      <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', fontSize:'12px' }}>
        {formatPhoneNumber(row.phoneNumber)}
      </TableCell>
      
      {selectedOption === 'auditor' && (
        <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', fontSize:'12px' }}>
          <FormControl fullWidth size="small">
            <Select
              value={managerSelections[row.id] || row.manager || ''}
              onChange={(e) => handleManagerChange(row.id, e.target.value)}
              displayEmpty
              sx={{
                fontSize: '12px',
                height: '32px',
                '& .MuiSelect-select': {
                  padding: '8px 12px'
                }
              }}
            >
              <MenuItem value="" disabled>
                Select Manager
              </MenuItem>
              {managersList.map(manager => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </TableCell>
      )}
      
      <TableCell sx={{ padding: '8px' }}>
        <CountBadge 
          label={row.count || 0}
          onClick={() => row.count > 0 && openCountModal(row)}
          clickable={row.count > 0}
          sx={{
            cursor: row.count > 0 ? 'pointer' : 'default',
            '&:hover': row.count > 0 ? {
              backgroundColor: theme?.palette?.grey?.[300] || '#e0e0e0',
            } : {}
          }}
        />
      </TableCell>
      
      <TableCell align="center">
        <IconButton
          aria-label={`More actions for ${row.name}`}
          aria-controls={open ? 'actions-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleMenuClick}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          id={`actions-menu-${row.id}`}
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              width: 'auto',
              boxShadow: theme?.shadows?.[3] || '0px 3px 5px -1px rgba(0,0,0,0.2)',
            },
          }}
          MenuListProps={{
            'aria-labelledby': `actions-button-${row.id}`,
          }}
        >
          <MenuItem onClick={() => { handleEdit(row.id); handleMenuClose(); }}>
            <ListItemIcon><EditIcon /></ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { handleDelete(row.id); handleMenuClose(); }}>
            <ListItemIcon><DeleteIcon /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
});

const CountModal = ({ open, onClose, user, selectedOption }) => {
  const theme = useTheme();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: theme?.palette?.primary?.main || '#1976d2',
        color: theme?.palette?.common?.white || '#ffffff',
        fontWeight: '600',
      }}>
        {selectedOption === 'manager' 
          ? 'Associated Auditors' 
          : selectedOption === 'moduleuser'
          ? 'Associated Modules'
          : 'Associated Organizations'}
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {user?.organizations?.length > 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1,
          }}>
            {user.organizations.map((org, index) => (
              <Chip
                key={index}
                label={org.name}
                sx={{
                  borderRadius: '6px',
                  py: 1,
                  my: 0.5,
                  backgroundColor: theme?.palette?.grey?.[100] || '#f5f5f5',
                  '& .MuiChip-label': {
                    fontWeight: '500',
                  }
                }}
                aria-label={org.name}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No {selectedOption === 'manager' 
                ? 'auditors' 
                : selectedOption === 'moduleuser'
                ? 'modules'
                : 'organizations'} associated
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          color="primary" 
          variant="contained"
          sx={{
            borderRadius: '6px',
            textTransform: 'none',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [managerSelections, setManagerSelections] = useState({});
  const [managersList, setManagersList] = useState([]);
  
  const selectedOption = useMemo(() => {
    if (location.pathname.includes('user-manager')) return 'manager';
    if (location.pathname.includes('user-auditor')) return 'auditor';
    if (location.pathname.includes('audit-moduleuser')) return 'moduleuser';
    return 'auditor';
  }, [location.pathname]);

  const auditTypes = useMemo(() => {
    const types = new Set();
    users.forEach(user => {
      if (user.auditType && user.auditType !== 'N/A') {
        types.add(user.auditType);
      }
    });
    return Array.from(types).sort();
  }, [users]);

  const headLabel = useMemo(() => {
    const baseLabels = [
      { id: 'name', label: 'User Name', align: 'left', width: '15%' },
      { id: 'email', label: 'Mail ID', align: 'left', width: '20%' },
      { id: 'phoneNumber', label: 'Phone Number', align: 'left', width: '15%' },
    ];
    
    if (selectedOption === 'auditor') {
      baseLabels.push(
        { id: 'manager', label: 'Manager', align: 'left', width: '15%' }
      );
    }
    
    baseLabels.push(
      { 
        id: 'count', 
        label: selectedOption === 'manager' 
          ? 'Auditors' 
          : selectedOption === 'moduleuser'
          ? 'Modules'
          : 'Organizations', 
        align: 'left', 
        width: '10%' 
      },
      { id: 'actions', label: 'Actions', align: 'center', width: '10%' }
    );

    return baseLabels;
  }, [selectedOption]);

  const fetchManagers = useCallback(async () => {
    try {
      const response = await apiServices.getManager();
      setManagersList(response);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = location.pathname.includes('user-manager')
        ? await apiServices.getManager()
        : await apiServices.getAuditor();

      const transformUserData = (user) => {
        const isManager = location.pathname.includes('user-manager');
        
        const name = user.name || 
                   `${user?.auth_user?.first_name || ''} ${user?.auth_user?.last_name || ''}`.trim() || 
                   'Unknown';
        
        const email = user.email || user?.auth_user?.email || 'N/A';
        const phoneNumber = user.phoneNumber || user.mobile || user.phone || 'N/A';
        
        let role = normalizeRole(user.role);
        if (!role) {
          role = isManager ? 'manager' : 'auditor';
        }

        const organizations = isManager
          ? user.manager_organizations || user.organizations || []
          : user.auditor_organizations || user.organizations || [];
        
        const count = organizations.length;

        return {
          id: user.id || 'N/A',
          name,
          email,
          phoneNumber,
          role,
          count,
          manager: user.manager || '',
          auditType: user.auditType || 
                   user?.company_types?.map(ct => ct.name).join(', ') || 
                   'N/A',
          organizations
        };
      };

      const transformedUsers = response.map(transformUserData);
      
      const filteredUsers = selectedOption
        ? transformedUsers.filter(user => user.role === selectedOption)
        : transformedUsers;

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setSnackbar({ 
        open: true, 
        message: `Error fetching users: ${error.message || 'Unknown error'}`,
        severity: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedOption, location.pathname]);

  useEffect(() => {
    setPage(0); 
    fetchAllUsers();
    if (selectedOption === 'auditor') {
      fetchManagers();
    }
  }, [fetchAllUsers, refreshKey, selectedOption, fetchManagers]);

  const filterUsers = useCallback((users) => {
    const searchTermLower = searchTerm.toLowerCase();
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        (user.name && user.name.toLowerCase().includes(searchTermLower)) ||
        (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTermLower)) ||
        (user.auditType && user.auditType.toLowerCase().includes(searchTermLower)) ||
        (user.organizations && user.organizations.some(org => org.name && org.name.toLowerCase().includes(searchTermLower)));
      
      const matchesAuditType = !auditTypeFilter || 
        user.auditType === auditTypeFilter;
      
      return matchesSearch && matchesAuditType;
    });
  }, [searchTerm, auditTypeFilter]);

  const sortData = useCallback((dataToSort, order, orderBy) => {
    return [...dataToSort].sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (orderBy === 'email') {
        comparison = (a.email || '').localeCompare(b.email || '');
      } else if (orderBy === 'phoneNumber') {
        comparison = (a.phoneNumber || '').localeCompare(b.phoneNumber || '');
      } else if (orderBy === 'auditType') {
        comparison = (a.auditType || '').localeCompare(b.auditType || '');
      } else if (orderBy === 'count') {
        comparison = (a.count || 0) - (b.count || 0);
      }
      return order === 'asc' ? comparison : -comparison;
    });
  }, []);

  const tableState = useMemo(() => {
    const filtered = filterUsers(users);
    const sorted = sortData(filtered, order, orderBy);
    const visible = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    
    return {
      filteredData: filtered,
      sortedData: sorted,
      visibleRows: visible,
      totalCount: filtered.length
    };
  }, [users, filterUsers, sortData, order, orderBy, page, rowsPerPage]);

  const resetFilters = () => {
    setSearchTerm('');
    setAuditTypeFilter('');
    setSelectedDate(null);
    setPage(0);
  };

  const openCountModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeCountModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    setPage(0);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPage(0);
  };

  const handleSort = (event, property) => {
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = dayjs(date).format('DD-MM-YYYY');
      setSearchTerm(prev => {
        const hasTextSearch = prev && !/\d{2}-\d{2}-\d{4}/.test(prev);
        return hasTextSearch ? `${prev} ${formattedDate}` : formattedDate;
      });
    } else {
      setSearchTerm(prev => prev?.replace(/\d{2}-\d{2}-\d{4}/, '')?.trim() || '');
    }
    setPage(0);
  };

  const handleEdit = (id) => {
    const userToEdit = users.find(user => user.id === id);
    navigate(`/edit-user/${id}`, { 
      state: { 
        user: userToEdit,
      } 
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setIsLoading(true);
      await apiServices.delete(`users/${id}/`);
      setUsers(prev => prev.filter(user => user.id !== id));
      refreshData();
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbar({ open: true, message: 'Error deleting user', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      padding: "20px",
      position: "absolute",
      top: "75px",
      width: {
        xs: '100%',
        sm: '100%',
      },
      transition: 'width 0.3s ease-in-out',
      pr: 3,
      boxSizing: 'border-box'
    }}>
      {isLoading && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}>
          <Loader
            type="box-up"
            bgColor={"#000b58"}
            color={"#000b58"}
            size={100}
          />
          <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
            Loading...
          </Typography>
        </Box>
      )}

      <CountModal 
        open={modalOpen} 
        onClose={closeCountModal} 
        user={selectedUser} 
        selectedOption={selectedOption}
      />

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        marginTop: '0px',
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
            <Button
              onClick={() => navigate('/AuditList/user-auditor')}
              disableRipple
              sx={{
                fontSize: '12px',
                textTransform: 'none',
                color: location.pathname.includes('user-auditor') ? '#5C4DFF' : '#888',
                fontWeight: location.pathname.includes('user-auditor') ? '600' : '400',
                borderRadius: 0,
                padding: '4px 0',
                minWidth: 'auto',
                borderBottom: location.pathname.includes('user-auditor') 
                  ? '2px solid #5C4DFF' 
                  : '2px solid transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#5C4DFF',
                  borderBottom: '2px solid #5C4DFF',
                },
              }}
              aria-label="View Auditors"
            >
              Auditors
            </Button>
            
            <Button
              onClick={() => navigate('/AuditList/user-manager')}
              disableRipple
              sx={{
                fontSize: '12px',
                textTransform: 'none',
                color: location.pathname.includes('user-manager') ? '#5C4DFF' : '#888',
                fontWeight: location.pathname.includes('user-manager') ? '600' : '400',
                borderRadius: 0,
                padding: '4px 0',
                minWidth: 'auto',
                borderBottom: location.pathname.includes('user-manager') 
                  ? '2px solid #5C4DFF' 
                  : '2px solid transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#5C4DFF',
                  borderBottom: '2px solid #5C4DFF',
                },
              }}
              aria-label="View Managers"
            >
              Managers
            </Button>

            <Button
              onClick={() => navigate('/AuditList/audit-moduleuser')}
              disableRipple
              sx={{
                fontSize: '12px',
                textTransform: 'none',
                color: location.pathname.includes('audit-moduleuser') ? '#5C4DFF' : '#888',
                fontWeight: location.pathname.includes('audit-moduleuser') ? '600' : '400',
                borderRadius: 0,
                padding: '4px 0',
                minWidth: 'auto',
                borderBottom: location.pathname.includes('audit-moduleuser') 
                  ? '2px solid #5C4DFF' 
                  : '2px solid transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#5C4DFF',
                  borderBottom: '2px solid #5C4DFF',
                },
              }}
              aria-label="View Module Users"
            >
              Audit Module Users
            </Button>
          </Box>
        </Box>
      </Box>

      <Card sx={{
        backgroundColor: theme?.palette?.background?.paper || '#ffffff',
        boxShadow: theme?.shadows?.[1] || '0px 2px 1px -1px rgba(0,0,0,0.2)',
        padding: '10px',
        borderRadius: '8px',
        border: `1px solid ${theme?.palette?.divider || '#e0e0e0'}`,
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <OutlinedInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search"
              sx={{
                width: 120,
                height: '35px',
                paddingLeft: "12px",
                fontSize: "12px",
                background: theme?.palette?.common?.white || '#ffffff',
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
              aria-label="Search users"
            />
            
            <Button
              variant="outlined"
              onClick={resetFilters}
              startIcon={<RestartAltIcon />}
              disabled={!searchTerm && !auditTypeFilter && !selectedDate}
              sx={{
                height: '35px',
                fontSize: '12px',
                color: theme.palette.text.secondary,
                borderColor: theme.palette.grey[400],
                '&:hover': {
                  borderColor: theme.palette.grey[600],
                },
                '&:disabled': {
                  opacity: 0.5,
                }
              }}
              aria-label="Reset all filters"
            >
              Reset
            </Button>
          </Box>
        </Box>

        <TableContainer sx={{ 
          width: '100%', 
          maxHeight: '327px', 
          overflowY: 'auto',
        }}>
          <Table size="small" aria-label="Users table">
            <UserTableHead 
              order={order}
              orderBy={orderBy}
              onRequestSort={handleSort}
              headLabel={headLabel}
            />
            <TableBody>
              {tableState.visibleRows.map(row => (
                <UserTableRow
                  key={row.id}
                  row={row}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  selectedOption={selectedOption}
                  openCountModal={openCountModal}
                  managersList={managersList}
                  managerSelections={managerSelections}
                  setManagerSelections={setManagerSelections}
                  setSnackbar={setSnackbar}
                />
              ))}
              {tableState.filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={headLabel.length} align="center">
             
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tableState.filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            background: theme?.palette?.common?.white || '#ffffff',
          }}
          aria-label="Table pagination"
        />
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          aria-live="polite"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserList;