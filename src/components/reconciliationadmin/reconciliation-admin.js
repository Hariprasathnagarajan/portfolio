
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useLocation } from 'react-router-dom';
import DoubleChatIcon from './DoubleChatIcon'; // adjust path as needed
import AttachFileIcon from '@mui/icons-material/AttachFile';
import apiServices from '../../ApiServices/ApiServices';
import { Search as SearchIcon, Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import axios from "axios";
import SyncIcon from '@mui/icons-material/Sync';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import {API_URL} from '../../ApiServices/ApiServices'; // Adjust the import path as needed
import { Download } from 'lucide-react';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";// Adjust the import path as needed

import "react-datepicker/dist/react-datepicker.css";
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
import ChatBox from "../ChatBox";
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
const [activeChatRow, setActiveChatRow] = useState(null); // Changed to null to hold file object
  const [tableData, setTableData] = useState([]);
const [startDate, setStartDate] = useState(null);
const [endDate, setEndDate] = useState(null);
const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const [documentCounter, setDocumentCounter] = useState(initialStaticData.length > 0 ? Math.max(...initialStaticData.map(item => parseInt(item.name.replace('Document ', '')) || 0)) + 1 : 1);

// Put this ABOVE useEffect, inside your component
const fetchReports = async () => {
  try {
    const reports = await apiServices.getReconciliationReports();
    
    // Handle cases where reports is undefined or null
    if (!reports) {
      console.error("No reports received from API");
      setTableData([]);
      return;
    }

    // Handle cases where reports is not an array
    if (!Array.isArray(reports)) {
      console.error("Expected array, got:", reports);
      setTableData([]);
      return;
    }

    const mappedReports = reports.map(report => {
      // always use empty array if missing
      const files = Array.isArray(report?.files) ? report.files : [];

      const stockFiles = files.filter(f => f.file_type === "Reconciliation Stock");
      const customsFiles = files.filter(f => f.file_type === "Reconciliation Customs");
      const reconciliationFiles = files.filter(f => f.file_type === "Reconciliation Summary");

      // Determine status
      let status = "NA";
      if (stockFiles.length && customsFiles.length && reconciliationFiles.length) {
        status = "Closed";
      } else if (stockFiles.length && customsFiles.length) {
        status = "In Progress";
      } else if (stockFiles.length || customsFiles.length) {
        status = "Open";
      }

      // make sure each field is at least an empty array
      const stockArr = stockFiles.map(f => ({
        name: f.document_name || f.file?.split("/").pop() || "",
        version_id: f.id,
        url: `${process.env.REACT_APP_API_BASE_URL}${f.file}`
      }));

      const customsArr = customsFiles.map(f => ({
        name: f.document_name || f.file?.split("/").pop() || "",
        version_id: f.id,
        url: `${process.env.REACT_APP_API_BASE_URL}${f.file}`
      }));

      const reconArr = reconciliationFiles.map(f => ({
        name: f.document_name || f.file?.split("/").pop() || "",
        version_id: f.id,
        url: `${process.env.REACT_APP_API_BASE_URL}${f.file}`
      }));

      return {
        id: report.id,
        name: report.document_name,
        month: report.month,
        start_month: report.start_month,
        start_year: report.start_year,
        end_month: report.end_month,
        end_year: report.end_year,
        date: report.uploaded_date || report.created_at,
        stock: stockArr,           // always []
        customs: customsArr,       // always []
        reconciliation: reconArr,  // always []
        status,
        hasUnread: false
      };
    });

    setTableData(mappedReports);
  } catch (error) {
    console.error("Error fetching reconciliation reports:", error);
    setTableData([]); // Set to empty array on error
  }
};


// Now useEffect simply calls it
useEffect(() => {
  fetchReports();
}, []);

useEffect(() => {
  const fetchUnread = async () => {
    try {
      const res = await apiServices.getUnreadMessages();
      const unreadThreads = res.unread_messages || [];
      
      console.log("🔍 FETCH UNREAD - Reconciliation threads only");
      
      setTableData(prevData =>
        prevData.map(row => {
          // Only update hasUnread if the row doesn't have an active chat open
          // This prevents the polling from overriding the read status
          if (activeChatRow === row.id) {
            return row; // Don't change rows with active chats
          }
          
          const hasUnread = unreadThreads.some(
            thread => thread.thread_type === 'Reconciliation' && thread.reconciliation_id === row.id
          );
          
          // Only update if the status actually changed
          if (row.hasUnread !== hasUnread) {
            console.log(`🔍 Row ${row.id} - updating hasUnread from ${row.hasUnread} to ${hasUnread}`);
            return { ...row, hasUnread };
          }
          
          return row;
        })
      );
      
    } catch (err) {
      console.error("❌ Failed to fetch unread messages", err);
    }
  };

  fetchUnread();
  const interval = setInterval(fetchUnread, 10000);
  return () => clearInterval(interval);
}, [activeChatRow]); // Add activeChatRow as dependency
// Update your handleOpenChat function to properly mark reconciliation threads as read:
const handleOpenChat = async (document) => {
  console.log("🔓 OPENING CHAT - Document:", document.id, "hasUnread:", document.hasUnread);
  setCurrentDocument(document);
  setActiveChatRow(document.id);
  
  if (!messages[document.id]) {
    setMessages(prev => ({ ...prev, [document.id]: [] }));
  }
  
  setChatOpen(true);

  // Only mark as read if there are actually unread messages
  if (document.hasUnread) {
    try {
      console.log("📝 Calling markThreadAsRead for thread:", document.id, "type: reconciliation");
      await apiServices.markThreadAsRead(document.id, 'reconciliation');
      console.log("✅ Successfully marked as read via API");
      
      // Update local state immediately and optimistically
      setTableData(prevData => {
        const newData = prevData.map(row =>
          row.id === document.id ? { ...row, hasUnread: false } : row
        );
        console.log("🔄 Local state updated. New hasUnread status for", document.id + ":", 
          newData.find(row => row.id === document.id)?.hasUnread);
        return newData;
      });
    } catch (err) {
      console.error("❌ Failed to mark as read", err);
      // Don't update local state if API call fails
    }
  }
};

const handleCloseChat = useCallback(() => {
  setChatOpen(false);
  setCurrentDocument(null);
  setActiveChatRow(null); // This will allow unread polling to resume for this row
}, []);

 const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedDate(null);
  };

