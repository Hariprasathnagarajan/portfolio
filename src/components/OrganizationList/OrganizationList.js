import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import apiServices, { API_URL1 } from '../../ApiServices/ApiServices';import Checkbox from '@mui/material/Checkbox';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import Loader from "react-js-loader";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import RestoreIcon from '@mui/icons-material/Restore';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Dialog, DialogContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";// Adjust the import path as needed
import {
  Card, Table, Button, TableBody, Box, Breadcrumbs, Link, Typography, TableContainer,
  TablePagination, TableRow, TableCell, TableHead, Select, MenuItem,
  FormControl, InputLabel, TableSortLabel, Tooltip, OutlinedInput, InputAdornment,
  IconButton, Menu, ListItemIcon, ListItemText, useTheme, Popover, Toolbar
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const StatusIndicator = styled(Box)(({ status }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
  
  backgroundColor: status === 'Active' ? "#E8F5E9"  : 
                   status === 'Inactive' ? "#FFEBEE" : 
                   status === 'Deleted' ? '#9E9E9E' :
                   status === 'Pending Approval' ? '#FFE082' : '#9E9E9E',

                   color: status === 'Active' ? "#2E7D32" : 
                    status === 'Inactive' ? "#C62828" :
                    status === 'Deleted' ? '#424242' :
                    status === 'Pending Approval' ? '#FF6F00' : '#424242',
  height: '24px',
  minWidth: '80px',
}));


 const BulkActions = ({ 
  numSelected, 
  onBulkFreeze, 
  onBulkDelete, 
  onBulkResume,
  onBulkRestore,
  onBulkPermanentDelete, 
  onBulkApprove, 
  onBulkReject,   
  selectedItems, 
  allData, 
  theme, 
  selectedOption 
}) => { 
  const selectedOrgs = useMemo(() => 
    allData.filter(org => selectedItems.includes(org.id)), 
    [allData, selectedItems]
  );
  
  const isDeletedTab = selectedOption === 'deleted';
  const isPendingTab = selectedOption === 'pending'; 

  const canApprove = useMemo(() => 
    selectedOrgs.every(org => !org.is_msi && !org.is_delete && org.msa_doc),
    [selectedOrgs]
  );

  const canReject = useMemo(() => 
    selectedOrgs.every(org => !org.is_msi && !org.is_delete),
    [selectedOrgs]
  );
  
  const canFreeze = useMemo(() => 
    selectedOrgs.every(org => !org.is_frozen && !org.is_delete && org.is_msi),
    [selectedOrgs]
  );
  
  const canResume = useMemo(() => 
    selectedOrgs.every(org => org.is_frozen && !org.is_delete),
    [selectedOrgs]
  );
  
  const canDelete = useMemo(() => 
    selectedOrgs.every(org => !org.is_delete),
    [selectedOrgs]
  );

  const canRestore = useMemo(() => 
    selectedOrgs.every(org => org.is_delete),
    [selectedOrgs]
  );

  const canPermanentDelete = useMemo(() => 
    selectedOrgs.every(org => org.is_delete),
    [selectedOrgs]
  );

  if (numSelected === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        ml: 2,
        '& .MuiButton-root': {
          minWidth: '100px',
          width: '100px',
          justifyContent: 'center',
          fontSize: '12px',
          px: 1.5,
          py: 0.5,
        },
      }}
    >
      {/* <Typography variant="subtitle2" sx={{ mr: 1, fontSize: '12px' }}>
        {numSelected} selected
      </Typography> */}

      {/* Bulk Approve (only in Pending tab, and if all selected orgs have MSA doc) */}
      {isPendingTab && canApprove && (
        <Button
          variant="outlined"
          size="small"
          onClick={onBulkApprove}
          sx={{
            borderColor: theme.palette.success.main,
            color: theme.palette.success.main,
            '&:hover': {
              borderColor: theme.palette.success.dark,
              backgroundColor: theme.palette.success.light,
            },
          }}
          aria-label="Approve selected organizations"
        >
          Approve
        </Button>
      )}

      {/* Bulk Reject (only in Pending tab) */}
      {isPendingTab && canReject && (
        <Button
          variant="outlined"
          size="small"
          onClick={onBulkReject}
          sx={{
            borderColor: theme.palette.error.main,
            color: theme.palette.error.main,
            '&:hover': {
              borderColor: theme.palette.error.dark,
              backgroundColor: theme.palette.error.light,
            },
          }}
          aria-label="Reject selected organizations"
        >
          Reject
        </Button>
      )}

      {/* Bulk Freeze */}
      {canFreeze && !isDeletedTab && !isPendingTab && (
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
          aria-label="Freeze selected organizations"
        >
          Inactive
        </Button>
      )}

      {/* Bulk Resume */}
      {canResume && !isDeletedTab && !isPendingTab && (
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
          aria-label="Resume selected organizations"
        >
          activate
        </Button>
      )}

      {/* Bulk Restore (only in Deleted tab) */}
      {isDeletedTab && canRestore && selectedOrgs.every(org => org.is_delete) && (
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
          aria-label="Restore selected organizations"
        >
          Restore
        </Button>
      )}

      {/* Permanent Delete (only in Deleted tab) */}
      {isDeletedTab && canPermanentDelete && selectedOrgs.every(org => org.is_delete) && (
        <Button
          variant="outlined"
          size="small"
          onClick={onBulkPermanentDelete}
          sx={{
            borderColor: theme.palette.error.main,
            color: theme.palette.error.main,
            '&:hover': {
              borderColor: theme.palette.error.dark,
              backgroundColor: theme.palette.error.light,
            },
          }}
          aria-label="Permanently delete selected organizations"
        >
          Delete
        </Button>
      )}
      
      {/* Bulk Delete (only in Active/Inactive tabs) */}
      {canDelete && !isDeletedTab && !isPendingTab && (
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
          aria-label="Soft delete selected organizations"
        >
          Delete
        </Button>
      )}
    </Box>
  );
};

