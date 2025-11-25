
import React, { useState,useEffect } from "react";
import { useLocation } from 'react-router-dom';
import DoubleChatIcon from './DoubleChatIcon'; // adjust path as needed
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { API_URL } from '../../ApiServices/ApiServices'; // Adjust the import path as needed
import axios from 'axios';
import ListIcon from '@mui/icons-material/List';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";
import ChatBox from "../ChatBox";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

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
    status = "Pending With Client";
  } else if (
    item.auditorFinding !== "-" &&
    item.clientResponse !== "-" &&
    item.action === "Pending"
  ) {
    status = "Pending With Auditor";
  } else {
    status = "NA";
  }

  return {
    ...item,
    status,
    hasUnread: false
  };
});

const statusOptions = ["All", "Closed", "Pending With Client", "Pending With Auditor", "Open"];

const headCells = [
  { id: "declarationNum", label: "Declaration Number", align: "left", width: "17%" },
  { id: "declarationDate", label: "Declaration Date", align: "left", width: "15%" },
  { id: "issueCount", label: "Issue Count", align: "left", width: "8%" },
  { id: "auditorFinding", label: "Auditor Findings", align: "left", width: "13%" },
  { id: "auditorRemark", label: "Auditor Remarks", align: "left", width: "13%" },
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
  const normalized = status?.trim().toLowerCase(); // normalize case + remove extra spaces

  switch (normalized) {
    case "closed":
      return { bg: "#E8F5E9", text: "#2E7D32" };
    case "pending with client":
      return { bg: "#FFF8E1", text: "#FF8F00" };
    case "pending with auditor":
      return { bg: "#F3E5F5", text: "#7B1FA2" };
    case "open":
      return { bg: "#FFEBEE", text: "#C62828" };
    case "na":
      return { bg: "#F5F5F5", text: "#757575" };
    default:
      return { bg: "#E3F2FD", text: "#1565C0" };
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

// const ChatBox = ({ open, onClose, chatMessages, currentDocument, onSendMessage }) => {
//   const [message, setMessage] = useState('');
//   const [chatMode, setChatMode] = useState('everyone');
//   const theme = useTheme();
//   const messagesEndRef = React.useRef(null);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const fileInputRef = React.useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   React.useEffect(() => {
//     scrollToBottom();
//   }, [chatMessages]);

//   const handleSendMessage = () => {
//     if (message.trim()) {
//       onSendMessage(currentDocument.id, message, chatMode);
//       setMessage('');
//     }
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//       const newMessage = {
//         id: chatMessages.length + 1,
//         sender: "You",
//         message: `File: ${file.name}`,
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         isUser: true,
//         senderType: chatMode === 'auditor' ? 'auditor' : 'user',
//         file: file
//       };
//       onSendMessage(currentDocument.id, newMessage, chatMode);
//       setSelectedFile(null);
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   if (!open) return null;

//   return (
//     <Box
//       sx={{
//         position: 'fixed',
//         right: 2,
//         top: 110,
//         bottom: 200,
//         width: 320,
//         height: 470,
//         backgroundColor: theme.palette.background.paper,
//         boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
//         borderRadius: '12px',
//         display: 'flex',
//         flexDirection: 'column',
//         border: `1px solid ${theme.palette.divider}`,
//         zIndex: 1300,
//         overflow: 'hidden',
//       }}
//     >
//       {/* Header */}
//       <Box
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           p: 2,
//           borderBottom: `1px solid ${theme.palette.divider}`,
//           backgroundColor: theme.palette.background.paper,
//         }}
//       >
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//           <Box sx={{
//             width: 36,
//             height: 36,
//             borderRadius: '50%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: theme.palette.grey[100],
//             color: theme.palette.text.primary,
//             fontWeight: 500,
//             fontSize: '0.875rem'
//           }}>
//             {currentDocument.declarationNum.charAt(0)}
//           </Box>
//           <Box>
//             <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
//               {currentDocument.declarationNum}
//             </Typography>
//             <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
//               {currentDocument.status} • {currentDocument.declarationDate}
//             </Typography>
//           </Box>
//         </Box>
//         <IconButton
//           onClick={onClose}
//           size="small"
//           sx={{
//             color: theme.palette.text.secondary,
//             '&:hover': {
//               backgroundColor: theme.palette.action.hover,
//             }
//           }}
//         >
//           <CloseIcon fontSize="small" />
//         </IconButton>
//       </Box>

//       {/* Mode Selector */}
//       <Box
//         sx={{
//           display: 'flex',
//           backgroundColor: theme.palette.grey[50],
//           p: 0.5,
//           borderBottom: `1px solid ${theme.palette.divider}`,
//         }}
//       >
//         <Button
//           fullWidth
//           size="small"
//           variant={chatMode === 'everyone' ? 'outlined' : 'text'}
//           onClick={() => setChatMode('everyone')}
//           sx={{
//             borderRadius: '6px',
//             textTransform: 'none',
//             fontSize: '0.7rem',
//             fontWeight: 500,
//             py: 0.5,
//             color: chatMode === 'everyone' ? theme.palette.primary.main : theme.palette.text.secondary,
//             borderColor: chatMode === 'everyone' ? theme.palette.primary.main : 'transparent',
//           }}
//         >
//           Everyone
//         </Button>
//         <Button
//           fullWidth
//           size="small"
//           variant={chatMode === 'auditor' ? 'outlined' : 'text'}
//           onClick={() => setChatMode('auditor')}
//           sx={{
//             borderRadius: '6px',
//             textTransform: 'none',
//             fontSize: '0.7rem',
//             fontWeight: 500,
//             py: 0.5,
//             color: chatMode === 'auditor' ? theme.palette.secondary.main : theme.palette.text.secondary,
//             borderColor: chatMode === 'auditor' ? theme.palette.secondary.main : 'transparent',
//           }}
//         >
//           Auditor Only
//         </Button>
//       </Box>

//       {/* Messages */}
//       <Box
//         sx={{
//           flex: 1,
//           overflowY: 'auto',
//           p: 2,
//           backgroundColor: theme.palette.grey[50],
//         }}
//       >
//         {chatMessages
//           .filter(msg => chatMode === 'everyone' || msg.isUser || msg.senderType === 'auditor')
//           .map((msg) => (
//             <Box
//               key={msg.id}
//               sx={{
//                 display: 'flex',
//                 flexDirection: msg.isUser ? 'row-reverse' : 'row',
//                 mb: 2,
//                 gap: 1,
//                 alignItems: 'flex-start',
//               }}
//             >
//               {!msg.isUser && (
//                 <Avatar
//                   sx={{
//                     width: 28,
//                     height: 28,
//                     fontSize: '0.7rem',
//                     bgcolor: msg.senderType === 'auditor' ?
//                       theme.palette.secondary.light : theme.palette.grey[300],
//                     color: msg.senderType === 'auditor' ?
//                       theme.palette.secondary.dark : theme.palette.text.secondary,
//                   }}
//                 >
//                   {msg.sender.charAt(0)}
//                 </Avatar>
//               )}

//               <Box
//                 sx={{
//                   maxWidth: '80%',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   gap: 0.5,
//                 }}
//               >
//                 {!msg.isUser && (
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       fontWeight: 500,
//                       color: theme.palette.text.primary,
//                       ml: 1,
//                     }}
//                   >
//                     {msg.sender}
//                     {msg.senderType === 'auditor' && (
//                       <Box
//                         component="span"
//                         sx={{
//                           ml: 0.5,
//                           fontSize: '0.6rem',
//                           color: theme.palette.secondary.dark,
//                           px: 0.5,
//                           py: 0.1,
//                           borderRadius: '4px'
//                         }}
//                       >
//                         Auditor
//                       </Box>
//                     )}
//                   </Typography>
//                 )}

//                 <Box
//                   sx={{
//                     backgroundColor: msg.isUser ?
//                       theme.palette.primary.lighter :
//                       (msg.senderType === 'auditor' ?
//                         theme.palette.secondary.lighter :
//                         theme.palette.grey[200]),
//                     borderRadius: msg.isUser ?
//                       '12px 4px 12px 12px' : '4px 12px 12px 12px',
//                     p: 1.5,
//                     wordBreak: 'break-word',
//                     border: `1px solid ${msg.isUser ?
//                       theme.palette.primary.light :
//                       (msg.senderType === 'auditor' ?
//                         theme.palette.secondary.light :
//                         theme.palette.grey[300])}`,
//                   }}
//                 >
//                   {msg.file ? (
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <AttachFileIcon fontSize="small" color="action" />
//                       <Typography
//                         component="a"
//                         href={URL.createObjectURL(msg.file)}
//                         download
//                         sx={{
//                           color: theme.palette.primary.main,
//                           textDecoration: 'none',
//                           '&:hover': { textDecoration: 'underline' },
//                           fontSize: '0.8rem'
//                         }}
//                       >
//                         {msg.file.name}
//                       </Typography>
//                     </Box>
//                   ) : (
//                     <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
//                       {msg.message}
//                     </Typography>
//                   )}
//                 </Box>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     color: theme.palette.text.secondary,
//                     textAlign: msg.isUser ? 'right' : 'left',
//                     px: 1,
//                     fontSize: '0.65rem'
//                   }}
//                 >
//                   {msg.time}
//                 </Typography>
//               </Box>
//             </Box>
//           ))}
//         <div ref={messagesEndRef} />
//       </Box>

//       {/* Input Area */}
//       <Box
//         sx={{
//           p: 1.5,
//           borderTop: `1px solid ${theme.palette.divider}`,
//           backgroundColor: theme.palette.background.paper,
//         }}
//       >
//         <Box sx={{ display: 'flex', gap: 1 }}>
//           <IconButton
//             size="small"
//             onClick={triggerFileInput}
//             sx={{
//               color: theme.palette.text.secondary,
//               '&:hover': {
//                 backgroundColor: theme.palette.action.hover,
//               }
//             }}
//           >
//             <AttachFileIcon fontSize="small" />
//           </IconButton>
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleFileChange}
//             style={{ display: 'none' }}
//           />
//           <TextField
//             fullWidth
//             size="small"
//             placeholder="Type a message..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={(e) => {
//               if (e.key === 'Enter') {
//                 handleSendMessage();
//               }
//             }}
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 borderRadius: '20px',
//                 backgroundColor: theme.palette.grey[50],
//                 '& fieldset': {
//                   borderColor: 'transparent',
//                 },
//                 '&:hover fieldset': {
//                   borderColor: theme.palette.grey[300],
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: theme.palette.primary.main,
//                 },
//               },
//             }}
//           />
//           <IconButton
//             color="primary"
//             onClick={handleSendMessage}
//             disabled={!message.trim()}
//             sx={{
//               color: theme.palette.primary.main,
//               '&:hover': {
//                 backgroundColor: theme.palette.primary.lighter,
//               },
//               '&:disabled': {
//                 color: theme.palette.text.disabled,
//               }
//             }}
//           >
//             <SendIcon fontSize="small" />
//           </IconButton>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

function AuditFindingsPage() {
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
  const [viewRemarkModalOpen, setViewRemarkModalOpen] = useState(false);
  const [viewRemarkText, setViewRemarkText] = useState("");
  const [activeChatRow, setActiveChatRow] = useState(null);
const [datePickerOpen, setDatePickerOpen] = React.useState(false);

const safeLower = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val.toLowerCase().trim();
  if (typeof val === "number") return val.toString().toLowerCase();
  return String(val).toLowerCase().trim();
};
const handleClearSearch = () => {
  setSearchTerm('');
  setSelectedDate(null);
  setPage(0);
};

const filteredData = Array.isArray(tableData)
  ? tableData.filter((row) => {
      const matchesStatus =
        statusFilter === "All" ||
        (row.workflowStatuses || []).some(
          (ws) => safeLower(ws) === safeLower(statusFilter)
        );

      const searchLower = safeLower(searchTerm);
      const matchesSearch =
        searchTerm === "" ||
        safeLower(row.declarationNum).includes(searchLower) ||
        safeLower(row.issueCount?.toString()).includes(searchLower) ||
        safeLower(row.auditorRemark).includes(searchLower) ||
        safeLower(row.clientResponse).includes(searchLower) ||
        safeLower(row.clientRemarks).includes(searchLower) ||
        safeLower(row.status).includes(searchLower) ||
        (row.auditorFindings &&
          row.auditorFindings.some((finding) =>
            safeLower(finding).includes(searchLower)
          ));

      // ✅ New: Date filter
      const matchesDate =
        !selectedDate ||
        new Date(row.declarationDate).toDateString() ===
          new Date(selectedDate).toDateString();

      return matchesStatus && matchesSearch && matchesDate;
    })
  : [];

// Add near your other state declarations
const [auditorFindingsModalOpen, setAuditorFindingsModalOpen] = useState(false);
const [selectedAuditorFindings, setSelectedAuditorFindings] = useState([]);
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
  // Collect ALL findings
  const allFindings = item.findings
    .filter(f => f.finding && f.finding !== "No Issues")
    .map(f => f.finding);

  // Use workflow_status from backend (not only findings)
  const workflowStatuses = item.findings.length > 0
    ? item.findings.map(f => f.workflow_status)
    : [item.workflow_status];   // ✅ fallback for Open/Closed

  return {
    id: item.id,
    declarationNum: item.declaration_number,
    declarationDate: item.date,
    issueCount: allFindings.length, // Use actual count of findings

    // ✅ store all findings for the modal
    auditorFindings: allFindings,
    allFindings: allFindings, // Keep both for compatibility

    // ✅ workflowStatuses always has at least 1
    workflowStatuses,
    status: workflowStatuses[0] || "-",

    // ✅ show first finding details, or "-"
    auditorFinding: allFindings.length > 0 ? allFindings[0] : "-",
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
  // Initialize with your static data
  const visibleRows = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
const backendBaseUrl = API_URL;
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
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
  setActiveChatRow(doc.id);   // ✅ highlight this row

  if (!messages[doc.id]) {
    setMessages(prev => ({
      ...prev,
      [doc.id]: []
    }));
  }

  setChatOpen(true);

  // ✅ Scroll the clicked row into view aligned to the Chat cell
  setTimeout(() => {
    const rowElement = window.document.getElementById(`row-${doc.id}`);
    if (rowElement) {
      rowElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "end" });
    }
  }, 100);
};