const handleCreateDocument = async () => {
  if (!startDate || !endDate) {
    alert("Please fill in all fields.");
    return;
  }
    if (new Date(startDate) > new Date(endDate)) {
    alert("Start date cannot be greater than end date.");
    return;
  }
  if (newStock.length === 0 && newCustoms.length === 0) {
    alert("Please upload at least one Stock or Customs document.");
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
// Helper to safely normalize any value into a lowercase string
const normalize = (value) => {
  if (!value) return "";
  if (Array.isArray(value)) {
    return value
      .map(v => (typeof v === "string" ? v : v.name || ""))
      .join(" ")
      .toLowerCase();
  }
  return String(value).toLowerCase();
};

const filteredData = tableData.filter(row => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    normalize(row.month).includes(search) ||
    normalize(row.date).includes(search) ||
    normalize(row.stock).includes(search) ||
    normalize(row.customs).includes(search) ||
    normalize(row.reconciliation).includes(search);

  const matchesFilter =
    (monthFilter === "All" || row.month === monthFilter) &&
    (statusFilter === "All" || row.status === statusFilter);
    
  const matchesDate =
    !selectedDate ||
    new Date(row.date).toDateString() ===
      new Date(selectedDate).toDateString();

  return matchesFilter && matchesSearch&& matchesDate
});

const sortedData = [...filteredData].sort((a, b) => {
  const valA = normalize(a[orderBy]);
  const valB = normalize(b[orderBy]);
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
// Update the handleViewAllFiles function to properly handle the file structure
const handleViewAllFiles = () => {
  if (!Array.isArray(fileDialogFiles) || fileDialogFiles.length === 0) {
    alert("No files to view.");
    return;
  }

  const token = localStorage.getItem("token");

  fileDialogFiles.forEach(async (file) => {
    // Get the correct file ID - check for version_id first, then id
    const fileId = file.version_id || file.id;
    
    if (!fileId) {
      console.error("No file ID found for file:", file);
      return;
    }

    try {
      const url = `${backendBaseUrl}reconciliation-files/view-secure-pdf/${fileId}/`;

      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob"
      });

      const fileBlob = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(fileBlob);

      // Open each file in a new tab
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.location.href = fileURL;
      } else {
        alert("Pop-up blocked. Please allow pop-ups for this site.");
      }
    } catch (error) {
      console.error("Error opening secure PDF:", error);
      alert(`Failed to open file: ${file.name || "Unknown file"}`);
    }
  });
};
  const handleCancelCreate = () => {
    setOpenCreatePopup(false);
    setStartDate("");
    setEndDate("");
    setNewStock([]);
    setNewCustoms([]);
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
      
      
  <Button
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
  </Button>
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
              
<TableCell sx={{ fontSize: "12px" }}>
  {row.start_month && row.start_year && row.end_month && row.end_year
    ? `${row.start_month.slice(0, 3)}/${row.start_year} - ${row.end_month.slice(0, 3)}/${row.end_year}`
    : "-"}
</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
  {formatDate(row.date)}
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

      <IconButton
        size="small"
        disabled={row.status === "Closed"}
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          setSelectedRow(row);
          setSelectedType("stock");
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Stack>
  ) : (
    <Box display="flex" justifyContent="center"> {/* Centering container */}
      <Button
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
    if (files.length === 0) return;

    try {
      // ✅ Set loading state
      setTableData(prev =>
        prev.map(item =>
          item.id === row.id ? { ...item, _loading: true } : item
        )
      );

      // ✅ Call backend API
      const response = await apiServices.uploadStockOrCustoms(
        row.id,
        files,
        "Reconciliation Stock"
      );

      setTableData(prev =>
  prev.map(item =>
    item.id === row.id
      ? {
          ...item,
          stock: [
            ...(Array.isArray(item.stock) ? item.stock : []),
            ...(Array.isArray(response.uploaded_files)
              ? response.uploaded_files.map(file => ({
                  version_id: file.id,
                  document_name: file.document_name,
                  name: file.document_name || file.file?.split("/").pop() || "",
                  url: file.file?.startsWith("http")
                    ? file.file
                    : `${process.env.REACT_APP_API_BASE_URL}${file.file}`,
                  file_type: file.file_type,
                  uploaded_at: file.uploaded_at,
                }))
              : [])
          ],
          // ✅ safe check for customs
          status:
            Array.isArray(item.customs) && item.customs.length > 0
              ? "In Progress"
              : "Open",
          _loading: false,
        }
      : item
  )
);


      alert("Upload failed. Please try again.");
    } finally {
      // ✅ Clear file input so same file can be uploaded again if needed
      e.target.value = "";
    }
  }}
