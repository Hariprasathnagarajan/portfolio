import React, { useState, useMemo, useEffect } from 'react';
import {
  Card, Table, Button, TableBody, Box, Typography, TableContainer,
  TablePagination, TableRow, TableCell, TableHead, OutlinedInput, InputAdornment,
  IconButton, TableSortLabel, useTheme, Dialog, Chip,
  DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Tooltip
} from '@mui/material';
import { styled } from '@mui/system';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import { API_URL } from "../../ApiServices/ApiServices"; // adjust path if needed
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const CountBadge = styled(Chip)(({ theme }) => ({
  minWidth: '24px',
  height: '24px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '400',
  backgroundColor: 'transparent',
  color: '#333',
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

const headLabel = [
  { id: 'organization_code', label: 'Organization Code', align: 'left' },
  { id: 'organization', label: 'Organization', align: 'left' },
  { id: 'last_updated_date', label: 'Last Updated Date', align: 'left' },
  { id: 'auditor', label: 'Auditor', align: 'left' },
  // { id: 'manager', label: 'Manager', align: 'left' },
  { id: 'current_status', label: 'Status', align: 'center' },
];

const ManagerReconciliation = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('organization_code');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
   const [selectedDate, setSelectedDate] = React.useState(null);
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState(''); // New state for search input
const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const navigate = useNavigate();

  // Fetch backend data
  useEffect(() => {
    const fetchManagerReconciliation = async () => {
      try {
       const response = await axios.get(`${API_URL}reconciliation-status/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch manager reconciliation data", error);
      }
    };

    fetchManagerReconciliation();
  }, []);

const filteredData = useMemo(() => {
  const formattedSearchTerm = searchTerm.toLowerCase();

  return data.filter((org) => {
    // 🔎 text search across fields
    const matchesSearch =
      !searchTerm ||
      org.organization_code?.toLowerCase().includes(formattedSearchTerm) ||
      org.organization?.toLowerCase().includes(formattedSearchTerm) ||
      org.last_updated_date?.toLowerCase().includes(formattedSearchTerm) ||
      org.auditor?.toLowerCase().includes(formattedSearchTerm) ||
      org.manager?.toLowerCase().includes(formattedSearchTerm) ||
      org.current_status?.toLowerCase().includes(formattedSearchTerm);

    // 📅 date filter (exact day match)
    const matchesDate =
      !selectedDate ||
      (org.last_updated_date &&
        new Date(org.last_updated_date).toDateString() ===
          new Date(selectedDate).toDateString());

    // ✅ combine both
    return matchesSearch && matchesDate;
  });
}, [data, searchTerm, selectedDate]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue = a[orderBy] || '';
      let bValue = b[orderBy] || '';
      return order === 'asc'
        ? aValue.toString().localeCompare(bValue.toString())
        : bValue.toString().localeCompare(aValue.toString());
    });
  }, [filteredData, order, orderBy]);

  const visibleRows = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setSearchQuery(e.target.value); // <-- update searchQuery
    setPage(0);
  };
const handleReset = () => {
    setSearchQuery('');
    setSearchTerm('');
    setPage(0);
  };
const handleClearSearch = () => {
  setSearchTerm('');
  setSelectedDate(null);
  setPage(0);
  // setSelected([]); // If you have a selection state, otherwise remove this line
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

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case 'closed':
      case 'close': return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'in-Progress':return { bg: '#FFF8E1', text: '#FF8F00' };
       case 'in Progress':return { bg: '#FFF8E1', text: '#FF8F00' };
      case 'in-progress':return { bg: '#FFF8E1', text: '#FF8F00' };
      case 'in progress':return { bg: '#FFF8E1', text: '#FF8F00' };
      case 'open': return { bg: '#FFEBEE', text: '#C62828' };
      default: return { bg: '#F5F5F5', text: '#757575' };
    }
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
          <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "14px" }}>
            Manager Reconciliation
          </Typography>
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
        <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
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
                       sx={{ height: '35px', fontSize: '12px', borderRadius: '7px' }}
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
              <TableRow sx={{ backgroundColor: theme.palette.grey[100], height: '56px' }}>
                {headLabel.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.align}
                    sortDirection={orderBy === headCell.id ? order : false}
                    sx={{
                      fontWeight: "600",
                      fontSize: "12px",
                      padding: "16px 12px",
                      whiteSpace: "nowrap",
                      color: theme.palette.text.primary,
                      "& .MuiTableSortLabel-root": {
                        color: theme.palette.text.primary,
                        "&:hover": { color: theme.palette.primary.main },
                        "&.Mui-active": { color: theme.palette.primary.main },
                      },
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={(e) => handleSort(e, headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleRows.length > 0 ? visibleRows.map((row, index) => (
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
                    <Link
                      to={`/ManagerReconciliationdetail`}
                      state={{
                        organization: row.organization,
                        username: row.organization_code
                      }}
                      style={{
                        color: '#1976d2',
                        // textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      {row.organization_code || "—"}
                    </Link>
                  </TableCell>

                  <TableCell align="left">
                    <Tooltip title={row.organization} arrow>
                      <span>{row.organization?.length > 20 ? `${row.organization.substring(0, 20)}...` : row.organization}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="left">
                    {row.last_updated_date
                      ? new Date(row.last_updated_date).toLocaleDateString("en-IN")
                      : "—"}
                  </TableCell>
                  <TableCell align="left">
                    {row.auditor || "—"}
                  </TableCell>
                  {/* <TableCell align="left">
                    {row.manager || "—"}
                  </TableCell> */}
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: getStatusColor(row.current_status).text,
                        backgroundColor: getStatusColor(row.current_status).bg,
                        height: "24px",
                        minWidth: "100px",
                      }}
                    >
                      {row.current_status || "—"}
                    </Box>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2">
                      {filteredData.length === 0 && data.length > 0
                        ? 'No matching organizations found'
                        : ''}
                    </Typography>
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
    </Box>
  );
};

export default ManagerReconciliation;
