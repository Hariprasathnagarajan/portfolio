
import React, { useState, useEffect } from "react";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNavigate } from "react-router-dom";
import DoubleChatIcon from "../audit-viewer/DoubleChatIcon";
import { Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import apiServices from '../../ApiServices/ApiServices';
import {API_URL} from '../../ApiServices/ApiServices';
import ListIcon from '@mui/icons-material/List';
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, Send as SendIcon, Edit as EditIcon } from "@mui/icons-material";
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
const initialData = [

  
].map(item => {
  let status;

  const hasAuditorFinding = item.auditorFinding && item.auditorFinding !== "-";
  const clientResponseFilled = item.clientResponse !== null && item.clientResponse !== "";
  const clientRemarksFilled = item.clientRemarks !== null && item.clientRemarks !== "";

  // Rule 1: Closed if both client response and remarks are filled
  if (clientResponseFilled && clientRemarksFilled) {
    status = "Closed";
  }
  // Rule 2: Pending with Client if there's an auditor finding but client hasn't fully responded/remarked
  else if (hasAuditorFinding && (!clientResponseFilled || !clientRemarksFilled)) {
    status = "Pending with Client";
  }
  // Default to "NA" for declarations not fitting the above criteria (e.g., no auditor finding)
  else {
    status = "-";
  }

  return {
    ...item,
    status,
    hasUnread: false
  };
});

const statusOptions = ["All", "Closed", "Pending with Client", "Pending with Auditor", "Open"];

