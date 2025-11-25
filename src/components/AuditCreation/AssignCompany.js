import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Edit from '@mui/icons-material/Edit';
import { Autocomplete } from '@mui/material';
import {
  AppBar, Toolbar, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, TextField, OutlinedInput, InputAdornment, TablePagination, TableSortLabel, MenuItem,
  useTheme, Button, Card, Dialog, DialogTitle, DialogContent, DialogActions, Select,
  FormControl, InputLabel, Chip, Checkbox, ListItemText
} from "@mui/material";
import { Search as SearchIcon, Add, Close } from "@mui/icons-material";

const auditorsList = ["Ravi", "Kumar", "Raja", "Willson", "Suresh", "Mani"];
const allOrganizations = [
  "DHL", "AL FUTTAIM", "NINJAVAH LOGISTICS", "NAQUEL LOGISTICS", "MONSANADA LOGISTICS",
  "ABC Corporation", "XYZ Enterprises", "Global Solutions", "Tech Innovators", "Prime Services"
];

const defaultCompanies = [
  { 
    id: 1, 
    code: "AE-2347346576", 
    name: ["DHL", "AL FUTTAIM", "NINJAVAH LOGISTICS"], 
    type: "FreeZone", 
    auditor: "Raja", 
    companyMail: "dhl@company.com", 
    mobileNumber: "+971 50 123 4567" 
  },
  { 
    id: 2, 
    code: "AE-7634567567", 
    name: ["AL FUTTAIM"], 
    type: "Mainland", 
    auditor: "Kumar", 
    companyMail: "alfuttaim@company.com", 
    mobileNumber: "+971 52 234 5678" 
  },
  { 
    id: 3, 
    code: "AE-7457346573", 
    name: ["NINJAVAH LOGISTICS", "NAQUEL LOGISTICS"], 
    type: "Broker", 
    auditor: "Suresh", 
    companyMail: "ninjavah@company.com", 
    mobileNumber: "+971 53 345 6789" 
  },
  { 
    id: 4, 
    code: "AE-7846374657", 
    name: ["NAQUEL LOGISTICS"], 
    type: "Warehouse", 
    auditor: "Willson", 
    companyMail: "naquel@company.com", 
    mobileNumber: "+971 54 456 7890" 
  },
  { 
    id: 5, 
    code: "AE-3847567845", 
    name: ["MONSANADA LOGISTICS"], 
    type: "Mainland", 
    auditor: "James", 
    companyMail: "monsanada@company.com", 
    mobileNumber: "+971 55 567 8901" 
  },
];

const StatusChip = ({ type }) => {
  const colorMap = {
    FreeZone: { bg: "#F0F7FF", text: "#1976D2" },
    Mainland: { bg: "#E8F5E9", text: "#2E7D32" },
    Broker: { bg: "#FFF8E1", text: "#FF8F00" },
    Warehouse: { bg: "#F3E5F5", text: "#7B1FA2" }
  };

  return (
    <Chip
      label={type}
      size="small"
      sx={{
        backgroundColor: colorMap[type]?.bg || '#f5f5f5',
        color: colorMap[type]?.text || '#212121',
        fontWeight: 500,
        minWidth: 80,
        height: 24,
        fontSize: '0.75rem',
        justifyContent: 'center'
      }}
    />
  );
};

