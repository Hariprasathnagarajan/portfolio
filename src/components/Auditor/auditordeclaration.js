
import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import DoubleChatIcon from './DoubleChatIcon';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import apiServices from '../../ApiServices/ApiServices';
import axios from 'axios';
import { API_URL } from '../../ApiServices/ApiServices'; // Adjust the import path as needed
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Add this import

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";// Adjust the import path as needed


import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Typography,
  Table,
  Card,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Paper,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Button,
  TableSortLabel,
  useTheme,
  TablePagination,
  InputAdornment,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge, OutlinedInput
} from "@mui/material";
import ChatBox from "../ChatBox";

// Removed the static `data` array here

const statusOptions = ["All", "Closed", "Pending with Client", "Pending with Auditor", "Open"];
const allStatusOptions = ["All", "Closed", "Pending with Client", "Pending with Auditor", "Open"];
const headCells = [
  { id: "declarationNum", label: "Declaration Number", align: "left", width: "12%" },
  { id: "declarationDate", label: "Declaration Date", align: "left", width: "9%" },
  { id: "issueCount", label: "Issue Count", align: "left", width: "7%" },
  { id: "auditorFinding", label: "Auditor Findings", align: "left", width: "10%" },
  { id: "auditorRemark", label: "Auditor Remarks", align: "left", width: "10%" },
  { id: "clientResponse", label: "Client Response", align: "left", width: "10%" },
  { id: "clientRemarks", label: "Client Remarks", align: "left", width: "10%" },
  { id: "status", label: "Status", align: "right", width: "7%" },
  { id: "actions", label: "Chat", align: "center", width: "9%" },
];

