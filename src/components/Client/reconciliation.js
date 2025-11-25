import React, { useState,useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useLocation } from 'react-router-dom';
// import DoubleChatIcon from './DoubleChatIcon'; // adjust path as needed
import DoubleChatIcon from "../audit-viewer/DoubleChatIcon";
import ChatBox from "../ChatBox";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import apiServices from '../../ApiServices/ApiServices';
import { Search as SearchIcon, Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";// Adjust the import path as needed
import Menu from '@mui/material/Menu';
import axios from "axios";
import SyncIcon from '@mui/icons-material/Sync';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import {API_URL} from '../../ApiServices/ApiServices'; // Adjust the import path as needed
import { Download } from 'lucide-react';
import {
  Box,
  Table,
  Card,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Paper,
  TextField,
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
import {Grid,} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';



// Remove or initialize this 'data' array if you have static data.
// For now, it's empty in your provided code, so we'll remove the .map part for clarity.
const initialStaticData = [
  {
    id: 1,
    name: "Document 1",
    month: "JAN 2025 - MAR 2025",
    date: "2025-03-15",
    stock: "stock_march.pdf",
    customs: "customs_march.pdf",
    reconciliation: "-",
    hasUnread: true,
  },
  {
    id: 2,
    name: "Document 2",
    month: "APR 2025 - JUN 2025",
    date: "2025-06-18",
    stock: "stock_june.pdf",
    customs: "customs_june.pdf",
    reconciliation: "recon_june.pdf",
    hasUnread: false,
  },
  {
    id: 3,
    name: "Document 3",
    month: "JUL 2025 - SEP 2025",
    date: "2025-07-10",
    stock: "-",
    customs: "-",
    reconciliation: "-",
    hasUnread: false,
  },
].map(item => {
  let status;
  if (item.stock !== "-" && item.customs !== "-" && item.reconciliation !== "-") {
    status = "Closed";
  } else if (item.stock !== "-" && item.customs !== "-") {
    status = "In Progress";
  } else if (item.stock !== "-") {
    status = "Open";
  } else {
    status = "NA";
  }

  return {
    ...item,
    status,
  };
});

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];
const statusOptions = ["All", "Closed", "In Progress", "Open"];


const headCells = [
  
  { id: "month", label: "Duration", align: "left", width: "10%" },
  { id: "date", label: "Updated Date", align: "left", width: "8%" },
  { id: "stock", label: "Stock ", align: "center", width: "16%" },
  { id: "customs", label: "Customs ", align: "center", width: "16%" },
  { id: "reconciliation", label: "Reconciliation", align: "left", width: "16%" },
  { id: "status", label: "Status", align: "center", width: "8%" },
  { id: "actions", label: "Chat", align: "center", width: "12%" },
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
            sx={{zIndex:0,
              fontWeight: "600",
              fontSize: "12px",
              padding: headCell.id === "auditType" ? "12px 16px" : "12px 24px",
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

const StatusChip = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "Closed": return { bg: "#E8F5E9", text: "#2E7D32" };
      case "In Progress": return { bg: "#FFF8E1", text: "#FF8F00" };
      case "Open": return { bg: "#FFEBEE", text: "#C62828" };
      case "NA": return { bg: "#F5F5F5", text: "#757575" };
      default: return { bg: "#E3F2FD", text: "#1565C0" };
    }
  };

  const colors = getStatusColor();

  return (
    <Box
      sx={{
          zIndex:0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        color: colors.text,
        backgroundColor: colors.bg,
        height: "24px",
        minWidth: "80px",
      }}
    >
      {status}
    </Box>
  );
};

function ReconciliationAdmin() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
    const handleOpenReconFile = async (fileId) => {
      try {
        const token = localStorage.getItem("token");
        if (!fileId) {
          alert("Missing version_id for file.");
          return;
        }
  
        const url = `${backendBaseUrl}reconciliation-files/view-secure-pdf/${fileId}/`;
  
        const response = await axios.get(url, {
          headers: { Authorization: `Token ${token}` },
          responseType: "blob"
        });
  
        const fileBlob = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(fileBlob);
        window.open(fileURL, "_blank");
      } catch (error) {
        console.error("Error opening secure reconciliation file:", error);
        alert("Failed to open file. Please check your network or token.");
      }
    };
  const { organization, username } = location.state || {};
  const [year, setYear] = React.useState(2025);
  const [monthFilter, setMonthFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("month");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [currentDocument, setCurrentDocument] = React.useState(null);
  const [messages, setMessages] = React.useState({});
  const [openCreatePopup, setOpenCreatePopup] = useState(false);
  const [newDuration, setNewDuration] = useState("");
const [newStock, setNewStock] = useState([]);
const [newCustoms, setNewCustoms] = useState([]);
const [fileDialogOpen, setFileDialogOpen] = useState(false);
const [fileDialogTitle, setFileDialogTitle] = useState("");
const [fileDialogFiles, setFileDialogFiles] = useState([]);
const [anchorEl, setAnchorEl] = useState(null);
const [selectedRow, setSelectedRow] = useState(null);
const [selectedType, setSelectedType] = useState(""); // 'stock' or 'customs'
const [editDialogOpen, setEditDialogOpen] = useState(false);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [activeChatRow, setActiveChatRow] = useState(null);
const [datePickerOpen, setDatePickerOpen] = React.useState(false);
 // Changed to null to hold file object
  const [tableData, setTableData] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [documentCounter, setDocumentCounter] = useState(initialStaticData.length > 0 ? Math.max(...initialStaticData.map(item => parseInt(item.name.replace('Document ', '')) || 0)) + 1 : 1);

// Put this ABOVE useEffect, inside your component
const fetchReports = async () => {
  try {
    const reports = await apiServices.getReconciliationReports();

    if (!Array.isArray(reports)) {
      console.error("Expected array, got:", reports);
      return;
    }

    const mappedReports = reports.map(report => {
      // Extract file arrays based on file_type
      const stockFiles = (report.files || []).filter(f => f.file_type === "Reconciliation Stock");
      const customsFiles = (report.files || []).filter(f => f.file_type === "Reconciliation Customs");
      const reconciliationFiles = (report.files || []).filter(f => f.file_type === "Reconciliation Summary");

      return {
        ...report,
        stock: stockFiles.map(f => ({
          name: f.file?.split("/").pop() || "-",
          version_id: f.id,
          url: `${process.env.REACT_APP_API_BASE_URL}${f.file}`
        })),
        customs: customsFiles.map(f => ({
          name: f.file?.split("/").pop() || "-",
          version_id: f.id,
          url: `${process.env.REACT_APP_API_BASE_URL}${f.file}`
        })),
        reconciliation: reconciliationFiles.map(f => ({
          name: f.file?.split("/").pop() || "-",
          version_id: f.id,
          url: `${process.env.REACT_APP_API_BASE_URL}${f.file}`
        }))
      };
    });

    setTableData(mappedReports);
    console.log("Fetched reconciliation reports:", mappedReports);
  } catch (error) {
    console.error("Error fetching reconciliation reports:", error);
  }
};



// Now useEffect simply calls it
useEffect(() => {
  fetchReports();
}, []);


const handleCreateDocument = async () => {
  if (!startDate || !endDate || !newStock || !newCustoms) {
    alert("Please fill in all fields.");
    return;

  }
      console.log("startDate:", startDate);
console.log("endDate:", endDate);
console.log("newStock:", newStock);
console.log("newCustoms:", newCustoms);


  try {
    // 🔁 STEP 1: Create report via backend
    const response = await apiServices.createReconciliationReport({
      
      document_name: `Document ${documentCounter}`,
      month: new Date().toLocaleString("default", { month: "long" }),
start_month: new Date(startDate).toLocaleString("default", { month: "long" }),
start_year: new Date(startDate).getFullYear(),
end_month: new Date(endDate).toLocaleString("default", { month: "long" }),
end_year: new Date(endDate).getFullYear(),

      
    });
    console.log("Creating reconciliation report with:",response);
    const reportId = response.report_id; // ✅ Real backend UUID

    // ✅ STEP 2: Upload stock and customs
if (newStock.length > 0) {
  await apiServices.uploadStockOrCustoms(reportId, newStock, "Reconciliation Stock");
}

if (newCustoms.length > 0) {
  await apiServices.uploadStockOrCustoms(reportId, newCustoms, "Reconciliation Customs");
}




  const newDoc = {
  id: reportId,
  name: `Document ${documentCounter}`,
  start_month: new Date(startDate).toLocaleString("default", { month: "long" }),
  start_year: new Date(startDate).getFullYear(),
  end_month: new Date(endDate).toLocaleString("default", { month: "long" }),
  end_year: new Date(endDate).getFullYear(),
  date: new Date().toLocaleDateString(),
  stock: newStock,
  customs: newCustoms,
  reconciliation: "-",
 status: "Open",
  hasUnread: false,
};


 await fetchReports(); // reuse the same function from useEffect
setDocumentCounter(prev => prev + 1);

// Reset form
setOpenCreatePopup(false);
setStartDate("");
setEndDate("");
setNewStock([]);
setNewCustoms([]);

  } catch (error) {
    console.error("Upload failed:", error);
    alert("Upload failed.");
  }
};

const filteredData = tableData.filter(row => {
  const searchLower = searchTerm.toLowerCase();
  
  // Helper function to extract file names from array
  const getFileNames = (files) => {
    if (!Array.isArray(files)) return files || '';
    return files.map(file => file.name || file || '').join(' ');
  };
  
  // Check all relevant fields
  const matchesSearch =
    (row.name?.toLowerCase() || '').includes(searchLower) ||
    (row.month?.toLowerCase() || '').includes(searchLower) ||
    (row.date?.toLowerCase() || '').includes(searchLower) ||
    (getFileNames(row.stock).toLowerCase()).includes(searchLower) ||
    (getFileNames(row.customs).toLowerCase()).includes(searchLower) ||
    (getFileNames(row.reconciliation).toLowerCase()).includes(searchLower) ||
    (row.status?.toLowerCase() || '').includes(searchLower);
  
  const matchesFilter =
    (monthFilter === "All" || row.month === monthFilter) &&
    (statusFilter === "All" || row.status === statusFilter);
      const matchesDate =
    !selectedDate ||
    new Date(row.uploaded_date).toDateString() ===
      new Date(selectedDate).toDateString();

  return matchesFilter && matchesSearch&& matchesDate;
  
});


  const sortedData = filteredData.sort((a, b) => {
    const valA = a[orderBy]?.toLowerCase?.() || "";
    const valB = b[orderBy]?.toLowerCase?.() || "";
    return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
const getUpdatedStatus = (item) => {
  const hasStock = Array.isArray(item.stock) && item.stock.length > 0;
  const hasCustoms = Array.isArray(item.customs) && item.customs.length > 0;
  const hasRecon = item.reconciliation && item.reconciliation !== "-";

  if (hasStock && hasCustoms && hasRecon) return "Closed";
  return item.status === "Open" ? "In Progress" : item.status;
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
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

 const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedDate(null);
  };

const handleOpenChat = (document) => {
  setCurrentDocument(document);
  setActiveChatRow(document.id);

  // Initialize empty messages array if not already present
  if (!messages[document.id]) {
    setMessages(prev => ({
      ...prev,
      [document.id]: []
    }));
  }

  setChatOpen(true);

  // ✅ Scroll the clicked row into view aligned to the Chat cell (last column)
  setTimeout(() => {
    const rowElement = window.document.getElementById(`row-${document.id}`);
    if (rowElement) {
      // Scroll to show the end of the row (chat column)
      rowElement.scrollIntoView({ 
        behavior: "smooth", 
        block: "center", 
        inline: "end"  // This aligns the end of the row to the container
      });
    }
  }, 100);
};

   const handleCloseChat = () => {
    setChatOpen(false);
    setActiveChatRow(null);
  };
  const [openChatId, setOpenChatId] = React.useState(null);

  const handleSendMessage = (docId, message, mode) => {
    const currentMessages = messages[docId] || []; // Handle case where messages[docId] is undefined

    // If the message is a file, handle it differently
    if (message.file) {
      const newMessage = {
        id: currentMessages.length + 1,
        sender: message.sender,
        message: message.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: message.isUser,
        senderType: message.senderType,
        file: message.file // Include the file in the message
      };

      setMessages(prev => ({
        ...prev,
        [docId]: [...currentMessages, newMessage]
      }));
    } else {
      const newMessage = {
        id: currentMessages.length + 1,
        sender: "You",
        message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true,
        senderType: mode === 'auditor' ? 'auditor' : 'user'
      };

      setMessages(prev => ({
        ...prev,
        [docId]: [...currentMessages, newMessage]
      }));
    }
  };
  // Handler for opening PDF files in a new tab
    const backendBaseUrl = API_URL;

const handleDownloadReconFile = async (fileId, fileName) => {
  try {
    const token = localStorage.getItem("token");
    if (!fileId) {
      alert("Missing file_id for file.");
      return;
    }

    const url = `${backendBaseUrl}reconciliation-files/view-secure-pdf/${fileId}/`;

    const response = await axios.get(url, {
      headers: { Authorization: `Token ${token}` },
      responseType: "blob"
    });

    const fileBlob = new Blob([response.data], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(fileBlob);

    // Create a temporary link element for downloading
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = fileName || "reconciliation_file.pdf"; // default name
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(fileURL);
  } catch (error) {
    console.error("Error downloading secure reconciliation file:", error);
    alert("Failed to download file. Please check your network or token.");
  }
};

  const handleCancelCreate = () => {
    setOpenCreatePopup(false);
    setStartDate("");
    setEndDate("");
    setNewStock([]);
    setNewCustoms([]);
  };
const handleViewAllDocuments = (documents) => {
  if (!Array.isArray(documents) || documents.length === 0) {
    alert("No documents to view.");
    return;
  }

  const token = localStorage.getItem("token");

  documents.forEach(async (doc) => {
    // Use version_id instead of id - this is the correct property from your data structure
    const fileId = doc.version_id || doc.id;
    
    if (!doc || !fileId) {
      console.warn("Missing file ID for document:", doc);
      return;
    }

    const url = `${API_URL}reconciliation-files/view-secure-pdf/${fileId}/`;
    console.log("Attempting to access:", url);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Token ${token}`
        },
        responseType: 'blob'
      });

      console.log("Response status:", response.status);
      
      if (response.status === 200) {
        const fileBlob = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(fileBlob);

        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.location.href = fileURL;
        } else {
          alert("Pop-up blocked. Please allow pop-ups for this site.");
        }
      } else {
        console.error("Unexpected response status:", response.status);
        alert("Failed to open file: Server returned unexpected status");
      }
    } catch (error) {
      console.error("Error opening secure PDF:", error);
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        
        if (error.response.status === 500) {
          alert("Server error: Please contact administrator. The file might be missing or corrupted.");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("Network error: Could not connect to server.");
      } else {
        console.error("Error setting up request:", error.message);
        alert("Error: " + error.message);
      }
    }
  });
};
  const handleRemoveFile = (type, index) => {
    if (type === "stock") {
      setNewStock(prev => prev.filter((_, i) => i !== index));
    } else if (type === "customs") {
      setNewCustoms(prev => prev.filter((_, i) => i !== index));
    }
  };
  const formatDate = (dateString) => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return "-";
  }
};
  return (
    
    <Box sx={{ zIndex:0,
  padding: "20px 20px 20px 20px", // Consistent padding on all sides
  position: "absolute",
  top: "75px",
  
  left: "20px",
  boxSizing: "border-box",
  overflowX: "hidden",
  right: chatOpen ? "286px" : "20px",
width: chatOpen ? "calc(100% - 40px - 286px)" : "calc(100% - 40px)",
 // Adjust width calculation
}}>

  

<Box
  sx={{zIndex:0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    marginTop: "0px",
    padding: "10px 20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#fafafa",
    my: 2,
    width: "100%",
    boxSizing: "border-box"
  }}
>
  <Box
    sx={{zIndex:0,
      width: "100%",
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      justifyContent: "space-between",
      alignItems: "center",
      gap: 2,
    }}
  >
      <Typography color="text.primary" sx={{ fontWeight: 600 }}>
        Reconciliation Audit
      </Typography>
      
      
  {/* <Button
    variant="contained"
    color="primary"
    startIcon={<AddIcon />}
    onClick={() => setOpenCreatePopup(true)}
    sx={{zIndex:0,
      backgroundColor: "#000", // black background
      color: "#fff",     
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 2,
      paddingX: 2,
      paddingY: 1,
      boxShadow: 2,
    }}
  >
    New Document
  </Button> */}
</Box>
      </Box>


      <Card
  sx={{
    zIndex:0,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${theme.palette.divider}`,
    mb: 3,
    width: "100%",
    overflowX: "auto",
    boxSizing: "border-box" // Include padding in width calculation
  }}
>

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
              sx={{zIndex:0, minWidth: 140, fontSize: '12px' }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        <TableContainer 
  sx={{ 
    zIndex:0,
    width: "100%", 
    maxHeight: "327px", 
    overflowY: "auto",
    overflowX: "hidden", // Prevent horizontal scrolling
    minWidth: chatOpen ? "900px" : "auto" // Set minimum width when chat is open
  }}
>
  <Table 
    size="small" 
    sx={{
      zIndex:0,
      minWidth: "100%", // Ensure table takes full width
      tableLayout: "fixed" // Use fixed layout for consistent column widths
    }}
  >
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
  id={`row-${row.id}`}   // ✅ Add this line
  hover
  sx={{
    '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
    '&:hover': { backgroundColor: theme.palette.grey[100] },
    ...(activeChatRow === row.id && { backgroundColor: '#e3f2fd !important' }),
  }}
>
              
<TableCell sx={{ fontSize: "12px" }}>
  {row.start_month && row.start_year && row.end_month && row.end_year
    ? `${row.start_month.slice(0, 3)}/${row.start_year} - ${row.end_month.slice(0, 3)}/${row.end_year}`
    : "-"}
</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
  {formatDate(row.uploaded_date)}
</TableCell>
                {/* --- STOCK CELL --- */}
{/* --- STOCK CELL --- */}
<TableCell sx={{ fontSize: "12px", textAlign: "center",padding: "8px 16px" }}> {/* Added textAlign: "center" */}
  {Array.isArray(row.stock) && row.stock.length > 0 ? (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center"> {/* Added justifyContent: "center" */}
    <Button
  size="small"
  variant="text"
  startIcon={<FolderOpenIcon />}
  onClick={() => {
    setFileDialogTitle("Stock Files");
    setFileDialogFiles(row.stock);
    setFileDialogOpen(true);
  }}
  sx={{
    textTransform: "none",
    color: "#1976d2",
    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
  }}
>
  View
</Button>

     
    </Stack>
  ) : (
    <Box display="flex" justifyContent="center"> {/* Centering container */}
      {/* <Button
        component="label"
        variant="text"
        sx={{ 
          minWidth: 'auto',
          padding: '6px',
          borderRadius: '50%',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
      >
  <CloudUploadIcon
          sx={{
            color: '#1976d2',
            fontSize: "20px",
            '&:hover': {
              color: '#1565c0'  
            }
          }}
        />
        <input
          type="file"
          hidden
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
              await apiServices.uploadStockOrCustoms(row.id, files, "Reconciliation Stock");
              await fetchReports();
            }
          }}
        />
      </Button> */}
    </Box>
  )}
</TableCell>

{/* --- CUSTOMS CELL --- */}
<TableCell sx={{ fontSize: "12px", textAlign: "center" }}> {/* Added textAlign: "center" */}
  {Array.isArray(row.customs) && row.customs.length > 0 ? (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center"> {/* Added justifyContent: "center" */}
<Button
  size="small"
  variant="text"
  startIcon={<FolderOpenIcon />}
  onClick={() => {
    setFileDialogTitle("Customs Files");
    setFileDialogFiles(row.customs);
    setFileDialogOpen(true);
  }}
  sx={{
    textTransform: "none",
    color: "#1976d2",
    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
  }}
>
  View
</Button>

    </Stack>
  ) : (
    <Box display="flex" justifyContent="center"> {/* Centering container */}
      {/* <Button
        component="label"
        variant="text"
        sx={{ 
          minWidth: 'auto',
          padding: '6px',
          borderRadius: '50%',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        <CloudUploadIcon 
          sx={{ 
            color: '#1976d2',
            fontSize: '20px',
            '&:hover': { 
              color: '#1565c0'  
            }
          }}
        />
        <input
          type="file"
          hidden
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
              await apiServices.uploadStockOrCustoms(row.id, files, "Reconciliation Customs");
              await fetchReports();
            }
          }}
        />
      </Button> */}
    </Box>
  )}
</TableCell>


                  {/* --- RECONCILIATION CELL --- */}
<TableCell sx={{ fontSize: "12px" }}>
  {Array.isArray(row.reconciliation) && row.reconciliation.length > 0 ? (
    <Stack direction="row" spacing={1} alignItems="center">
<Button 
  size="small"
  variant="text"
  startIcon={<FolderOpenIcon />}
  onClick={() => {
    if (row.status === "Open") {
      setTableData(prev =>
        prev.map(item =>
          item.id === row.id
            ? { ...item, status: "In Progress" }
            : item
        )
      );
    }
    setFileDialogTitle("Reconciliation Files");
    setFileDialogFiles(row.reconciliation);
    setFileDialogOpen(true);
  }}
  sx={{
    textTransform: "none",
    color: "#1976d2",
    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
  }}
>
  View
</Button>

      <IconButton
        size="small"
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          setSelectedRow(row);
          setSelectedType("reconciliation");
        }}
      >
      
      </IconButton>
    </Stack>
  ) : "-"}
</TableCell>

                 <TableCell align="center">
  {row.status === "NA" ? "-" : <StatusChip status={row.status} />}
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
                                                invisible={!(
  row.hasUnread || 
  row.status === "Pending with Auditor" || 
  row.status === "Pending with Client"
)}
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
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No records found
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
          sx={{zIndex:0,
            fontSize: "12px",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: "12px"
            },
          }}
        />
      </Card>

      <ChatBox
              open={chatOpen}
              org = "Current"
              currentDocument={currentDocument}
              threadId={currentDocument?.id}
              onSendMessage={handleSendMessage}
              onClose={handleCloseChat}
              username={
              currentDocument && currentDocument.start_month && currentDocument.start_year && currentDocument.end_month && currentDocument.end_year
                ? `${currentDocument.start_month.slice(0, 3)}/${currentDocument.start_year} - ${currentDocument.end_month.slice(0, 3)}/${currentDocument.end_year}`
                : "-"
            }
            source="reconciliation"
            />


<Dialog open={openCreatePopup} onClose={() => setOpenCreatePopup(false)} fullWidth maxWidth="sm">
  <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>Create New Document</DialogTitle>

  <DialogContent dividers>
    <Grid container spacing={2}>
      {/* Start Date */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="Start Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </Grid>

      {/* End Date */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="End Date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Grid>

      {/* Stock Upload */}
     {/* Stock Upload */}
<Grid item xs={12}>
  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
    Upload Stock Documents
  </Typography>
  {newStock.map((file, index) => (
    <Box
      key={index}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 1, backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}
    >
      <Typography fontSize="12px">{file.name}</Typography>
      <IconButton size="small" onClick={() => handleRemoveFile("stock", index)}>
        <DeleteIcon fontSize="small" color="error" />
      </IconButton>
    </Box>
  ))}
  
  <Button
    variant="outlined"
    component="label"
    fullWidth
  >
    Choose Stock Files
    <input
      type="file"
      hidden
      multiple
      accept=".pdf,.docx,.xlsx,.csv,.png,.jpg"
      onChange={(e) => {
        const files = Array.from(e.target.files);
        setNewStock(prev => [...prev, ...files]);
      }}
    />
  </Button>
</Grid>

      {/* Customs Upload */}
 
<Grid item xs={12}>
  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
    Upload Customs Documents
  </Typography>
  {newCustoms.map((file, index) => (
    <Box
      key={index}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 1, backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}
    >
      <Typography fontSize="12px">{file.name}</Typography>
      <IconButton size="small" onClick={() => handleRemoveFile("customs", index)}>
        <DeleteIcon fontSize="small" color="error" />
      </IconButton>
    </Box>
  ))}
  
  <Button
    variant="outlined"
    component="label"
    fullWidth
  >
    Choose Customs Files
    <input
      type="file"
      hidden
      multiple
      accept=".pdf,.docx,.xlsx,.csv,.png,.jpg"
      onChange={(e) => {
        const files = Array.from(e.target.files);
        setNewCustoms(prev => [...prev, ...files]);
      }}
    />
  </Button>
</Grid>

    </Grid>
  </DialogContent>

  <DialogActions sx={{ px: 3, py: 2 }}>
    <Button onClick={handleCancelCreate} color="secondary">
      Cancel
    </Button>
    <Button onClick={handleCreateDocument} variant="contained" color="primary">
      Create
    </Button>
  </DialogActions>
</Dialog>
<Dialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span>{fileDialogTitle}</span>
    <Box>
     <Button
  variant="contained"
  size="small"
  onClick={() => {
    console.log("Files to view:", fileDialogFiles);
    console.log("First file structure:", fileDialogFiles[0]);
    handleViewAllDocuments(fileDialogFiles);
  }}
  sx={{ fontSize: "12px", textTransform: "none", mr: 1 }}
>
  📂 View All
</Button>
      <IconButton
        aria-label="close"
        onClick={() => setFileDialogOpen(false)}
        sx={{
          color: (theme) => theme.palette.grey[500],
        }}
      >
      
      </IconButton>
    </Box>
  </DialogTitle>
  <DialogContent dividers>
    {fileDialogFiles.length > 0 ? (
      fileDialogFiles.map((file, index) => {
        // Build correct file URL
        const fileUrl =
          file instanceof File
            ? URL.createObjectURL(file)
            : file.url?.startsWith("http")
              ? file.url
              : `${process.env.REACT_APP_API_BASE_URL}${file.url || file.file}`;

        // Check if it's a PDF
        const isPDF =
          file.name?.toLowerCase().endsWith(".pdf") ||
          fileUrl?.toLowerCase().endsWith(".pdf");

        return (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Typography fontSize="14px">{file.name}</Typography>

            <Box display="flex" gap={1}>
              {/* View Button for PDFs */}
              {isPDF && (
                <Box display="flex" justifyContent="center">
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const fileId = file.version_id || file.id;
                        if (fileId) {
                          handleOpenReconFile(fileId);
                        } else {
                          alert("File ID not found");
                        }
                      }}
                      sx={{
                        color: theme.palette.info.main,
                        '&:hover': { backgroundColor: theme.palette.info.light },
                      }}
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Download Button */}
              <Tooltip title="Download">
                <IconButton
                  size="small"
                  onClick={() => {
                    const fileId = file.version_id || file.id;
                    if (fileId) {
                      handleDownloadReconFile(fileId, file.name);
                    } else {
                      alert("File ID not found");
                    }
                  }}
              
                                                                          sx={{
                                                                              color: theme.palette.success.main,
                                                                              '&:hover': {
                                                                                  backgroundColor: theme.palette.success.light,
                                                                              },
                                                                          }}
                                                                      >
                                                                          <Download size={16} />
                                                                      </IconButton>
                                                                  </Tooltip>
            </Box>
          </Box>
        );
      })
    ) : (
      <Typography>No files uploaded.</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setFileDialogOpen(false)} color="primary">
      Close
    </Button>
  </DialogActions>
</Dialog>


{/* ================= Edit (Replace) Dialog ================= */}
<Dialog
  open={editDialogOpen}
  onClose={() => setEditDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
 <Dialog
  open={editDialogOpen}
  onClose={() => setEditDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    Edit {selectedType === "stock" ? "Stock" : "Customs"} Files
    <Button
      size="small"
      variant="contained"
      component="label"
      sx={{ fontSize: "12px", textTransform: "none" }}
    >
      Upload New
      <input
        type="file"
        hidden
onChange={(e) => {
  const file = e.target.files[0];
  if (!file) return;
  setTableData(prev =>
    prev.map(item =>
      item.id === selectedRow.id
        ? {
            ...item,
            [selectedType]: [...item[selectedType], file],
          }
        : item
    )
  );
  // 🆕 Update selectedRow immediately
  setSelectedRow(prev =>
    prev
      ? {
          ...prev,
          [selectedType]: [...prev[selectedType], file],
        }
      : prev
  );
}}
      />
    </Button>
  </DialogTitle>
  <DialogContent dividers>
    {selectedRow?.[selectedType]?.length ? (
      selectedRow[selectedType].map((file, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography fontSize="14px">
            {file?.document_name || file?.name || "Unnamed File"}
          </Typography>
<Button variant="outlined" size="small" component="label">
  <SyncIcon fontSize="small" /> {/* Replace icon */}
  <input
    type="file"
    hidden
    onChange={async (e) => {
      const newFile = e.target.files?.[0];
      if (!newFile || (!file?.id && !file?.version_id)) return;
      try {
        // 1️⃣ Send replace request to backend
        await apiServices.replaceReconciliationFile(
          file?.version_id || file?.id,
          newFile
        );
        // 2️⃣ Update tableData instantly
        setTableData(prev =>
          prev.map(row =>
            row.id === selectedRow?.id
              ? {
                  ...row,
                  [selectedType]: row[selectedType].map((f, i) =>
                    i === index
                      ? { ...f, name: newFile.name }
                      : f
                  ),
                }
              : row
          )
        );
        // 3️⃣ Update selectedRow instantly
        setSelectedRow(prev =>
          prev
            ? {
                ...prev,
                [selectedType]: prev[selectedType].map((f, i) =>
                  i === index
                    ? { ...f, name: newFile.name }
                    : f
                ),
              }
            : prev
        );
        // 4️⃣ Show success message
        setSnackbar({
          open: true,
          message: "File replaced successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Replace failed:", error);
        setSnackbar({
          open: true,
          message: "Failed to replace file",
          severity: "error",
        });
      }
    }}
  />
</Button>
        </Box>
      ))
    ) : (
      <Typography>No files found</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditDialogOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>
  <DialogContent dividers>
    {selectedRow?.[selectedType]?.length ? (
      selectedRow[selectedType].map((file, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography fontSize="14px">
            {file?.document_name || file?.name || "Unnamed File"}
          </Typography>

<Button variant="outlined" size="small" component="label">
  Replace
  <input
    type="file"
    hidden
    onChange={async (e) => {
      const newFile = e.target.files?.[0];
      if (!newFile || (!file?.id && !file?.version_id)) return;

      try {
        // 1️⃣ Send replace request to backend
        await apiServices.replaceReconciliationFile(
          file?.version_id || file?.id,
          newFile
        );

        // 2️⃣ Update tableData instantly
        setTableData(prev =>
          prev.map(row =>
            row.id === selectedRow?.id
              ? {
                  ...row,
                  [selectedType]: row[selectedType].map((f, i) =>
                    i === index
                      ? { ...f, name: newFile.name }
                      : f
                  ),
                }
              : row
          )
        );

        // 3️⃣ Update selectedRow instantly
        setSelectedRow(prev =>
          prev
            ? {
                ...prev,
                [selectedType]: prev[selectedType].map((f, i) =>
                  i === index
                    ? { ...f, name: newFile.name }
                    : f
                ),
              }
            : prev
        );

        // 4️⃣ Show success message
        setSnackbar({
          open: true,
          message: "File replaced successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Replace failed:", error);
        setSnackbar({
          open: true,
          message: "Failed to replace file",
          severity: "error",
        });
      }
    }}
  />
</Button>
        </Box>
      ))
    ) : (
      <Typography>No files found</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditDialogOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>


{/* ================= Delete Dialog ================= */}
{/* ================= Delete Dialog ================= */}
<Dialog
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    Delete {selectedType === "stock" ? "Stock" : "Customs"} Files
  </DialogTitle>
  <DialogContent dividers>
    {fileDialogFiles?.length ? (
      fileDialogFiles.map((file, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography fontSize="14px">
            {file?.document_name || file?.name || "Unnamed File"}
          </Typography>

          <IconButton
            size="small"
            color="error"
            onClick={async () => {
              if (!file?.id && !file?.version_id) return;
              try {
                // Call the delete API
                await apiServices.deleteReconciliationFile(
                  file?.version_id || file?.id
                );
                
                // Update local state - filter out the specific file
                setTableData(prev =>
                  prev.map(row =>
                    row.id === selectedRow?.id
                      ? {
                          ...row,
                          [selectedType]: row[selectedType].filter(
                            (f, i) => 
                              // Compare by version_id if available, otherwise by index
                              (f.version_id && f.version_id !== file.version_id) ||
                              (!f.version_id && i !== index)
                          ),
                        }
                      : row
                  )
                );
                
                // Also update the fileDialogFiles to remove the deleted file
                setFileDialogFiles(prev => 
                  prev.filter((f, i) => 
                    (f.version_id && f.version_id !== file.version_id) ||
                    (!f.version_id && i !== index)
                  )
                );
                
                setSnackbar({
                  open: true,
                  message: "File deleted successfully",
                  severity: "success",
                });
              } catch (error) {
                console.error("Delete failed:", error);
                setSnackbar({
                  open: true,
                  message: "Failed to delete file",
                  severity: "error",
                });
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))
    ) : (
      <Typography>No files found</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}

export default ReconciliationAdmin;