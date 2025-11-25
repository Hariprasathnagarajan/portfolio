import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useLocation } from 'react-router-dom';
import DoubleChatIcon from './DoubleChatIcon'; // adjust path as needed
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Search as SearchIcon, Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";
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
  Typography,
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


const data = [
  { id: 1, name: "Document 1", month: "JAN 2025-MAR 2025", date: "5/1/2025", stock: "Stock Report 1", customs: "Customs Transaction 1", reconciliation: "Reconciliation Report 1", updatedBy: "John Doe" },
  { id: 2, name: "Document 2", month: "FEB 2025-MAY 2025", date: "4/2/2025", stock: "Stock Report 2", customs: "Customs Transaction 2", reconciliation: "Reconciliation Report 2", updatedBy: "Jane Smith" },
  { id: 3, name: "Document 3", month: "JAN 2025-JUL 2025", date: "2/3/2025", stock: "Stock Report 3", customs: "Customs Transaction 3", reconciliation: "-", updatedBy: "Mike Johnson" },
  { id: 4, name: "Document 4", month: "AUG 2025-OCT 2025", date: "2/4/2025", stock: "Stock Report 4", customs: "-", reconciliation: "-", updatedBy: "System" },
  { id: 5, name: "Document 5", month: "FEB 2025-APR 2025", date: "5/15/2025", stock: "Stock Report 5", customs: "Customs Transaction 5", reconciliation: "Reconciliation Report 5", updatedBy: "Sarah Williams" },
  { id: 6, name: "Document 6", month: "SEP 2025-OCT 2025", date: "6/20/2025", stock: "Stock Report 6", customs: "Customs Transaction 6", reconciliation: "-", updatedBy: "David Brown" },
  { id: 7, name: "Document 7", month: "JAN 2025-FEB 2025", date: "7/10/2025", stock: "-", customs: "-", reconciliation: "-", updatedBy: "System" }
].map(item => {
  let status;
  if (item.stock !== "-" && item.customs !== "-" && item.reconciliation !== "-") {
    status = "Closed";
  } else if (item.stock !== "-" && item.customs !== "-") {
    status = "In-Progress";
  } else if (item.stock !== "-") {
    status = "Open";
  } else {
    status = "NA";
  }

  return {
    ...item,
    status,
    hasUnread: false // Default to false since we don't have predefined messages
  };
});
const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];
const statusOptions = ["All", "Closed", "In-Progress", "Open", "NA"];

