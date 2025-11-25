import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import DoubleChatIcon from './DoubleChatIcon'; // adjust path as needed
import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import axios from 'axios';
import ChatBox from "../ChatBox";
import ListIcon from '@mui/icons-material/List';
import { API_URL } from '../../ApiServices/ApiServices'; // Adjust the import path as needed
import { Search as SearchIcon, Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";
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
  Badge, OutlinedInput,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const statusOptions = ["All", "Closed", "Pending With Client", "Pending With Auditor", "Open"];
const headCells = [
  { id: "declarationNum", label: "Declaration Number", align: "left", width: "17%" },
  { id: "declarationDate", label: "Declaration Date", align: "left", width: "15%" },
  { id: "issueCount", label: "Issue Count", align: "left", width: "8%" },
  { id: "auditorFinding", label: "Auditor Findings", align: "left", width: "13%" },
  { id: "auditorRemark", label: "Auditor Remarks", align: "left", width: "13%" },
  { id: "clientResponse", label: "Client Response", align: "left", width: "13%" },
  { id: "clientRemarks", label: "Client Remarks", align: "left", width: "10%" }, // Reduced from 12%
  { id: "status", label: "Status", align: "right", width: "8%" },
  { id: "actions", label: "Chat", align: "center", width: "10%" },
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
  const normalized = status?.toLowerCase();

  switch (normalized) {
    case "closed":
      return { bg: "#E8F5E9", text: "#2E7D32" };
    case "pending with client":
      return { bg: "#FFF8E1", text: "#FF8F00" };
    case "pending with auditor":
      return{ bg: "#F3E5F5", text: "#7B1FA2" };
    case "open":
      return { bg: "#FFEBEE", text: "#C62828" };
    case "na":
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



function CompanyDeclarationStatus() {
  const location = useLocation();
  const theme = useTheme();
  const [year, setYear] = React.useState(2025);
  const [monthFilter, setMonthFilter] = React.useState("All");
  const auditorFindingOptions = [
    { value: "Wrong Currency", label: "Wrong Currency" },
    { value: "Wrong CFI", label: "Wrong CFI" }
  ];
  const { organization, username, statusFilter: initialStatusFilter } = location.state || {};
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || "All");
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("declarationNum");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [currentDocument, setCurrentDocument] = React.useState(null);
  const [messages, setMessages] = React.useState({});
  const [tableData, setTableData] = useState([]);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search input
  const [activeChatRow, setActiveChatRow] = useState(null);
const [viewRemarkModalOpen, setViewRemarkModalOpen] = useState(false);
const [datePickerOpen, setDatePickerOpen] = React.useState(false);
const [viewRemarkText, setViewRemarkText] = useState("");
  // New state for Auditor Findings modal
  const [auditorFindingsModalOpen, setAuditorFindingsModalOpen] = useState(false);
  const [selectedAuditorFindings, setSelectedAuditorFindings] = useState([]);

const safeLower = (val) =>
  typeof val === "string" ? val.toLowerCase().trim() : "";

const filteredData = Array.isArray(tableData)
  ? tableData.filter((row) => {
      const matchesStatus =
        statusFilter === "All" ||
        (row.workflowStatuses || []).some(
          (ws) => safeLower(ws) === safeLower(statusFilter)
        );

      const matchesSearch = safeLower(row.declarationNumber).includes(
        safeLower(searchTerm)
      );
          const matchesDate =
        !selectedDate ||
        new Date(row.declarationDate).toDateString() ===
          new Date(selectedDate).toDateString();

      return matchesStatus && matchesSearch && matchesDate;
     
    })
  : [];

const normalizeStatus = (status) => {
  switch (status) {
    case "Open":
      return "open";
    case "Closed":
      return "closed";
    case "Pending With Auditor":
      return "pending_auditor";
    case "Pending With Client":
      return "pending_client";
    case "In Progress":
      return "in_progress";
    default:
      return undefined;
  }
};
 useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}declaration-status/`, {
          params: {
            organization: organization || "",
            username: username || "",
            status:
              statusFilter && statusFilter !== "All"
                ? normalizeStatus(statusFilter)
                : undefined,
          },
          headers: { Authorization: `Token ${token}` },
        });
let data = response.data.map((item) => {
  // Extract workflow statuses from findings
  const workflowStatuses = item.findings.map(f => f.workflow_status);
  
  // Get ALL findings (not just the first one)
  const allFindings = item.findings
    .filter(f => f.finding && f.finding !== "No Issues")
    .map(f => f.finding);

  return {
    id: item.id,
    declarationNum: item.declaration_number,
    declarationDate: item.date,
    issueCount: allFindings.length, // Use the actual count of findings

    // ✅ use workflow_status from findings if available, else from declaration
    workflowStatuses: workflowStatuses.length > 0 ? workflowStatuses : [item.workflow_status || "N/A"],
    status: workflowStatuses.length > 0 ? workflowStatuses[0] : (item.workflow_status || "N/A"),

    // ✅ Store ALL findings as an array
    auditorFindings: allFindings,
    auditorRemark: item.findings?.[0]?.auditor_remark || "-",
    clientResponse: item.findings?.[0]?.client_response || "-",
    clientRemarks: item.findings?.[0]?.client_remark || "-"
  };
});


console.log("statusFilter:", statusFilter);


if (statusFilter && statusFilter !== "All") {
  const sf = safeLower(statusFilter);

  data = data.filter((d) =>
    (d.workflowStatuses || []).some((ws) => safeLower(ws) === sf)
  );
}
console.log("data before filtering:", data);
        setTableData(data);
      } catch (error) {
        console.error("Error fetching declarations:", error);
      }
    };

    if (organization && username) {
      fetchData();
    }
  }, [organization, username, statusFilter]);

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
const handleClearSearch = () => {
  setSearchTerm('');
  setSelectedDate(null);
  setPage(0);
  // setSelected([]); // If you have a selection state, otherwise remove this line
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

const handleOpenChat = (doc) => {
  setCurrentDocument(doc);
  setActiveChatRow(doc.id);

  if (!messages[doc.id]) {
    setMessages(prev => ({
      ...prev,
      [doc.id]: []
    }));
  }

  setChatOpen(true);

  setTimeout(() => {
    const rowElement = window.document.getElementById(`row-${doc.id}`);
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "end" });
    }
  }, 100);
};

  const handleCloseChat = () => {
    setChatOpen(false);
  };
  const handleAuditorFindingChange = (id, newValue) => {
    setTableData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, auditorFinding: newValue } : item
      )
    );
  };

  const handleClientResponseChange = (id, newValue) => {
    setTableData(prevData =>
      prevData.map(item =>
        item.id === id ? { ...item, clientResponse: newValue } : item
      )
    );
  };

  const handleSendMessage = (docId, message, mode) => {
    const currentMessages = messages[docId] || [];

    if (message.file) {
      const newMessage = {
        id: currentMessages.length + 1,
        sender: message.sender,
        message: message.message,
        time: message.time,
        isUser: message.isUser,
        senderType: message.senderType,
        file: message.file
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

  const backendBaseUrl = API_URL;

  const handleDeclarationClick = async (declarationNumber) => {
    try {
      const token = localStorage.getItem("token");

      // Set the current document so the modal header can display its number
      setCurrentDocument(tableData.find(doc => doc.declarationNum === declarationNumber));

      const response = await axios.get(
        `${backendBaseUrl}declaration-documents/${declarationNumber}/`,
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );

      // Ensure response.data.documents is an array
      if (response.data && Array.isArray(response.data.documents)) {
        // Assume file_url from the backend response is already the direct secure PDF view URL
        setSelectedDocuments(response.data.documents.map(doc => ({
          file_name: doc.file_name,
          file_url: doc.file_url,
          declaration_number: response.data.declaration_number,
          version_id: doc.version_id  // This should be the secure PDF view URL from your backend
        })));
        setDocumentModalOpen(true);
      } else {
        console.warn("API response for documents is not in expected format or documents array is missing:", response.data);
        setSelectedDocuments([]); // Fallback to empty array
        setDocumentModalOpen(true); // Still open modal, but it will show "No documents"
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

  const handleOpenSpecificDocument = async (doc) => {
  try {
    const token = localStorage.getItem("token");

    if (!doc || !doc.declaration_number || !doc.version_id) {
      alert("Missing declaration_number or version_id.");
      return;
    }

    const url = `${API_URL}declaration-documents/${doc.declaration_number}/view-secure-pdf/${doc.version_id}/`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`
      },
      responseType: 'blob' // important: treat it as a file
    });

    const fileBlob = new Blob([response.data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(fileBlob);
    window.open(fileURL, '_blank');

  } catch (error) {
    console.error("Error opening secure PDF:", error);
    alert("Failed to open document. Please check your network or token.");
  }
};


  const handleCloseDocumentModal = () => {
    setDocumentModalOpen(false);
    setSelectedDocuments([]);
    setCurrentDocument(null); // Clear current document when closing modal
  };

  const navigate = useNavigate();

  // New function to open the auditor findings modal
