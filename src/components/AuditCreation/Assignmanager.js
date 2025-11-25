import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Autocomplete } from '@mui/material';
import {
  AppBar, Toolbar, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, TextField, OutlinedInput, InputAdornment, TablePagination, TableSortLabel, MenuItem,
  useTheme, Checkbox, Button, Card, Dialog, DialogTitle, DialogContent, DialogActions, Select,
  FormControl, InputLabel, Menu,
} from "@mui/material";
import { Home, ArrowBack, Search as SearchIcon, Edit, MoreVert, Add } from "@mui/icons-material";

const auditorsList = ["Raja & Kumar", "Kumar", "Raja", "Suresh", "Mani"];
const managersList = ["John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson"];
const defaultCompanies = [
  { id: 1, auditor: "Aarav Mehta", manager: "John Smith", auditType: "Mainland", email: "aarav.mehta@gmail.com", mobileNumber: "+971 50 123 4567" },
  { id: 2, auditor: "Diya Sharma", manager: "Sarah Johnson", auditType: "Warehouse", email: "diya.sharma@gmail.com", mobileNumber: "+971 52 234 5678" },
  { id: 3, auditor: "Rohan Iyer", manager: "Michael Brown", auditType: "Warehouse", email: "rohan.iyer@gmail.com", mobileNumber: "+971 53 345 6789" },
  { id: 4, auditor: "Sneha Reddy", manager: "Emily Davis", auditType: "Mainland", email: "sneha.reddy@gmail.com", mobileNumber: "+971 54 456 7890" },
  { id: 5, auditor: "Karthik Nair", manager: "David Wilson", auditType: "Broker", email: "karthik.nair@auditfirm.com", mobileNumber: "+971 55 567 8901" },
  { id: 6, auditor: "Anita Desai", manager: "John Doe", auditType: "FreeZone", email: "anita.desai@gmail.com", mobileNumber: "+971 56 678 9012" },
  { id: 7, auditor: "Vikram Singh", manager: "Jane Smith", auditType: "Mainland", email: "vikram.singh@gmail.com", mobileNumber: "+971 57 789 0123" },
  { id: 8, auditor: "Priya Sharma", manager: "Robert Brown", auditType: "Warehouse", email: "priya.sharma@gmail.com", mobileNumber: "+971 58 890 1234" },
  { id: 9, auditor: "Rahul Gupta", manager: "Emily Johnson", auditType: "Broker", email: "rahul.gupta@gmail.com", mobileNumber: "+971 59 901 2345" },
  { id: 10, auditor: "Neha Verma", manager: "Michael Wilson", auditType: "FreeZone", email: "neha.verma@gmail.com", mobileNumber: "+971 50 012 3456" },
];

const AuditTypeChip = ({ type }) => {
  const colorMap = {
    Mainland: { bg: "#E8F5E9", text: "#2E7D32" },
    FreeZone: { bg: "#E3F2FD", text: "#1565C0" },
    Broker: { bg: "#FFF3E0", text: "#EF6C00" },
    Warehouse: { bg: "#F3E5F5", text: "#6A1B9A" },
  };

  const styles = colorMap[type] || { bg: "#f5f5f5", text: "#424242" };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 1.5,
        py: 0.5,
        borderRadius: "16px",
        fontSize: "11px",
        fontWeight: 500,
        color: styles.text,
        backgroundColor: styles.bg,
        textTransform: "capitalize",
        minWidth: "80px",
        textAlign: "center",
      }}
    >
      {type}
    </Box>
  );
};

const headCells = [
  { id: "auditor", label: "Auditor", align: "left", width: "20%" },
  { id: "email", label: "Auditor Email", align: "left", width: "20%" },
  { id: "mobileNumber", label: "Mobile Number", align: "left", width: "15%" },
  { id: "auditorCount", label: "Organization Count", align: "center", width: "15%" },
  { id: "auditType", label: "Organization Type", align: "left", width: "15%" },
  { id: "manager", label: "Manager", align: "left", width: "15%" },
  { id: "action", label: "Action", align: "center", width: "10%" },
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
            {headCell.id !== "action" ? (
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
            ) : (
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "12px" }}>
                {headCell.label}
              </Typography>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const ManagerDisplay = ({ managers }) => {
  if (!managers) return null;
  const managerList = managers.split(", ").filter(Boolean);
  if (managerList.length === 0) return null;

  return (
    <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
      {managerList.join(", ")}
    </Typography>
  );
};

const EditableAuditorDisplay = ({ auditors, onEdit }) => {
  if (!auditors) return null;
  const auditorList = auditors.split(", ").filter(Boolean);
  if (auditorList.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: "12px" }}>
        {auditorList.join(", ")}
      </Typography>
    </Box>
  );
};

