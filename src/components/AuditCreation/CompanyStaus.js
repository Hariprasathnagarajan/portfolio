import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Table, Button, TableBody, Box, Typography, TableContainer,
  TablePagination, TableRow, TableCell, TableHead, OutlinedInput, InputAdornment,
  IconButton, TableSortLabel, useTheme, Chip, Checkbox, Dialog,
  DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Tooltip
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers'; // Corrected import
import dayjs from 'dayjs'; // Added import
import CloseIcon from '@mui/icons-material/Close';

// Styled component for Name Display
const NameDisplayBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f9f9f9', // Light grey background
  fontSize: '12px',
  padding: '4px 8px', // Minimal padding
  borderRadius: '4px',
  display: 'inline-block',
  margin: '2px 0',
  // No border or strong colors
}));

// Name Display Component
const NameDisplay = ({ names, dialogTitle }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!names || names.length === 0) {
    return <NameDisplayBox>N/A</NameDisplayBox>;
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
      <NameDisplayBox
        onClick={handleOpenDialog}
        sx={{ cursor: names.length > 1 ? 'pointer' : 'default' }}
      >
        {names.length === 1 ? (
          names[0]
        ) : (
          <>
            {names[0]}
            <Typography component="span" sx={{ fontSize: '10px', ml: 0.5, fontWeight: 'bold' }}>
              +{names.length - 1}
            </Typography>
          </>
        )}
      </NameDisplayBox>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          {dialogTitle}
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 1 }}>
          <List dense disablePadding>
            {names.map((name, index) => (
              <ListItem key={index} disablePadding sx={{ py: 0, minHeight: 'unset' }}>
                <ListItemText primary={name} primaryTypographyProps={{ fontSize: '12px' }} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" size="small">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Table column configuration
const headLabel = [
  { id: 'checkbox', label: '', align: 'center', width: '5%' },
  { id: 'username', label: 'Username', align: 'left', width: '10%' },
  { id: 'organization', label: 'Organization', align: 'left', width: '20%' },
  { id: 'manager', label: 'Manager', align: 'left', width: '15%' },
  { id: 'auditor', label: 'Auditor', align: 'left', width: '15%' },
  { id: 'closed', label: 'Closed', align: 'center', width: '8%' },
  { id: 'open', label: 'Open', align: 'center', width: '8%' },
  { id: 'pendingClient', label: 'Pending Client', align: 'center', width: '8%' },
  { id: 'pendingAuditor', label: 'Pending Auditor', align: 'center', width: '8%' },
];

// Main component
const CompanyStatus = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', items: [] });
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock data - Added manager and auditor fields, updated some usernames to start with "AE-"
  const mockOrganizations = useMemo(() => ([
    {
      id: 1,
      username: "AE-2347346576",
      organization: "DHL Global Forwarding",
      manager: ["John Doe", "Jane Smith"],
      auditor: ["Alice Brown"],
      closed: 20,
      open: 5,
      pendingClient: 10,
      pendingAuditor: 3,
      updatedDate: "2025-06-25",
    },
    {
      id: 2,
      username: "AE-9876543210",
      organization: "Amazon Logistics",
      manager: ["Robert Johnson"],
      auditor: ["Emily White", "David Green", "Sarah Lee"],
      closed: 15,
      open: 8,
      pendingClient: 7,
      pendingAuditor: 2,
      updatedDate: "2025-06-20",
    },
    {
      id: 3,
      username: "AE-1234567890",
      organization: "FedEx Express",
      manager: ["Michael Davis", "Olivia Wilson"],
      auditor: ["Sophia Miller"],
      closed: 30,
      open: 2,
      pendingClient: 5,
      pendingAuditor: 1,
      updatedDate: "2025-06-18",
    },
    {
      id: 4,
      username: "AE-876545678",
      organization: "UPS Supply Chain",
      manager: ["Daniel Taylor"],
      auditor: ["Chris Evans", "Maria Garcia"],
      closed: 12,
      open: 7,
      pendingClient: 3,
      pendingAuditor: 4,
      updatedDate: "2025-06-15",
    },
    {
      id: 5,
      username: "AE-76567887",
      organization: "Maersk",
      manager: ["Liam Rodriguez", "Noah Martinez", "Emma Hernandez"],
      auditor: ["Isabella Lopez"],
      closed: 25,
      open: 1,
      pendingClient: 8,
      pendingAuditor: 0,
      updatedDate: "2025-06-10",
    },
    {
      id: 6,
      username: "AE-7654567654",
      organization: "C.H. Robinson",
      manager: ["Mia Gonzalez"],
      auditor: ["Alexander Perez"],
      closed: 18,
      open: 6,
      pendingClient: 4,
      pendingAuditor: 5,
      updatedDate: "2025-06-05",
    },
    {
      id: 7,
      username: "AE-234565434",
      organization: "Kuehne + Nagel",
      manager: ["Charlotte King"],
      auditor: ["James Wright", "Benjamin Hill"],
      closed: 22,
      open: 3,
      pendingClient: 9,
      pendingAuditor: 2,
      updatedDate: "2025-06-01",
    },
  ]), []);

  // Fetch data
  const fetchOrganizations = useCallback(async () => {
    setData(mockOrganizations);
  }, [mockOrganizations]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    const formattedSearchTerm = searchTerm.toLowerCase();
    let filtered = data.filter(org => {
      // Default filter: username starts with "AE-"
      const matchesAECode = org.username.startsWith("AE-");

      const matchesSearch = !searchTerm ||
        org.username.toLowerCase().includes(formattedSearchTerm) ||
        org.organization.toLowerCase().includes(formattedSearchTerm) ||
        (org.manager && org.manager.some(name => name.toLowerCase().includes(formattedSearchTerm))) ||
        (org.auditor && org.auditor.some(name => name.toLowerCase().includes(formattedSearchTerm))) ||
        dayjs(org.updatedDate).format('DD-MM-YYYY').toLowerCase().includes(formattedSearchTerm);

      const matchesDate = selectedDate
        ? dayjs(org.updatedDate).isSame(selectedDate, "day")
        : true;

      return matchesAECode && matchesSearch && matchesDate;
    });

    return filtered;
  }, [data, searchTerm, selectedDate]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'username') comparison = a.username.localeCompare(b.username);
      else if (orderBy === 'organization') comparison = a.organization.localeCompare(b.organization);
      else if (orderBy === 'manager') comparison = (a.manager?.[0] || '').localeCompare(b.manager?.[0] || '');
      else if (orderBy === 'auditor') comparison = (a.auditor?.[0] || '').localeCompare(b.auditor?.[0] || '');
      else if (orderBy === 'closed') comparison = a.closed - b.closed;
      else if (orderBy === 'open') comparison = a.open - b.open;
      else if (orderBy === 'pendingClient') comparison = a.pendingClient - b.pendingClient;
      else if (orderBy === 'pendingAuditor') comparison = a.pendingAuditor - b.pendingAuditor;
      else if (orderBy === 'updatedDate') comparison = dayjs(a.updatedDate).diff(dayjs(b.updatedDate));
      return order === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, order, orderBy]);

  const visibleRows = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
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
      const newSelecteds = filteredData.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
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
    setPage(0);
  };

  const handleCreateOrganization = () => navigate('/create-organization');

  const handleCountClick = (type, count, orgName) => {
    if (count === 0) return;

    // Generate dummy items based on the count (3-5 items)
    const numberOfItems = Math.max(3, Math.min(5, count)); // Ensure 3-5 items
    const dummyItems = Array.from({ length: numberOfItems }, (_, i) =>
      `Dummy ${type.replace(/([A-Z])/g, ' $1').trim()} Item ${i + 1} for ${orgName}`
    );

    setDialogContent({
      title: `${orgName} - ${type.replace(/([A-Z])/g, ' $1').trim()} Items`,
      items: dummyItems
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Table header component
  function EnhancedTableHead({ order, orderBy, onRequestSort, numSelected, rowCount, onSelectAllClick }) {
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead sx={{ background: theme.palette.grey[100], borderBottom: `1px solid ${theme.palette.divider}` }}>
        <TableRow>
          <TableCell padding="checkbox" sx={{ width: "60px", padding: "0" }}>
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": "select all organizations" }}
              sx={{
                color: theme.palette.grey[600],
                "&.Mui-checked": { color: theme.palette.primary.main },
              }}
            />
          </TableCell>
          {headLabel.slice(1).map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.align}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{
                fontWeight: "600",
                fontSize: "12px",
                padding: "12px 24px",
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
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
                sx={{
                  width: "100%",
                  justifyContent: headCell.align === "center" ? "center" : "flex-start",
                  display: "flex",
                }}
              >
                {headCell.label}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

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
      {/* Title and New Organization Button */}
      <Box sx={{
        width: '100%',
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
        <Typography variant="h2" sx={{ fontWeight: 600, fontSize: '14px', color:'darkblue' }}>
          Organization Status
        </Typography>

        <Button
          variant="contained"
          onClick={handleCreateOrganization}
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
          New Organization
        </Button>
      </Box>

      {/* Main Content */}
      <Card sx={{
        width: '100%',
        padding: '1%',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        borderRadius: '8px',
        border: `1px solid ${theme.palette.divider}`,
      }}>
        {/* Search and Date Picker */}
        <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
          <Box display="flex" gap={2}>
            <OutlinedInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search organizations..."
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              }
              sx={{
                width: 250,
                height: 36,
                fontSize: '12px',
                '& .MuiOutlinedInput-input': {
                  padding: '8px 12px',
                  fontSize: '12px',
                },
              }}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      width: 200,
                      fontSize: '12px',
                      '& .MuiOutlinedInput-input': {
                        padding: '8px 12px',
                        fontSize: '12px',
                      },
                    },
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  },
                }}
                aria-label="Filter by date"
              />
            </LocalizationProvider>
          </Box>


          {selected.length > 0 && (
            <Typography variant="subtitle2" sx={{ fontSize: '12px' }}>
              {selected.length} selected
            </Typography>
          )}
        </Box>

        {/* Data Table */}
        <TableContainer sx={{ width: '100%', maxHeight: '350px', overflowY: 'auto' }}>
          <Table size="small">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleSort}
              onSelectAllClick={handleSelectAllClick}
              numSelected={selected.length}
              rowCount={filteredData.length}
            />
            <TableBody>
              {visibleRows.map(row => (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isSelected(row.id)}
                  selected={isSelected(row.id)}
                  key={row.id}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
                    '&:hover': { backgroundColor: theme.palette.grey[100] },
                    '& td': { fontSize: '12px', padding: '8px', whiteSpace: 'nowrap' },
                  }}
                >
                  <TableCell padding="checkbox" sx={{ padding: '0px 4px' }}>
                    <Checkbox checked={isSelected(row.id)} onChange={() => handleClick(row.id)} />
                  </TableCell>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>
                    <Tooltip title={row.organization} arrow>
                      <span>{row.organization.length > 20 ? `${row.organization.substring(0, 20)}...` : row.organization}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <NameDisplay names={row.manager} dialogTitle="Managers" />
                  </TableCell>
                  <TableCell>
                    <NameDisplay names={row.auditor} dialogTitle="Auditors" />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.closed}
                      size="small"
                      clickable={row.closed > 0}
                      onClick={() => row.closed > 0 && handleCountClick('closed', row.closed, row.organization)}
                      sx={{
                        backgroundColor: '#f0f0f0', // Light neutral color
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        minWidth: 40,
                        fontSize: '12px',
                        padding: '2px 6px',
                        cursor: row.closed > 0 ? 'pointer' : 'default',
                        '&:hover': row.closed > 0 ? {
                          backgroundColor: '#e0e0e0',
                        } : {}
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.open}
                      size="small"
                      clickable={row.open > 0}
                      onClick={() => row.open > 0 && handleCountClick('open', row.open, row.organization)}
                      sx={{
                        backgroundColor: '#f0f0f0', // Light neutral color
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        minWidth: 40,
                        fontSize: '12px',
                        padding: '2px 6px',
                        cursor: row.open > 0 ? 'pointer' : 'default',
                        '&:hover': row.open > 0 ? {
                          backgroundColor: '#e0e0e0',
                        } : {}
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.pendingClient}
                      size="small"
                      clickable={row.pendingClient > 0}
                      onClick={() => row.pendingClient > 0 && handleCountClick('pendingClient', row.pendingClient, row.organization)}
                      sx={{
                        backgroundColor: '#f0f0f0', // Light neutral color
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        minWidth: 40,
                        fontSize: '12px',
                        padding: '2px 6px',
                        cursor: row.pendingClient > 0 ? 'pointer' : 'default',
                        '&:hover': row.pendingClient > 0 ? {
                          backgroundColor: '#e0e0e0',
                        } : {}
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.pendingAuditor}
                      size="small"
                      clickable={row.pendingAuditor > 0}
                      onClick={() => row.pendingAuditor > 0 && handleCountClick('pendingAuditor', row.pendingAuditor, row.organization)}
                      sx={{
                        backgroundColor: '#f0f0f0', // Light neutral color
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        minWidth: 40,
                        fontSize: '12px',
                        padding: '2px 6px',
                        cursor: row.pendingAuditor > 0 ? 'pointer' : 'default',
                        '&:hover': row.pendingAuditor > 0 ? {
                          backgroundColor: '#e0e0e0',
                        } : {}
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={headLabel.length} align="center">
                 
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
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

      {/* Count Items Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {dialogContent.title}
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List dense>
            {dialogContent.items.map((item, index) => (
              <ListItem key={index}>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyStatus;