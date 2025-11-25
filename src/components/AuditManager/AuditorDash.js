import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Table, Button, TableBody, Box, Typography, TableContainer,
  TablePagination, TableRow, TableCell, TableHead, OutlinedInput, InputAdornment,
  IconButton, TableSortLabel, useTheme, Dialog,
  DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Tooltip, Link
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import apiServices from '../../ApiServices/ApiServices';


// Styled components
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

// Table column configuration
const headLabel = [
  { id: 'auditor', label: 'Auditor', align: 'left' },
  { id: 'assigned', label: 'Assigned', align: 'center' },
  { id: 'closed', label: 'Closed', align: 'center' },
  { id: 'open', label: 'Open', align: 'center' },
  { id: 'pendingClient', label: 'Pending with Client', align: 'center' },
  { id: 'pendingAuditor', label: 'Pending with Auditor', align: 'center' },
];

// Main component
const AuditStatusTable = () => {
  const [auditorData, setAuditorData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('auditor');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const theme = useTheme();
  const navigate = useNavigate();
const handleClearSearch = () => {
  setSearchTerm('');
  setSelectedDate(null);
  setPage(0);
  // setSelected([]); // If you have a selection state, otherwise remove this line
};
  useEffect(() => {
    const fetchAuditorData = async () => {
      try {
        const data = await apiServices.getAuditorDetails();
        // Transform the data to the expected format
        const transformedData = data.map(item => ({
          ...item,
          pendingClient: item.pending_with_client || 0,
          pendingAuditor: item.pending_with_auditor || 0,
        }));
        setAuditorData(transformedData);
      } catch (error) {
        console.error("Failed to fetch auditor data:", error);
      }
    };
    fetchAuditorData();
  }, []);

  const filteredData = useMemo(() => {
    const formattedSearchTerm = searchTerm.toLowerCase();
    return auditorData.filter(item => {
      return !searchTerm ||
        item.auditor.toLowerCase().includes(formattedSearchTerm);
    });
  }, [auditorData, searchTerm]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'auditor') comparison = a.auditor.localeCompare(b.auditor);
      else {
        comparison = (a[orderBy] || 0) - (b[orderBy] || 0);
      }
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

  const handleRequestSort = (property) => {
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

  const handleRowClick = (row) => {
    setSelectedRow(row);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

const handleStatusClick = (e, row, status) => {
  e.stopPropagation();
  navigate(`/OpenDeclaration`, {
    state: {
      auditorName: row.auditor,
      status: status, // ✅ Pass the status here
      declarations: []
    }
  });
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
          <TabButton selected>   Auditor Status </TabButton>
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
        <Box display="flex" justifyContent="flex-start" mb={2} alignItems="center">
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search..."
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
            sx={{
              width: '120px',
              maxWidth: '400px',
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
                sx={{ height: '35px', fontSize: '12px', borderRadius: '7px', marginLeft: '10px' }}
                onClick={handleClearSearch}
                disabled={!searchTerm && !selectedDate}
              >
                Reset
              </Button>
        </Box>

        <TableContainer sx={{ width: '100%', maxHeight: '350px', overflowY: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100], height: '56px' }}>
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
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map(row => (
                <TableRow hover key={row.id} onClick={() => handleRowClick(row)} sx={{ height: '56px', '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] } }}>
                  <TableCell sx={{ fontSize: '12px', padding: "16px 12px" }}>
                    <Link onClick={(e) => handleStatusClick(e, row, 'auditor')} style={{ cursor: 'pointer' }}>
                      {row.auditor}
                    </Link>
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', padding: "16px 12px" }}>{row.assigned}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', padding: "16px 12px" }}>
                    <Link onClick={(e) => handleStatusClick(e, row, 'closed')} style={{ cursor: 'pointer' }}>
                      {row.closed}
                    </Link>
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', padding: "16px 12px" }}>
                    <Link onClick={(e) => handleStatusClick(e, row, 'open')} style={{ cursor: 'pointer' }}>
                      {row.open}
                    </Link>
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', padding: "16px 12px" }}>
                    <Link onClick={(e) => handleStatusClick(e, row, 'pendingClient')} style={{ cursor: 'pointer' }}>
                      {row.pendingClient}
                    </Link>
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '12px', padding: "16px 12px" }}>
                    <Link onClick={(e) => handleStatusClick(e, row, 'pendingAuditor')} style={{ cursor: 'pointer' }}>
                      {row.pendingAuditor}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
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
          sx={{
            fontSize: '12px',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input': {
              fontSize: '12px',
            },
          }}
        />
      </Card>

      {/* <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: theme.shadows[5],
            backgroundColor: theme.palette.background.paper,
            padding: '20px',
            overflowY: 'auto',
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#5C4DFF', fontWeight: 600 }}>
            {selectedRow?.auditor} Details
          </Typography>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedRow && (
            <List>
              <ListItem sx={{ py: 1 }}>
                <ListItemText
                  primary={`Assigned (${selectedRow.assigned}):`}
                  secondary={
                    <Box component="div" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Total assigned declarations.
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {/* Updated to directly display the count */}
              {/* <ListItem sx={{ py: 1 }}>
                <ListItemText
                  primary={`Closed (${selectedRow.closed}):`}
                  secondary={
                    <Box component="div" sx={{ mt: 1 }}>
                        <Typography variant="body2">
                          Total closed declarations.
                        </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem sx={{ py: 1 }}>
                <ListItemText
                  primary={`Open (${selectedRow.open}):`}
                  secondary={
                    <Box component="div" sx={{ mt: 1 }}>
                       <Typography variant="body2">
                          Total open declarations.
                        </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem sx={{ py: 1 }}>
                <ListItemText
                  primary={`Pending with Client (${selectedRow.pendingClient}):`}
                  secondary={
                    <Box component="div" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                          Total declarations pending with the client.
                        </Typography>
                    </Box>
                  }
                />
              </ListItem>
              <ListItem sx={{ py: 1 }}>
                <ListItemText
                  primary={`Pending with Auditor (${selectedRow.pendingAuditor}):`}
                  secondary={
                    <Box component="div" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                          Total declarations pending with the auditor.
                        </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          )}
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
      </Dialog> */} 
    </Box>
  );
};

export default AuditStatusTable;