export default function AssignManager() {
  const [companies, setCompanies] = useState(
    defaultCompanies.map((c) => ({
      ...c,
      updatedDate: c.updatedDate || new Date().toISOString().split("T")[0],
    }))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuditType, setSelectedAuditType] = useState('');
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("auditor");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedAuditor, setSelectedAuditor] = useState([]);
  const theme = useTheme();
  const navigate = useNavigate();

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedAuditType('');
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPage(0);
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearchTerm =
      !searchTerm ||
      company.auditor.toLowerCase().includes(searchTerm) ||
      company.email.toLowerCase().includes(searchTerm) ||
      company.mobileNumber.toLowerCase().includes(searchTerm) ||
      company.auditType.toLowerCase().includes(searchTerm) ||
      company.manager.toLowerCase().includes(searchTerm);

    const matchesAuditType =
      !selectedAuditType || company.auditType === selectedAuditType;

    return matchesSearchTerm && matchesAuditType;
  });

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleAddAuditor = (company) => {
    setSelectedRow(company);
    setSelectedAuditor(company.auditor.split(", ").filter(Boolean));
  };

  const handleSaveAuditor = () => {
    if (selectedRow && selectedAuditor.length > 0) {
      setCompanies(prev =>
        prev.map(c => 
          c.id === selectedRow.id 
            ? { ...c, auditor: selectedAuditor.join(", ") } 
            : c
        )
      );
    }
    setSelectedRow(null);
    setSelectedAuditor([]);
  };

  const sortedCompanies = filteredCompanies.sort((a, b) => {
    const valA = a[orderBy]?.toLowerCase?.() || "";
    const valB = b[orderBy]?.toLowerCase?.() || "";
    return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const visibleRows = sortedCompanies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const auditorCountMap = companies.reduce((acc, company) => {
    acc[company.auditor] = (acc[company.auditor] || 0) + 1;
    return acc;
  }, {});

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
              Assign-Auditor-to-Manager
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
              aria-label="Search users"
            />
            
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ fontSize: '12px', zIndex: 0, backgroundColor: '#fff' }}>Organization Type</InputLabel>
              <Select
                value={selectedAuditType}
                onChange={(e) => setSelectedAuditType(e.target.value)}
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
              disabled={!searchTerm && !selectedAuditType}
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
              aria-label="Reset all filters"
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
                  {/* Auditor column */}
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <EditableAuditorDisplay 
                      auditors={company.auditor} 
                    />
                  </TableCell>

                  {/* Auditor Email column */}
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <Typography sx={{ fontSize: '12px' }}>
                      {company.email}
                    </Typography>
                  </TableCell>

                  {/* Mobile Number column */}
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <Typography sx={{ fontSize: '12px' }}>
                      {company.mobileNumber}
                    </Typography>
                  </TableCell>

                  {/* Organization Count column */}
                  <TableCell sx={{ padding: '1px 30px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '12px' }}>
                        {auditorCountMap[company.auditor] || 0}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Organization Type column */}
                  <TableCell sx={{ padding: '12px 24px' }}>
                    <AuditTypeChip type={company.auditType} />
                  </TableCell>

                  {/* Manager column */}
                  <TableCell sx={{ paddingLeft: '24px' }}>
                    <ManagerDisplay managers={company.manager} />
                  </TableCell>

                  {/* Action column */}
                  <TableCell align="center" sx={{ padding: '12px 24px' }}>
                    <IconButton size="small" onClick={() => handleAddAuditor(company)} sx={{ padding: '4px' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filteredCompanies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ fontSize: "12px", py: 4 }}>
          
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

      {/* Auditor Edit Dialog */}
      <Dialog open={Boolean(selectedRow)} onClose={() => setSelectedRow(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Auditor</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={auditorsList}
            value={selectedAuditor}
            onChange={(event, newValue) => setSelectedAuditor(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Auditors"
                placeholder="Select Auditors"
                margin="normal"
              />
            )}
            fullWidth
            disableCloseOnSelect
            getOptionLabel={(option) => option}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRow(null)} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAuditor} 
            variant="contained" 
            color="primary"
            disabled={selectedAuditor.length === 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}