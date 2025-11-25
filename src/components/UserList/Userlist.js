
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    Box, Card, Table, Button, TableBody, Typography, TableContainer,
    TablePagination, TableRow, TableCell, TableHead, Checkbox,
    OutlinedInput, InputAdornment, MenuItem,
    IconButton, Menu, ListItemIcon, ListItemText, useTheme,
    TableSortLabel, Snackbar, Alert, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import RestoreIcon from '@mui/icons-material/Restore';
import ClearIcon from '@mui/icons-material/Clear';
import apiServices from "../../ApiServices/ApiServices";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Popover from '@mui/material/Popover';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";// Adjust the import path as needed
const StatusIndicator = styled(Box)(({ status }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: status === 'Active' ? '#E8F5E9' :
                     status === 'Inactive' ? '"#FFEBEE"' :
                     status === 'Deleted' ? '#9E9E9E' : '#9E9E9E',
    color: status === 'Active' ? '#2E7D32':
          status === 'Inactive' ? '#C62828' :
          status === 'Deleted' ? '#616161' : '#616161',
    height: '24px',
    minWidth: '80px',
}));

const BulkActions = React.memo(({  numSelected, onBulkFreeze, onBulkDelete, onBulkResume, selectedItems, allData, theme , onBulkRestore, selectedFilter }) => {
    const selectedUsers = useMemo(() =>
      allData.filter(user => selectedItems.includes(user.id)),
      [allData, selectedItems]
    );

    const canFreeze = useMemo(() =>
      selectedUsers.some(user => !user.is_frozen && !user.is_delete),
      [selectedUsers]
    );

    const canResume = useMemo(() =>
      selectedUsers.some(user => user.is_frozen && !user.is_delete),
      [selectedUsers]
    );

    const canDelete = useMemo(() =>
      selectedUsers.some(user => !user.is_delete),
      [selectedUsers]
    );

    const canRestore = useMemo(() =>
      selectedUsers.some(user => user.is_delete),
      [selectedUsers]
    );

    if (numSelected === 0) return null;

    return (
      <Box sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        ml: 2,
        '& .MuiButton-root': {
          minWidth: '100px',
          width: '100px',
          justifyContent: 'flex-start',
          fontSize: '12px',
          px: 1.5,
          py: 0.5,
        }
      }}>
        {/* <Typography variant="subtitle2" sx={{ mr: 1, fontSize: '12px' }}>
          {numSelected} selected
        </Typography> */}

        {canFreeze && (
          <Button
            variant="outlined"
            size="small"
            onClick={onBulkFreeze}
            sx={{
              borderColor: theme.palette.warning.main,
              color: theme.palette.warning.main,
              '&:hover': {
                borderColor: theme.palette.warning.dark,
                backgroundColor: theme.palette.warning.light,
              },
            }}
            aria-label="Freeze selected users"
          >
            Inactive
          </Button>
        )}

        {canResume && (
          <Button
            variant="outlined"
            size="small"
            onClick={onBulkResume}
            sx={{
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              '&:hover': {
                borderColor: theme.palette.success.dark,
                backgroundColor: theme.palette.success.light,
              },
            }}
            aria-label="Resume selected users"
          >
            activate
          </Button>
        )}

        {selectedFilter === 'deleted' && canRestore && (
          <Button
            variant="outlined"
            size="small"
            onClick={onBulkRestore}
            sx={{
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              '&:hover': {
                borderColor: theme.palette.success.dark,
                backgroundColor: theme.palette.success.light,
              },
            }}
            aria-label="Restore selected users"
          >
            Restore
          </Button>
        )}

        {selectedFilter === 'deleted' && canRestore && (
          <Button
            variant="outlined"
            size="small"
            onClick={onBulkDelete}
            sx={{
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              '&:hover': {
                borderColor: theme.palette.error.dark,
                backgroundColor: theme.palette.error.light,
              },
            }}
            aria-label="Permanently delete selected users"
          >
            Delete
          </Button>
        )}

        {canDelete && (
          <Button
            variant="outlined"
            size="small"
            onClick={onBulkDelete}
            sx={{
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              '&:hover': {
                borderColor: theme.palette.error.dark,
                backgroundColor: theme.palette.error.light,
              },
            }}
            aria-label="Delete selected users"
          >
            Delete
          </Button>
        )}
      </Box>
    );
});