const headCells = [
  { id: "declarationNum", label: "Declaration Number", align: "left", width: "17%" },
  { id: "declarationDate", label: "Declaration Date", align: "left", width: "15%" },
  { id: "issueCount", label: "Issue Count", align: "left", width: "8%" },
  { id: "auditorFinding", label: "Auditor Finding", align: "left", width: "13%" },
  { id: "auditorRemark", label: "Auditor Remark", align: "left", width: "13%" },
  { id: "clientResponse", label: "Client Response", align: "left", width: "11%" },
  { id: "clientRemarks", label: "Client Remarks", align: "left", width: "12%" },
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
    switch (status) {
      case "Closed": return { bg: "#E8F5E9", text: "#2E7D32" };
      case "Pending with Client": return { bg: "#FFF8E1", text: "#FF8F00" };
      case "Pending with Auditor": return { bg: "#F3E5F5", text: "#7B1FA2" };
      case "Open": return { bg: "#FFEBEE", text: "#C62828" };
      case "NA": return { bg: "#F5F5F5", text: "#757575" };
      default: return {  text: "#1565C0" };
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


function AuditStatusDetails() {
  const theme = useTheme();
  // Initialize with dummy values
  const [organization] = useState("Dummy Org");
  const [username] = useState("dummyuser");
  const [auditorName] = useState("Dummy Auditor");
const [findingsModalOpen, setFindingsModalOpen] = useState(false);
const [selectedAuditorFindings, setSelectedAuditorFindings] = useState([]);
  const [year, setYear] = React.useState(2025);
  const [monthFilter, setMonthFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All"); // Initial status filter
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("declarationNum");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [currentDocument, setCurrentDocument] = React.useState(null);
  const [messages, setMessages] = React.useState(
    // Dummy chat messages for some declarations
    {
      1: [
        { id: 1, sender: "Auditor", message: "Please check the currency code.", time: "10:00 AM", isUser: false, senderType: "auditor" },
        { id: 2, sender: "You", message: "Acknowledged, checking now.", time: "10:05 AM", isUser: true, senderType: "user" },
      ],
      3: [
        { id: 1, sender: "Auditor", message: "Why did you disagree with the finding?", time: "11:00 AM", isUser: false, senderType: "auditor" },
        { id: 2, sender: "You", message: "We believe our original entry is correct. Providing supporting documents soon.", time: "11:10 AM", isUser: true, senderType: "user" },
      ],
      8: [
        { id: 1, sender: "Auditor", message: "Missing HS Code for item X.", time: "09:00 AM", isUser: false, senderType: "auditor" },
        { id: 2, sender: "You", message: "We will provide it shortly.", time: "09:05 AM", isUser: true, senderType: "user" },
      ]
    }
  );
  const [tableData, setTableData] = useState(initialData); // Initialize with dummy data

  // State for client remarks modal
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [editingRemarkRowId, setEditingRemarkRowId] = useState(null);
  const [currentRemarkText, setCurrentRemarkText] = useState("");

const filteredData = tableData.filter(row => {
  const matchesStatus =
    statusFilter === "All" || row.status === statusFilter;
  const searchLower = searchTerm.toLowerCase();
  
  // Check all relevant fields
  const matchesSearch =
    (row.declarationNum?.toLowerCase() || '').includes(searchLower) ||
    (row.declarationDate?.toLowerCase() || '').includes(searchLower) ||
    (row.issueCount?.toString() || '').includes(searchLower) || // Convert number to string for search
    (row.auditorFinding?.toLowerCase() || '').includes(searchLower) ||
    (row.auditorRemark?.toLowerCase() || '').includes(searchLower) ||
    (row.clientResponse?.toLowerCase() || '').includes(searchLower) ||
    (row.clientRemarks?.toLowerCase() || '').includes(searchLower) ||
    (row.status?.toLowerCase() || '').includes(searchLower) ||
    (row.updatedBy?.toLowerCase() || '').includes(searchLower);
  
  return matchesStatus && matchesSearch;
});

  const sortedData = filteredData.sort((a, b) => {
    const valA = a[orderBy]?.toLowerCase?.() || "";
    const valB = b[orderBy]?.toLowerCase?.() || "";
    return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });
  // Initialize with your static data
  const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
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

    if (response.data && Array.isArray(response.data.documents)) {
      setSelectedDocuments(response.data.documents.map(doc => ({
        file_name: doc.file_name,
        file_url: doc.file_url,
        declaration_number: response.data.declaration_number,
        version_id: doc.version_id
      })));
      setDocumentModalOpen(true);
    } else {
      console.warn("API response for documents is not in expected format:", response.data);
      setSelectedDocuments([]);
      setDocumentModalOpen(true);
    }
  } catch (error) {
    console.error("Error fetching document list:", error);
    alert("Failed to load document list.");
  }
};

useEffect(() => {
// Replace this section in your useEffect fetchDeclarations function
const fetchDeclarations = async () => {
  try {
    const data = await apiServices.getFilteredDeclarations(statusFilter, organization);
    console.log("Raw API data:", data); // Debug log
    const formatted = data.map((item) => {
      // Collect ALL findings from ALL finding groups
      const allFindings = [];
      
      // Iterate through each finding group
      if (item.findings && Array.isArray(item.findings)) {
        item.findings.forEach(findingGroup => {
          // Add findings from this group
          if (findingGroup.findings && Array.isArray(findingGroup.findings)) {
            findingGroup.findings.forEach(finding => {
              if (finding.finding) {
                allFindings.push(finding.finding);
              }
            });
          }
        });
      }

      const auditFinding = item.findings?.[0] || {};
      const findingId = auditFinding.id || null;
      
      const clientResponseFilled = auditFinding.client_response && auditFinding.client_response !== "";
      const clientRemarksFilled = auditFinding.client_remark && auditFinding.client_remark !== "";
      const status = auditFinding.workflow_status || "-";

      let status1 = "-";
      if (status === "Pending With Client" || status === "Pending with Client") {
        status1 = "Pending with Client";
      } else if (status === "Pending With Auditor" || status === "Pending with Auditor") {
        status1 = "Pending with Auditor";
      } else if (status === "Closed") {
        status1 = "Closed";
      } else if (status === "Open") {
        status1 = "Open";
      }
      else{
        status1 = "Open"
      }

      return {
        id: item.id,
        findingId: findingId,
        declarationNum: item.declaration_number,
        declarationDate: formatDate(item.date),
        issueCount: item.issue_count, // Use actual count of findings
        auditorFinding: allFindings.length > 0 ? allFindings[0] : "-",
        allFindings: allFindings, // Store ALL findings for the popup
        auditorRemark: auditFinding.auditor_remark || "-",
        clientResponse: auditFinding.client_response || null,
        clientRemarks: auditFinding.client_remark || null,
        updatedBy: "System",
        action: "Pending",
        status: status1,
        hasUnread: false
      };
    });

    console.log("Formatted data:", formatted); // Debug log
    setTableData(formatted);
    setPage(0); // Reset to first page
  } catch (error) {
    console.error("Failed to fetch declarations:", error);
  }
};

  fetchDeclarations();
}, [statusFilter, organization]);

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
  if (!doc || !doc.declaration_number || !doc.version_id) {
    alert("Missing document details.");
    return;
  }

  const token = localStorage.getItem("token");

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

    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.location.href = fileURL;
    } else {
      alert("Pop-up blocked. Please allow pop-ups for this site.");
    }

  } catch (error) {
    console.error("Error opening PDF:", error);
    alert("Failed to open the document.");
  }
};