function EnhancedTableHead({ order, orderBy, onRequestSort, headCells }) {
  const theme = useTheme();
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{ background: theme.palette.grey[100], borderBottom: `1px solid ${theme.palette.divider}` }}>
      <TableRow >
        {headCells.map((headCell) => (
          <TableCell
  key={headCell.id}
  align={headCell.align}
  sx={{
    fontWeight: "600",
    fontSize: "12px",
    padding: "12px 16px",
    whiteSpace: "nowrap",
    width: headCell.width, // Use the width from headCells
    minWidth: headCell.width, // Ensure minimum width
    color: theme.palette.text.primary,
    background: theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.divider}`,
    "& .MuiTableSortLabel-root": {
      color: theme.palette.text.primary,
      "&:hover": { color: theme.palette.primary.main },
      "&.Mui-active": { color: theme.palette.primary.main },
    },
  }}
>
            {headCell.id !== "actions" ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
const findingsOptions = [
  "Importing /Exporting restricted goods",
  "Importing /Exporting prohibited items",
  "No proof of export against FZ Transit OUT",
  "Export period forfeited",
  "Export overdated",
  "Discrepancy in goods info between Export & import",
  "Export value is higher than import value",
  "Exporter name is different than importer",
  "Goods exported from FZ by different company",
  "Duplication of export",
  "Wrong exemption",
  "Wrong duty rate",
  "Exemption approval not attached",
  "Wrong Incoterm(FCA,FOB,EXW,CFR,CIF)",
  "Wrong CIF value",
  "Wrong FOB value",
  "Wrong Insurance",
  "Wrong Freight",
  "Antidumping charges",
  "Trading in goods not under license activity",
  "Finished goods duty payable",
  "Exemption not qualified",
  "Wrong packages",
  "Wrong package type",
  "Wrong weight",
  "Wrong quantity",
  "Wrong Description",
  "Wrong COG",
  "No BOL or BOL not stamped",
  "No COG certificate",
  "No Original Invoice",
  "No remarks for omitted invoice",
  "Fake Invoice",
  "Undervalue of goods-Big diff",
  "Declared value too highcompared to invoice",
  "Unacceptable discount",
  "Wrong Hscode (0% to 1%)",
  "Wrong Hscode (0% to 50%)",
  "Wrong Hscode (5% to 50%)",
  "HSCode Tobacco (0% to 100%)",
  "HSCode Tobacco (5% to 100%)",
  "Wrong Hscode (5% to 5%)",
  "Wrong Hscode (1% to 5%)",
  "Wrong Hscode (0% to 0%)",
  "Wrong value-small diff",
  "CIF value different in BOL/AWB",
  "Others"
];


const FindingsDialog = ({ open, onClose, onSave, initialFindings, onSaveAndNext }) => {
  const [selectedFindings, setSelectedFindings] = useState(initialFindings || []);
  const [searchTerm, setSearchTerm] = useState('');

  const theme = useTheme();

  React.useEffect(() => {
    setSelectedFindings(initialFindings || []);
  }, [initialFindings, open]);

const handleSave = () => {
  const findingsToSave = selectedFindings.includes("No Issues")
    ? ["No Issues"]
    : selectedFindings;

  // Save findings first
  onSave(findingsToSave);

  // 👉 Instead of closing, trigger remarks dialog
  if (onSaveAndNext) {
    onSaveAndNext(findingsToSave);
  } else {
    onClose();
  }
};


  const handleReset = () => {
    setSelectedFindings([]); // Reset selections
  };

 const filteredFindings = findingsOptions
  .filter(finding =>
    finding.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => {
    const aSelected = selectedFindings.includes(a);
    const bSelected = selectedFindings.includes(b);
    if (aSelected && !bSelected) return -1; // selected first
    if (!aSelected && bSelected) return 1;
    return 0;
  });


  const handleToggleFinding = (finding) => {
    if (finding === "No Issues") {
      // If "No Issues" is selected, clear all other selections
      setSelectedFindings(["No Issues"]);
    } else {
      // If any other finding is selected, toggle it
      setSelectedFindings((prev) => {
        if (prev.includes(finding)) {
          return prev.filter((f) => f !== finding);
        } else {
          // If "No Issues" is selected, remove it
          return prev.filter((f) => f !== "No Issues").concat(finding);
        }
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontWeight: 600,
        fontSize: '1.1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2,
        px: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EditIcon sx={{ color: theme.palette.common.white }} />
          <span>Auditor Findings</span>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.palette.common.white,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
     
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Search Bar */}
        <Box sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.grey[50]
        }}>
          <OutlinedInput
            fullWidth
            placeholder="Search findings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            }
            sx={{
              backgroundColor: theme.palette.common.white,
              borderRadius: '8px',
              '& .MuiOutlinedInput-input': {
                py: 1,
                fontSize: '0.875rem'
              }
            }}
          />
        </Box>

        {/* Selected Count */}
        <Box sx={{
          px: 2,
          py: 1,
          backgroundColor: theme.palette.grey[100],
          borderBottom: `1px solid ${theme.palette.divider}`

        }}>
          <Typography variant="subtitle2" sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: theme.palette.text.secondary
          }}>
            Selected: <span style={{ color: theme.palette.primary.main }}>
              {selectedFindings.includes("No Issues") ? 0 : selectedFindings.length} of {findingsOptions.length}
            </span>
          </Typography>
        </Box>

        {/* Findings List */}
        <Box sx={{
          maxHeight: '400px',
          overflowY: 'auto',
          p: 1
        }}>
          <List dense sx={{ p: 0 }}>
            <ListItem
              button
              onClick={() => handleToggleFinding("No Issues")}
              sx={{
                borderRadius: '6px',
                mb: 0.5,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <Checkbox
                edge="start"
                checked={selectedFindings.includes("No Issues")}
                tabIndex={-1}
                disableRipple
                sx={{
                  color: theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
              <ListItemText
                primary="No Issues"
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: {
                    fontWeight: selectedFindings.includes("No Issues") ? 600 : 400,
                    color: selectedFindings.includes("No Issues") ?
                      theme.palette.primary.dark : theme.palette.text.primary
                  }
                }}
              />
            </ListItem>
            {filteredFindings.map((finding) => (
              <ListItem
                key={finding}
                button
                onClick={() => handleToggleFinding(finding)}
                sx={{
                  borderRadius: '6px',
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <Checkbox
                  edge="start"
                  checked={selectedFindings.includes(finding)}
                  tabIndex={-1}
                  disableRipple
                  sx={{
                    color: theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
                <ListItemText
                  primary={finding}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: {
                      fontWeight: selectedFindings.includes(finding) ? 600 : 400,
                      color: selectedFindings.includes(finding) ?
                        theme.palette.primary.dark : theme.palette.text.primary
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>

      <DialogActions sx={{
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        justifyContent: 'space-between'
      }}>
        <Button
          onClick={handleReset} // Reset button functionality
          variant="outlined"
          sx={{
            borderRadius: '6px',
            textTransform: 'none',
            px: 3,
            fontWeight: 500
          }}
        >
          Reset Selection
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '6px',
            textTransform: 'none',
            px: 3,
            fontWeight: 500
          }}
        >
          Cancel
        </Button>

<Button
  onClick={handleSave}
  variant="contained"
  disabled={selectedFindings.length === 0} // Add this disabled prop
  sx={{
    borderRadius: '6px',
    textTransform: 'none',
    px: 3,
    fontWeight: 500,
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none'
    },
    // Add styles for disabled state
    '&:disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled
    }
  }}
>
  Save Findings ({selectedFindings.includes("No Issues") ? 0 : selectedFindings.length})
</Button>
      </DialogActions>
    </Dialog>
  );
};



const RemarksDialog = ({ open, onClose, onSave, currentRemark }) => {
  const [remark, setRemark] = useState(currentRemark || '');
  const theme = useTheme();
  const [selectedFindings, setSelectedFindings] = useState([]);
  
  useEffect(() => {
    setRemark(currentRemark);
  }, [currentRemark, open]);

  const handleSave = () => {
    // Don't save if current remark is "NA" and new remark is empty
    if (currentRemark === " " && remark.trim() === "") {
        onClose();
        return;
    }
    onSave(remark);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: theme.shadows[10],
        }
      }}
    >
      <DialogTitle sx={{
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontWeight: 600,
        fontSize: '1.1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2,
        px: 3,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EditIcon sx={{ color: theme.palette.common.white }} />
          <span>Enter Auditor Remarks</span>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.palette.common.white,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

<DialogContent sx={{ p: 3 }}>
  <TextField
    autoFocus
    margin="dense"
    fullWidth
    multiline
    rows={5}
    value={remark}   // ✅ this shows existing remark if available
    onChange={(e) => setRemark(e.target.value)}
    variant="outlined"
    label="Auditor Remarks"
    InputLabelProps={{ shrink: true }}
    sx={{
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '& fieldset': {
          borderColor: theme.palette.divider,
        },
        '&:hover fieldset': {
          borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
        },
      },
    }}
  />
</DialogContent>


      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '6px',
            textTransform: 'none',
            px: 3,
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
 <Button
          onClick={handleSave}
          disabled={!remark.trim()} // This line disables the button when the remark is empty
          variant="contained"
          sx={{
            borderRadius: '6px',
            textTransform: 'none',
            px: 3,
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
            '&.Mui-disabled': { // Add styling for the disabled state
              backgroundColor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            }
          }}
        >
          Save Remark
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function AuditorDeclaration() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
const [editingStatus, setEditingStatus] = useState(false);
const [editingStatusRow, setEditingStatusRow] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState(null);
const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [clickedDeclarations, setClickedDeclarations] = useState([]);
  const handleDeclarationNumClick = (row) => {
    const updatedData = tableData.map(item =>
      item.id === row.id ? { ...item, status: "Pending with Auditor" } : item
    );
    setTableData(updatedData);

    if (!clickedDeclarations.includes(row.id)) {
      setClickedDeclarations([...clickedDeclarations, row.id]);
    }
  };
const handleClearSearch = () => {
  setSearchTerm('');
  setSelectedDate(null);
  setPage(0);
  // setSelected([]); // If you have a selection state, otherwise remove this line
};
  const { organization, username, statusFilter: initialStatusFilter } = location.state || {};
  const [findingsDialogOpen, setFindingsDialogOpen] = useState(false);
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [year, setYear] = useState(2025);
  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || "All");
  const [selectedDate, setSelectedDate] = useState(null);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("declarationNum");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatRow, setActiveChatRow] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [messages, setMessages] = useState({});
  
  const { orgId, auditorName } = location.state || {};
  console.log("Org ID:", orgId);
console.log("📦 Fetching declarations with org ID:", orgId);

const handleCloseFinding = async (rowId, newStatus) => {
  try {
    const response = await apiServices.findingClose({
      declaration_id: rowId,
      status: newStatus   // 👈 send status too
    });
    console.log("Finding updated successfully!", response.data);
    fetchDeclarations();
  } catch (error) {
    console.error(error.response?.data?.error || "Error updating finding");
  }
};

  // Add useEffect to listen for status change events
  useEffect(() => {
    const handleStatusChange = (event) => {
      const { declarationId, newStatus, declarationNum } = event.detail;
      
      console.log('Status change received:', { declarationId, newStatus, declarationNum });
      
      // Update the table data immediately
      setTableData(prevData => 
        prevData.map(item => 
          item.id === declarationId 
            ? { ...item, status: newStatus }
            : item
        )
      );
    };

    // Listen for status change events
    window.addEventListener('statusChanged', handleStatusChange);

    // Cleanup
    return () => {
      window.removeEventListener('statusChanged', handleStatusChange);
    };
  }, []);

  // Also add real-time polling for status updates
  useEffect(() => {
    const pollStatusUpdates = async () => {
      if (!orgId) return;
      
      try {
        const response = await apiServices.getDeclarationStatus({
          organization: orgId,
          status: 'All'
        });
        
        // Compare and update if statuses have changed
        setTableData(prevData => {
          const updatedData = prevData.map(item => {
            const freshItem = response.find(r => r.id === item.id);
            if (freshItem && freshItem.status !== item.status) {
              console.log('Status updated via polling:', item.declarationNum, freshItem.status);
              return { ...item, status: freshItem.status };
            }
            return item;
          });
          return updatedData;
        });
      } catch (error) {
        console.error('Error polling status updates:', error);
      }
    };

    // Poll every 10 seconds for status updates
    const pollInterval = setInterval(pollStatusUpdates, 10000);
    
    return () => clearInterval(pollInterval);
  }, [orgId]);


const fetchDeclarations = async () => {

  setError(null);

  try {
    if (!orgId) {
      throw new Error("Organization ID not available");
    }

    const params = {
      organization: orgId,  // ✅ pass UUID directly
    };

    if (searchTerm) params.search = searchTerm;
    if (statusFilter !== 'All') params.status = statusFilter;

    console.log("📤 API Params:", params);  // Debugging help

    const responseData = await apiServices.getDeclarationStatus(params);
console.log(responseData)
    const mappedData = responseData.map(item => {
      const findings = item.findings || [];

      return {
        id: item.id,
        declarationNum: item.declaration_number,
        declarationDate: item.date || null,  // keep raw ISO date

        issueCount: item.issue_count || 0,
        auditorFinding: findings.map(f => f.finding),
        auditorRemark: findings.length > 0 && findings[0].auditor_remark
          ? findings[0].auditor_remark
          : '',
        clientResponse: findings.length > 0 ? findings[0].client_response || '-' : '-',
        clientRemarks: findings.length > 0 ? findings[0].client_remark || '-' : '-',
        status: item.status || 'Open', 
        hasUnread: false,
        chat_thread_id: item.chat_thread_id || null
      };
    });

    setTableData(mappedData);
  } catch (err) {
    console.error("Failed to fetch declaration data:", err);
    setError("Failed to load data.");
  } finally {

  }
};
useEffect(() => {
  fetchDeclarations();
}, [orgId, searchTerm, statusFilter]);

const handleSaveFindings = async (findings, remarkText) => {
  const remark = remarkText || " ";

  const allFieldsFilled = 
    findings.length > 0 && 
    !findings.includes("No Issues") &&
    remark.trim() !== "" && 
    remark !== " " &&
    currentRow.clientResponse && 
    currentRow.clientResponse !== "-" &&
    currentRow.clientRemarks && 
    currentRow.clientRemarks !== "-";

  const updatedStatus = findings.includes("No Issues") ? "Closed" : (
    allFieldsFilled ? "Closed" : "Pending with Client"
  );

  const updatedRow = {
    ...currentRow,
    auditorFinding: findings,
    auditorRemark: remark,
    issueCount: findings.includes("No Issues") ? 0 : findings.length,
    status: updatedStatus
  };

  setTableData(prevData =>
    prevData.map(item => (item.id === currentRow.id ? updatedRow : item))
  );

  try {
    await apiServices.updateDeclaration({
      declaration_id: currentRow.id,
      auditor_remark: remark,
      findings: findings.map(f => ({ finding: f })),
      issue_count: updatedRow.issueCount
    });
    console.log("✅ Combined remark and findings saved");
    setFindingsDialogOpen(false);
    await fetchDeclarations(); // Refresh data only once
  } catch (err) {
    console.error("Failed to save combined data:", err);
  }
};


  const handleOpenFindingsDialog = (row) => {
  console.log("Opening findings dialog for row:", row);
  setCurrentRow(row);
  setFindingsDialogOpen(true);
};

const handleOpenRemarksDialog = (row) => {
  setCurrentRow(row);
  setRemarksDialogOpen(true);
};
const StatusChip = ({ status, onClick, row }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Closed": return { bg: "#E8F5E9", text: "#2E7D32" };
      case "Pending with Client": return { bg: "#FFF8E1", text: "#FF8F00" };
      case "Pending with Auditor": return { bg: "#F3E5F5", text: "#7B1FA2" };
      case "Open": return { bg: "#FFEBEE", text: "#C62828" };
      case "-": return { bg: "#F5F5F5", text: "#757575" };
      default: return { bg: "#F5F5F5", text: "#757575" };
    }
  };
  const allFieldsFilled =
    row &&
    row.auditorFinding &&
    row.auditorFinding.length > 0 &&
    !row.auditorFinding.includes("No Issues") &&
    row.auditorRemark &&
    row.auditorRemark !== " " &&
    row.auditorRemark !== "" &&
    row.clientResponse &&
    row.clientResponse !== "-" &&
    row.clientRemarks &&
    row.clientRemarks !== "-";

  // Show dropdown for these statuses, and for "Open" if all fields are filled
  const isDropdown =
    status === "Pending with Client" ||
    status === "Pending with Auditor" ||
    status === "Closed" ||
    (status === "Open" && allFieldsFilled);

  const colors = getStatusColor();

  return (
    <Box
      onClick={isDropdown ? onClick : undefined}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "4px 10px",
        borderRadius: "4px",
        fontSize: "10.5px",
        fontWeight: "bold",
        color: colors.text,
        backgroundColor: colors.bg,
        height: "31px",
        minWidth: "90px",
        cursor: isDropdown ? 'pointer' : 'default',
        border: isDropdown ? '1px solid #bbb' : 'none',
        boxShadow: isDropdown ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
        gap: 0.5,
      }}
    >
      <span style={{ flex: 1 }}>{status}</span>
      {isDropdown && (
        <ArrowDropDownIcon sx={{ fontSize: 18, color: colors.text }} />
      )}
    </Box>
  );
};
const backendBaseUrl = API_URL;
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
const handleDeclarationClick = async (declarationNumber) => {
  try {
    const token = localStorage.getItem("token");

    // Find the declaration object
    const selectedDeclaration = tableData.find(doc => doc.declarationNum === declarationNumber);
    console.log("Declaration selected:", selectedDeclaration); // ✅ now after declaration

    setCurrentDocument(selectedDeclaration); // update currentDocument

    const response = await axios.get(
      `${backendBaseUrl}declaration-documents/${declarationNumber}/`,
      { headers: { Authorization: `Token ${token}` } }
    );

    if (response.data && Array.isArray(response.data.documents)) {
      setSelectedDocuments(response.data.documents.map(doc => ({
        file_name: doc.file_name,
        file_url: doc.file_url,
        declaration_number: response.data.declaration_number,
        version_id: doc.version_id,
        chat_thread_id: selectedDeclaration?.chat_thread_id || null
      })));
      setDocumentModalOpen(true);
    } else {
      console.warn("API response for documents is not in expected format or documents array is missing:", response.data);
      setSelectedDocuments([]);
      setDocumentModalOpen(true);
    }

  } catch (error) {
    console.error("Error fetching document list:", error);
    if (error.response) {
      alert(`Failed to load document list: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      alert("Failed to load document list: No response from server. Check if backend is running and URL is correct.");
    } else {
      alert(`Failed to load document list: ${error.message}`);
    }
  }
};



const handleViewAllDocuments = () => {
  if (!Array.isArray(selectedDocuments) || selectedDocuments.length === 0) {
    alert("No documents to view.");
    return;
  }

  const token = localStorage.getItem("token");

  // Update the status of all selected documents to "Pending with Auditor"
  const updatedData = tableData.map(item => {
    if (selectedDocuments.some(doc => doc.declaration_number === item.declarationNum)) {
      // Add to clickedDeclarations if not already present
      if (!clickedDeclarations.includes(item.id)) {
        setClickedDeclarations(prev => [...prev, item.id]);
      }
      console.log("Updating status for item:", item.id);
      const response = apiServices.updateDeclarationStatus(
        item.id,
       "Pending with Auditor"
      );
      console.log("Response from updateDeclarationStatus:", response.data);
      return { ...item, status: "Pending with Auditor" };
    }
    return item;
  });
  setTableData(updatedData);

    selectedDocuments.forEach(async (doc) => {
        if (!doc || !doc.declaration_number || !doc.version_id) return;

        const url = `${API_URL}declaration-documents/${doc.declaration_number}/view-secure-pdf/${doc.version_id}/`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Token ${token}`
                },
                responseType: 'blob'
            });

            const fileBlob = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(fileBlob);

            // Must call immediately, not after an async wait
            const newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.location.href = fileURL;
            } else {
                alert("Pop-up blocked. Please allow pop-ups for this site.");
            }

        } catch (error) {
            console.error("Error opening secure PDF:", error);
        }
    });
};
useEffect(() => {
  const fetchUnread = async () => {
    try {
      const res = await apiServices.getUnreadMessages();
      const unreadThreads = res.unread_messages || [];

      setTableData(prev =>
        prev.map(row => {
          const hasUnread = unreadThreads.some(
            t => t.declaration_number === row.declarationNum
          );
          return { ...row, hasUnread };
        })
      );
    } catch (err) {
      console.error("❌ Failed to fetch unread messages", err);
    }
  };

  fetchUnread();
  const interval = setInterval(fetchUnread, 10000); // poll every 10s
  return () => clearInterval(interval);
}, []);

const handleOpenSpecificDocument = async (doc) => {
  try {
    const token = localStorage.getItem("token");

    if (!doc || !doc.declaration_number || !doc.version_id) {
      alert("Missing declaration_number or version_id.");
      return;
    }

    // Find the row in tableData
    const row = tableData.find(item => item.declarationNum === doc.declaration_number);

    // Check if any required field is empty or default
    const shouldChangeStatus =
      !row ||
      !row.auditorFinding || row.auditorFinding.length === 0 ||
      row.auditorRemark === "" || row.auditorRemark === "" ||
      !row.clientResponse || row.clientResponse === "-" ||
      !row.clientRemarks || row.clientRemarks === "-";

    if (shouldChangeStatus) {
      setTableData(prevData =>
        prevData.map(item => {
          if (item.declarationNum === doc.declaration_number) {
            if (!clickedDeclarations.includes(item.id)) {
              setClickedDeclarations(prev => [...prev, item.id]);
            }
            return { ...item, status: "Pending with Auditor" };
            
          }
          return item;
        })
      );
    }

    const url = `${API_URL}declaration-documents/${doc.declaration_number}/view-secure-pdf/${doc.version_id}/`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`
      },
      responseType: 'blob'
    });

    const fileBlob = new Blob([response.data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(fileBlob);
    window.open(fileURL, '_blank');

  } catch (error) {
    console.error("Error opening secure PDF:", error);
    alert("Failed to open document. Please check your network or token.");
  }
};

const handleSaveFindingRemark = async (findings, remark) => {
  if (!currentRow) return;

  const existingRow = tableData.find(item => item.id === currentRow.id);

  // If "No Issues" is selected, set remark to "-"
  const updatedFindings =
    findings && findings.length > 0
      ? findings
      : existingRow?.auditorFinding || [];

  const updatedRemark =
    updatedFindings.includes("No Issues") ? "-" :
    remark !== undefined ? remark : existingRow?.auditorRemark || " ";

  const updatedIssueCount = updatedFindings.includes("No Issues")
    ? 0
    : updatedFindings.length;

  // If new audit finding or remark is given, set client fields to empty string
  const isNewAuditData =
    (findings && findings.length > 0 && JSON.stringify(findings) !== JSON.stringify(existingRow?.auditorFinding)) ||
    (remark !== undefined && remark !== existingRow?.auditorRemark);

  const updatedRow = {
    ...currentRow,
    auditorFinding: updatedFindings,
    auditorRemark: updatedRemark,
    issueCount: updatedIssueCount,
    status: updatedFindings.includes("No Issues")
      ? "Closed"
      : "Pending with Client",
    clientResponse: isNewAuditData ? "" : existingRow?.clientResponse,
    clientRemarks: isNewAuditData ? "" : existingRow?.clientRemarks,
  };

  setTableData(prevData =>
    prevData.map(item =>
      item.id === currentRow.id ? updatedRow : item
    )
  );

  try {
    const response = await apiServices.updateDeclaration({
      declaration_id: currentRow.id,
      auditor_remark: updatedRemark,
      findings: updatedFindings.map(f => ({ finding: f })),
      issue_count: updatedIssueCount,
      client_response: updatedRow.clientResponse,
      client_remark: updatedRow.clientRemarks,
    });

    console.log("✅ Saved correctly", updatedRow, response.data);

    if (response.data.chat_thread_id) {
      setCurrentDocument(prev => ({
        ...prev,
        chat_thread_id: response.data.chat_thread_id
      }));
    }

  } catch (err) {
    console.error("❌ Failed to save:", err);
  }
};


  const handleCloseDocumentModal = () => {
  setDocumentModalOpen(false);
  setSelectedDocuments([]);
  // Do NOT clear currentDocument here, so chat stays open if it was open
  };

const handleSaveRemark = async (remark) => {
  const updatedRemark = remark || "";
  
  // Check if all required fields are filled to determine new status
  const allFieldsFilled = 
    currentRow.auditorFinding.length > 0 && 
    !currentRow.auditorFinding.includes("No Issues") &&
    updatedRemark.trim() !== "" && 
    updatedRemark !== "-" &&
    currentRow.clientResponse && 
    currentRow.clientResponse !== "-" &&
    currentRow.clientRemarks && 
    currentRow.clientRemarks !== "-";

  const updatedStatus = allFieldsFilled 
    ? ""
    : (updatedRemark && updatedRemark.trim() !== "" && updatedRemark !== "-" 
      ? "Pending with Client" 
      : currentRow.status);

  const updatedRow = {
    ...currentRow,
    auditorRemark: updatedRemark,

  };
  
  const updatedData = tableData.map(item =>
    item.id === currentRow.id ? updatedRow : item
  );
  setTableData(updatedData);

  try {
   await apiServices.updateDeclaration({
  declaration_id: currentRow.id,
  auditor_remark: updatedRemark,
  findings: currentRow.auditorFinding.map(f => ({ finding: f })),
});

  } catch (err) {
    console.error("Failed to save remark:", err);
  }
};

const handleOpenChat = async (document) => {
  setCurrentDocument(document);
  setActiveChatRow(document.id);

  if (!messages[document.id]) {
    setMessages(prev => ({ ...prev, [document.id]: [] }));
  }

  setChatOpen(true);

  try {
    await apiServices.markThreadAsRead(document.id, "declaration");
    setTableData(prev =>
      prev.map(row =>
        row.id === document.id ? { ...row, hasUnread: false } : row
      )
    );
  } catch (err) {
    console.error("❌ Failed to mark as read", err);
  }
};


  const handleCloseChat = () => {
    setChatOpen(false);
    setCurrentDocument(null);
    setActiveChatRow(null); 
  };

  const handleSendMessage = (documentId, messageContent, chatMode) => {
    setMessages(prevMessages => {
      const newMessages = {
        ...prevMessages,
        [documentId]: [
          ...(prevMessages[documentId] || []),
          {
            id: (prevMessages[documentId]?.length || 0) + 1,
            sender: "You",
            message: typeof messageContent === 'string' ? messageContent : messageContent.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: true,
            senderType: chatMode === 'auditor' ? 'auditor' : 'user',
            file: typeof messageContent !== 'string' ? messageContent.file : undefined
          }
        ]
      };
      return newMessages;
    });
    if (chatMode === 'auditor') {
      setTimeout(() => {
        setMessages(prevMessages => ({
          ...prevMessages,
          [documentId]: [
            ...(prevMessages[documentId] || []),
            {
              id: (prevMessages[documentId]?.length || 0) + 2,
              sender: "Auditor",
              message: "Thank you for your message. We will review it shortly.",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isUser: false,
              senderType: 'auditor'
            }
          ]
        }));
        setTableData(prevData => prevData.map(item =>
          item.id === documentId ? { ...item, hasUnread: true } : item
        ));
      }, 1000);
    }
  };

  const filteredData = tableData.filter(row => {
    const matchesSearch =
      (row.declarationNum && row.declarationNum.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.declarationDate && row.declarationDate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.clientResponse && row.clientResponse.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.clientRemarks && row.clientRemarks.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.auditorRemark && row.auditorRemark.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.auditorFinding && row.auditorFinding.some(finding => finding && finding.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesFilter =
      (monthFilter === "All" || (row.declarationDate && row.declarationDate.includes(`-${monthFilter}-`))) &&
      (statusFilter === "All" || row.status === statusFilter);
        const matchesDate =
    !selectedDate ||
    new Date(row.declarationDate).toDateString() ===
      new Date(selectedDate).toDateString();

    return matchesFilter && matchesSearch&& matchesDate;
  });

  const sortedData = filteredData.sort((a, b) => {
    const valA = String(a[orderBy])?.toLowerCase?.() || "";
    const valB = String(b[orderBy])?.toLowerCase?.() || "";
    return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{
      padding: "20px 20px 20px 20px",
      position: "absolute",
      top: "75px",
      left: "20px",
      boxSizing: "border-box",
      overflowX: "hidden",
      right: chatOpen ? "286px" : "20px",
      width: chatOpen ? "calc(100% - 40px - 286px)" : "calc(100% - 40px)",
    }}>
      <Box sx={{
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        marginTop: "0px",
        padding: "10px 20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        backgroundColor: "#fafafa",
        my: 2,
        boxSizing: "border-box"
      }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ fontSize: "12px" }}
        >
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/auditor-company')}
            sx={{ cursor: 'pointer', fontWeight: 600, fontSize: "14px" }}
          >
            Auditor Organization Status
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "14px" }}>
            Auditor Declaration Details
          </Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>
            <Box component="span" sx={{ color: theme.palette.text.secondary }}>
              Organization:
            </Box> {organization}
             </Typography>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>
            <Box component="span" sx={{ color: theme.palette.text.secondary }}>
              Organization Code:
            </Box> {username}
          </Typography>
        </Box>
      </Box>

      <Card sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        padding: "10px",
        borderRadius: "8px",
        border: `1px solid ${theme.palette.divider}`,
        mb: 3,
        width: "100%",
        overflowX: "auto",
        boxSizing: "border-box"
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
          </Box>
          <Stack direction="row" spacing={2}>
<TextField
  select
  label="Status"
  size="small"
  value={statusFilter}
  onChange={(e) => setStatusFilter(e.target.value)}
  sx={{ minWidth: 140, fontSize: '12px', zIndex: 0 }}
>
  {["All","Open", "Closed", "Pending with Auditor", "Pending with Client"].map((status) => (
    <MenuItem key={status} value={status}>
      {status}
    </MenuItem>
  ))}
</TextField>
          </Stack>
        </Box>
<TableContainer sx={{
  width: "100%",
  maxHeight: "327px",
  overflowY: "auto",
  overflowX: chatOpen ? "auto" : "hidden", // Only allow horizontal scroll when chat is open
  minWidth: chatOpen ? 1000 : "100%",      // Set minWidth only when chat is open
}}>
  <Table size="small" sx={{
    minWidth: chatOpen ? 1000 : "100%",    // Set minWidth only when chat is open
    tableLayout: "fixed",
  }}>
    <EnhancedTableHead
      order={order}
      orderBy={orderBy}
      onRequestSort={handleRequestSort}
      headCells={headCells}
    />
              <TableBody>
                {visibleRows.map((row) => (
 <TableRow
                 key={row.id}
                 hover
                 sx={{
                   // Zebra striping
                   '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
                   '&:hover': { backgroundColor: theme.palette.grey[100] },
               
                   // ✅ Force highlight when chat is open (overrides zebra + hover)
                   ...(activeChatRow === row.id && {
                     backgroundColor: '#e3f2fd !important',
                   }),
                 }}
               >

                    <TableCell sx={{ fontSize: "12px", whiteSpace: "normal", wordBreak: "break-word" }}>
                                      <Typography
                                        onClick={() => handleDeclarationClick(row.declarationNum)}
                                        sx={{
                                          textDecoration: 'underline',
                                          color: 'primary.main',
                                          cursor: 'pointer',
                                          fontSize: '12px',
                                          '&:hover': { color: 'primary.dark' }
                                        }}
                                      >
                                        {row.declarationNum}
                                      </Typography>
                                    </TableCell>

<TableCell sx={{ fontSize: "12px", paddingLeft: "35px" }}>
  {row.declarationDate
    ? new Date(row.declarationDate).toLocaleDateString("en-GB") // format here
    : "N/A"}
</TableCell>


                    <TableCell sx={{
                      fontSize: "12px",
                      paddingLeft: "12px",
                      textAlign: "center"
                    }}>
                      {row.issueCount}
                    </TableCell>
{/* Auditor Findings Cell */}

<TableCell
  sx={{
    fontSize: "12px",
    whiteSpace: "normal",
    wordBreak: "break-word",
    textAlign: "center"
  }}
>
  <Button
    variant="outlined"
    size="small"
    onClick={() => handleOpenFindingsDialog(row)}
    sx={{
      fontSize: "11px",
      textTransform: "none",
      padding: "4px 10px",
      minWidth: "100px",
    }}
  >
    Add Findings
  </Button>
</TableCell>

{/* Auditor Remarks Cell */}
<TableCell
  sx={{
    fontSize: "12px",
    whiteSpace: "normal",
    wordBreak: "break-word",
    textAlign: "center"
  }}
>
  <Button
    variant="outlined"
    size="small"
    onClick={() => handleOpenRemarksDialog(row)}
    sx={{
      fontSize: "11px",
      textTransform: "none",
      padding: "4px 10px",
      minWidth: "100px",
    }}
  >
    Add Remarks
  </Button>
</TableCell>

<TableCell sx={{ fontSize: "12px", textAlign: "center" }}>
  <Typography
    sx={{
      fontSize: "12px",
      color: 'text.primary',
      textDecoration: 'none',
      cursor: 'default'
    }}
  >
    {row.clientResponse !== "-" ? row.clientResponse : "-"}
  </Typography>
</TableCell>
<TableCell sx={{ fontSize: "12px", textAlign: "center" }}>
  <Typography
    sx={{
      fontSize: "12px",
      color: 'text.primary',
      textDecoration: 'none',
      cursor: 'default'
    }}
  >
    {row.clientRemarks !== "-" ? row.clientRemarks : "-"}
  </Typography>
</TableCell>
<TableCell align="center">
  <StatusChip 
    status={row.status} 
    row={row}
    onClick={() => {
      if (
        row.status === "Pending with Client" ||
        row.status === "Pending with Auditor" ||
        row.status === "Closed" ||
        (
          row.status === "Open" &&
          row.auditorFinding &&
          row.auditorFinding.length > 0 &&
          !row.auditorFinding.includes("No Issues") &&
          row.auditorRemark &&
          row.auditorRemark !== " " &&
          row.auditorRemark !== "" &&
          row.clientResponse &&
          row.clientResponse !== "-" &&
          row.clientRemarks &&
          row.clientRemarks !== "-"
        )
      ) {
        setEditingStatusRow(row);
        setEditingStatus(true);
      }
    }}
  />
</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="ChatBox">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenChat(row)}
                          >
<Badge
  color="error"
  variant="dot"
  invisible={!row.hasUnread}
>
  <DoubleChatIcon fontSize="small" />
</Badge>

                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                      
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        
<Dialog
  open={documentModalOpen}
  onClose={handleCloseDocumentModal}
  aria-labelledby="document-list-dialog-title"
  maxWidth="sm"
  fullWidth
>
  <DialogTitle id="document-list-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <span>Documents for Declaration: {currentDocument?.declarationNum}</span>
  <Box>
    <Button
      variant="contained"
      size="small"
      onClick={handleViewAllDocuments}
      sx={{ fontSize: "12px", textTransform: "none", mr: 1 }}
    >
      📂 View All
    </Button>
    <IconButton
      aria-label="close"
      onClick={handleCloseDocumentModal}
      sx={{
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <CloseIcon />
    </IconButton>
  </Box>
</DialogTitle>

  <DialogContent dividers>
    {Array.isArray(selectedDocuments) && selectedDocuments.length > 0 ? (
      <List>
        {selectedDocuments.map((doc, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenSpecificDocument(doc);
                }}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                  color: 'primary.main',
                  fontSize: '13px',
                  wordBreak: 'break-word',
                  display: 'block',
                  pr: 2
                }}
              >
                {doc.file_name}
              </Link>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleOpenSpecificDocument(doc)}
              sx={{ fontSize: "12px", textTransform: "none", ml: 2, whiteSpace: 'nowrap' }}
            >
              View
            </Button>
          </ListItem>
        ))}
      </List>
    ) : (
      <Typography>No documents found for this declaration.</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDocumentModal}>Close</Button>
  </DialogActions>
</Dialog>
<Dialog
  open={editingStatus}
  onClose={() => setEditingStatus(false)}
  fullWidth
  maxWidth="xs"
>
  <DialogTitle>Update Status</DialogTitle>
  <DialogContent>
    <TextField
      select
      fullWidth
      label="New Status"
      value={editingStatusRow?.status || "Pending with Client"}
      onChange={(e) => {
        setEditingStatusRow({
          ...editingStatusRow,
          status: e.target.value
        });
      }}
      sx={{ mt: 2 }}
    >
{["Open", "Closed", "Pending with Auditor", "Pending with Client"].map((status) => (
  <MenuItem key={status} value={status}>
    {status}
  </MenuItem>
))}
    </TextField>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditingStatus(false)}>Cancel</Button>
    <Button 
  onClick={() => {
    if (editingStatusRow) {
      handleCloseFinding(editingStatusRow.id, editingStatusRow.status); // 👈 pass status here
      setEditingStatus(false); // close dialog after saving
    }
  }} 
  variant="contained" 
  color="primary"