const headLabel = [
    { id: 'username', label: 'Name', align: 'left', width: '15%' },
    { id: 'email', label: 'Email', align: 'left', width: '20%' },
    { id: 'createdAt', label: 'Created Date', align: 'left', width: '15%' },
    { id: 'role', label: 'Role', align: 'center', width: '10%' },
    { id: 'status', label: 'Status', align: 'center', width: '10%' },
    { id: 'actions', label: 'Actions', align: 'center', width: '120px' },
];

// Updated to make Select-All operate on the CURRENT PAGE ONLY
const UserTableHead = React.memo(({ order, orderBy, onRequestSort, numSelectedOnPage, pageCount, onSelectAllClick }) => {
    const theme = useTheme();

    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead sx={{
            background: theme.palette.grey[100], // ✅ Change this line to grayish color
            borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
            <TableRow>
                <TableCell padding="checkbox" sx={{ background: theme.palette.grey[100] }}> {/* ✅ Add background to checkbox cell too */}
                    <Checkbox
                        indeterminate={numSelectedOnPage > 0 && numSelectedOnPage < pageCount}
                        checked={pageCount > 0 && numSelectedOnPage === pageCount}
                        onChange={onSelectAllClick}
                        inputProps={{ 'aria-label': 'select all users on this page' }}
                        sx={{
                            color: theme.palette.grey[600],
                            '&.Mui-checked': { color: theme.palette.primary.main },
                        }}
                    />
                </TableCell>
                {headLabel.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align}
                        sx={{
                            background: theme.palette.grey[100], // ✅ Add this line for gray background
                            fontWeight: "600",
                            fontSize: "12px",
                            padding: headCell.id === "actions" ? "12px 16px" : "12px 24px",
                            whiteSpace: "nowrap",
                            width: headCell.width,
                            color: theme.palette.text.primary,
                            "& .MuiTableSortLabel-root": {
                                color: theme.palette.text.primary,
                                "&:hover": { color: theme.palette.primary.main },
                                "&.Mui-active": { color: theme.palette.primary.main },
                            },
                        }}
                    >
                        {headCell.id !== "actions" ? (
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : "asc"}
                                onClick={createSortHandler(headCell.id)}
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
    );
});

const UserTableRow = React.memo(({
    row,
    handleEdit,
    handleDelete,
    isSelected,
    handleClick,
    handleFreeze,
    PermanentDelete,
    handleRestore
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

    const getStatusText = useMemo(() => {
        if (row.is_delete) return 'Deleted';
        if (row.is_frozen) return 'Inactive';
        return 'Active';
    }, [row]);

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
            <TableCell padding="checkbox">
                <Checkbox
                    checked={isSelected}
                    onChange={() => handleClick(row.id)}
                    aria-label={`Select user ${row.username}`}
                />
            </TableCell>

            <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap' ,fontSize:'12px'}}>
                {row.username}
            </TableCell>
            <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap',fontSize:'12px' }}>
                <Tooltip title={row.email} arrow>
                    <span>{row.email.length > 20 ? `${row.email.substring(0, 20)}...` : row.email}</span>
                </Tooltip>
            </TableCell>
            <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', fontSize: '12px' }}>
  {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-GB") : "N/A"}
</TableCell>

            <TableCell align="center">
                <StatusIndicator status={row.role}>
                    {row.role}
                </StatusIndicator>
            </TableCell>
            <TableCell align="center">
                <StatusIndicator status={getStatusText}>
                    {getStatusText}
                </StatusIndicator>
            </TableCell>
            <TableCell align="center" sx={{ width: '120px', minWidth: '120px', maxWidth: '120px', padding: '8px', fontSize: '12px' }}>
                <IconButton
                    aria-label={`More actions for ${row.username}`}
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
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{ style: { minWidth: 180, maxWidth: 220, boxShadow: theme.shadows[3], overflow: 'hidden', wordBreak: 'break-word' } }}
                    MenuListProps={{ 'aria-labelledby': `actions-button-${row.id}` }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    {row.is_delete ? (
                        <>
                            <MenuItem onClick={() => { handleRestore(row.id); handleMenuClose(); }}>
                                <ListItemIcon><RestoreIcon /></ListItemIcon>
                                <ListItemText>Restore</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => { PermanentDelete(row.id); handleMenuClose(); }}>
                                <ListItemIcon><DeleteIcon /></ListItemIcon>
                                <ListItemText>Delete</ListItemText>
                            </MenuItem>
                        </>
                    ) : (
                        <>
                            <MenuItem onClick={() => { handleEdit(row.id); handleMenuClose(); }}>
                                <ListItemIcon><EditIcon /></ListItemIcon>
                                <ListItemText>Edit</ListItemText>
                            </MenuItem>
                            {row.is_frozen ? (
                                <MenuItem onClick={() => { handleFreeze(row.id, false); handleMenuClose(); }}>
                                    <ListItemIcon><FontAwesomeIcon icon={faToggleOn} /></ListItemIcon>
                                    <ListItemText>active</ListItemText>
                                </MenuItem>
                            ) : (
                                <MenuItem onClick={() => { handleFreeze(row.id, true); handleMenuClose(); }}>
                                    <ListItemIcon><FontAwesomeIcon icon={faToggleOff} /></ListItemIcon>
                                    <ListItemText>Inactive</ListItemText>
                                </MenuItem>
                            )}
                            <MenuItem onClick={() => { handleDelete(row.id); handleMenuClose(); }}>
                                <ListItemIcon><DeleteIcon /></ListItemIcon>
                                <ListItemText>Delete</ListItemText>
                            </MenuItem>
                        </>
                    )}
                </Menu>
            </TableCell>
        </TableRow>
    );
});


const UserList = () => {
    const [allData, setAllData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('createdAt');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selected, setSelected] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const theme = useTheme();
    const navigate = useNavigate();
    const anchorRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [datePickerOpen, setDatePickerOpen] = React.useState(false);



    // Fetch all users
    const fetchAllUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await apiServices.users();
            const users = response.map((user) => ({
                id: user.id,
                username: user.auth_user.first_name || "N/A",
                email: user.auth_user.email,
                createdAt: user.created_at,
                role: user.role.name.toLowerCase(),
                is_frozen: user.is_frozen,
                is_delete: user.is_delete,
                orgId: user.organization.id
            }));
            setAllData(users);
        } catch (error) {
            console.error("Error fetching users:", error);
            setSnackbar({ open: true, message: 'Error fetching users', severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setPage(0);
        fetchAllUsers();
    }, [fetchAllUsers]);

   const filterUsers = useCallback((users) => {
  const searchTermLower = searchTerm.toLowerCase();

  return users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.username?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower) ||
      (user.createdAt && dayjs(user.createdAt).format('DD-MM-YYYY').includes(searchTermLower)) ||
      user.role?.toLowerCase().includes(searchTermLower);

    // ✅ New Date filter (same-day match)
    const matchesDate =
      !selectedDate ||
      (user.createdAt && dayjs(user.createdAt).isSame(selectedDate, 'day'));

    switch (selectedFilter) {
      case 'active':
        return matchesSearch && matchesDate && !user.is_frozen && !user.is_delete;
      case 'inactive':
        return matchesSearch && matchesDate && user.is_frozen && !user.is_delete;
      case 'deleted':
        return matchesSearch && matchesDate && user.is_delete;
      case 'all':
      default:
        return matchesSearch && matchesDate && !user.is_delete;
    }
  });
}, [searchTerm, selectedFilter, selectedDate]);


    const sortData = useCallback((dataToSort, order, orderBy) => {
        return [...dataToSort].sort((a, b) => {
            let comparison = 0;
            if (orderBy === 'username') comparison = a.username.localeCompare(b.username);
            else if (orderBy === 'email') comparison = a.email.localeCompare(b.email);
            else if (orderBy === 'createdAt') comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            else if (orderBy === 'role') comparison = a.role.localeCompare(b.role);
            else if (orderBy === 'status') {
                const statusA = a.is_delete ? 2 : (a.is_frozen ? 1 : 0);
                const statusB = b.is_delete ? 2 : (b.is_frozen ? 1 : 0);
                comparison = statusA - statusB;
            }
            return order === 'asc' ? comparison : -comparison;
        });
    }, []);

    const tableState = useMemo(() => {
        const filtered = filterUsers(allData);
        const sorted = sortData(filtered, order, orderBy);
        const visible = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        return {
            filteredData: filtered,
            sortedData: sorted,
            visibleRows: visible,
            totalCount: filtered.length
        };
    }, [allData, filterUsers, sortData, order, orderBy, page, rowsPerPage]);

    // --- Selection helpers for current page ---
    const pageRowIds = useMemo(() => tableState.visibleRows.map(r => r.id), [tableState.visibleRows]);
    const numSelectedOnPage = useMemo(() => selected.filter(id => pageRowIds.includes(id)).length, [selected, pageRowIds]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
        setPage(0);
        setSelected([]);
    };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedDate(null);
    setPage(0);
    setSelected([]);
  };
    const clearSearchAndDate = () => {
        setSearchTerm('');
        setSelectedDate(null);
        setSelected([]);
        setPage(0);
    };

    const handleSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClick = useCallback((id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }, []);

    const isSelected = useCallback((id) => selected.includes(id), [selected]);

    // Select-all now works for CURRENT PAGE ONLY and preserves previous selections across pages
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newIds = pageRowIds.filter(id => !selected.includes(id));
            setSelected(prev => [...prev, ...newIds]);
        } else {
            // remove only current page ids
            setSelected(prev => prev.filter(id => !pageRowIds.includes(id)));
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage); // keep selections intact
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        // DO NOT clear selections here; keep them persistent across page size changes
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
        setSelected([]);
        setAnchorEl(null); // close calendar after selection
    };

    const handleEdit = (id) => navigate(`/UpdateUser/${id}`);
    const handleAddUser = () => navigate('/createuser');

    const handleAction = async (action, id, confirmMsg, apiCall) => {
        if (!window.confirm(confirmMsg)) return;
        try {
            setIsLoading(true);
            await apiCall();
            fetchAllUsers();
            setSelected([]);
            setSnackbar({ open: true, message: `User ${action} successfully`, severity: 'success' });
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            setSnackbar({ open: true, message: `Error performing ${action}: ${error?.message || 'Unknown error'}`, severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const PermanentDelete = async (id) => {
        const user = allData.find(user => user.id === id);
        if (!user) return;
        if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
        try {
            setIsLoading(true);
            await apiServices.permanentUserDelete(id);
            fetchAllUsers();
            setSelected([]);
            setSnackbar({ open: true, message: 'User permanently deleted', severity: 'success' });
        } catch (error) {
            console.error("Error deleting user:", error);
            setSnackbar({ open: true, message: `Error deleting user: ${error?.message || 'Unknown error'}`, severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id) => {
        const user = allData.find(user => user.id === id);
        if (!user) return;
        handleAction('delete', id, "Are you sure you want to delete this user?", () => apiServices.deleteAdmin(id));
    };
    const handleRestore = (id) => {
        const user = allData.find(user => user.id === id);
        if (!user) return;
        handleAction('restore', id, "Are you sure you want to restore this user?", () => apiServices.restoreAdmin(id));
    };
    const handleFreeze = (id, freeze) => {
        const user = allData.find(user => user.id === id);
        if (!user) return;

        handleAction(
            freeze ? 'freeze' : 'resume',
            id,
            `Are you sure you want to ${freeze ? 'freeze' : 'resume'} this user?`,
            () => freeze
                ? apiServices.freezeEmployee(user.orgId, id)
                : apiServices.resumeEmployee(user.orgId, id)
        );
    };

    const handleBulkAction = async (action, confirmMsg, apiCall) => {
        if (selected.length === 0) return;

        const selectedUsers = allData.filter(user => selected.includes(user.id));
        const eligibleUsers = selectedUsers.filter(user => {
            switch (action) {
                case 'freeze':
                    return !user.is_frozen && !user.is_delete;
                case 'resume':
                    return user.is_frozen && !user.is_delete;
                case 'delete':
                    return !user.is_delete;
                default:
                    return true;
            }
        });

        if (eligibleUsers.length === 0) {
            setSnackbar({ open: true, message: `No users are eligible for ${action}`, severity: 'warning' });
            return;
        }

        if (eligibleUsers.length > 5) {
            const proceed = window.confirm(
                `You are about to ${action} ${eligibleUsers.length} users.\n\n` +
                `First 5 users:\n${eligibleUsers.slice(0, 5).map(u => u.username).join('\\n')}\n\n` +
                `Are you sure you want to proceed?`
            );
            if (!proceed) return;
        } else {
            if (!window.confirm(`${confirmMsg} ${eligibleUsers.length} user(s)?`)) return;
        }

        try {
            setIsLoading(true);
            const promises = eligibleUsers.map(user => apiCall(user.orgId, user.id));
            await Promise.all(promises);
            fetchAllUsers();
            setSelected([]);
            setSnackbar({ open: true, message: `Successfully ${action}d ${eligibleUsers.length} user(s)`, severity: 'success' });
        } catch (error) {
            console.error(`Error performing bulk ${action}:`, error);
            setSnackbar({ open: true, message: `Error performing bulk ${action}: ${error?.message || 'Unknown error'}`, severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkFreeze = () => handleBulkAction(
      'freeze',
      'Are you sure you want to freeze',
      (orgId, id) => apiServices.freezeEmployee(orgId, id)
    );
    const handleBulkResume = () => handleBulkAction(
      'resume',
      'Are you sure you want to resume',
      (orgId, id) => apiServices.resumeEmployee(orgId, id)
    );
    // FIX: bulk delete to match single delete signature (id only)
    const handleBulkDelete = () => handleBulkAction(
      'delete',
      'Are you sure you want to delete',
      (_orgId, id) => apiServices.deleteAdmin(id)
    );

    const optionLabelMap = { all: 'All Users', active: 'Active', inactive: 'Inactive', deleted: 'Deleted' };

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
            {/* Loading indicator */}
            {isLoading && (
                <Box sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: theme.palette.primary.main,
                    zIndex: 9999,
                    animation: 'pulse 1.5s infinite'
                }} />
            )}

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                marginTop:'0px',
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
                                onClick={() => {
                                    setSelectedFilter(value);
                                    setPage(0);
                                    setSelected([]);
                                }}
                                disableRipple
                                sx={{
                                    fontSize: '12px',
                                    textTransform: 'none',
                                    color: selectedFilter === value ? '#5C4DFF' : '#888',
                                    fontWeight: selectedFilter === value ? '600' : '400',
                                    borderRadius: 0,
                                    padding: '4px 0',
                                    minWidth: 'auto',
                                    borderBottom: selectedFilter === value ? '2px solid #5C4DFF' : '2px solid transparent',
                                    '&:hover': { backgroundColor: 'transparent', color: '#5C4DFF', borderBottom: '2px solid #5C4DFF' },
                                }}
                                aria-label={`View ${label}`}
                            >
                                {label}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleAddUser}
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
                            aria-label="Add new user"
                        >
                            New User
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Card sx={{
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                padding:'10px',
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
                    onClick={handleClearSearch}
              disabled={!searchTerm && !selectedDate}
                  >
                    Reset
                  </Button>
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
                  format="DD/MM/YYYY"
                  aria-label="Select date for filtering"
                  openTo="day"
                  disableOpenPicker
                  slotProps={{ textField: { sx: { display: 'none' } } }}
                  open={true}
                  onClose={() => setAnchorEl(null)}
                />
              </LocalizationProvider>
            </Popover>
          </Box>

                    <BulkActions
    numSelected={selected.length}
    onBulkFreeze={handleBulkFreeze}
    onBulkDelete={() => handleBulkAction(
        'permanent delete',
        'Are you sure you want to permanently delete',
        (_orgId, id) => apiServices.permanentUserDelete(id)
    )}
    onBulkResume={handleBulkResume}
    onBulkRestore={() => handleBulkAction(
        'restore',
        'Are you sure you want to restore',
        (_orgId, id) => apiServices.restoreAdmin(id)
    )}
    selectedItems={selected}
    allData={allData}
    theme={theme}
    selectedFilter={selectedFilter}
/>
                </Box>

                <TableContainer sx={{ width: '100%', maxHeight: '350px', overflowY: 'auto', overflowX: 'auto', minWidth: '900px' }}>
                    <Table size="small" aria-label="Users table" stickyHeader tableLayout="fixed">
                        <UserTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleSort}
                            onSelectAllClick={handleSelectAllClick}
                            numSelectedOnPage={numSelectedOnPage}
                            pageCount={pageRowIds.length}
                        />
                        <TableBody>
                            {tableState.visibleRows.map(row => (
                                <UserTableRow
                                    key={row.id}
                                    row={row}
                                    handleEdit={()=>handleEdit(row.id)}
                                    handleDelete={()=>handleDelete(row.id)}
                                    PermanentDelete={()=>PermanentDelete(row.id)}
                                    isSelected={isSelected(row.id)}
                                    handleClick={handleClick}
                                    handleFreeze={handleFreeze}
                                    handleRestore={handleRestore}
                                />
                            ))}
                            {tableState.filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                      
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
                    sx={{ display: 'flex', justifyContent: 'flex-end', background: theme.palette.common.white }}
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
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserList;
