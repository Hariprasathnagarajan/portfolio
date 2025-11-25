import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card, Table, Button, TableBody, Box, Typography, TableContainer,
  TablePagination, TableRow, TableCell, TableHead, OutlinedInput, InputAdornment,
  IconButton, TableSortLabel, useTheme, Dialog, Chip,
  DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Tooltip, Divider
} from '@mui/material';
import { styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import apiServices from "../../ApiServices/ApiServices";

// Styled components
const CountBadge = styled(Chip)(({ theme }) => ({
  minWidth: '24px',
  height: '24px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '400',
  backgroundColor: 'transparent',   // Set background to transparent
  color: '#000000',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'transparent', // Keep hover background transparent
  },
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

const OrganizationChip = styled(Chip)(({ theme }) => ({
  borderRadius: '12px',
  padding: '8px 12px',
  margin: '4px 0',
  backgroundColor: '#f5f5f5',
  '& .MuiChip-label': {
    padding: 0,
    fontWeight: '500',
  }
}));

// Table column configuration
const headLabel = [
  { id: 'auditor', label: 'Auditor', align: 'left' },
  { id: 'organizationCount', label: 'Organization Count', align: 'center' },
  { id: 'manager', label: 'Manager', align: 'left' }, 
  { id: 'closed', label: 'Closed', align: 'center' },
  { id: 'open', label: 'Open', align: 'center' },
  { id: 'pendingClient', label: 'Pending with Client', align: 'center' },
  { id: 'pendingAuditor', label: 'Pending with Auditor', align: 'center' },
];

// Main component
const AuditStatus = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('auditor');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ 
    title: '', 
    items: [] 
  });
  const theme = useTheme();
  const navigate = useNavigate();

  const fetchOrganizations = useCallback(async () => {
  try {
    const response = await apiServices.getAuditStatus(); // Make sure this hits your Django API

    const transformed = response.map(item => ({
      id: item.auditor_id,
      auditor: item.auditor,
      organizations: item.organizations.map(org => ({
        orgId: org.id,
        organizationName: org.name,
        manager: org.manager,
        closed: org.closed,
        open: org.open,
        pendingClient: org.pending_client,
        pendingAuditor: org.pending_auditor
      }))
    }));

    setData(transformed);
  } catch (error) {
    console.error('Error fetching audit status:', error);
  }
}, []);


  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Filter data
const safeSearch = (value, searchTerm) => {
  if (!value) return false;
  return String(value).toLowerCase().includes(searchTerm);
};
// Filter data
// Filter data
const filteredData = useMemo(() => {
  const formattedSearchTerm = searchTerm.toLowerCase();
  return data.filter(auditor => {
    if (!searchTerm) return true;
    
    // Search auditor name
    if (safeSearch(auditor.auditor, formattedSearchTerm)) return true;
    
    // Search numeric fields (convert numbers to strings for searching)
    const organizationCount = auditor.organizations?.length || 0;
    const totalClosed = auditor.organizations?.reduce((sum, org) => sum + org.closed, 0) || 0;
    const totalOpen = auditor.organizations?.reduce((sum, org) => sum + org.open, 0) || 0;
    const totalPendingClient = auditor.organizations?.reduce((sum, org) => sum + org.pendingClient, 0) || 0;
    const totalPendingAuditor = auditor.organizations?.reduce((sum, org) => sum + org.pendingAuditor, 0) || 0;
    
    if (safeSearch(organizationCount.toString(), formattedSearchTerm)) return true;
    if (safeSearch(totalClosed.toString(), formattedSearchTerm)) return true;
    if (safeSearch(totalOpen.toString(), formattedSearchTerm)) return true;
    if (safeSearch(totalPendingClient.toString(), formattedSearchTerm)) return true;
    if (safeSearch(totalPendingAuditor.toString(), formattedSearchTerm)) return true;
    
    // Search through organizations
    if (auditor.organizations) {
      return auditor.organizations.some(org => 
        safeSearch(org.organizationName, formattedSearchTerm) ||
        safeSearch(org.manager, formattedSearchTerm)
      );
    }
    
    return false;
  });
}, [data, searchTerm]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'auditor') comparison = a.auditor.localeCompare(b.auditor);
      else if (orderBy === 'organizationCount') {
        comparison = (a.organizations?.length || 0) - (b.organizations?.length || 0);
      }
      else if (orderBy === 'closed') {
        const aTotal = a.organizations?.reduce((sum, org) => sum + org.closed, 0) || 0;
        const bTotal = b.organizations?.reduce((sum, org) => sum + org.closed, 0) || 0;
        comparison = aTotal - bTotal;
      }
      else if (orderBy === 'open') {
        const aTotal = a.organizations?.reduce((sum, org) => sum + org.open, 0) || 0;
        const bTotal = b.organizations?.reduce((sum, org) => sum + org.open, 0) || 0;
        comparison = aTotal - bTotal;
      }
      else if (orderBy === 'pendingClient') {
        const aTotal = a.organizations?.reduce((sum, org) => sum + org.pendingClient, 0) || 0;
        const bTotal = b.organizations?.reduce((sum, org) => sum + org.pendingClient, 0) || 0;
        comparison = aTotal - bTotal;
      }
      else if (orderBy === 'pendingAuditor') {
        const aTotal = a.organizations?.reduce((sum, org) => sum + org.pendingAuditor, 0) || 0;
        const bTotal = b.organizations?.reduce((sum, org) => sum + org.pendingAuditor, 0) || 0;
        comparison = aTotal - bTotal;
      }
      return order === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, order, orderBy]);

  const visibleRows = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  

  const handleOrganizationCountClick = (auditor) => {
    navigate("/company", { 
      state: { 
        auditorId: auditor.id,
        auditorName: auditor.auditor
      } 
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Table header component
  function EnhancedTableHead({ order, orderBy, onRequestSort }) {
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead sx={{ 
        background: theme.palette.grey[100], 
        borderBottom: `1px solid ${theme.palette.divider}` 
      }}>
        <TableRow sx={{ height: '56px' }}>
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
            Audit Status
          </TabButton>
        </Box>
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
        {/* Search Section */}
        <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
          <Box display="flex" gap={2} alignItems="center">
            <OutlinedInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search.."
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
                  alignContent:'start'
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

        {/* Data Table */}
        <TableContainer sx={{ width: '100%', maxHeight: '350px', overflowY: 'auto' }}>
          <Table size="small">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleSort}
            />
            <TableBody>
              {visibleRows.map(auditor => {
                const totalClosed = auditor.organizations?.reduce((sum, org) => sum + org.closed, 0) || 0;
                const totalOpen = auditor.organizations?.reduce((sum, org) => sum + org.open, 0) || 0;
                const totalPendingClient = auditor.organizations?.reduce((sum, org) => sum + org.pendingClient, 0) || 0;
                const totalPendingAuditor = auditor.organizations?.reduce((sum, org) => sum + org.pendingAuditor, 0) || 0;
                const organizationCount = auditor.organizations?.length || 0;
                
                return (
                  <TableRow
                    hover
                    key={auditor.id}
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
                      {auditor.auditor}
                    </TableCell>
                    <TableCell align="center">
                     
  <Box
    onClick={() => handleOrganizationCountClick(auditor)}
    sx={{
      color: organizationCount > 0 ? 'primary.main' : 'text.disabled',
      cursor: organizationCount > 0 ? 'pointer' : 'default',
      fontSize: '12px',
      fontWeight: 600
    }}
  >
    {organizationCount}
  </Box>

                    </TableCell>
                    <TableCell align="left">
                      {auditor.organizations[0]?.manager || "N/A"}
                    </TableCell>
                    <TableCell align="center">
                     
                        <Box
                          
                        >
                          {totalClosed}
                        </Box>
                  
                    </TableCell>
                    <TableCell align="center">
                      
                        <Box
                          
                        >
                          {totalOpen}
                        </Box>
                      
                    </TableCell>
                    <TableCell align="center">
                     
                        <Box
                          
                        >
                          {totalPendingClient}
                        </Box>
                   
                    </TableCell>
                    <TableCell align="center">
                    
                        <Box
                          
                        >
                          {totalPendingAuditor}
                        </Box>
                  
                    </TableCell>
                  </TableRow>
                );
              })}
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
        <DialogTitle sx={{
          backgroundColor: '#fff',
          color: '#000',
          fontWeight: '600',
        }}>
          {dialogContent.title}
          <IconButton 
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme.palette.common.white,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ py: 2 }}>
          <List dense>
            {dialogContent.items.map((item, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemText primary={item} />
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
    </Box>
  );
};

export default AuditStatus;