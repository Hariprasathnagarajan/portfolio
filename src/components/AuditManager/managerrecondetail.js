import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import DoubleChatIcon from './DoubleChatIcon'; // adjust path as needed
import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from "@mui/icons-material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';    
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { API_URL } from '../../ApiServices/ApiServices'; // Adjust the import path as needed
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
  TextField,
  IconButton,
  Tooltip,
  Stack,
  Button,
  TableSortLabel,
  useTheme,
  TablePagination,
  InputAdornment,
  Badge,
  OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  MenuItem
} from "@mui/material";
import axios from "axios";
import apiServices from "../../ApiServices/ApiServices";

import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import ChatBox from "../ChatBox";

const years = [2025, 2024, 2023];
const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];
const statusOptions = ["All", "Closed", "In-Progress", "Open", "NA"];

const headCells = [
  { id: "month", label: "Duration", align: "left", width: "10%" },
  { id: "date", label: "Updated Date", align: "left", width: "15%" },
  { id: "stock", label: "Stocks", align: "left", width: "15%" },
  { id: "customs", label: "Customs", align: "left", width: "15%" },
  { id: "reconciliation", label: "Reconciliation", align: "left", width: "15%" },
  { id: "status", label: "Status", align: "center", width: "10%" },
  { id: "actions", label: "Chat", align: "center", width: "5%" },
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
        case 'in-Progress':return { bg: '#FFF8E1', text: '#FF8F00' };
       case 'in Progress':return { bg: '#FFF8E1', text: '#FF8F00' };
      case 'in-progress':return { bg: '#FFF8E1', text: '#FF8F00' };
      case 'in progress':return { bg: '#FFF8E1', text: '#FF8F00' };
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

// StatusIndicator component for file dialog
const StatusIndicator = ({ status, children }) => {
  const colors = {
    Approved: { bg: "#E8F5E9", color: "#2E7D32" },
    Pending: { bg: "#FFF8E1", color: "#FF8F00" },
    Rejected: { bg: "#FFEBEE", color: "#C62828" },
    "N/A": { bg: "#F5F5F5", color: "#757575" },
  };
  const style = colors[status] || colors["N/A"];

  return (
    <Box
      sx={{
        display: "inline-block",
        px: 1.5,
        py: 0.5,
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {children}
    </Box>
  );
};

function ReconciliationAudit() {
  const theme = useTheme();
  const location = useLocation();
  const { organization, username } = location.state || {
    organization: "ABC Corporation",
    organization_code: "ORG-1234567890"
  };

  // ✅ Hooks
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [messages, setMessages] = useState({});
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileDialogTitle, setFileDialogTitle] = useState("");
  const [fileDialogFiles, setFileDialogFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search input
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [fileDialogStatus, setFileDialogStatus] = useState("");
  const navigate = useNavigate();
const BASEURL = "http://localhost:8000";
  // ✅ fetch data
  useEffect(() => {
    fetchManagerReconciliationReports();
  }, []);

  // helper to extract proper filename
  const getFileName = (f) => {
    if (f.name) return f.name; // backend may already provide name
    if (f.file) return f.file.split("/").pop(); // extract from file path
    if (f.url) return f.url.split("/").pop();   // fallback if url exists
    return "Unnamed File";
  };

  const fetchManagerReconciliationReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!organization) return;

      const response = await axios.get(
        `${API_URL}reconciliation-documents/${organization}/`,
        { headers: { Authorization: `Token ${token}` } }
      );

      const normalizedData = response.data.map(item => {
        // split files by type
        const stockFiles = (item.files || []).filter(f => f.file_type === "Reconciliation Stock");
        const customFiles = (item.files || []).filter(f => f.file_type === "Reconciliation Customs");
        const reconciliationFiles = (item.files || []).filter(f => f.file_type === "Reconciliation Summary");

        // map them with proper names + urls
        const formatFile = (f) => ({
          id: f.id,
          name: getFileName(f),
          url: f.url || f.file,   // backend may send `url` or `file`
          file_type: f.file_type
        });

        return {
          ...item,
          reconciliation: item.reconciliation
            ? (Array.isArray(item.reconciliation) ? item.reconciliation : [item.reconciliation])
            : [],
          stock_files: stockFiles.map(formatFile),
          custom_files: customFiles.map(formatFile),
          reconciliation_files: reconciliationFiles.map(formatFile),
        };
      });

      console.log("Manager reconciliation data:", normalizedData);
      setData(normalizedData);

    } catch (error) {
      console.error("Error fetching manager reconciliation reports:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(row => {
    const matchesSearch =
      (row.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.start_month || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.updated_at || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.status || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      statusFilter === "All" || row.status === statusFilter;

  const matchesDate =
    !selectedDate ||
    (row.updated_at &&
      new Date(row.updated_at).toDateString() ===
        new Date(selectedDate).toDateString());

  return matchesFilter && matchesSearch && matchesDate;

  });

  // ✅ File handlers
  const handleOpenReconFile = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
      if (!fileId) {
        alert("Missing file ID.");
        return;
      }
      const url = `${API_URL}reconciliation-files/view-secure-pdf/${fileId}/`;
      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });
      const fileBlob = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(fileBlob);
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error opening file:", error);
      alert("Failed to open file.");
    }
  };

  const handleDownloadReconFile = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("token");
      if (!fileId) {
        alert("Missing file ID.");
        return;
      }
      const url = `${API_URL}reconciliation-files/download/${fileId}/`;
      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute("download", fileName || "file.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file.");
    }
  };

  const sortedData = filteredData.sort((a, b) => {
    const valA = (a[orderBy] || "").toString().toLowerCase();
    const valB = (b[orderBy] || "").toString().toLowerCase();
    return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedDate(null);
    setPage(0);
  };
  const handleOpenChat = (document) => {
    setCurrentDocument(document);
    if (!messages[document.id]) {
      setMessages(prev => ({
        ...prev,
        [document.id]: []
      }));
    }
    setChatOpen(true);
  };

  const handleCloseChat = () => setChatOpen(false);

  const handleSendMessage = (docId, message, mode) => {
    const currentMessages = messages[docId] || [];
    const newMessage = {
      id: currentMessages.length + 1,
      sender: "You",
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
      senderType: mode === 'auditor' ? 'auditor' : 'user'
    };
    setMessages(prev => ({
      ...prev,
      [docId]: [...currentMessages, newMessage]
    }));
  };

  // New function to handle opening blob files
  const handleOpenBlobFile = async (fileUrl) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(fileUrl, {
        headers: { Authorization: `Token ${token}` },
      });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening blob file:", error);
    }
  };
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setSearchQuery(event.target.value); // <-- update searchQuery
    setPage(0);
  };
  const handleReset = () => {
    setSearchQuery('');
    setSearchTerm('');
    setStatusFilter('All');
    setPage(0);
  };

  // New function to handle downloading files