const headCells = [
  { id: "name", label: "Document Name", align: "left", width: "12%" },
  { id: "month", label: "Duration", align: "left", width: "10%" },
  { id: "date", label: "Updated Date", align: "left", width: "8%" },
  { id: "stock", label: "Stock ", align: "left", width: "16%" },
  { id: "customs", label: "Customs ", align: "left", width: "16%" },
  { id: "reconciliation", label: "Reconciliation", align: "left", width: "16%" },
  { id: "status", label: "Status", align: "center", width: "8%" },
  { id: "actions", label: "Actions", align: "center", width: "12%" },
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
      case "In-Progress": return { bg: "#FFF8E1", text: "#FF8F00" };
      case "Open": return { bg: "#FFEBEE", text: "#C62828" };
      case "NA": return { bg: "#F5F5F5", text: "#757575" };
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

const ChatBox = ({ open, onClose, chatMessages, currentDocument, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [chatMode, setChatMode] = useState('everyone');
  const theme = useTheme();
  const messagesEndRef = React.useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(currentDocument.id, message, chatMode);
      setMessage('');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const newMessage = {
        id: chatMessages.length + 1,
        sender: "You",
        message: `File: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true,
        senderType: chatMode === 'auditor' ? 'auditor' : 'user',
        file: file
      };
      onSendMessage(currentDocument.id, newMessage, chatMode);
      setSelectedFile(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
       right: 2,
        top:110,
        bottom: 200,
        width: 320,
        height: 470,
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        zIndex: 1300,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.grey[100],
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: '0.875rem'
          }}>
            {currentDocument.name.charAt(0)}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {currentDocument.name}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {currentDocument.status} • {currentDocument.month}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Mode Selector */}
      <Box
        sx={{
          display: 'flex',
          backgroundColor: theme.palette.grey[50],
          p: 0.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          fullWidth
          size="small"
          variant={chatMode === 'everyone' ? 'outlined' : 'text'}
          onClick={() => setChatMode('everyone')}
          sx={{
            borderRadius: '6px',
            textTransform: 'none',
            fontSize: '0.7rem',
            fontWeight: 500,
            py: 0.5,
            color: chatMode === 'everyone' ? theme.palette.primary.main : theme.palette.text.secondary,
            borderColor: chatMode === 'everyone' ? theme.palette.primary.main : 'transparent',
          }}
        >
          Everyone
        </Button>
        <Button
          fullWidth
          size="small"
          variant={chatMode === 'auditor' ? 'outlined' : 'text'}
          onClick={() => setChatMode('auditor')}
          sx={{
            borderRadius: '6px',
            textTransform: 'none',
            fontSize: '0.7rem',
            fontWeight: 500,
            py: 0.5,
            color: chatMode === 'auditor' ? theme.palette.secondary.main : theme.palette.text.secondary,
            borderColor: chatMode === 'auditor' ? theme.palette.secondary.main : 'transparent',
          }}
        >
          Auditor Only
        </Button>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: theme.palette.grey[50],
        }}
      >
        {chatMessages
          .filter(msg => chatMode === 'everyone' || msg.isUser || msg.senderType === 'auditor')
          .map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                flexDirection: msg.isUser ? 'row-reverse' : 'row',
                mb: 2,
                gap: 1,
                alignItems: 'flex-start',
              }}
            >
              {!msg.isUser && (
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    fontSize: '0.7rem',
                    bgcolor: msg.senderType === 'auditor' ?
                      theme.palette.secondary.light : theme.palette.grey[300],
                    color: msg.senderType === 'auditor' ?
                      theme.palette.secondary.dark : theme.palette.text.secondary,
                  }}
                >
                  {msg.sender.charAt(0)}
                </Avatar>
              )}

              <Box
                sx={{
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                {!msg.isUser && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      ml: 1,
                    }}
                  >
                    {msg.sender}
                    {msg.senderType === 'auditor' && (
                      <Box
                        component="span"
                        sx={{
                          ml: 0.5,
                          fontSize: '0.6rem',
                          color: theme.palette.secondary.dark,
                          px: 0.5,
                          py: 0.1,
                          borderRadius: '4px'
                        }}
                      >
                        Auditor
                      </Box>
                    )}
                  </Typography>
                )}

                <Box
                  sx={{
                    backgroundColor: msg.isUser ?
                      theme.palette.primary.lighter :
                      (msg.senderType === 'auditor' ?
                        theme.palette.secondary.lighter :
                        theme.palette.grey[200]),
                    borderRadius: msg.isUser ?
                      '12px 4px 12px 12px' : '4px 12px 12px 12px',
                    p: 1.5,
                    wordBreak: 'break-word',
                    border: `1px solid ${msg.isUser ?
                      theme.palette.primary.light :
                      (msg.senderType === 'auditor' ?
                        theme.palette.secondary.light :
                        theme.palette.grey[300])}`,
                  }}
                >
                  {msg.file ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachFileIcon fontSize="small" color="action" />
                      <Typography
                        component="a"
                        href={URL.createObjectURL(msg.file)}
                        download
                        sx={{
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                          fontSize: '0.8rem'
                        }}
                      >
                        {msg.file.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {msg.message}
                    </Typography>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    textAlign: msg.isUser ? 'right' : 'left',
                    px: 1,
                    fontSize: '0.65rem'
                  }}
                >
                  {msg.time}
                </Typography>
              </Box>
            </Box>
          ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={triggerFileInput}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <AttachFileIcon fontSize="small" />
          </IconButton>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: theme.palette.grey[50],
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.grey[300],
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.lighter,
              },
              '&:disabled': {
                color: theme.palette.text.disabled,
              }
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};



function ReconciliationViewer() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { organization, username } = location.state || {}; // Get the passed state
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

  const filteredData = data.filter(row => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.stock.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.customs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.reconciliation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      (monthFilter === "All" || row.month === monthFilter) &&
      (statusFilter === "All" || row.status === statusFilter);
      
  const matchesDate =
    !selectedDate ||
    new Date(row.date).toDateString() ===
      new Date(selectedDate).toDateString();

    return matchesFilter && matchesSearch && matchesDate 
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

const handleOpenChat = (doc) => {
  setCurrentDocument(doc);

  // Initialize empty messages array if not already present
  if (!messages[doc.id]) {
    setMessages(prev => ({
      ...prev,
      [doc.id]: []
    }));
  }

  setChatOpen(true);

  // ✅ Scroll the clicked row into view aligned to the Chat column
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
  
 const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedDate(null);
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
 // Adjust width calculation
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
      <Typography color="text.primary" sx={{ fontWeight: 600 }}>
        Reconciliation Audit
      </Typography>

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
  id={`row-${row.id}`}   // ✅ add this
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
  {row.name}
</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.month}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.date}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.stock !== "-" ? (
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
                        {row.stock}
                      </Typography>
                    ) : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.customs !== "-" ? (
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
                        {row.customs}
                      </Typography>
                    ) : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.reconciliation !== "-" ? (
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
                        {row.reconciliation}
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

export default ReconciliationViewer;