/>

      </Button>
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
      <IconButton
        size="small"
        disabled={row.status === "Closed"}
        onClick={(e) => {
          setAnchorEl(e.currentTarget);
          setSelectedRow(row);
          setSelectedType("customs");
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Stack>
  ) : (
    <Box display="flex" justifyContent="center"> {/* Centering container */}
      <Button
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
    if (files.length === 0) return;

    try {
      // ✅ Set loading state
      setTableData(prev =>
        prev.map(item =>
          item.id === row.id ? { ...item, _loading: true } : item
        )
      );

      // ✅ Upload to backend
      const response = await apiServices.uploadStockOrCustoms(
        row.id,
        files,
        "Reconciliation Customs"
      );

      // ✅ Update with backend response
      setTableData(prev =>
        prev.map(item =>
          item.id === row.id
            ? {
                ...item,
                customs: [
                  ...item.customs,
                  ...response.uploaded_files.map(file => ({
                    version_id: file.id,
                    document_name: file.document_name,  
                    name: file.document_name || file.file.split("/").pop(),
                    url: file.file.startsWith("http")
                      ? file.file
                      : `${process.env.REACT_APP_API_BASE_URL}${file.file}`,
                    file_type: file.file_type,
                    uploaded_at: file.uploaded_at,
                  }))
                ],
                status: item.stock.length > 0 ? "In Progress" : "Open",
                _loading: false,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Upload failed:", error);

      // ✅ Reset loading state
      setTableData(prev =>
        prev.map(item =>
          item.id === row.id ? { ...item, _loading: false } : item
        )
      );

      alert("Upload failed. Please try again.");
    } finally {
      // ✅ Allow re-upload of the same file
      e.target.value = "";
    }
  }}
/>

      </Button>
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
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                  
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

    {}

<ChatBox
              open={chatOpen}
              org = "Current"
                currentDocument={{
    ...currentDocument,
    thread_type: 'Reconciliation',
  }}
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
<Grid container spacing={2}>
  {/* Start Date */}
<Grid item xs={12} sm={6}>
  <Typography variant="subtitle2" sx={{ mb: 0.10 ,marginLeft: 2.5 }}>
    Start Date
  </Typography>
  <Box sx={{ width: 230, marginLeft: 2 }}> {/* adjust width here */}
    <DatePicker
  selected={startDate}
  onChange={(date) => setStartDate(date)}
  dateFormat="dd/MM/yyyy"
  className="date-picker-input"
/>
  </Box>
</Grid>

<Grid item xs={12} sm={6}>
  <Typography variant="subtitle2" sx={{ mb: 0.10, marginLeft: 2.5 }}>
    End Date
  </Typography>
  <Box sx={{ width: 230 ,marginLeft: 2}}>
   <DatePicker
  selected={endDate}
  onChange={(date) => setEndDate(date)}
  dateFormat="dd/MM/yyyy"
  className="date-picker-input"
/>
  </Box>
</Grid>
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
      <Typography fontSize="12px">
  {file.document_name || file.name || file.url?.split("/").pop()}
</Typography>

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
    ><Typography fontSize="12px">
  {file.document_name || file.name || file.url?.split("/").pop()}
</Typography>

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
    {fileDialogTitle}
    <Box>
      <Button
        variant="contained"
        size="small"
        onClick={handleViewAllFiles}
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
            <Typography fontSize="14px">
  {file.document_name || file.name || file.url?.split("/").pop()}
</Typography>


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

<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={() => setAnchorEl(null)}
>
  {/* <MenuItem
    onClick={() => {
      setFileDialogTitle(`${selectedType === "stock" ? "Stock" : "Customs"} Files`);
      setFileDialogFiles(selectedRow?.[selectedType] || []);
      setFileDialogOpen(true);
      setAnchorEl(null);
    }}
  >
    View File
  </MenuItem> */}

  <MenuItem
    onClick={() => {
      setEditDialogOpen(true);
      setAnchorEl(null);
    }}
  >
    Edit File
  </MenuItem>

<MenuItem
    onClick={() => {
      setFileDialogTitle(
        `${selectedType === "stock" ? "Stock" : "Customs"} Files`
      );
      setFileDialogFiles(selectedRow?.[selectedType] || []);
      setDeleteDialogOpen(true);
      setAnchorEl(null);
    }}
  >
    Delete File
  </MenuItem>
</Menu>

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
    onChange={async (e) => {
      const file = e.target.files[0];
      if (!file || !selectedRow?.id) return;

      try {
        // 🔹 Upload to backend
        const response = await apiServices.uploadStockOrCustoms(
          selectedRow.id,
          [file],
          selectedType === "stock"
            ? "Reconciliation Stock"
            : "Reconciliation Customs"
        );

        // 🔹 Update tableData immediately
        setTableData(prev =>
          prev.map(row =>
            row.id === selectedRow.id
              ? {
                  ...row,
                  [selectedType]: [
                    ...row[selectedType],
                    ...response.uploaded_files.map(f => ({
                      version_id: f.id,
                      document_name: f.document_name,
                      name: f.document_name || f.file.split("/").pop(),
                      url: f.file.startsWith("http")
                        ? f.file
                        : `${process.env.REACT_APP_API_BASE_URL}${f.file}`,
                      file_type: f.file_type,
                      uploaded_at: f.uploaded_at,
                    }))
                  ]
                }
              : row
          )
        );

        // 🔹 Update selectedRow (popup state)
        setSelectedRow(prev =>
          prev
            ? {
                ...prev,
                [selectedType]: [
                  ...prev[selectedType],
                  ...response.uploaded_files.map(f => ({
                    version_id: f.id,
                    document_name: f.document_name,
                    name: f.document_name || f.file.split("/").pop(),
                    url: f.file.startsWith("http")
                      ? f.file
                      : `${process.env.REACT_APP_API_BASE_URL}${f.file}`,
                    file_type: f.file_type,
                    uploaded_at: f.uploaded_at,
                  }))
                ]
              }
            : prev
        );

        // 🔹 Update popup list if it's open
        if (
          fileDialogOpen &&
          fileDialogTitle.includes(
            selectedType === "stock" ? "Stock" : "Customs"
          )
        ) {
          setFileDialogFiles(prev => [
            ...prev,
            ...response.uploaded_files.map(f => ({
              version_id: f.id,
              document_name: f.document_name,
              name: f.document_name || f.file.split("/").pop(),
              url: f.file.startsWith("http")
                ? f.file
                : `${process.env.REACT_APP_API_BASE_URL}${f.file}`,
              file_type: f.file_type,
              uploaded_at: f.uploaded_at,
            }))
          ]);
        }

        // 🔹 Success alert
        setSnackbar({
          open: true,
          message: "File uploaded successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Upload failed:", error);
        setSnackbar({
          open: true,
          message: "Failed to upload file",
          severity: "error",
        });
      } finally {
        // allow re-uploading same file
        e.target.value = "";
      }
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
<IconButton color="warning" size="small" component="label">
  <SyncIcon fontSize="small" />
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
        
        // 2️⃣ Update tableData instantly - FIXED: Update both name and document_name
        setTableData(prev =>
          prev.map(row =>
            row.id === selectedRow?.id
              ? {
                  ...row,
                  [selectedType]: row[selectedType].map((f, i) =>
                    i === index
                      ? { 
                          ...f, 
                          name: newFile.name,
                          document_name: newFile.name // Add this line
                        }
                      : f
                  ),
                }
              : row
          )
        );
        
        // 3️⃣ Update selectedRow instantly - FIXED: Update both name and document_name
        setSelectedRow(prev =>
          prev
            ? {
                ...prev,
                [selectedType]: prev[selectedType].map((f, i) =>
                  i === index
                    ? { 
                        ...f, 
                        name: newFile.name,
                        document_name: newFile.name // Add this line
                      }
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
</IconButton>
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
        const response = await apiServices.replaceReconciliationFile(
          file?.version_id || file?.id,
          newFile
        );

        // FIXED: Update both name and document_name properties
        const updatedFileData = {
          name: newFile.name,
          document_name: newFile.name
        };

        setTableData(prev =>
          prev.map(row =>
            row.id === selectedRow?.id
              ? {
                  ...row,
                  [selectedType]: row[selectedType].map((f, i) =>
                    i === index
                      ? { ...f, ...updatedFileData }
                      : f
                  ),
                }
              : row
          )
        );

        setSelectedRow(prev =>
          prev
            ? {
                ...prev,
                [selectedType]: prev[selectedType].map((f, i) =>
                  i === index
                    ? { ...f, ...updatedFileData }
                    : f
                ),
              }
            : prev
        );

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