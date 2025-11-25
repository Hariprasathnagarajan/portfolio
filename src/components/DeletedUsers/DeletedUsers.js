import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "react-js-loader";
import apiServices from "../../ApiServices/ApiServices";
import {
    Box, Card, Table, Button, TableBody, Typography, TableContainer,
    TablePagination, TableRow, TableCell, TableHead, Select, MenuItem,
    FormControl, InputLabel, OutlinedInput, InputAdornment,
    IconButton, useTheme, Popover
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import Checkbox from '@mui/material/Checkbox';

const UserList = () => {
    const [data, setData] = useState([]);
    const [actionMessage, setActionMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filterDate, setFilterDate] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const theme = useTheme();
    const navigate = useNavigate();
    const open = Boolean(anchorEl);
    const id = open ? 'date-picker-popover' : undefined;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setIsLoading(true);
                const response = await apiServices.users();
                
                // Log the raw API response for debugging
                console.log("API Response:", response);
                
                let users = response.map((user) => ({
                    id: user.id,
                    empId: user.auth_user?.id || null,
                    username: user.auth_user?.first_name || "N/A",
                    email: user.auth_user?.email || "N/A",
                    createdAt: user.created_at,
                    role: user.role?.name || "Unknown",
                    status: user.is_frozen,
                    delete: user.is_delete,
                })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Filter for deleted users (check both boolean true and string "true")
                const filteredUsers = users.filter(item => 
                    item.delete === true || item.delete === "true"
                );
                
                setData(filteredUsers);
                setFilteredData(filteredUsers);
                
                if (filteredUsers.length === 0) {
                    setActionMessage("No deleted users found.");
                } else {
                    setActionMessage("");
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                setActionMessage("Error fetching users. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [refresh]);

    const filteredData1 = useMemo(() => {
        return filteredData.filter((item) => {
            const searchValue = searchTerm.toLowerCase();

            const usernameMatch = item.username.toLowerCase().includes(searchValue);
            const emailMatch = item.email.toLowerCase().includes(searchValue);
            const createdAtMatch = item.createdAt ? 
                new Date(item.createdAt).toLocaleDateString().toLowerCase().includes(searchValue) : 
                false;
            const roleMatch = item.role.toLowerCase().includes(searchValue);

            let roleFilterMatch = true;
            if (filter !== "") {
                roleFilterMatch = item.role === filter;
            }

            return roleFilterMatch && (usernameMatch || emailMatch || createdAtMatch || roleMatch);
        });
    }, [filteredData, searchTerm, filter]);

    useEffect(() => {
        const filterUsers = data.filter((item) => {
            if (filterDate) {
                const itemDate = new Date(item.createdAt);
                const selectedDate = new Date(filterDate);
                return itemDate.toLocaleDateString() === selectedDate.toLocaleDateString();
            }
            return true;
        });
        setFilteredData(filterUsers);
    }, [filterDate, data]);

    const paginatedData = filteredData1.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handleFilter = (e) => setFilter(e.target.value);
    const handleRowsPerPage = (e) => setRowsPerPage(parseInt(e.target.value));
    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handleCalendarClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleDateChange = (date) => {
        const formattedDate = date ? dayjs(date).format('DD-MM-YYYY') : '';
        setSelectedDate(date);
        setFilterDate(date);
        setSearchTerm(formattedDate.toLowerCase());
        handleClose();
    };

    const handleCheckboxChange = (event, rowId) => {
        if (event.target.checked) {
            setSelectedRows([...selectedRows, rowId]);
        } else {
            setSelectedRows(selectedRows.filter(id => id !== rowId));
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allRowIds = paginatedData.map(row => row.id);
            setSelectedRows(allRowIds);
        } else {
            setSelectedRows([]);
        }
    };

    const isRowSelected = (rowId) => selectedRows.includes(rowId);

    const uniqueRoles = [...new Set(data.map(item => item.role))];

    return (
        <Box sx={{
            marginLeft: {
                xs: "0",
                sm: "0",
            },
            marginTop: "25px",
            padding: "20px",
            paddingTop: '100px',
            width: {
                xs: '100%',
                sm: '100%',
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
                Deleted User List
            </Typography>
            
            {actionMessage && (
                <Typography sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    {actionMessage}
                </Typography>
            )}

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
                <Box display="flex" justifyContent="space-between" mb={2} gap={2}>
                    <OutlinedInput
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search..."
                        sx={{
                            flex: 1,
                            maxWidth: 260,
                            fontSize: '14px',
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
                    
                    <FormControl variant="outlined" sx={{ minWidth: 250 }}>
                        <InputLabel id="role-label" sx={{ fontSize: '12px' }}>Filter by Role</InputLabel>
                        <Select
                            labelId="role-label"
                            value={filter}
                            onChange={handleFilter}
                            label="Filter by Role"
                            sx={{
                                fontSize: '14px',
                                '& .MuiSelect-select': { textDecoration: 'none' },
                                background: theme.palette.common.white,
                            }}
                        >
                            <MenuItem value="" sx={{ fontSize: '12px' }}>All Roles</MenuItem>
                            {uniqueRoles.map((role, index) => (
                                <MenuItem key={index} value={role} sx={{ fontSize: '12px' }}>
                                    {role}
                                </MenuItem>
                            ))}
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
                        <MuiDatePicker
                            value={selectedDate}
                            onChange={handleDateChange}
                            renderInput={() => { }}
                            format="DD-MM-YYYY"
                        />
                    </LocalizationProvider>
                </Popover>

                <TableContainer sx={{ width: '100%', maxHeight: '350px', overflowY: 'auto' }}>
                    <Table size="small" sx={{ width: '100%', minWidth: 650 }}>
                        <TableHead sx={{
                            background: theme.palette.grey[100],
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        }}>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        onChange={handleSelectAll}
                                        checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                        indeterminate={selectedRows.length > 0 && selectedRows.length < paginatedData.length}
                                    />
                                </TableCell>
                                <TableCell sx={{
                                    fontWeight: '600',
                                    padding: '12px 8px',
                                    whiteSpace: 'nowrap',
                                    width: '25%',
                                    color: theme.palette.text.primary,
                                    fontSize: '14px',
                                }}>Name</TableCell>
                                <TableCell sx={{
                                    fontWeight: '600',
                                    padding: '12px 8px',
                                    whiteSpace: 'nowrap',
                                    width: '25%',
                                    color: theme.palette.text.primary,
                                    fontSize: '14px',
                                }}>Email</TableCell>
                                <TableCell sx={{
                                    fontWeight: '600',
                                    padding: '12px 8px',
                                    whiteSpace: 'nowrap',
                                    width: '25%',
                                    color: theme.palette.text.primary,
                                    fontSize: '14px',
                                }}>Created Date</TableCell>
                                <TableCell sx={{
                                    fontWeight: '600',
                                    padding: '12px 8px',
                                    whiteSpace: 'nowrap',
                                    width: '25%',
                                    color: theme.palette.text.primary,
                                    fontSize: '14px',
                                }}>Role</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item) => (
                                    <TableRow key={item.id}
                                        sx={{
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: theme.palette.grey[50],
                                            },
                                            '&:hover': {
                                                backgroundColor: theme.palette.grey[100],
                                            },
                                        }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isRowSelected(item.id)}
                                                onChange={(event) => handleCheckboxChange(event, item.id)}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', color: theme.palette.text.primary, fontSize: '12px' }}>
                                            {item.username}
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', color: theme.palette.text.primary, fontSize: '12px' }}>
                                            {item.email}
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', color: theme.palette.text.primary, fontSize: '12px' }}>
                                            {item.createdAt ? 
                                                new Date(item.createdAt).toLocaleDateString("en-US", { 
                                                    year: "numeric", 
                                                    month: "long", 
                                                    day: "numeric" 
                                                }) : 
                                                "N/A"}
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', color: theme.palette.text.primary, fontSize: '12px' }}>
                                            {item.role}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ fontSize: '12px' }}>
                                        No deleted users found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredData1.length}
                    rowsPerPage={rowsPerPage}
                    page={currentPage - 1}
                    onPageChange={(event, newPage) => handlePageChange(newPage + 1)}
                    onRowsPerPageChange={handleRowsPerPage}
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

export default UserList;