>
  Save
</Button>

  </DialogActions>
</Dialog>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            fontSize: "12px",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: "12px"
            },
          }}
        />
      </Card>

<ChatBox
  open={chatOpen}
  onClose={handleCloseChat}
  chatMessages={currentDocument ? messages[currentDocument.id] || [] : []}
  currentDocument={{
    ...currentDocument,
    // Ensure these fields exist with fallbacks
    thread_type: currentDocument?.thread_type || 'Audit',
    declarationNum: currentDocument?.declaration_number || currentDocument?.declarationNum || 'Unknown'
  }}
  onSendMessage={handleSendMessage}
  threadId={currentDocument?.chat_thread_id}
  username={username}
  source="declaration"
/>

<FindingsDialog
  open={findingsDialogOpen}
  onClose={() => setFindingsDialogOpen(false)}
  onSave={(findings) => {
    handleSaveFindingRemark(findings, currentRow?.auditorRemark);
  }}
  initialFindings={currentRow ? currentRow.auditorFinding : []}
  onSaveAndNext={(findings) => {
    setFindingsDialogOpen(false);
    // If "No Issues" is selected, do NOT open remarks dialog, just save with remark "-"
    if (findings.includes("No Issues")) {
      handleSaveFindingRemark(findings, "");
    } else {
      handleSaveFindingRemark(findings, currentRow?.auditorRemark);
      setRemarksDialogOpen(true);
    }
  }}
/>
<RemarksDialog
  open={remarksDialogOpen}
  onClose={() => setRemarksDialogOpen(false)}
  onSave={(remark) =>
    handleSaveFindingRemark([], remark)
  }
  currentRemark={currentRow?.auditorRemark || ''}
/>

    </Box>
  );
}
export default AuditorDeclaration;