const handleDownload = async (fileUrl, fileName) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}${fileUrl}`, {
      headers: { Authorization: `Token ${token}` },
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || fileUrl.split("/").pop();
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed", error);
    alert("Failed to download file.");
  }
};

  // New function to handle viewing all files
  const handleViewAllDocuments = async (files) => {
    if (files?.length > 0) {
      for (const f of files) {
        try {
          await handleOpenReconFile(f.id);
        } catch (error) {
          console.error(`❌ Failed to open file:`, error);
        }
      }
    }
  };

  // Modified function to open file dialog
  const handleOpenFileDialog = (title, files, status) => {
    setFileDialogTitle(title);
    setFileDialogFiles(files);
    setFileDialogStatus(status);
    setFileDialogOpen(true);
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
              <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ fontSize: "12px" }}
              >
                <Link
                  underline="hover"
                  color="inherit"
                  onClick={() => navigate('/ManagerReconciliation')}
                  sx={{ cursor: 'pointer', fontWeight: 600, fontSize: "14px" }}
                >
                  Manager Reconciliation
                </Link>
                <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "14px" }}>
                  Reconciliation Declaration status
                </Typography>
              </Breadcrumbs>
            </Box>
            <Box sx={{ display: "flex", gap: 3 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>
                <Box component="span" sx={{ color: theme.palette.text.secondary }}>Organization:</Box> {organization || "N/A"}
              </Typography>
              <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#000" }}>
                <Box component="span" sx={{ color: theme.palette.text.secondary }}>Code:</Box> {username || "N/A"}
              </Typography>
            </Box>
          </Box>
        </Box>
        {/* Table */}
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
                    <Box display="flex" justifyContent="space-between" alignItems="center">
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

            <Stack direction="row" spacing={2} zIndex={0}>
              <TextField
                select
                label="Status"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 140, fontSize: "12px" }}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Box>
          <TableContainer sx={{ maxHeight: "327px", overflowY: "auto" }}>
            <Table size="small">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={() => { }}
                headCells={headCells}
              />
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontSize: "12px" }}>
                      {row.start_month && row.start_year && row.end_month && row.end_year
                        ? `${row.start_month.slice(0, 3)}/${row.start_year} - ${row.end_month.slice(0, 3)}/${row.end_year}`
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "12px" }}>
                      {row.updated_at
                        ? new Date(row.updated_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })
                        : "-"}
                    </TableCell>
                    {/* Stock Files */}
                    <TableCell>
                      {row.stock_files?.length > 0 ? (
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<FolderOpenIcon />}
                          onClick={() => handleOpenFileDialog("Stock Report", row.stock_files, row.status)}
                          sx={{
                            textTransform: "none",
                            color: "#1976d2",
                            "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                          }}
                        >
                          View
                        </Button>
                      ) : "-"}
                    </TableCell>
                    {/* Customs */}
                    <TableCell>
                      {row.custom_files?.length > 0 ? (
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<FolderOpenIcon />}
                          onClick={() => handleOpenFileDialog("Customs Report", row.custom_files, row.status)}
                          sx={{
                            textTransform: "none",
                            color: "#1976d2",
                            "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                          }}
                        >
                          View
                        </Button>
                      ) : "-"}
                    </TableCell>
                    {/* Reconciliation */}
                    <TableCell>
                      {row.reconciliation_files?.length > 0 ? (
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<FolderOpenIcon />}
                          onClick={() => handleOpenFileDialog("Reconciliation Files", row.reconciliation_files, row.status)}
                          sx={{
                            textTransform: "none",
                            color: "#1976d2",
                            "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.08)" },
                          }}
                        >
                          View
                        </Button>
                      ) : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ChatBox">
                        <IconButton size="small" onClick={() => handleOpenChat(row)}>
                          <Badge color="error" variant="dot">
                            <DoubleChatIcon fontSize="small" />
                          </Badge>
                        </IconButton>
                      </Tooltip>
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
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              fontSize: "12px",
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                fontSize: "12px",
              },
            }}
          />
        </Card>
   
      {/* Chat Box on Right */}
      {chatOpen && (
        <Box sx={{ flex: 0.3, borderLeft: "1px solid #ddd", bgcolor: "#fafafa" }}>
<ChatBox
  open={chatOpen}
  onClose={handleCloseChat}
  chatMessages={currentDocument ? messages[currentDocument.id] || [] : []}
  currentDocument={currentDocument}
  onSendMessage={handleSendMessage}

  // ✅ FIX
  source="reconciliation"
  threadId={null}
  username={
              currentDocument && currentDocument.start_month && currentDocument.start_year && currentDocument.end_month && currentDocument.end_year
                ? `${currentDocument.start_month.slice(0, 3)}/${currentDocument.start_year} - ${currentDocument.end_month.slice(0, 3)}/${currentDocument.end_year}`
                : "-"
            }               // org UUID// should contain report.id (UUID!)
  reportId={currentDocument?.id}    // explicitly pass UUID
/>

        </Box>
      )}

      {/* File Dialog - Updated to match ReconciliationAudit.js */}
      <Dialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          <span>{fileDialogTitle}</span>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleViewAllDocuments(fileDialogFiles)}
            sx={{ fontSize: "12px", textTransform: "none", mr: 1 }}
          >
            📂 View All
          </Button>
        </DialogTitle>

        <DialogContent>
          {fileDialogFiles?.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: "12px", fontWeight: "bold" }}>
                      File Name
                    </TableCell>
                    <TableCell sx={{ fontSize: "12px", fontWeight: "bold" }}>
                      Document Type
                    </TableCell>
                    <TableCell sx={{ fontSize: "12px", fontWeight: "bold" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontSize: "12px", fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fileDialogFiles.map((f, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontSize: "12px" }}>
                        {f.name || f.url?.split("/").pop() || "Unnamed File"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "12px" }}>
                        {f.file_type || "-"}
                      </TableCell>
                      <TableCell>
                        <StatusIndicator status={fileDialogStatus}>
                          {fileDialogStatus}
                        </StatusIndicator>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          {/* View File */}
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenReconFile(f.id)}
                            size="small"
                            sx={{
                              color: theme.palette.primary.main,
                              "&:hover": {
                                backgroundColor: theme.palette.primary.light,
                              },
                            }}
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>

                          {/* Download File */}
                          <IconButton
                            color="success"
                           onClick={() => handleDownload(f.url, f.name)}
                            size="small"
                            sx={{
                              color: theme.palette.success.main,
                              "&:hover": {
                                backgroundColor: theme.palette.success.light,
                              },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No files available</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setFileDialogOpen(false)} sx={{ fontSize: "12px" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReconciliationAudit;