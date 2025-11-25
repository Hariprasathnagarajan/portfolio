import React, { useState, useEffect,useRef } from "react";
import { useLocation } from "react-router-dom";
import DoubleChatIcon from "./DoubleChatIcon"; // adjust path as needed
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import axios from "axios";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DownloadIcon from "@mui/icons-material/Download";
import { API_URL,API_URL1 } from "../../ApiServices/ApiServices"; 
import SearchIcon from '@mui/icons-material/Search';
import { Download } from 'lucide-react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';    
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  OutlinedInput,
} from "@mui/material";

import ChatBox from "../ChatBox";
const years = [2025, 2024, 2023];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const BASEURL = API_URL1;
const statusOptions = ["All", "Closed", "In Progress", "Open"];
const headCells = [
  { id: "month", label: "Duration", align: "left", width: "10%" },
  { id: "date", label: "Updated Date", align: "left", width: "15%" },
  { id: "stock", label: "Stock ", align: "left", width: "15%" },
  { id: "customs", label: "Customs ", align: "left", width: "15%" },
  {
    id: "reconciliation",
    label: "Reconciliation",
    align: "left",
    width: "15%",
  },
  { id: "status", label: "Status", align: "center", width: "10%" },
  { id: "actions", label: "Chat", align: "center", width: "5%" },
];

