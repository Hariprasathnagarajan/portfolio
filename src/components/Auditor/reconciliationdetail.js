import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useLocation } from 'react-router-dom';
import SyncIcon from '@mui/icons-material/Sync';
import axios from "axios";
import apiServices from '../../ApiServices/ApiServices';
import DoubleChatIcon from './DoubleChatIcon'; // adjust path as needed
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { FaUpload } from 'react-icons/fa';
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { DeleteIcon, Download } from 'lucide-react';
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ChatBox from "../ChatBox";
import { Sync } from "@mui/icons-material";
import { API_URL } from '../../ApiServices/ApiServices'; // Adjust the import path as needed
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, Send as SendIcon, Add as AddIcon } from "@mui/icons-material"; // Import AddIcon
import { Box,Table,Card,TableBody,TableCell,TableContainer,TableRow,TableHead,Paper,TextField,IconButton,Tooltip,Stack,Button,TableSortLabel,useTheme,TablePagination,InputAdornment,Avatar,Divider,List,ListItem,ListItemAvatar,ListItemText,Badge,OutlinedInput} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";// Adjust the import path as needed
import { format } from "date-fns";
// Safely parse incoming date strings (DD/MM/YYYY, DD-MM-YYYY, ISO, etc.)
const parseDate = (value) => {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value)) return value;

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const parts = String(value).split(/[-/]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d)) return d;
  }

  // Fallback
  const d2 = new Date(value);
  return isNaN(d2) ? null : d2;
};

// Normalize to yyyy-mm-dd for reliable comparison
const toYMD = (date) => (date ? format(date, "yyyy-MM-dd") : null);

// Function to determine status based on stock, customs, and reconciliation
const getDocumentStatus = (stock, customs, reconciliation) => {
  const hasStock = stock && stock !== "-";
  const hasCustoms = customs && customs !== "-";
  const hasReconciliation = reconciliation && reconciliation !== "-";

  const hasViewedStock = hasStock && typeof stock === "string" && stock.startsWith("Viewed: ");
  const hasViewedCustoms = hasCustoms && typeof customs === "string" && customs.startsWith("Viewed: ");

  if (hasReconciliation) {
    return "Closed";
  }

  if (hasViewedStock && hasViewedCustoms) {
    return "In Progress";
  }

  if (hasStock || hasCustoms) {
    return "Open";
  }

  return "-";
};