const updateClientResponseBackend = async (findingId, response, remark) => {
  try {
    const trimmedResponse = response?.trim();
    const trimmedRemark = remark?.trim();

    if (!trimmedResponse || !trimmedRemark) {
      // alert("Please fill in both Client Response and Client Remark");
      return;
    }

    await apiServices.updateClientResponse(findingId, {
      client_response: trimmedResponse,
      client_remark: trimmedRemark
    });

    console.log("Submitting:", trimmedResponse, trimmedRemark);
    console.log("Client response updated successfully");
    return true; // Return success status
  } catch (error) {
    console.error("Failed to update client response:", error);
    return false; // Return failure status
  }
};

  const handleCloseDocumentModal = () => {
    setDocumentModalOpen(false);
    setSelectedDocuments([]);
    setCurrentDocument(null); // Clear current document when closing modal
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

  const handleOpenChat = (document) => {
    setCurrentDocument(document);

    // Initialize empty messages array if not already present
    if (!messages[document.id]) {
      setMessages(prev => ({
        ...prev,
        [document.id]: []
      }));
    }

    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  const handleSendMessage = (docId, message, mode) => {
  const currentMessages = messages[docId] || [];

  const newMessage = {
    id: currentMessages.length + 1,
    sender: "You",
    message: message.message || message, // support both string & object
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isUser: true,
    senderType: mode === 'auditor' ? 'auditor' : 'user'
  };

  // Update chat messages
  setMessages(prev => ({
    ...prev,
    [docId]: [...currentMessages, newMessage]
  }));

  // Update table to show latest message in auditorRemark column
  setTableData(prev =>
    prev.map(row => {
      if (row.id === docId) {
        return {
          ...row,
          auditorRemark: newMessage.message // <-- update table
        };
      }
      return row;
    })
  );
};

  // Handler for Client Response dropdown change
const handleClientResponseChange = async (event, rowId) => {
  const newValue = event.target.value;
  const currentRow = tableData.find((row) => row.id === rowId);
  const currentRemark = currentRow?.clientRemarks || "";
  const findingId = currentRow?.findingId;

  if (!findingId) {
    console.error("No findingId found for row:", rowId);
    return;
  }

  // Update UI state first for responsiveness
  setTableData((prevData) =>
    prevData.map((row) => {
      if (row.id === rowId) {
        const updatedRow = { ...row, clientResponse: newValue };
        if (newValue === "Agree") {
          updatedRow.status = "Pending with Client";
        } else if (newValue === "Disagree") {
          updatedRow.status = "Pending with Auditor";
        }
        return updatedRow;
      }
      return row;
    })
  );

  // For "Agree", send to backend immediately
  if (newValue === "Agree") {
    handleOpenRemarkModal(rowId, currentRemark);
    const success = await updateClientResponseBackend(
      findingId,
      newValue,
      currentRemark
    );
    if (!success) {
      // Revert UI state if API call failed
      setTableData((prevData) =>
        prevData.map((row) => {
          if (row.id === rowId) {
            return { ...row, clientResponse: row.clientResponse }; // revert to previous value
          }
          return row;
        })
      );
    }
  } else if (newValue === "Disagree") {
    handleOpenRemarkModal(rowId, currentRemark);
  }
};

  // Handler to open remarks modal
  const handleOpenRemarkModal = (rowId, currentRemark) => {
    setEditingRemarkRowId(rowId);
    setCurrentRemarkText(currentRemark || ""); // Initialize with existing remark or empty string
    setRemarkModalOpen(true);
  };
const handleSaveRemark = async () => {
  const row = tableData.find((r) => r.id === editingRemarkRowId);
  if (!row) {
    console.error("Row not found for editing");
    return;
  }

  const updatedResponse = row.clientResponse || "";
  const findingId = row.findingId;
  const trimmedRemark = currentRemarkText.trim();

  if (!trimmedRemark) {
    alert("Please enter a remark");
    return;
  }

  try {
    const success = await updateClientResponseBackend(
      findingId,
      updatedResponse,
      trimmedRemark
    );

    if (success) {
      setTableData((prevData) =>
        prevData.map((row) => {
          if (row.id === editingRemarkRowId) {
            const updatedRow = {
              ...row,
              clientRemarks: trimmedRemark,
            };
            if (updatedResponse === "Agree") {
              updatedRow.status = "Pending with Client";
            } else if (updatedResponse === "Disagree") {
              updatedRow.status = "Pending with Auditor";
            }
            return updatedRow;
          }
          return row;
        })
      );
    }
  } catch (error) {
    console.error("Failed to save remark:", error);
  } finally {
    setRemarkModalOpen(false);
    setEditingRemarkRowId(null);
    setCurrentRemarkText("");
  }
};

  const handleCloseRemarkModal = () => {
    setRemarkModalOpen(false);
    setEditingRemarkRowId(null);
    setCurrentRemarkText("");
  };
const formatDate = (dateString) => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString; // Return original if formatting fails
  }
};
  const navigate = useNavigate();
  return (
    <Box sx={{
      padding: "20px 20px 20px 20px", // Consistent padding on all sides
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
          width: "100%", // Ensure full width
          boxSizing: "border-box" // Include padding in width calculation
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
            

              <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "14px" }}>
                Audit's Declaration Details
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
          <Box display="flex" gap={2} alignItems="center">
            <OutlinedInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search"
              sx={{
                width: 120, // You can adjust this width as needed
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
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme.palette.grey[50]
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.grey[100]
                    },
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
                  <TableCell sx={{ fontSize: "12px", paddingLeft: "35px" }}> {/* Adjust paddingLeft as needed */}
                    {row.declarationDate}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontSize: "12px",
                      paddingLeft: "12px", // reduced left padding
                      textAlign: "center"     // ensure left alignment
                    }}
                  >
                    {row.issueCount}
                    
                  </TableCell>
