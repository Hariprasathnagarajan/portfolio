// AdminList.js
/* eslint-disable no-const-assign */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Card, Table, Button, TableBody, Typography, TableContainer,
  TablePagination, TableRow, TableCell, TableHead, Select, MenuItem,
  FormControl, InputLabel, TableSortLabel, Tooltip, OutlinedInput, InputAdornment,
  IconButton, Menu, ListItemIcon, ListItemText, useTheme, useMediaQuery, Popover
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import apiServices from '../../ApiServices/ApiServices';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import Loader from "react-js-loader";

const StatusIndicator = styled(Box)(({ status }) => ({
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: 'black',
  backgroundColor: status === 'Active' ? '#A5D6A7' : status === 'Inactive' ? '#F44336' : '#9E9E9E',
}));

const headLabel = [
  { id: 'username', label: 'Username', align: 'left', width: '20%' },
  { id: 'name', label: 'Name', align: 'left', width: '20%' },
  { id: 'email', label: 'Email', align: 'left', width: '25%' },
  { id: 'createdAt', label: 'Created Date', align: 'left', width: '20%' },
];

const UserTableHead = ({ order, orderBy, onRequestSort, onSelectAllClick, numSelected, rowCount }) => {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  const theme = useTheme();
  return (
    <TableHead sx={{
      background: theme.palette.grey[100],
      borderBottom: `1px solid ${theme.palette.divider}`,
    }}>
      <TableRow style={{ height: '50px' }}> {/* Increased height here */}
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all users' }}
            sx={{
              color: theme.palette.grey[600],
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              },
              '& .MuiSvgIcon-root': {
                fontSize: 16,
              },
            }}
          />
        </TableCell>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sx={{
              fontWeight: '600',
              padding: '12px 8px',
              whiteSpace: 'nowrap',
              width: headCell.width,
              color: theme.palette.text.primary,
              fontSize: '14px',
              '& .MuiTableSortLabel-root': {
                color: theme.palette.text.primary,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
                '&.Mui-active': {
                  color: theme.palette.primary.main,
                },
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
};

const UserTableRow = ({ row, handleEdit, handleDelete, isSelected, handleClick, handleFreeze }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <TableRow
      hover
      role="checkbox"
      aria-checked={isSelected}
      selected={isSelected}
      sx={{
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.grey[50],
        },
        '&:hover': {
          backgroundColor: theme.palette.grey[100],
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.grey[200],
        },
        height: '60px', // Increased height here
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox checked={isSelected} onChange={(event) => handleClick(row.id)}
          sx={{
            '& .MuiSvgIcon-root': {
              fontSize: 16,
            },
          }} />
      </TableCell>
      <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', color: theme.palette.text.primary, fontSize: '12px' }}>{row.username}</TableCell>
      <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', color: theme.palette.text.primary, fontSize: '12px' }}>
        <Tooltip title={row.name} arrow>
          <span>{row.name.length > 20 ? `${row.name.substring(0, 20)}...` : row.name}</span>
        </Tooltip>
      </TableCell>
      <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', color: theme.palette.text.primary, fontSize: '12px' }}>
        {row.email}
      </TableCell>
      <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', color: theme.palette.text.primary, fontSize: '12px' }}>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
    </TableRow>
  );
};

const AdminList = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(''); // Changed from statusFilter
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const theme = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalendarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-picker-popover' : undefined;

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        const response = await apiServices.getAdmins();
        const admins = response.product_admins.map(admin => ({
          id: admin.id,
          username: admin.auth_user.username,
          name: admin.auth_user.first_name,
          email: admin.auth_user.email,
          createdAt: admin.created_at,
          role: admin.role.name,
          delete: admin.is_delete,
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Filter data
        const filterdata = admins.filter(item => item.delete === true);
        setData(filterdata);

      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [navigate]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPage(0);
  };

  const handleFilter = (e) => {
    setFilter(e.target.value);
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

  const handleClick = useCallback((id) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((selectedId) => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, [setSelected]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = visibleRows.map((row) => row.id);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };

  const isSelected = useCallback((id) => selected.includes(id), [selected]);

  const sortData = useCallback((dataToSort, order, orderBy) => {
    return [...dataToSort].sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'username') {
        comparison = a.username.localeCompare(b.username);
      } else if (orderBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (orderBy === 'email') {
        comparison = a.email.localeCompare(b.email);
      }
      else if (orderBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }, []);

  const handleDateChange = (date) => {
    const formattedDate = date ? dayjs(date).format('DD-MM-YYYY') : '';
    setSelectedDate(date);
    setSearchTerm(formattedDate.toLowerCase());
    setPage(0);
    handleClose();
  };

  const filteredData = data.filter(admin => {
    const formattedCreatedDate = dayjs(admin.createdAt).format('DD-MM-YYYY').toLowerCase();
    return (
      (!searchTerm ||
        admin.username.toLowerCase().includes(searchTerm) ||
        admin.name.toLowerCase().includes(searchTerm) ||
        admin.email.toLowerCase().includes(searchTerm) ||
        formattedCreatedDate.includes(searchTerm)
      ) &&
      (!filter || admin.role === filter) // Changed from statusFilter
    );
  });

  const sortedData = useMemo(() => {
    return sortData(filteredData, order, orderBy);
  }, [filteredData, order, orderBy, sortData]);

  const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const numSelected = selected.length;
  const rowCount = filteredData.length;

  return (
    <Box sx={{
      marginLeft: {
        xs: "0",
        sm: "0",
        md: "250px",
      },
      marginTop: "80px",
      width: {
        xs: '100%',
        sm: '100%',
        md: 'calc(100% - 250px)',
      },
      transition: 'width 0.3s ease-in-out',
      pr: 3,
      boxSizing: 'border-box'
    }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          paddingRight: '20px',
          fontSize: '18px',
          color: '#000b58'
        }}
      >
        Admin List
      </Typography>
      <Card sx={{
        width: '100%',
        minWidth: 600,
        padding: '1%',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.grey[50],
        mx: 'auto',
        boxSizing: 'border-box'
      }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search..."
            sx={{
              maxWidth: 260, fontSize: '14px',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              },
              background: theme.palette.common.white,
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handleCalendarClick}>
                  <CalendarMonthIcon />
                </IconButton>
              </InputAdornment>
            }
          />
          <FormControl variant="outlined" sx={{ minWidth: 240 }}>
            <InputLabel id="role-filter-label" sx={{ fontSize: '12px' }}>
              Filter by Role
            </InputLabel>
            <Select
              labelId="role-filter-label"
              value={filter}
              onChange={handleFilter}
              label="Filter by Role"
              sx={{
                fontSize: '14px',
                '& .MuiSelect-select': { textDecoration: 'none' },
                background: theme.palette.common.white,
              }}
            >
              <MenuItem value="" sx={{ fontSize: '12px' }}>All</MenuItem>
              <MenuItem value="PRODUCT_ADMIN" sx={{ fontSize: '12px' }}>PRODUCT_ADMIN</MenuItem>
              {/* <MenuItem value="SuperAdmin" sx={{ fontSize: '12px' }}>SuperAdmin</MenuItem> */}
            </Select>
          </FormControl>
        </Box>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={() => { }}
              format="DD-MM-YYYY"
            />
          </LocalizationProvider>
        </Popover>

        <TableContainer sx={{ width: '100%', maxHeight: '350px', overflowY: 'auto' }}>
          <Table size="small" sx={{ width: '100%', minWidth: 650 }}>
            <UserTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleSort}
              onSelectAllClick={handleSelectAllClick}
              numSelected={numSelected}
              rowCount={rowCount}
            />
            <TableBody>
              {visibleRows.map(row => {
                const isItemSelected = isSelected(row.id);
                return (
                  <UserTableRow
                    key={row.id}
                    row={row}
                    isSelected={isItemSelected}
                    handleClick={handleClick}

                  />
                );
              })}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ fontSize: '12px' }}>No results found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            fontSize: '12px',
            background: theme.palette.common.white,
            border: 'none',
          }}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
        />
      </Card>
      {isLoading && (
        <div className="loading-popup">
          <div className="loading-popup-content">
            <Loader type="box-up" bgColor={'#000b58'} color={'#000b58'} size={100} />
            <p>Loading...</p>
          </div>
        </div>
      )}
    </Box>
  );
};

export default AdminList;