const handleViewAuditorFindings = (findings) => {
  // Ensure findings is an array before setting it
  const findingsArray = Array.isArray(findings) ? findings : [findings];
  setSelectedAuditorFindings(findingsArray);
  setAuditorFindingsModalOpen(true);
};

  // New function to close the auditor findings modal
  const handleCloseAuditorFindingsModal = () => {
    setAuditorFindingsModalOpen(false);
    setSelectedAuditorFindings([]);
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
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ fontSize: "12px" }}
            >


              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigate('/companydash')}
                sx={{ cursor: 'pointer', fontWeight: 600, fontSize: "14px" }}
              >
                Organization Status
              </Link>

              <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "14px" }}>
                Organization Details
              </Typography>
            </Breadcrumbs>

          </Box>
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
          boxSizing: "border-box"
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
              sx={{ height: '35px', fontSize: '12px', borderRadius: '7px' }}
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
            width: "100%",
            maxHeight: "327px",
            overflowY: "auto",
            overflowX: "hidden",
            minWidth: chatOpen ? "900px" : "auto"
          }}
        >
          <Table
            size="small"
            sx={{
              minWidth: "100%",
              tableLayout: "fixed"
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
                  id={`row-${row.id}`}   // ✅ add this
                  hover
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
                    '&:hover': { backgroundColor: theme.palette.grey[100] },
                    ...(activeChatRow === row.id && { backgroundColor: '#e3f2fd !important' }),
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
    ? new Date(row.declarationDate).toLocaleDateString("en-GB") // DD/MM/YYYY
    : "N/A"}
</TableCell>

                  <TableCell
                    sx={{
                      fontSize: "12px",
                      paddingLeft: "14px",
                      textAlign: "center"
                    }}
                  >
                    {row.issueCount}
                  </TableCell>

                  {/* MODIFIED: Replaced text with a button */}
<TableCell align="center" sx={{ fontSize: "12px", textAlign: "center" }}>
  {row.issueCount > 0 && row.auditorFindings && row.auditorFindings.length > 0 ? (
    <Button
         variant="outlined"
         size="small"
         onClick={() => handleViewAuditorFindings(row.auditorFindings)}
          sx={{
                             fontSize: "11px",
                             textTransform: "none",
                             padding: "4px 10px",
                             minWidth: "100px",
                           }}
                         >
         View Findings
       </Button>
  ) : (
    "-"
  )}
</TableCell>

<TableCell align="center" sx={{ fontSize: "12px", textAlign: "center" }}>
  {row.auditorRemark !== "-" ? (
    <Button
      variant="outlined"
      size="small"
      onClick={() => {
        setViewRemarkText(row.auditorRemark);
        setViewRemarkModalOpen(true);
      }}
      sx={{
                          fontSize: "11px",
                          textTransform: "none",
                          padding: "4px 10px",
                          minWidth: "100px",
                        }}
                      >
      View Remarks
    </Button>
  ) : "-"}
</TableCell>

                  <TableCell align="center" sx={{ fontSize: "12px" }}>
                    {row.clientResponse || "N/A"}
                  </TableCell>

                  <TableCell align="center" sx={{ 
  fontSize: "12px",
  width: "10%",
  paddingRight: "16px"
}}>
  {row.clientRemarks !== "-" ? (
    <Typography sx={{ color: 'text.primary', fontSize: "12px" }}>
      {row.clientRemarks}
    </Typography>
  ) : "-"}
</TableCell>

                                   <TableCell align="center" >
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
                           invisible={!(
  row.hasUnread || 
  row.status === "Pending With Auditor" || 
  row.status === "Pending With Client"
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
              {/* Added Array.isArray check here */}
              {Array.isArray(filteredData) && filteredData.length === 0 && (
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          // Count is now safe as filteredData is guaranteed to be an array
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
        currentDocument={currentDocument}
        onSendMessage={handleSendMessage}
        source="declaration"
      />
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
            secondaryAction={
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenSpecificDocument(doc)}
                sx={{ fontSize: "12px", textTransform: "none" }}
              >
                View
              </Button>
            }
          >
            <ListItemText
              primary={
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
                    color: 'primary.main'
                  }}
                >
                  {doc.file_name}
                </Link>
              }
              sx={{ pr: 2 }}
            />
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

      {/* NEW: Auditor Findings Modal */}
<Dialog
  open={auditorFindingsModalOpen}
  onClose={handleCloseAuditorFindingsModal}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: { borderRadius: 2, padding: 1 }
  }}