const UserTableHead = React.memo(({ order, orderBy, rowCount, onRequestSort, numSelected, filteredDataLength, onSelectAllClick }) => {
  

  const theme = useTheme();
  
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
      zIndex: 2, // keep header above table body
    }}
  >
    <TableRow>
      <TableCell
        padding="checkbox"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 3, // higher so checkbox stays clickable
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <Checkbox
          indeterminate={numSelected > 0 && numSelected < filteredDataLength}
          checked={filteredDataLength > 0 && numSelected === filteredDataLength}
          onChange={onSelectAllClick}
          inputProps={{ 'aria-label': 'select all organizations' }}
          sx={{
            color: theme.palette.grey[600],
            '&.Mui-checked': {
              color: theme.palette.primary.main,
            },
          }}
        />
      </TableCell>

      {headLabel.map((headCell) =>
        headCell.id === 'actions' ? (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sx={{
              fontWeight: '600',
              fontSize: '12px',
              padding: '12px 8px',
              whiteSpace: 'nowrap',
              width: headCell.width,
              color: theme.palette.text.primary,
              position: 'sticky',
              top: 0,
              zIndex: 2,
              backgroundColor: theme.palette.grey[100],
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
              fontSize: '12px',
              padding: '12px 8px',
              whiteSpace: 'nowrap',
              width: headCell.width,
              color: theme.palette.text.primary,
              position: 'sticky',
              top: 0,
              zIndex: 2,
              backgroundColor: theme.palette.grey[100],
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
              aria-label={`Sort by ${headCell.label}`}
              tabIndex={0}
              onKeyPress={(e) =>
                e.key === 'Enter' && createSortHandler(headCell.id)(e)
              }
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span style={{ display: 'none' }}>
                  {order === 'desc'
                    ? 'sorted descending'
                    : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        )
      )}
    </TableRow>
  </TableHead>
);

});

const headLabel = [
  { id: 'username', label: 'Username', align: 'left', width: '12%' },
  { id: 'org_name', label: 'Organization', align: 'left', width: '18%' },
  { id: 'msa_doc', label: 'MSA Doc', align: 'left', width: '15%' },
  { id: 'created_date', label: 'Created Date', align: 'left', width: '12%' },
  { id: 'manager', label: 'Manager', align: 'left', width: '15%' },
  { id: 'auditor', label: 'Auditor', align: 'left', width: '15%' },
  { id: 'status', label: 'Status', align: 'center', width: '8%' },
  { id: 'actions', label: 'Actions', align: 'center', width: '5%' },
];