const handleCloseChat = () => {
  setChatOpen(false);
  setActiveChatRow(null);   // ✅ remove highlight when chat closes
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
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ fontSize: "14px" }}
            >
              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigate('/audits-status')}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              >
                Audit Status
              </Link>
              <Link 
                underline="hover"
                color="inherit"
                onClick={() => navigate('/company')}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              >
                Audit's Organization Status
              </Link>

              <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "14px" }}>
                Audit's Declaration Details
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
                   overflowX: chatOpen ? "auto" : "hidden", // Only allow horizontal scroll when chat is open
                   minWidth: chatOpen ? 1000 : "100%",      // Set minWidth only when chat is open
                 }}
               >
                 <Table
                   size="small"
                   sx={{
                     minWidth: chatOpen ? 1000 : "100%",    // Set minWidth only when chat is open
                     tableLayout: "fixed",
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
      ? new Date(row.declarationDate).toLocaleDateString("en-GB")
      : "N/A"}
  </TableCell>

  <TableCell sx={{ fontSize: "12px", paddingLeft: "12px", textAlign: "center" }}>
    {row.issueCount}
  </TableCell>

               <TableCell align="center" sx={{ fontSize: "12px", textAlign: "center" }}>
  {row.auditorFindings &&
   row.auditorFindings.length > 0 &&
   row.auditorFindings[0] !== "-" ? (
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


  <TableCell sx={{ fontSize: "12px" }}>
    {row.clientResponse !== "-" ? (
      <Typography sx={{ color: 'text.primary', fontSize: "12px" }}>
        {row.clientResponse}
      </Typography>
    ) : "-"}
  </TableCell>

  <TableCell sx={{ fontSize: "12px" }}>
    {row.clientRemarks !== "-" ? (
      <Typography sx={{ color: 'text.primary', fontSize: "12px" }}>
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
      <Dialog
        open={viewRemarkModalOpen}
        onClose={() => setViewRemarkModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {/* remark dialog */}
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
      <ChatBox
        open={chatOpen}
        currentDocument={currentDocument}
        threadId={currentDocument?.id}
        onSendMessage={handleSendMessage}
        onClose={handleCloseChat}
        source="declaration"
      />
    </Box>
  );
}


export default AuditFindingsPage;