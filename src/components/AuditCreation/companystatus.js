import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Table, Button, TableBody, Box, Typography, TableContainer,
  TablePagination, TableRow, TableCell, TableHead, OutlinedInput, InputAdornment,
  IconButton, TableSortLabel, useTheme, Dialog, Chip,
  DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Tooltip
} from '@mui/material';
import { styled } from '@mui/system';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import apiServices from '../../ApiServices/ApiServices';


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
  { id: 'username', label: 'Organization Code', align: 'left' },
  { id: 'organization', label: 'Organization', align: 'left' },
  { id: 'manager', label: 'Manager', align: 'center' },
  { id: 'auditor', label: 'Auditor', align: 'center' },
  { id: 'closed', label: 'Closed', align: 'center' },
  { id: 'open', label: 'Open', align: 'center' },
  { id: 'pendingClient', label: 'Pending with Client', align: 'center' },
  { id: 'pendingAuditor', label: 'Pending with Auditor', align: 'center' },
];

const CompanyStatus = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('username');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', items: [] });
  const theme = useTheme();
  const navigate = useNavigate();

   const fetchOrganizations = useCallback(async () => {
  try {
   
    const response = await apiServices.orgStatus();
    console.log("✅ API response:", response);

    if (!Array.isArray(response)) {
      throw new Error('API response is not an array');
    }

    const transformedData = response.map(org => ({
      id: org.id,
      username: org.organization_code,
      organization: org.organization,
      manager: org.manager ? [org.manager] : [],
      auditor: org.auditor ? [org.auditor] : [],
      closed: org.closed || 0,
      open: org.open || 0,
      pendingClient: org.pending_client || 0,
      pendingAuditor: org.pending_auditor || 0,
    }));

    setData(transformedData);
  } catch (err) {
    setError('Failed to fetch organization data');
    console.error('Fetch error:', err);
  } finally {

  }
}, []);


  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);



  const filteredData = useMemo(() => {
    const formattedSearchTerm = searchTerm.toLowerCase();
    return data.filter(org => {
      return !searchTerm ||
        org.username.toLowerCase().includes(formattedSearchTerm) ||
        org.organization.toLowerCase().includes(formattedSearchTerm) ||
        (org.manager && org.manager.some(name => name.toLowerCase().includes(formattedSearchTerm))) ||
        (org.auditor && org.auditor.some(name => name.toLowerCase().includes(formattedSearchTerm)));
    });
  }, [data, searchTerm]);

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
      return order === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, order, orderBy]);

  const visibleRows = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

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

const handleCountClick = (type, count, orgName, username) => {
  const statusMap = {
    open: "Open",
    closed: "Closed",
    pendingClient: "Pending With Client",
    pendingAuditor: "Pending With Auditor",
  };

  navigate("/company-declaration-status", {
    state: {
      organization: orgName,
      username: username,
      statusFilter: statusMap[type] || "All"
    }
  });

  const dummyItems = Array.from({ length: count }, (_, i) => `Dummy ${type} Item ${i + 1}`);
  setDialogContent({
    title: `${orgName} - ${type.replace(/([A-Z])/g, ' $1').trim()} Items`,
    items: dummyItems
  });
  setDialogOpen(true);
};

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  

  if (error) {
    return (
      <Box sx={{ 
        padding: "20px", 
        position: "absolute", 
        top: "75px", 
        width: '100%',
        textAlign: 'center',
        paddingRight: '50px'
      }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchOrganizations} variant="outlined">
          Retry
        </Button>
      </Box>
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
            Organization Status
          </TabButton>
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
          <Box display="flex" gap={2} alignItems="center">
            <OutlinedInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search ..."
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              }
              sx={{
                width: '120px',
                height: 36,
                fontSize: '12px',
                '& .MuiOutlinedInput-input': {
                  padding: '0px 1px',
                  fontSize: '12px',
                },
              }}
            />
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              sx={{ height: '36px', fontSize: '12px', borderRadius: '7px' }}
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
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
                      ...(headCell.id === 'closed' || headCell.id === 'open'
                        ? { pl: 4 }
                        : {}),
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
              {visibleRows.length > 0 ? visibleRows.map(row => (
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
                    <Link
                      to="/company-declaration-status"
                      state={{ organization: row.organization, username: row.username }}
                      style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                    >
                      {row.username}
                    </Link>
                  </TableCell>

                  <TableCell align="left">
                    <Tooltip title={row.organization} arrow>
                      <span>{row.organization.length > 20 ? `${row.organization.substring(0, 20)}...` : row.organization}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="left">
                    <NameDisplay names={row.manager} dialogTitle="Managers" />
                  </TableCell>
                  <TableCell align="left">
                    <NameDisplay names={row.auditor} dialogTitle="Auditors" />
                  </TableCell>
                  {/* Closed Count */}
<TableCell align="center">
  <Tooltip title="View closed items" arrow>
    <Box
      onClick={() =>
        row.closed > 0 &&
        handleCountClick('closed', row.closed, row.organization, row.username)
      }
      sx={{
        color: row.closed > 0 ? theme.palette.primary.main : theme.palette.text.disabled,
        cursor: row.closed > 0 ? 'pointer' : 'default',
        fontSize: '12px',
        fontWeight: 600,
        '&:hover': {
          textDecoration: row.closed > 0 ? 'underline' : 'none',
        },
      }}
    >
      {row.closed}
    </Box>
  </Tooltip>
</TableCell>

{/* Open Count */}
<TableCell align="center">
  <Tooltip title="View open items" arrow>
    <Box
      onClick={() =>
        row.open > 0 &&
        handleCountClick('open', row.open, row.organization, row.username)
      }
      sx={{
        color: row.open > 0 ? theme.palette.primary.main : theme.palette.text.disabled,
        cursor: row.open > 0 ? 'pointer' : 'default',
        fontSize: '12px',
        fontWeight: 600,
        '&:hover': {
          textDecoration: row.open > 0 ? 'underline' : 'none',
        },
      }}
    >
      {row.open}
    </Box>
  </Tooltip>
</TableCell>

<TableCell align="center">
  <Tooltip title="View Pending with client items" arrow>
    <Box
      onClick={() =>
        row.pendingClient > 0 &&
        handleCountClick('pendingClient', row.pendingClient, row.organization, row.username)
      }
      sx={{
        color: row.pendingClient > 0 ? theme.palette.primary.main : theme.palette.text.disabled,
        cursor: row.pendingClient > 0 ? 'pointer' : 'default',
        fontSize: '12px',
        fontWeight: 600,
        '&:hover': {
          textDecoration: row.pendingClient > 0 ? 'underline' : 'none',
        },
      }}
    >
      {row.pendingClient}
    </Box>
  </Tooltip>
</TableCell>

<TableCell align="center">
  <Tooltip title="View Pending with auditor items" arrow>
    <Box
      onClick={() =>
        row.pendingAuditor > 0 &&
        handleCountClick('pendingAuditor', row.pendingAuditor, row.organization, row.username)
      }
      sx={{
        color: row.pendingAuditor > 0 ? theme.palette.primary.main : theme.palette.text.disabled,
        cursor: row.pendingAuditor > 0 ? 'pointer' : 'default',
        fontSize: '12px',
        fontWeight: 600,
        '&:hover': {
          textDecoration: row.pendingAuditor > 0 ? 'underline' : 'none',
        },
      }}
    >
      {row.pendingAuditor}
    </Box>
  </Tooltip>
</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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

export default CompanyStatus;