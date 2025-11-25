
import React, { useState,useEffect } from "react";
import { useLocation } from 'react-router-dom';
import DoubleChatIcon from './DoubleChatIcon'; // adjust path as needed
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import axios from 'axios';
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
  Badge, OutlinedInput
} from "@mui/material";
import ChatBox from "../ChatBox";
const data = [
  { id: 1, declarationNum: "7625986305386", declarationDate: "2025-01-15", issueCount: 5, auditorFinding: "Wrong Currency", auditorRemark: "Insert the correct currency", clientResponse: "Agree", clientRemarks: "Updated latest doc", action: "Action 1", updatedBy: "John Doe" },
  { id: 2, declarationNum: "5764832863868", declarationDate: "2025-02-10", issueCount: 3, auditorFinding: "Wrong CFI", auditorRemark: "Insert the CFI value", clientResponse: "Agree", clientRemarks: "Updated latest doc", action: "Action 2", updatedBy: "Jane Smith" },
  { id: 3, declarationNum: "7639871632877", declarationDate: "2025-01-20", issueCount: 7, auditorFinding: "Wrong Currency", auditorRemark: "Insert the correct currency", clientResponse: "DisAgree", clientRemarks: "-", action: "Pending", updatedBy: "Mike Johnson" },
  { id: 4, declarationNum: "8729247237633", declarationDate: "2025-08-05", issueCount: 2, auditorFinding: "Wrong Currency", auditorRemark: "Insert the correct currency", clientResponse: "Agree", clientRemarks: "-", action: "Pending", updatedBy: "System" },
  { id: 5, declarationNum: "8752387286268", declarationDate: "2025-02-15", issueCount: 4, auditorFinding: "Wrong CFI", auditorRemark: "Insert the CFI value", clientResponse: "DisAgree", clientRemarks: "Updated latest doc", action: "Action 5", updatedBy: "Sarah Williams" },
  { id: 6, declarationNum: "3674362367432", declarationDate: "2025-09-01", issueCount: 1, auditorFinding: "Wrong CFI", auditorRemark: "Insert the CFI value", clientResponse: "Agree", clientRemarks: "-", action: "Pending", updatedBy: "David Brown" },
  { id: 7, declarationNum: "7362863262676", declarationDate: "2025-01-30", issueCount: 0, auditorFinding: "Wrong Currency", auditorRemark: "Insert the correct currency", clientResponse: "Agree", clientRemarks: "-", action: "NA", updatedBy: "System" },

  // ✅ New Open Status Data
  { id: 8, declarationNum: "8111111111111", declarationDate: "2025-03-05", issueCount: 2, auditorFinding: "Missing HS Code", auditorRemark: "Provide correct code", clientResponse: "-", clientRemarks: "-", action: "Pending", updatedBy: "Auditor" },
  { id: 9, declarationNum: "8222222222222", declarationDate: "2025-03-12", issueCount: 1, auditorFinding: "Wrong Amount", auditorRemark: "Recalculate", clientResponse: "-", clientRemarks: "-", action: "Pending", updatedBy: "Auditor" },
  { id: 10, declarationNum: "8333333333333", declarationDate: "2025-03-18", issueCount: 3, auditorFinding: "Incorrect Country", auditorRemark: "Correct country of origin", clientResponse: "-", clientRemarks: "-", action: "Pending", updatedBy: "Auditor" },
  {
    id: 11,
    declarationNum: "9111111111111",
    declarationDate: "2025-04-05",
    issueCount: 2,
    auditorFinding: "Incorrect Currency",
    auditorRemark: "Verify currency code",
    clientResponse: "-",
    clientRemarks: "-",
    action: "Awaiting Client",
    updatedBy: "Auditor"
  },
  {
    id: 12,
    declarationNum: "9222222222222",
    declarationDate: "2025-04-12",
    issueCount: 1,
    auditorFinding: "Wrong Tax Code",
    auditorRemark: "Provide corrected code",
    clientResponse: "-",
    clientRemarks: "-",
    action: "Under Review",
    updatedBy: "Auditor"
  }
].map(item => {
  let status;

  if (
    item.auditorFinding !== "-" &&
    item.clientResponse !== "-" &&
    item.action !== "Pending"
  ) {
    status = "Closed";
  } else if (
    item.auditorFinding !== "-" &&
    item.clientResponse === "-" &&
    item.action === "Pending"
  ) {
    status = "Open";
  } else if (
    item.auditorFinding !== "-" &&
    item.clientResponse === "-" &&
    item.action !== "Pending"
  ) {
    status = "Pending with Client";
  } else if (
    item.auditorFinding !== "-" &&
    item.clientResponse !== "-" &&
    item.action === "Pending"
  ) {
    status = "Pending with Auditor";
  } else {
    status = "NA";
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
  { id: "clientResponse", label: "Client Response", align: "left", width: "13%" },
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
      default: return { bg: "#E3F2FD", text: "#1565C0" };
    }
  };

  const location = useLocation();
  const { organization, username, statusFilter: initialStatusFilter } = location.state || {};// Get the passed state
  const { auditorName } = location.state || {};
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



function AuditFindingsPages() {
  const theme = useTheme();
const location = useLocation();
const { organization, username, statusFilter: initialStatusFilter, auditorName } = location.state || {};
  // Get the passed state
  const [year, setYear] = React.useState(2025);
  const [monthFilter, setMonthFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState(initialStatusFilter || "All");
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("declarationNum");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [currentDocument, setCurrentDocument] = React.useState(null);
  const [messages, setMessages] = React.useState({});
  const [tableData, setTableData] = useState([]);

  const filteredData = tableData.filter(row => {
    const matchesStatus =
      statusFilter === "All" || row.status === statusFilter;

    return matchesStatus;
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${API_URL}declaration-status/`, {
          params: {
            organization: organization || '',
            username: username || ''
          },
          headers: {
            Authorization: `Token ${token}`
          }
        });
        console.log("Mapped data:", response.data.map(item => ({
          id: item.id,
          declarationNum: item.declaration_number,
          declarationDate: new Date(item.date).toLocaleDateString(),
          issueCount: item.issue_count,
          auditorFinding: "",
          auditorRemark: "-",
          clientResponse: "",
          clientRemarks: "-",
          status: "Open",
          hasUnread: false
        })));

        // ✅ Map backend fields to match frontend expectations
        setTableData(
          response.data.map(item => ({
            id: item.id,
            declarationNum: item.declaration_number,
            declarationDate: new Date(item.date).toLocaleDateString(), // format or keep raw
            issueCount: item.issue_count,
            auditorFinding: "",
            auditorRemark: "-",
            clientResponse: "",
            clientRemarks: "-",
            status: "Open",
            hasUnread: false
          }))
        );

      } catch (error) {
        console.error("Error fetching declaration status:", error);
      }
    };

    if (organization && username) {
      fetchData();
    }
  }, [organization, username]);


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
    const currentMessages = messages[docId] || []; // Handle case where messages[docId] is undefined

    // If the message is a file, handle it differently
    if (message.file) {
      const newMessage = {
        id: currentMessages.length + 1,
        sender: message.sender,
        message: message.message,
        time: message.time,
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
                          Auditor:
                        </Box>
                        {auditorName || "N/A"} {/* Display auditor name here */}
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
                  <TableCell sx={{
                    fontSize: "12px",
                    whiteSpace: "normal", // Allow text to wrap
                    wordBreak: "break-word" // Break long words
                  }}>
                    {row.declarationNum}
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
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.auditorFinding !== "-" ? (
                      <Typography
                        component="a"
                        href="#"
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' },
                          fontSize: "12px"
                        }}
                      >
                        {row.auditorFinding}
                      </Typography>
                    ) : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.auditorRemark !== "-" ? (
                      <Typography
                        component="a"
                        href="#"
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' },
                          fontSize: "12px"
                        }}
                      >
                        {row.auditorRemark}
                      </Typography>
                    ) : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.clientResponse !== "-" ? (
                      <Typography
                        component="a"
                        href="#"
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' },
                          fontSize: "12px"
                        }}
                      >
                        {row.clientResponse}
                      </Typography>
                    ) : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.clientRemarks !== "-" ? (
                      <Typography
                        component="a"
                        href="#"
                        sx={{
                          textDecoration: 'none',
                          color: 'primary.main',
                          '&:hover': { textDecoration: 'underline' },
                          fontSize: "12px"
                        }}
                      >
                        {row.clientRemarks}
                      </Typography>
                    ) : "-"}
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
        onClose={handleCloseChat}
        chatMessages={currentDocument ? messages[currentDocument.id] || [] : []}
        currentDocument={currentDocument}
        onSendMessage={handleSendMessage}
      />
    </Box>
  );
}

export default AuditFindingsPages;