<TableCell sx={{ fontSize: "12px", textAlign: "center" }}>
  {row.auditorFinding !== "-" ? (
    <Button
      variant="outlined"
      size="small"
      onClick={() => {
        // Use row.allFindings if available, otherwise fallback to row.auditorFinding
        const findings = row.allFindings || [row.auditorFinding];
        setSelectedAuditorFindings(findings);
        setFindingsModalOpen(true);
      }}
      startIcon={<ListIcon />}
      sx={{ fontSize: "10px", minWidth: "120px" }}
    >
      View Findings
    </Button>
  ) : "-"}

</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.auditorRemark !== "-" ? (
                      <Typography
                        component="span"
                        sx={{
                          color: 'black', // Set to black
                          fontSize: "12px"
                        }}
                      >
                        {row.auditorRemark}
                      </Typography>
                    ) : "-"}
                  </TableCell>

                  <TableCell sx={{ fontSize: "12px" }}>
                                    {row.clientResponse ? row.clientResponse : "-"}
</TableCell>

<TableCell sx={{ fontSize: "12px" }}>
  {row.clientRemarks ? row.clientRemarks : "-"}
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
                            variant="dot"invisible={!(
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
  currentDocument={currentDocument}
  threadId={currentDocument?.id}
  onSendMessage={handleSendMessage}
  onClose={handleCloseChat}
  source="declaration"
/>
{/* Auditor Findings Modal */}
<Dialog
  open={findingsModalOpen}
  onClose={() => setFindingsModalOpen(false)}
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
      onClick={() => setFindingsModalOpen(false)}
      variant="contained"
      color="primary"
      sx={{ textTransform: "none" }}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

      {/* Client Remarks Modal */}
      <Dialog
        open={remarkModalOpen}
        onClose={handleCloseRemarkModal}
        aria-labelledby="remark-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="remark-dialog-title">Enter Client Remarks</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="remarks"
            label="Remarks"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={currentRemarkText}
            onChange={(e) => setCurrentRemarkText(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemarkModal}>Cancel</Button>
          <Button onClick={handleSaveRemark} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AuditStatusDetails;