function EnhancedTableHead({ order, orderBy, onRequestSort, headCells }) {
  const theme = useTheme();
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead
      sx={{
        background: theme.palette.grey[100],
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <TableRow>
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
      case "Closed":
        return { bg: "#E8F5E9", text: "#2E7D32" };
      case "In Progress":
        return { bg: "#FFF8E1", text: "#FF8F00" };
      case "Open":
        return { bg: "#FFEBEE", text: "#C62828" };
      case "NA":
        return { bg: "#F5F5F5", text: "#757575" };
      default:
        return { bg: "#E3F2FD", text: "#1565C0" };
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
function ReconciliationAudit() {
  const theme = useTheme();
  const location = useLocation();
  const { organization, organization_code } = location.state || {};
  const [year, setYear] = React.useState(2025);
  const [monthFilter, setMonthFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [currentDocument, setCurrentDocument] = React.useState(null);
  const [messages, setMessages] = React.useState({});
  const [data, setData] = useState([]);
   const [activeChatRow, setActiveChatRow] = useState(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
const filteredData = data.filter((row) => {
  const matchesSearch =
    (row.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.month || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.updated_at || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.stock || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.customs || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.reconciliation || "").toLowerCase().includes(searchTerm.toLowerCase());

  const matchesFilter =
    (monthFilter === "All" || row.month === monthFilter) &&
    (statusFilter === "All" || row.status === statusFilter);

  const matchesDate =
    !selectedDate ||
    (row.updated_at &&
      new Date(row.updated_at).toDateString() ===
        new Date(selectedDate).toDateString());

  return matchesFilter && matchesSearch && matchesDate;
});


  const sortedData = filteredData.sort((a, b) => {
    const valA = (a[orderBy] || "").toLowerCase();
    const valB = (b[orderBy] || "").toLowerCase();
    return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const navigate = useNavigate();
  const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem("token"); // Or however you store it
        const response = await axios.get(
          `${API_URL}reconciliation-documents/${organization}/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        console.log("Fetched reconciliation documents:", response.data);
        const enhanced = response.data.map((doc) => {
          const stockFile = doc.files.find(
            (f) => f.file_type === "Reconciliation Stock"
          );
          const customsFile = doc.files.find(
            (f) => f.file_type === "Reconciliation Customs"
          );
          const summaryFile = doc.files.find(
            (f) => f.file_type === "Reconciliation Summary"
          );

          let status = doc.status;

          return {
            ...doc,
            status,
            stock: stockFile ? stockFile.file : "-",
            customs: customsFile ? customsFile.file : "-",
            reconciliation: summaryFile ? summaryFile.file : "-",
            updated_at: doc.updated_at || null,
            hasUnread: false,
          };
        });

        setData(enhanced);
      } catch (error) {
        console.error("Failed to fetch reconciliation documents:", error);
      }
    };

    if (organization) fetchDocuments();
  }, [organization]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedDate(null);
    setPage(0);
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
  
  const [openFileList, setOpenFileList] = useState(null);

  const handleViewFiles = (type, files, status) => {
    setOpenFileList({ type, files, status, allFiles: files });
  };

const handleViewAllDocuments = async (list) => {
  if (list?.allFiles?.length > 0) {
    for (const f of list.allFiles) {
      try {
        // Remove leading slash if exists
        const cleanFilePath = f.file.startsWith("/")
          ? f.file.substring(1)
          : f.file;
        const fileUrl = `${BASEURL}${cleanFilePath}`;
        const response = await fetch(fileUrl, {
          method: "GET",
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        // Open in new tab
        window.open(blobUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error(`❌ Failed to open file ${f.file}:`, error);
      }
    }
  }
};

const handleDownload = async (fileUrl) => {
    try {
      // Remove any double slashes except after 'http(s):'
      const normalizedUrl = `${BASEURL}${fileUrl}`.replace(/([^:]\/)\/+/g, "$1");
      const response = await fetch(normalizedUrl, {
        headers: { Authorization: `Token ${localStorage.getItem("token")}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileUrl.split("/").pop();
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const handleApproval = (id, status) => {
    console.log(`Approval clicked for ${id} with status ${status}`);
  };

  const openRejectDialog = (id) => {
    console.log(`Reject clicked for ${id}`);
  };

  const isLoading = false; // can hook into actual state later

  const handleCloseFileList = () => {
    setOpenFileList(null);
  };
const tableContainerRef = useRef(null);
const handleOpenChat = (doc) => {
  setCurrentDocument(doc);
  setActiveChatRow(doc.id);

  if (!messages[doc.id]) {
    setMessages((prev) => ({
      ...prev,
      [doc.id]: [],
    }));
  }

  setChatOpen(true);

  // Use a slightly longer timeout to ensure DOM is ready
  setTimeout(() => {
    const rowElement = document.getElementById(`row-${doc.id}`);
    if (rowElement) {
      // First, center the row vertically
      rowElement.scrollIntoView({ 
        behavior: "smooth", 
        block: "center",
        inline: "start"
      });
      
      // Then scroll the table container to the far right
      setTimeout(() => {
        if (tableContainerRef.current) {
          // Force scroll to the maximum right position
          tableContainerRef.current.scrollLeft = tableContainerRef.current.scrollWidth;
        }
      }, 300);
    }
  }, 100);
};


  const handleCloseChat = () => {
    setChatOpen(false);
    setActiveChatRow(null); 
  };

  const [openChatId, setOpenChatId] = React.useState(null);
  const handleSendMessage = (docId, message, mode) => {
    const currentMessages = messages[docId] || [];
    // Handle case where messages[docId] is undefined

    // If the message is a file, handle it differently
    if (message.file) {
      const newMessage = {
        id: currentMessages.length + 1,
        sender: message.sender,
        message: message.message,
        time: message.time,
        isUser: message.isUser,
        senderType: message.senderType,
        file: message.file, // Include the file in the message
      };

      setMessages((prev) => ({
        ...prev,
        [docId]: [...currentMessages, newMessage],
      }));
    } else {
      const newMessage = {
        id: currentMessages.length + 1,
        sender: "You",
        message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isUser: true,
        senderType: mode === "auditor" ? "auditor" : "user",
      };

      setMessages((prev) => ({
        ...prev,
        [docId]: [...currentMessages, newMessage],
      }));
    }
  };
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

const handleOpenBlobFile = async (fileUrl) => {
    try {
      // Remove any double slashes except after 'http(s):'
      const normalizedUrl = fileUrl.replace(/([^:]\/)\/+/g, "$1");
      const response = await fetch(normalizedUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening blob file:", error);
    }
  };
  return (
    <Box
      sx={{
        padding: "20px",
        position: "absolute",
        top: "75px",
        pr: 3,
        boxSizing: "border-box",
      }}
    >
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
    width: chatOpen ? "calc(100% - 350px)" : "96%",
    transition: "width 0.3s ease",
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
                onClick={() => navigate("/AuditReconcilation")}
                sx={{ cursor: "pointer", fontWeight: 600, fontSize: "14px" }}
              >
                Reconciliation Audit Status
              </Link>

              <Typography
                color="text.primary"
                sx={{ fontWeight: 600, fontSize: "14px" }}
              >
                Reconciliation Audit
              </Typography>
            </Breadcrumbs>
          </Box>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#000",
              }}
            >
              <Box component="span" sx={{ color: theme.palette.text.secondary }}>
                Organization:
              </Box>{" "}
              {organization || "N/A"}
            </Typography>
            <Typography
              sx={{
                
                fontSize: "14px",
                fontWeight: 600,
                color: "#000",
              }}
            >
              <Box component="span" sx={{ color: theme.palette.text.secondary }}>
                Code:
              </Box>{" "}
              {organization_code || "N/A"}
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
          width: chatOpen ? "calc(100% - 325px)" : "96%",
          transition: "width 0.3s ease",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >

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

<TableContainer
  ref={tableContainerRef}
  sx={{ 
    width: "100%", 
    maxHeight: "327px", 
    overflowY: "auto",
    overflowX: "auto"
  }}
>
          <Table size="small">
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
  id={`row-${row.id}`}   // ✅ add this
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
  {row.updated_at
    ? new Date(row.updated_at).toLocaleDateString("en-GB") // forces DD/MM/YYYY
    : "-"}
</TableCell>

                  {/* Stock Report */}
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.stock !== "-" ? (
                      <Button
  size="small"
  variant="text"
  startIcon={<FolderOpenIcon />}
  onClick={() =>
    handleViewFiles(
      "Stock ",
      row.files.filter((f) => f.file_type === "Reconciliation Stock"),
      row.status
    )
  }
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

                  {/* Customs Report */}
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.customs !== "-" ? (
                    <Button
  size="small"
  variant="text"
  startIcon={<FolderOpenIcon />}
  onClick={() =>
    handleViewFiles(
      "Customs ",
      row.files.filter((f) => f.file_type === "Reconciliation Customs"),
      row.status
    )
  }
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

                  {/* Reconciliation */}
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.reconciliation !== "-" ? (
<Button
  size="small"
  variant="text"
  startIcon={<FolderOpenIcon />}
  onClick={() =>
    handleViewFiles(
      "Reconciliation summary",
      row.files.filter((f) => f.file_type === "Reconciliation Summary"),
      row.status
    )
  }
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
                            invisible={
                              !(
                                row.hasUnread ||
                                row.status === "Pending with Auditor" ||
                                row.status === "Pending with Client"
                              )
                            }
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
          sx={{
            fontSize: "12px",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              fontSize: "12px",
            },
          }}
        />
      </Card>

      {}

      <ChatBox
              open={chatOpen}
              org = {organization_code}
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

<Dialog open={!!openFileList} onClose={handleCloseFileList} maxWidth="sm" fullWidth>
  <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <span>{openFileList?.type} Files</span>
    <Box>
      <Button
        variant="contained"
        size="small"
        onClick={() => handleViewAllDocuments(openFileList)}
        sx={{ fontSize: "12px", textTransform: "none", mr: 1 }}
      >
        📂 View All
      </Button>
      <IconButton
        aria-label="close"
        onClick={handleCloseFileList}
        sx={{
          color: (theme) => theme.palette.grey[500],
        }}
      >
   
      </IconButton>
    </Box>
  </DialogTitle>
  <DialogContent dividers>
    {openFileList?.files?.length > 0 ? (
      openFileList.files.map((file, index) => {
        const fileUrl = `${BASEURL}${file.file}`;
        const isPDF = fileUrl.toLowerCase().endsWith(".pdf");
        
        return (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Typography fontSize="14px">{file.file.split("/").pop()}</Typography>
            
            <Box display="flex" gap={1}>
              {/* View Button for PDFs */}
              {isPDF && (
                <Tooltip title="View">
                                                                       <IconButton
                                                                           size="small"
                    onClick={() => handleOpenBlobFile(fileUrl)}
                    sx={{
                                                                                   color: theme.palette.primary.main,
                                                                                   '&:hover': {
                                                                                       backgroundColor: theme.palette.primary.light,
                                                                                   },
                                                                               }}
                                                                           >
                                                                               <SearchIcon fontSize="small" />
                                                                           </IconButton>
                                                                       </Tooltip>
              )}
              
              {/* Download Button */}
              <Tooltip title="Download">
                                                                    <IconButton
                                                                        size="small"
                  onClick={() => handleDownload(file.file)}
                 
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
              
              {/* Approve/Reject if Pending */}
              {file.status === "Pending" && (
                <>
                  <Tooltip title="Approve">
                    <IconButton
                      color="success"
                      onClick={() => handleApproval(file.id, "Approved")}
                      size="small"
                      disabled={isLoading}
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      color="error"
                      onClick={() => openRejectDialog(file.id)}
                      size="small"
                      disabled={isLoading}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        );
      })
    ) : (
      <Typography>No files available</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseFileList} color="primary">
      Close
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}

export default ReconciliationAudit;