const UserTableRow = React.memo(({ 
  row, 
  handleEdit, 
  handleDelete, 
  isSelected, 
  handleClick, 
  handleFreeze, 
  PermanentDelete,
  url, 
  handleApprove, 
  handleReject, 
  handleRestore,
  apiServices
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [managerName, setManagerName] = useState('...');
  const [auditorName, setAuditorName] = useState('...');
  const theme = useTheme();

  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenMsaDoc = async (docPath) => {
    const cleanedPath = docPath.replace(/^\/+/g, '').replace(/\/+/g, '/');
    const fullUrl = `${url.replace(/\/+$/, '')}/${cleanedPath}`;

  try {
    const response = await fetch(fullUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Now open the blob URL
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Failed to open blob PDF:', error);
  }
};


  const getStatusText = useMemo(() => {
    if (row.is_delete) return 'Deleted';
    if (row.is_msi === false) return 'Pending Approval';
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
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.grey[50],
        },
        '&:hover': {
          backgroundColor: theme.palette.grey[100],
        },
        '& td': {
          fontSize: '12px',
          padding: '8px',
          whiteSpace: 'nowrap',
        },
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={() => handleClick(row.id)}
          aria-label={`Select organization ${row.org_name}`}
        />
      </TableCell>

      <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', fontSize:'12px' }}>
        {row.username}
      </TableCell>
      
      <TableCell sx={{ padding: '8px', whiteSpace: 'nowrap', fontSize:'12px' }}>
        <Tooltip title={row.org_name} arrow>
          <span>{row.org_name.length > 20 ? `${row.org_name.substring(0, 20)}...` : row.org_name}</span>
        </Tooltip>
      </TableCell>
      
      <TableCell sx={{ 
        padding: '8px', 
        whiteSpace: 'nowrap',
        fontSize: '12px',
        maxWidth: '150px',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {row.msa_doc ? (
          <Tooltip title={row.msa_doc} arrow placement="top-start">
            <span>
              <span
                onClick={() => handleOpenMsaDoc(row.msa_doc)}
                style={{ 
                  color: theme.palette.primary.main, 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {row.msa_doc.split('/').pop()}
              </span>
            </span>
          </Tooltip>
        ) : "Null"}
      </TableCell>
      
    <TableCell align="center">
  {row.created_date ? dayjs(row.created_date).format("DD/MM/YYYY") : "N/A"}
</TableCell>
      
<TableCell>
  <Tooltip title={row.audit_manager_name || '-'} arrow>
    <span>{row.audit_manager_name || '-'}</span>
  </Tooltip>
</TableCell>

<TableCell>
  <Tooltip title={row.auditor_name || '-'} arrow>
    <span>{row.auditor_name || '-'}</span>
  </Tooltip>
</TableCell>
      
      <TableCell align="center">
        <StatusIndicator status={getStatusText}>
          {getStatusText}
        </StatusIndicator>
      </TableCell>
      
      <TableCell align="center">
        <IconButton
          aria-label={`More actions for ${row.org_name}`}
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
          PaperProps={{
            style: {
              width: 'auto',
              boxShadow: theme.shadows[3],
            },
          }}
          MenuListProps={{
            'aria-labelledby': `actions-button-${row.id}`,
          }}
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
          ) : !row.is_msi ? (
            <>
              {row.msa_doc ? (
                <MenuItem onClick={() => { handleApprove(row.id); handleMenuClose(); }}>
                  <ListItemIcon><IoIosCheckmarkCircle /></ListItemIcon>
                  <ListItemText>Approve</ListItemText>
                </MenuItem>
              ) : (
                <MenuItem disabled>
                  <ListItemIcon><IoIosCheckmarkCircle /></ListItemIcon>
                  <ListItemText>Approve</ListItemText>
                </MenuItem>
              )}
              <MenuItem onClick={() => { handleReject(row.id); handleMenuClose(); }}>
                <ListItemIcon><MdCancel /></ListItemIcon>
                <ListItemText>Reject</ListItemText>
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
                  <ListItemText>Active</ListItemText>
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
const OrganizationList = () => {
  const [allData, setAllData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('active');
  const isDeletedTab = currentTab === 'deleted';
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('created_date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const anchorRef = useRef(null);
  const tableContainerRef = useRef(null); 
  const [anchorEl, setAnchorEl] = useState(null);
  const url = API_URL1;
const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const selectedOption = useMemo(() => {
    if (id === 'user-active') return 'active';
    if (id === 'user-inactive') return 'inactive';
    if (id === 'user-deleted') return 'deleted';
    if (id === 'user-pending') return 'pending';
    return 'all';
  }, [id]);

 useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
  }, [page, rowsPerPage]);

const fetchAllOrganizations = useCallback(async () => {
  try {
    setIsLoading(true);
    const [orgsResponse, pendingResponse] = await Promise.all([
      apiServices.getOrganizations(),
      apiServices.pendingMsiOrganizations()
    ]);

    const orgMap = new Map();
    console.log("Fetched organizations:", orgsResponse, pendingResponse);

    orgsResponse.approved_organizations.forEach(org => {
      orgMap.set(org.id, {
        id: org.id,
        username: org.auth_user.username,
        org_name: org.company_name,
        msa_doc: org.contract_doc,
        created_date: org.created_at,
        is_frozen: org.is_frozen,
        is_delete: org.is_delete,
        is_msi: org.is_msi === true,
        auditor_name: org.auditor_name || '',
        audit_manager_name: org.audit_manager_name || ''
      });
    });

    pendingResponse.pending_organizations.forEach(org => {
      if (!orgMap.has(org.id)) {
        orgMap.set(org.id, {
          id: org.id,
          username: org.auth_user.username,
          org_name: org.company_name,
          msa_doc: org.contract_doc,
          created_date: org.created_at,
          is_frozen: false,
          is_delete: false,
          is_msi: false,
          auditor_name: '',
          audit_manager_name: ''
        });
      }
    });

    setAllData(Array.from(orgMap.values()));
  } catch (error) {
    console.error("Error fetching organizations:", error);
    setSnackbar({ open: true, message: 'Error fetching organizations', severity: 'error' });
  } finally {
    setIsLoading(false);
  }
}, []);

useEffect(() => {
  setPage(0);
  setSelected([]);
  fetchAllOrganizations();

  // Auto-refresh every 10 seconds (adjust as needed)
  const interval = setInterval(() => {
    fetchAllOrganizations();
  }, 10000);

  return () => clearInterval(interval); // cleanup on unmount
}, [id, fetchAllOrganizations]);

const filterOrganizations = useCallback((orgs) => {
  const searchTermLower = searchTerm.toLowerCase();

  return orgs.filter(org => {
    const statusText = org.is_delete
      ? 'deleted'
      : org.is_msi === false
      ? 'pending approval'
      : org.is_frozen
      ? 'inactive'
      : 'active';

    const matchesSearch =
      !searchTerm ||
      org.username?.toLowerCase().includes(searchTermLower) ||
      org.org_name?.toLowerCase().includes(searchTermLower) ||
      org.auditor_name?.toLowerCase().includes(searchTermLower) ||
      org.audit_manager_name?.toLowerCase().includes(searchTermLower) ||
      statusText.toLowerCase().includes(searchTermLower) ||
      (org.created_date && dayjs(org.created_date).format('DD/MM/YYYY').includes(searchTermLower));

    const statusMatch = {
      all: !org.is_delete && org.is_msi,
      active: !org.is_frozen && !org.is_delete && org.is_msi,
      inactive: org.is_frozen && !org.is_delete && org.is_msi,
      deleted: org.is_delete,
      pending: !org.is_msi && !org.is_delete
    };

    // ✅ New Date filter (like we used before)
    const matchesDate =
      !selectedDate ||
      (org.created_date &&
        dayjs(org.created_date).isSame(selectedDate, 'day'));

    return matchesSearch && statusMatch[selectedOption] && matchesDate;
  });
}, [searchTerm, selectedOption, selectedDate]);



  const sortData = useCallback((dataToSort, order, orderBy) => {
    return [...dataToSort].sort((a, b) => {
      let comparison = 0;
      if (orderBy === 'username') {
        comparison = a.username.localeCompare(b.username);
      } else if (orderBy === 'org_name') {
        comparison = a.org_name.localeCompare(b.org_name);
      } else if (orderBy === 'created_date') {
        comparison = new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
      } else if (orderBy === 'status') {
        comparison = (a.is_frozen === b.is_frozen) ? 0 : (a.is_frozen ? -1 : 1);
      } else if (orderBy === 'manager') {
        comparison = (a.audit_manager_name || '').localeCompare(b.audit_manager_name || '');
      } else if (orderBy === 'auditor') {
        comparison = (a.auditor_name || '').localeCompare(b.auditor_name || '');
      }
      return order === 'asc' ? comparison : -comparison;
    });
  }, []);

  const tableState = useMemo(() => {
    const filtered = filterOrganizations(allData);
    const sorted = sortData(filtered, order, orderBy);
    const visible = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    
    return {
      filteredData: filtered,
      sortedData: sorted,
      visibleRows: visible,
      totalCount: filtered.length
    };
  }, [allData, filterOrganizations, sortData, order, orderBy, page, rowsPerPage]);

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

  const handleSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = useCallback((id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const isSelected = useCallback((id) => selected.includes(id), [selected]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = tableState.filteredData.map((row) => row.id);
      setSelected(newSelected);
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
    if (date) {
      const formattedDate = dayjs(date).format('DD/MM/YYYY');
      setSearchTerm(formattedDate);
    } else {
      setSearchTerm('');
    }
    setPage(0);
    setSelected([]);
    setAnchorEl(null);
  };

  const handleEdit = (id) => navigate(`/CompanyUpdate/${id}`);
  const handleAddOrganization = () => navigate('/companycreation');

  const handleAction = async (action, id, confirmMsg, apiCall) => {
    if (!window.confirm(confirmMsg)) return;
    try {
      setIsLoading(true);
      await apiCall(id);
      fetchAllOrganizations();
      setSelected([]);
      setSnackbar({ open: true, message: `Organization ${action} successfully`, severity: 'success' });
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setSnackbar({ open: true, message: `Error performing ${action}`, severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const PermanentDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this organization?")) return;
    try {
      setIsLoading(true);
      await apiServices.permanentOrganizationdelete(id);
      fetchAllOrganizations();
      setSelected([]);
      setSnackbar({ open: true, message: 'Organization permanently deleted', severity: 'success' });
    } catch (error) {
      console.error("Error deleting organization:", error);
      setSnackbar({ open: true, message: 'Error deleting organization', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => handleAction('delete', id, "Are you sure you want to delete this organization?", apiServices.deleteOrganization);
  const handleRestore = (id) => handleAction('restore', id, "Are you sure you want to restore this organization?", apiServices.RestoreOrganizationdelete);
  const handleFreeze = (id, freeze) => handleAction(freeze ? 'freeze' : 'resume', id, `Are you sure you want to ${freeze ? 'freeze' : 'resume'} this organization?`, freeze ? apiServices.freezeOrganization : apiServices.resumeOrganization);
  const handleApprove = (id) => handleAction('approve', id, "Are you sure you want to approve this organization?", apiServices.approvemsiOrganization);
  const handleReject = (id) => handleAction('reject', id, "Are you sure you want to reject this organization?", apiServices.rejectmsiOrganization);

  const handleBulkAction = async (action, confirmMsg, apiCall) => {
    if (selected.length === 0) return;
    
    const selectedOrgs = allData.filter(org => selected.includes(org.id));
    const eligibleOrgs = selectedOrgs.filter(org => {
      const isDeletedView = selectedOption === 'deleted';
      const isPendingView = selectedOption === 'pending';
      
      switch (action) {
        case 'freeze':
          return !isDeletedView && !isPendingView && !org.is_frozen && !org.is_delete && org.is_msi;
        case 'resume':
          return !isDeletedView && !isPendingView && org.is_frozen && !org.is_delete;
        case 'delete':
          return !isDeletedView && !isPendingView && !org.is_delete;
        case 'restore':
          return isDeletedView && org.is_delete;
        case 'permanent_delete':
          return isDeletedView && org.is_delete;
        case 'approve':
          return isPendingView && !org.is_msi && !org.is_delete && org.msa_doc;
        case 'reject':
          return isPendingView && !org.is_msi && !org.is_delete;
        default:
          return true;
      }
    });

    if (eligibleOrgs.length === 0) {
      setSnackbar({ 
        open: true, 
        message: `No organizations are eligible for ${action}`, 
        severity: 'warning' 
      });
      return;
    }

    if (eligibleOrgs.length > 5) {
      const proceed = window.confirm(
        `You are about to ${action} ${eligibleOrgs.length} organizations.\n\n` +
        `First 5 organizations:\n${eligibleOrgs.slice(0, 5).map(o => o.org_name).join('\n')}\n\n` +
        `Are you sure you want to proceed?`
      );
      if (!proceed) return;
    } else {
      if (!window.confirm(`${confirmMsg} ${eligibleOrgs.length} organization(s)?`)) return;
    }

    try {
      setIsLoading(true);
      
      const apiCallToUse = (action === 'permanent_delete') ? apiServices.permanentOrganizationdelete : apiCall;
      
      const promises = eligibleOrgs.map(org => apiCallToUse(org.id));
      await Promise.all(promises);
      
      fetchAllOrganizations();
      setSelected([]);
      setSnackbar({ 
        open: true, 
        message: `Successfully ${action}d ${eligibleOrgs.length} organization(s)`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      setSnackbar({ 
        open: true, 
        message: `Error performing bulk ${action}`, 
        severity: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkFreeze = () => handleBulkAction('freeze', 'Are you sure you want to freeze', apiServices.freezeOrganization);
  const handleBulkResume = () => handleBulkAction('resume', 'Are you sure you want to resume', apiServices.resumeOrganization);
  const handleBulkDelete = () => handleBulkAction('delete', 'Are you sure you want to delete', apiServices.deleteOrganization);
  const handleBulkRestore = () => handleBulkAction('restore','Are you sure you want to restore',apiServices.RestoreOrganizationdelete);
  const handleBulkPermanentDelete = () => handleBulkAction('permanent_delete','Are you sure you want to permanently delete',apiServices.permanentOrganizationdelete);
  const handleBulkApprove = () => handleBulkAction('approve', 'Are you sure you want to approve', apiServices.approvemsiOrganization);
  const handleBulkReject = () => handleBulkAction('reject', 'Are you sure you want to reject', apiServices.rejectmsiOrganization);

  const optionLabelMap = {
    all: 'All Organizations',
    active: 'Active',
    inactive: 'Inactive',
    deleted: 'Deleted',
    pending: 'Pending Approval'
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
                onClick={() => navigate(`/OrganizationList/${value === 'all' ? '' : `user-${value}`}`)}
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
                aria-label={`View ${label}`}
              >
                {label}
              </Button>
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={handleAddOrganization}
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
            aria-label="Add new organization"
          >
            New Organization
          </Button>
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
            onBulkDelete={handleBulkDelete}
            onBulkResume={handleBulkResume}
            onBulkRestore={handleBulkRestore}
            onBulkPermanentDelete={handleBulkPermanentDelete}
            onBulkApprove={handleBulkApprove}
            onBulkReject={handleBulkReject}
            selectedItems={selected}
            allData={allData}
            theme={theme}
            selectedOption={selectedOption}
          />
        </Box>

        <TableContainer 
          sx={{ 
            width: '100%', 
            maxHeight: '350px', 
            overflowY: 'auto',
          }}
          ref={tableContainerRef}
        >
          <Table size="small" aria-label="Organizations table" stickyHeader>
            <UserTableHead 
              order={order}
              orderBy={orderBy}
              onRequestSort={handleSort}
              onSelectAllClick={handleSelectAllClick}
              numSelected={selected.length}
              filteredDataLength={tableState.filteredData.length}
            />
            <TableBody>
              {tableState.visibleRows.map(row => (
                <UserTableRow
                  key={row.id}
                  row={row}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  PermanentDelete={PermanentDelete}
                  isSelected={isSelected(row.id)}
                  handleClick={handleClick}
                  handleFreeze={handleFreeze}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                  handleRestore={handleRestore}
                  url={url}
                  apiServices={apiServices}
                />
              ))}
              {tableState.filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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
          count={tableState.filteredData.length}
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

export default OrganizationList;