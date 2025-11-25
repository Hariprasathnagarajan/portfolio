import React, { useState } from "react";
import DoubleChatIcon from './DoubleChatIcon';
import { Add as AddIcon, AttachFile as AttachFileIcon, Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";
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
  MenuItem,
  IconButton,
  Tooltip,
  Stack,
  Button,
  TableSortLabel,
  useTheme,
  TablePagination,
  OutlinedInput,
  InputAdornment,
  Avatar,
  Badge
} from "@mui/material";
import dayjs from 'dayjs';

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
        right: 16,
        bottom: 16,
        width: 320,
        height: 420,
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
              {currentDocument.status}
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
        {chatMessages.map((msg) => (
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

const adhocHeadCells = [
  { id: "name", label: "Adhoc Name", align: "left", width: "15%" },
  { id: "date", label: "Start Date", align: "left", width: "10%" },
  { id: "endDate", label: "End Date", align: "left", width: "10%" },
  { id: "stock", label: "Stock", align: "left", width: "10%" },
  { id: "customs", label: "Customs", align: "left", width: "10%" },
  { id: "transactions", label: "Transactions", align: "left", width: "15%" },
  { id: "reconciliation", label: "Reconciliation", align: "left", width: "15%" },
  { id: "status", label: "Status", align: "center", width: "10%" },
  { id: "actions", label: "Actions", align: "center", width: "5%" },
];

function EnhancedTableHead({ order, orderBy, onRequestSort, headCells }) {
  const theme = useTheme();
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{ background: theme.palette.grey[100], borderBottom: `1px solid ${theme.palette.divider}` }}>
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
      case "Closed": return { bg: "#E8F5E9", text: "#2E7D32" };
      case "In-Progress": return { bg: "#FFF8E1", text: "#FF8F00" };
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

function AdhocReconciliation() {
  const theme = useTheme();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [adhocPage, setAdhocPage] = React.useState(0);
  const [adhocRowsPerPage, setAdhocRowsPerPage] = React.useState(5);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [chatOpen, setChatOpen] = React.useState(false);
  const [currentDocument, setCurrentDocument] = React.useState(null);
  const [messages, setMessages] = React.useState({});
  const [adhocData, setAdhocData] = React.useState([
    {
      id: 1,
      name: "Adhoc-1",
      date: "2/4/2024",
      endDate: "2/4/2025",
      stock: "Stock Report 1",
      customs: "Customs Report 1",
      transactions: "Transaction Report 1",
      reconciliation: "Reconciliation Report 1",
      status: "Closed",
      hasUnread: false
    },
    {
      id: 2,
      name: "Adhoc-2",
      date: "2/4/2025",
      endDate: "",
      stock: "Stock Report 2",
      customs: "Customs Report 2",
      transactions: "Transaction Report 2",
      reconciliation: "-",
      status: "In-Progress",
      hasUnread: false
    },
    {
      id: 3,
      name: "Adhoc-3",
      date: "6/15/2024",
      endDate: "7/1/2024",
      stock: "Stock Report 3",
      customs: "Customs Report 3",
      transactions: "Transaction Report 3",
      reconciliation: "Reconciliation Report 3",
      status: "Closed",
      hasUnread: false
    },
    {
      id: 4,
      name: "Adhoc-4",
      date: "6/20/2024",
      endDate: "",
      stock: "-",
      customs: "-",
      transactions: "-",
      reconciliation: "-",
      status: "Open",
      hasUnread: false
    },
    {
      id: 5,
      name: "Adhoc-5",
      date: "6/25/2024",
      endDate: "",
      stock: "Stock Report 5",
      customs: "Customs Report 5",
      transactions: "Transaction Report 5",
      reconciliation: "-",
      status: "In-Progress",
      hasUnread: false
    }
  ]);

  const filteredAdhocData = adhocData.filter(row => {
    const matchesSearch = 
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.endDate && row.endDate.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const sortedAdhocData = filteredAdhocData.sort((a, b) => {
    const valA = a[orderBy]?.toLowerCase?.() || "";
    const valB = b[orderBy]?.toLowerCase?.() || "";
    return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const visibleAdhocRows = sortedAdhocData.slice(adhocPage * adhocRowsPerPage, adhocPage * adhocRowsPerPage + adhocRowsPerPage);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleAdhocChangePage = (event, newPage) => {
    setAdhocPage(newPage);
  };

  const handleAdhocChangeRowsPerPage = (event) => {
    setAdhocRowsPerPage(parseInt(event.target.value, 10));
    setAdhocPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setAdhocPage(0);
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

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  const handleSendMessage = (docId, message, mode) => {
    const currentMessages = messages[docId] || [];
    if (message.file) {
      const newMessage = {
        id: currentMessages.length + 1,
        sender: "You",
        message: `File: ${message.file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true,
        senderType: mode === 'auditor' ? 'auditor' : 'user',
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

  const linkStyle = { 
    textDecoration: 'none',
    color: 'primary.main',
    '&:hover': { textDecoration: 'underline' },
    fontSize: "12px"
  };

  return (
    <Box sx={{ 
      padding: "20px",
      position: "absolute",
      top: "75px",
      width: "100%",
      pr: 3,
      boxSizing: "border-box",
    }}>
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
            <Button
              onClick={() => { }}
              disableRipple
              sx={{
                fontSize: "12px",
                textTransform: "none",
                fontWeight: "600",
                borderRadius: 0,
                padding: "4px 0",
                minWidth: "auto",
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              Adhoc Reconciliation
            </Button>
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
          width: chatOpen ? "calc(100% - 400px)" : "100%",
          transition: "width 0.3s ease",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: "14px", fontWeight: "bold", mr: 1 }}>
            Adhoc Reconciliation
          </Typography>
          <IconButton
            size="small"
            onClick={() => {
              const newId = Math.max(...adhocData.map(item => item.id), 0) + 1;
              const newAdhoc = {
                id: newId,
                name: `Adhoc-${newId}`,
                date: dayjs().format('M/D/YYYY'),
                endDate: "",
                stock: "-",
                customs: "-",
                transactions: "-",
                reconciliation: "-",
                status: "Open",
                hasUnread: false
              };
              setAdhocData([newAdhoc, ...adhocData]);
              setAdhocPage(0);
            }}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              ml: 1,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              }
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        <TableContainer sx={{ width: "100%", maxHeight: "327px", overflowY: "auto" }}>
          <Table size="small">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              headCells={adhocHeadCells}
            />
            <TableBody sx={{
              '&:nth-of-type(odd)': { 
                backgroundColor: theme.palette.grey[50] 
              },
              '&:hover': { 
                backgroundColor: theme.palette.grey[100] 
              },
            }}>
              {visibleAdhocRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontSize: "12px" }}>{row.name}</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>{row.date}</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>{row.endDate || "-"}</TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.stock !== "-" ? (
                      <Typography component="a" href="#" sx={linkStyle}>
                        {row.stock}
                      </Typography>
                    ) : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.customs !== "-" ? (
                      <Typography component="a" href="#" sx={linkStyle}>
                        {row.customs}
                      </Typography>
                    ) : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.transactions !== "-" ? (
                      <Typography component="a" href="#" sx={linkStyle}>
                        {row.transactions}
                      </Typography>
                    ) : "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "12px" }}>
                    {row.reconciliation !== "-" ? (
                      <Typography component="a" href="#" sx={linkStyle}>
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
              {filteredAdhocData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
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
          count={filteredAdhocData.length}
          rowsPerPage={adhocRowsPerPage}
          page={adhocPage}
          onPageChange={handleAdhocChangePage}
          onRowsPerPageChange={handleAdhocChangeRowsPerPage}
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

export default AdhocReconciliation;