>
  <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.2rem", color: "primary.main" }}>
    Auditor Findings 
  </DialogTitle>
  <DialogContent dividers>
    {selectedAuditorFindings.length > 0 ? (
      <List>
        {selectedAuditorFindings.map((finding, index) => (
          <React.Fragment key={index}>
            <ListItem sx={{ paddingY: 1 }}>
              <ListItemText
                primaryTypographyProps={{ fontSize: "0.95rem" }}
                primary={`• ${finding}`}
              />
            </ListItem>
            {index < selectedAuditorFindings.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    ) : (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: "italic", textAlign: "center", paddingY: 2 }}
      >
        No findings available.
      </Typography>
    )}
  </DialogContent>
  <DialogActions sx={{ padding: 2 }}>
    <Button
      onClick={handleCloseAuditorFindingsModal}
      variant="contained"
      color="primary"
      sx={{ textTransform: "none" }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>
 {/* remark dialog */}
 <Dialog
   open={viewRemarkModalOpen}
   onClose={() => setViewRemarkModalOpen(false)}
   maxWidth="sm"
   fullWidth
 >
  
    <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.2rem", color: "primary.main" }}>
      Auditor Remarks</DialogTitle>
   <DialogContent dividers>
     <Typography sx={{ fontSize: "14px", whiteSpace: "pre-line" }}>
       {viewRemarkText}
     </Typography>
   </DialogContent>
   <DialogActions>
     <Button onClick={() => setViewRemarkModalOpen(false)} variant="contained">
       Close
     </Button>
   </DialogActions>
 </Dialog>
    </Box>
  );
}

export default CompanyDeclarationStatus;