const headCells = [
  { id: "code", label: "Organization Code", align: "left", width: "20%" },
  { id: "auditor", label: "Auditor", align: "left", width: "15%" },
  { id: "companyMail", label: "Organization Mail", align: "left", width: "20%" },
  { id: "mobileNumber", label: "Mobile Number", align: "left", width: "15%" },
  { id: "type", label: "Organization Type", align: "left", width: "15%" },
  { id: "name", label: "Organization Name", align: "left", width: "15%" },
];

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
  const theme = useTheme();

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{ background: theme.palette.grey[100], borderBottom: `1px solid ${theme.palette.divider}` }}>
      <TableRow>
        {headCells.map((headCell) => (
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
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              sx={{
                "&:hover": { color: theme.palette.primary.main },
                "&.Mui-active": { color: theme.palette.primary.main },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "12px" }}>
                {headCell.label}
              </Typography>
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const OrganizationNameDisplay = ({ names, onEdit, companyId }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectedNames, setSelectedNames] = useState(names);
  const [inputValue, setInputValue] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Group names and count occurrences
  const groupedNames = names.reduce((acc, name) => {
    const baseName = name.split(' +')[0]; // Remove any existing counts
    if (!acc[baseName]) {
      acc[baseName] = 0;
    }
    acc[baseName]++;
    return acc;
  }, {});

  // Format names with counts (e.g., "Name +1")
  const formattedNames = Object.entries(groupedNames).map(([name, count]) => {
    return count > 1 ? `${name} +${count - 1}` : name;
  });

  const handleClickOpen = () => {
    setSelectedNames(names);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    onEdit(companyId, selectedNames);
    handleClose();
  };

  const handleChange = (event, newValue) => {
    setSelectedNames(newValue);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        alignItems: 'center'
      }}>
        {showAll || formattedNames.length === 1 ? (
          formattedNames.map((name) => (
            <Chip
              key={name}
              label={name}
              size="small"
              sx={{
                fontSize: '12px',
                height: '24px',
                backgroundColor: theme.palette.grey[100],
                color: theme.palette.text.primary,
              }}
            />
          ))
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              key={formattedNames[0]}
              label={formattedNames[0]}
              size="small"
              sx={{
                fontSize: '12px',
                height: '24px',
                backgroundColor: theme.palette.grey[100],
                color: theme.palette.text.primary,
              }}
            />
            <Box
              sx={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 0.5,
                cursor: 'pointer'
              }}
              onClick={() => setShowAll(true)}
            >
              <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                +{formattedNames.length - 1}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      <IconButton 
        size="small" 
        onClick={handleClickOpen} 
        sx={{ 
          padding: '2px',
          marginLeft: '4px',
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          }
        }}
      >
        <Edit fontSize="small" />
      </IconButton>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Organization Name(s)</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Autocomplete
            multiple
            id="organization-names-autocomplete"
            options={allOrganizations}
            value={selectedNames}
            onChange={handleChange}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            disableCloseOnSelect
            filterSelectedOptions
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  deleteIcon={<Close fontSize="small" />}
                  sx={{
                    fontSize: '12px',
                    height: '24px',
                    backgroundColor: theme.palette.grey[100],
                    color: theme.palette.text.primary,
                    margin: '4px',
                    '& .MuiChip-deleteIcon': {
                      fontSize: '16px',
                      color: theme.palette.grey[500],
                      '&:hover': {
                        color: theme.palette.error.main
                      }
                    }
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search and select organizations"
                placeholder="Type to search..."
                sx={{ 
                  fontSize: '12px',
                  '& .MuiOutlinedInput-root': {
                    padding: '8px',
                  }
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Typography sx={{ fontSize: '12px' }}>{option}</Typography>
              </li>
            )}
            sx={{
              mt: 1,
              '& .MuiAutocomplete-inputRoot': {
                padding: '8px',
              },
              '& .MuiOutlinedInput-root': {
                fontSize: '12px',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClose} 
            color="secondary"
            sx={{ fontSize: '12px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={selectedNames.length === 0}
            sx={{ fontSize: '12px', textTransform: 'none' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function AssignCompanyToAuditor() {
  const [companies, setCompanies] = useState(defaultCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganizationType, setSelectedOrganizationType] = useState('');
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("auditor");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const navigate = useNavigate();

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedOrganizationType('');
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPage(0);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearchTerm =
      !searchTerm ||
      company.code.toLowerCase().includes(searchTerm) ||
      company.name.join(", ").toLowerCase().includes(searchTerm) ||
      company.companyMail.toLowerCase().includes(searchTerm) ||
      company.mobileNumber.toLowerCase().includes(searchTerm) ||
      company.type.toLowerCase().includes(searchTerm) ||
      company.auditor.toLowerCase().includes(searchTerm);

    const matchesOrganizationType =
      !selectedOrganizationType || company.type === selectedOrganizationType;

    return matchesSearchTerm && matchesOrganizationType;
  });

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleUpdateOrganizationNames = (companyId, newNames) => {
    setCompanies(prev =>
      prev.map(c =>
        c.id === companyId
          ? { ...c, name: newNames }
          : c
      )
    );
  };

  const sortedCompanies = filteredCompanies.sort((a, b) => {
    const valA = a[orderBy]?.toLowerCase?.() || "";
    const valB = b[orderBy]?.toLowerCase?.() || "";
    return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const visibleRows = sortedCompanies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ padding: "20px", position: "absolute", top: "75px", width: "100%", pr: 3, boxSizing: "border-box" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          marginTop: "0px",
          padding: "10px 24px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          backgroundColor: "#fafafa",
          my: 2,
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Button
              onClick={() => { }}
              disableRipple
              sx={{
                fontSize: "12px",
                textTransform: "none",
                color: "#5C4DFF",
                fontWeight: "600",
                borderRadius: 0,
                padding: "4px 0",
                minWidth: "auto",
                borderBottom: "2px solid #5C4DFF",
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#5C4DFF",
                  borderBottom: "2px solid #5C4DFF",
                },
              }}
            >
              Assign Organization to Auditor
            </Button>
          </Box>
        </Box>
      </Box>

      <Card
        sx={{
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
          padding: "10px",
          borderRadius: "8px",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <OutlinedInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search"
              sx={{
                width: 120,
                height: '35px',
                fontSize: "12px",
                '& .MuiOutlinedInput-input': {
                  padding: '8px 12px',
                },
                backgroundColor: theme.palette.common.white,
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
            
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ fontSize: '12px', zIndex: 0, backgroundColor: '#fff' }}>Organization Type</InputLabel>
              <Select
                value={selectedOrganizationType}
                onChange={(e) => setSelectedOrganizationType(e.target.value)}
                label="Organization Type"
                sx={{ fontSize: '12px' }}
              >
                <MenuItem value="" sx={{ fontSize: '12px' }}>All Types</MenuItem>
                <MenuItem value="Mainland" sx={{ fontSize: '12px' }}>Mainland</MenuItem>
                <MenuItem value="FreeZone" sx={{ fontSize: '12px' }}>FreeZone</MenuItem>
                <MenuItem value="Broker" sx={{ fontSize: '12px' }}>Broker</MenuItem>
                <MenuItem value="Warehouse" sx={{ fontSize: '12px' }}>Warehouse</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              onClick={resetFilters}
              startIcon={<RestartAltIcon />}
              disabled={!searchTerm && !selectedOrganizationType}
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
            >
              Reset
            </Button>
          </Box>
        </Box>

        <TableContainer sx={{ width: "100%", maxHeight: "400px", overflowY: "auto" }}>
          <Table size="small">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows.map((company) => (
                <TableRow key={company.id} hover sx={{
                  '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
                  '&:hover': { backgroundColor: theme.palette.grey[100] },
                }}>
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <Typography sx={{ fontSize: '12px' }}>
                      {company.code}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <Typography sx={{ fontSize: '12px' }}>
                      {company.auditor}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <Typography sx={{ fontSize: '12px' }}>
                      {company.companyMail}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <Typography sx={{ fontSize: '12px' }}>
                      {company.mobileNumber}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <StatusChip type={company.type} />
                  </TableCell>
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <OrganizationNameDisplay 
                      names={company.name} 
                      onEdit={(newNames) => handleUpdateOrganizationNames(company.id, newNames)}
                      companyId={company.id}
                    />
                  </TableCell>
                </TableRow>
              ))}

              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ fontSize: "12px", py: 4 }}>
     
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCompanies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Rows per page:"
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            background: theme.palette.common.white,
            fontSize: "12px",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "12px" },
          }}
        />
      </Card>
    </Box>
  );
}