const headCells = [
  // Removed: { id: "name", label: "Document Name", align: "left", width: "12%" },
  { id: "month", label: "Duration", align: "left", width: "10%" },
  { id: "date", label: "Updated Date", align: "left", width: "8%" },
  { id: "stock", label: "Stock", align: "left", width: "16%" },
  { id: "customs", label: "Customs ", align: "left", width: "16%" },
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
            sx={{
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
      default: return { bg: "#E3F2FD", text: "#1565C0" };
    }
  };

  const colors = getStatusColor();

  return (
    <Box
      sx={{
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

function ReconciliationAuditor() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { organization, username } = location.state || {}; // Get the passed state
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false);
  const [fileToReplace, setFileToReplace] = useState(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileDialogTitle, setFileDialogTitle] = useState("");
  const [fileDialogFiles, setFileDialogFiles] = useState([]);
  const [recAnchorEl, setRecAnchorEl] = useState(null);
  const [selectedRecRow, setSelectedRecRow] = useState(null);
  const [recFileDialogOpen, setRecFileDialogOpen] = useState(false);
  const [recEditDialogOpen, setRecEditDialogOpen] = useState(false);
  const [recDeleteDialogOpen, setRecDeleteDialogOpen] = useState(false);
  const [recFileDialogFiles, setRecFileDialogFiles] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedType, setSelectedType] = useState(""); // 'stock' or 'customs'
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [activeChatRow, setActiveChatRow] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
  const handleReplaceClick = (rowId, fileIndex) => {
    setFileToReplace({ rowId, fileIndex });
    setReplaceDialogOpen(true);
  };
  
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


 const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedDate(null);
  };


  const handleReplaceConfirm = (event) => {
    setReplaceDialogOpen(false);
    if (fileToReplace) {
      handleReconciliationUpload(event, fileToReplace.rowId, true);
    }
  };
  // Initialize data as an empty array

  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [messages, setMessages] = useState({});
  const [uploadMessage, setUploadMessage] = useState(null);

  const [data, setData] = useState([]);
const handleViewAllFiles = () => {
  if (!Array.isArray(fileDialogFiles) || fileDialogFiles.length === 0) {
    alert("No files to view.");
    return;
  }

  const token = localStorage.getItem("token");

  fileDialogFiles.forEach(async (file) => {
    if (!file || !file.id) return;

    try {
      const url = `${backendBaseUrl}reconciliation-files/view-secure-pdf/${file.id}/`;

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
    }
  });
};
// Add this fetch function near your other state declarations
const fetchReconciliationData = useCallback(async () => {
  const token = localStorage.getItem('token');
  if (!organization) return;

  try {
    const response = await axios.get(`${API_URL}auditor/reconciliation-reports/org/${organization}/`, {
      headers: { Authorization: `Token ${token}` }
    });
    
    // Normalize reconciliation data to always be an array
    const normalizedData = response.data.map(item => ({
      ...item,
      reconciliation: item.reconciliation 
        ? (Array.isArray(item.reconciliation) ? item.reconciliation : [item.reconciliation])
        : []
    }));
    
    console.log("Refetched reconciliation reports:", normalizedData);
    setData(normalizedData);
  } catch (err) {
    console.error("Error refetching reconciliation reports:", err);
  }
}, [organization]);

// Update your useEffect to use this function
useEffect(() => {
  fetchReconciliationData();
}, [fetchReconciliationData]);

// Modify the handleReconciliationUpload function to call fetch after success
const handleReconciliationUpload = async (event, rowId, isReplacement = false) => {
  const file = event.target.files[0];
  const organizationName = organization;
  const token = localStorage.getItem("token");

  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const endpoint = isReplacement
      ? `${API_URL}auditor/reconciliation-replace/${rowId}/`
      : `${API_URL}auditor/reconciliation-upload/org/${organizationName}/${rowId}/`;

    const response = await axios.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Token ${token}`,
      },
    });

    // ✅ Preserve backend's name, fallback only if missing
    const newFile = {
      ...response.data,
      name: response.data.name || response.data.file_name || file.name,
    };

    let updatedData;

    setData((prevData) => {
      updatedData = prevData.map((item) => {
        if (isReplacement) {
          if (Array.isArray(item.reconciliation)) {
            const fileIndex = item.reconciliation.findIndex((f) => f.id === rowId);
            if (fileIndex !== -1) {
              const newReconciliationArray = [...item.reconciliation];
              newReconciliationArray[fileIndex] = newFile;
              return { ...item, reconciliation: newReconciliationArray };
            }
          }
        } else if (item.id === rowId) {
          const existingFiles = Array.isArray(item.reconciliation) ? item.reconciliation : [];
          return {
            ...item,
            reconciliation: [...existingFiles, newFile],
            status: getDocumentStatus(item.stock, item.customs, "Uploaded"),
          };
        }
        return item;
      });
      return updatedData;
    });

    // ✅ Update dialog state with the latest data
    setFileDialogFiles(prevFiles => {
      const updatedRow = updatedData.find(d =>
        (d.reconciliation.some(f => f.id === newFile.id)) || (d.id === rowId)
      );
      return updatedRow ? updatedRow.reconciliation : prevFiles;
    });

    setSelectedRecRow(prevRow => {
      if (!prevRow) return null;
      const updatedRow = updatedData.find(d => d.id === prevRow.id);
      return updatedRow || prevRow;
    });

    setUploadMessage(isReplacement ? "File replaced successfully!" : "File uploaded successfully!");

    // ✅ AUTOMATIC REFRESH: Refetch data from server after successful upload
    fetchReconciliationData();

  } catch (err) {
    console.error("Error uploading file:", err);
    setUploadMessage(isReplacement ? "Error replacing file." : "Error uploading file.");
  }
};

// Also update the handleDeleteReconciliationFile to refresh after delete
const handleDeleteReconciliationFile = async (rowId, fileId) => {
  const token = localStorage.getItem("token");
  try {
    // ✅ Match backend route exactly
    await axios.delete(
      `${API_URL}auditor/reconciliation-delete/org/${fileId}/`,
      {
        headers: { Authorization: `Token ${token}` },
      }
    );

    // ✅ Update local state
    setData(prevData =>
      prevData.map(item =>
        item.id === rowId
          ? {
              ...item,
              reconciliation: item.reconciliation.filter(f => f.id !== fileId),
            }
          : item
      )
    );

    setRecFileDialogFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadMessage("File deleted successfully!");

    // ✅ AUTOMATIC REFRESH: Refetch data from server after successful delete
    fetchReconciliationData();

  } catch (err) {
    console.error("Error deleting file:", err);
    setUploadMessage("Error deleting file.");
  }
};

  const statusOptions = ["All", "Closed", "In Progress", "Open"];
const handleUpdateStatus = async (reportId, newStatus) => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.post(
      `${API_URL}reconciliation/${reportId}/status/`,
      { status: newStatus },
      { headers: { Authorization: `Token ${token}` } }
    );

    console.log("Status updated:", response.data);

    // ✅ Update local state immediately
    setData(prevData =>
      prevData.map(item =>
        item.id === reportId ? { ...item, status: newStatus } : item
      )
    );
  } catch (error) {
    console.error("Error updating status:", error);
  }
};
  const handleAddNewDocument = useCallback(() => {
    const newDocId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;

    // Simulate stock, customs, and reconciliation being uploaded by the client
    // Randomly decide if they are "uploaded" or not
    const isStockUploaded = Math.random() < 0.7; // 70% chance of being uploaded
    const isCustomsUploaded = Math.random() < 0.6; // 60% chance of being uploaded
    const isReconciliationUploaded = Math.random() < 0.5; // 50% chance of being uploaded

    const stock = isStockUploaded ? `Stock Report ${newDocId}` : "-";
    const customs = isCustomsUploaded ? `Customs Transaction ${newDocId}` : "-";
    const reconciliation = isReconciliationUploaded ? `Reconciliation Report ${newDocId}` : "-";

    const status = getDocumentStatus(stock, customs, reconciliation);

    // Date logic: only show current date if all three processes are "Closed"
    const newDate = (stock !== "-" && customs !== "-" && reconciliation !== "-")
      ? new Date().toLocaleDateString('en-GB')
      : "N/A"; // Format: DD/MM/YYYY

    const newDocument = {
      id: newDocId,
      name: `Document ${newDocId}`,
      month: "JUL 2025-SEP 2025", // Example duration
      date: newDate,
      stock: stock,
      customs: customs,
      reconciliation: reconciliation,
      updatedBy: "Client Upload", // Indicate client upload
      status: status,
      hasUnread: false
    };

    setData(prevData => [...prevData, newDocument]);
  }, [data]);

const filteredData = useMemo(() => {
  return data.filter((row) => {
    const formattedSearch = searchTerm.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      row.organization?.toLowerCase().includes(formattedSearch) ||
      row.username?.toLowerCase().includes(formattedSearch) ||
      row.status?.toLowerCase().includes(formattedSearch);

    const rowDate = parseDate(row.date);
    const selDate = parseDate(selectedDate);
    const matchesDate =
      !selDate || (rowDate && toYMD(rowDate) === toYMD(selDate));

    return matchesSearch && matchesDate;
  });
}, [data, searchTerm, selectedDate]);




  const sortedData = useMemo(() => {
    return filteredData.sort((a, b) => {
      const valA = a[orderBy]?.toLowerCase?.() || "";
      const valB = b[orderBy]?.toLowerCase?.() || "";
      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, order, orderBy]);

  const visibleRows = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const handleRequestSort = useCallback((event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  }, [order, orderBy]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  }, []);
// Replace your current fetchUnread useEffect with this:
// Replace your current fetchUnread useEffect with this:
useEffect(() => {
  const fetchUnread = async () => {
    try {
      const res = await apiServices.getUnreadMessages();
      const unreadThreads = res.unread_messages || [];
      
      console.log("🔍 FETCH UNREAD - Reconciliation threads only");
      
      setData(prevData =>
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
      setData(prevData => {
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

  const handleSendMessage = useCallback((docId, messageContent, mode) => {
    setMessages(prev => {
      const currentMessages = prev[docId] || [];
      let newMessage;

      if (messageContent.file) {
        newMessage = {
          id: currentMessages.length + 1,
          sender: messageContent.sender,
          message: messageContent.message,
          time: messageContent.time,
          isUser: messageContent.isUser,
          senderType: messageContent.senderType,
          file: messageContent.file
        };
      } else {
        newMessage = {
          id: currentMessages.length + 1,
          sender: "You",
          message: messageContent,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: true,
          senderType: mode === 'auditor' ? 'auditor' : 'user'
        };
      }
      return {
        ...prev,
        [docId]: [...currentMessages, newMessage]
      };
    });
  }, []);
  const backendBaseUrl = API_URL;
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

// In your useEffect where you fetch data, normalize the reconciliation field
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!organization) return;

  axios.get(`${API_URL}auditor/reconciliation-reports/org/${organization}/`, {
    headers: { Authorization: `Token ${token}` }
  })
  .then((res) => {
    // Normalize reconciliation data to always be an array
    const normalizedData = res.data.map(item => ({
      ...item,
      reconciliation: item.reconciliation 
        ? (Array.isArray(item.reconciliation) ? item.reconciliation : [item.reconciliation])
        : []
    }));
    console.log("Fetched reconciliation reports:", normalizedData);
    setData(normalizedData);
  })
  .catch((err) => {
    console.error("Error fetching reconciliation reports:", err);
  });
}, [organization]);

const renderFileDialog = () => (
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
          const fileName = typeof file === "string" ? file : file.name;
          const fileId = typeof file === "object" ? file.id : null;

          return (
            <Box key={file.id || index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {fileName}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleOpenReconFile(file.id)}
                sx={{
                  color: theme.palette.info.main,
                  '&:hover': { backgroundColor: theme.palette.info.light },
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
              <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={() => handleDownloadReconFile(file.id, file.name)}
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
          );
        })
      ) : (
        <Typography>No files uploaded.</Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setFileDialogOpen(false)}>Close</Button>
    </DialogActions>
  </Dialog>
);



  // A new dialog to handle file viewing, editing, and deleting.
  const renderReconciliationActionsDialog = () => {
    const filesToDisplay = Array.isArray(selectedRecRow?.reconciliation)
      ? selectedRecRow.reconciliation
      : [];

    return (
<Dialog
  open={recEditDialogOpen}
  onClose={() => setRecEditDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  {/* Title with Upload button aligned right */}
  <DialogTitle
    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
  >
    Reconciliation Files
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
          handleReconciliationUpload(e, selectedRecRow.id);
        }}
      />
    </Button>
  </DialogTitle>

  {/* File list */}
  <DialogContent dividers>
    {filesToDisplay.length > 0 ? (
      filesToDisplay.map((file, index) => (
        <Box
          key={file.id || index}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography fontSize="14px" fontWeight="500">
            {file.name || file.file_name || file.original_name || "Unnamed File"}
          </Typography>
          <Box display="flex" gap={1}>
            {/* Replace Button */}
           <IconButton
  size="small"
  color="warning"
  component="label"
>
  <SyncIcon fontSize="small" />
  <input
    type="file"
    hidden
    onChange={(e) => {
      handleReconciliationUpload(e, file.id, true);
    }}
  />
</IconButton>
          </Box>
        </Box>
      ))
    ) : (
      <Typography>No reconciliation files found.</Typography>
    )}
  </DialogContent>

  {/* Footer actions */}
  <DialogActions>
    <Button onClick={() => setRecEditDialogOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>

    );
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


      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ fontSize: '12px' }}
      >

      </Breadcrumbs>

      <Box
        sx={{
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
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >

          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ fontSize: "12px" }}
          >


            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate('/auditor-reconciliation', {
                state: { organization, username }
              })}
              sx={{ cursor: 'pointer', fontWeight: 600, fontSize: "14px" }}
            >
              Auditor Reconciliation
            </Link>

            <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "14px" }}>
              Reconciliation Details
            </Typography>
          </Breadcrumbs>



          <Box sx={{ display: "flex", gap: 3 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#000"
              }}
            >
              <Box component="span" sx={{ color: theme.palette.text.secondary }}>
                Organization:
              </Box> {organization}
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#000"
              }}
            >
              <Box component="span" sx={{ color: theme.palette.text.secondary }}>
                Code:
              </Box> {username}
            </Typography>
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
            {/* Plus Icon on the right side of the search bar */}

          </Box>

          <Stack direction="row" spacing={2} zIndex={0}>

            <TextField
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 140, fontSize: '12px' }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        {renderFileDialog()}
        {renderReconciliationActionsDialog()}
        <Menu
          anchorEl={recAnchorEl}
          open={Boolean(recAnchorEl)}
          onClose={() => setRecAnchorEl(null)}
        >
        {/* <MenuItem
  onClick={() => {
    // Re-fetch the row data to ensure it is the latest before opening the dialog
    const updatedRow = data.find(d => d.id === selectedRecRow.id);
    setFileDialogTitle(`Reconciliation Files`);
    setFileDialogFiles(updatedRow?.reconciliation || []);  // ✅ use main popup
    setFileDialogOpen(true);
    setRecAnchorEl(null);
  }}
>
  View File
</MenuItem> */}


          <MenuItem
            onClick={() => {
              setRecEditDialogOpen(true);
              setRecAnchorEl(null);
            }}
          >
            Edit File
          </MenuItem>

          <MenuItem
            onClick={() => {
              // This is also a placeholder for a delete dialog.
              setRecFileDialogFiles(selectedRecRow?.reconciliation || []);
              setRecDeleteDialogOpen(true);
              setRecAnchorEl(null);
            }}
          >
            Delete
          </MenuItem>
        </Menu>


        {/* Delete Dialog - Retained as it's separate from the new edit dialog */}
        <Dialog open={recDeleteDialogOpen} onClose={() => setRecDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Reconciliation Files</DialogTitle>
          <DialogContent dividers>
            {Array.isArray(recFileDialogFiles) && recFileDialogFiles.length > 0 ? (
              recFileDialogFiles.map((file, index) => (
                <Box key={file.id || index} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography fontSize="14px">{file.name}</Typography>

{/* Inside the recDeleteDialogOpen dialog */}
<IconButton
  size="small"
  color="error"
  onClick={() => handleDeleteReconciliationFile(selectedRecRow.id, file.id)}
>
  <DeleteForeverIcon fontSize="small" />
</IconButton>
                </Box>
              ))
            ) : (
              <Typography>No files found</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRecDeleteDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <TableContainer
          sx={{
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
            {replaceDialogOpen && (
              <Dialog open={replaceDialogOpen} onClose={() => setReplaceDialogOpen(false)}>
                <DialogTitle>Replace File</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to replace this file? The existing file will be permanently deleted.
                  </DialogContentText>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                    onChange={handleReplaceConfirm}
                    style={{ marginTop: '16px' }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setReplaceDialogOpen(false)}>Cancel</Button>
                </DialogActions>
              </Dialog>
            )}
            <TableBody>
              {visibleRows.map((row) => {
                const hasViewedStockOrCustoms =
                 (row.stock !== "-" && row.stock?.startsWith?.("Viewed: ")) &&
(row.customs !== "-" && row.customs?.startsWith?.("Viewed: "));


                return (
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
                  
<TableCell align="left">
  {row.date ? format(parseDate(row.date), "dd/MM/yyyy") : "N/A"}
</TableCell>

{/* Stock Cell */}
<TableCell sx={{ fontSize: "12px" }}>
  {Array.isArray(row.stock) && row.stock.length !== 0 ? (
    <Button
      size="small"
      variant="text"
      startIcon={<FolderOpenIcon />}
      onClick={async () => {
        try {
          setFileDialogTitle(`Stock Files`);
          // Use existing API endpoint
          const response = await axios.get(
            `${API_URL}auditor/reconciliation-reports/org/${organization}/`, 
            {
              headers: { Authorization: `Token ${localStorage.getItem("token")}` }
            }
          );
          
          // Find the specific row and get stock files
          const specificRow = response.data.find(item => item.id === row.id);
          const stockFiles = specificRow?.stock || [];
          
          setFileDialogFiles(Array.isArray(stockFiles) ? stockFiles : [stockFiles]);
          setFileDialogOpen(true);
          
          setData(prevData =>
  prevData.map(item => {
    if (item.id === row.id && item.status === "Open") {
      // ✅ Call backend API
      handleUpdateStatus(row.id, "In Progress");

      // ✅ Update UI immediately
      return { ...item, status: "In Progress" };
    }
    return item; // don’t forget this
  })
);
        } catch (error) {
          console.error("Error fetching stock files:", error);
          setFileDialogFiles([]);
          setFileDialogOpen(true);
        }
      }}
      sx={{
        textTransform: "none",
        color: "#1976d2",
        "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
      }}
    >
      View 
    </Button>
  ) : (
    "-"
  )}
</TableCell>

{/* Customs Cell */}
<TableCell sx={{ fontSize: "12px" }}>
  {Array.isArray(row.customs) && row.customs.length !== 0 ? (
    <Button
      size="small"
      variant="text"
      startIcon={<FolderOpenIcon />}
      onClick={async () => {
        try {
          setFileDialogTitle(`Customs Files`);
          const response = await axios.get(
            `${API_URL}auditor/reconciliation-reports/org/${organization}/`, 
            {
              headers: { Authorization: `Token ${localStorage.getItem("token")}` }
            }
          );
          
          const specificRow = response.data.find(item => item.id === row.id);
          const customsFiles = specificRow?.customs || [];
          
          setFileDialogFiles(Array.isArray(customsFiles) ? customsFiles : [customsFiles]);
          setFileDialogOpen(true);
          
          setData(prevData =>
  prevData.map(item => {
    if (item.id === row.id && item.status === "Open") {
      // ✅ Call backend API
      handleUpdateStatus(row.id, "In Progress");

      // ✅ Update UI immediately
      return { ...item, status: "In Progress" };
    }
    return item; // don’t forget this
  })
);
        } catch (error) {
          console.error("Error fetching customs files:", error);
          setFileDialogFiles([]);
          setFileDialogOpen(true);
        }
      }}
      sx={{
        textTransform: "none",
        color: "#1976d2",
        "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
      }}
    >
      View 
    </Button>
  ) : (
    "-"
  )}
</TableCell>
<TableCell sx={{ fontSize: "12px" }}>
  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
    {row.reconciliation && row.reconciliation.length > 0 ? (
      <>
        {/* If files exist → show View File */}
       <Button
  size="small"
  variant="text"
  startIcon={<FolderOpenIcon />}
  onClick={() => {
    // Use the new function to open the dialog
    const updatedRow = data.find(d => d.id === row.id);
    setFileDialogTitle(`Reconciliation Files `);
    setFileDialogFiles(updatedRow?.reconciliation || []);
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
            setRecAnchorEl(e.currentTarget);
            setSelectedRecRow(row);
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </>
    ) : (
      <>
        {/* If no files → show Upload */}
<Box display="flex" justifyContent="center">
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
      onChange={(e) => handleReconciliationUpload(e, row.id)}
    />
  </Button>
</Box>
      </>
    )}
  </Box>
</TableCell>


                    <TableCell align="center">
                      <StatusChip status={row.status} />
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
  invisible={!row.hasUnread}  // This should hide the dot when hasUnread is false
>
  <DoubleChatIcon fontSize="small" />
</Badge>
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

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
  org={username}
  currentDocument={{
    ...currentDocument,
    thread_type: 'Reconciliation',
  }}
  threadId={currentDocument?.id}
  onSendMessage={handleSendMessage}
  onClose={handleCloseChat}
  username={
    currentDocument &&
    currentDocument.start_month &&
    currentDocument.start_year &&
    currentDocument.end_month &&
    currentDocument.end_year
      ? `${currentDocument.start_month.slice(0, 3)}/${currentDocument.start_year} - ${currentDocument.end_month.slice(0, 3)}/${currentDocument.end_year}`
      : "-"
  }
  source="reconciliation"
/>

    </Box>
  );
}

export default ReconciliationAuditor;