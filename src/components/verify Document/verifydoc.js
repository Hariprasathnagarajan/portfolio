import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Tooltip from '@mui/material/Tooltip';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
    Box,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    InputAdornment,
    IconButton,
    useTheme,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    OutlinedInput,
    Popover,
    TableSortLabel,
    FormControl,
    InputLabel,
    CircularProgress,
    TextField,
    DialogContentText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Filter as FilterIcon, Download, RotateCcw } from 'lucide-react';
import apiServices, { API_URL1 } from '../../ApiServices/ApiServices';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from '@mui/icons-material/Info';
// import CloseIcon from '@mui/icons-material/Close';

const StatusText = styled('span')(({ status }) => ({
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'inline-block',
    textAlign: 'left',
    minWidth: '80px',
    backgroundColor:
        status === 'REJECTED' ? '#ffebee' :
            status === 'APPROVED' ? '#e8f5e9' :
                '#fff3e0',
    color:
        status === 'REJECTED' ? '#d32f2f' :
            status === 'APPROVED' ? '#2e7d32' :
                '#ffa726',
}));

// Styled component for status indicators
const StatusIndicator = styled(Box)(({ status }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
 backgroundColor:
    status === 'Approved' ? "#E8F5E9" :     // light green
    status === 'Rejected' ? "#FFEBEE" :     // red
    status === 'PENDING'  ? '#FFE082' :     // yellow
                            '#9E9E9E',      // grey

  color:
    status === 'Approved' ? "#2E7D32" :     // dark green font
    status === 'Rejected' ? "#C62828" :     // white font for red bg
    status === 'PENDING'  ? '#000000' :     // black font for yellow bg
                            '#FFFFFF',  
    height: '24px',
    minWidth: '80px',
}));

const headLabel = [
    { id: 'declarationNumber', label: 'Declaration Number', align: 'left', width: '20%' },
    { id: 'declarationDate', label: 'Declaration Date', align: 'left', width: '15%' },
    { id: 'documentsCount', label: 'Documents', align: 'center', width: '15%' },
    { id: 'updatedDate', label: 'Updated Date', align: 'left', width: '20%' },

];

const DocumentApproval = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDoc, setFilterDoc] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    
const [datePickerOpen, setDatePickerOpen] = React.useState(false);

    const anchorRef = useRef(null);
    const StatusDotsWithCount = ({ documents }) => {
        // Handle undefined/null documents array
        if (!documents || !Array.isArray(documents)) {
            return null;
        }

        const statusCounts = documents.reduce((acc, doc) => {
            const status = doc?.status?.toUpperCase() || 'UNKNOWN';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return (
            <Box display="flex" alignItems="center" gap={1}>
                {['APPROVED', 'REJECTED', 'PENDING'].map((status) => (
                    statusCounts[status] ? (
                        <Box key={status} display="flex" alignItems="center" gap={0.5}>
                            <Box
                                sx={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: status === 'APPROVED' ? '#A5D6A7' :
                                        status === 'REJECTED' ? '#F44336' :
                                            status === 'PENDING' ? '#FFE082' : '#9E9E9E',
                                    boxShadow: '0 0 4px 1px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                {statusCounts[status] || 0}
                            </Typography>
                        </Box>
                    ) : null
                ))}
            </Box>
        );
    };

    // Also update the grouping useEffect to ensure documents array exists
    useEffect(() => {
        if (data && Array.isArray(data)) {
            const groups = data.reduce((acc, document) => {
                if (!document) return acc;

                const key = document.declarationNumber;
                if (!acc[key]) {
                    acc[key] = {
                        declarationNumber: key,
                        declarationDate: document.declarationDate || document.updatedDate,
                        documents: [],
                        latestUpdate: document.updatedDate,
                        status: document.status?.toUpperCase() || 'UNKNOWN'
                    };
                }
                if (document) {
                    acc[key].documents.push(document);
                    if (new Date(document.updatedDate) > new Date(acc[key].latestUpdate)) {
                        acc[key].latestUpdate = document.updatedDate;
                    }
                }
                return acc;
            }, {});

            setGroupedData(Object.values(groups));
        } else {
            setGroupedData([]);
        }
    }, [data]);

    // Update the grouping useEffect to include declarationDate

    const [groupedData, setGroupedData] = useState([]);
    const [openGroupDialog, setOpenGroupDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    // Add this useEffect to group the data when data changes
    useEffect(() => {
        if (data.length > 0) {
            const groups = data.reduce((acc, document) => {
                const key = document.declarationNumber;
                if (!acc[key]) {
                    acc[key] = {
                        declarationNumber: key,
                        documents: [],
                        latestUpdate: document.updatedDate,
                        status: document.status.toUpperCase(),
                        documentType: document.documentType
                    };
                }
                acc[key].documents.push(document);
                if (new Date(document.updatedDate) > new Date(acc[key].latestUpdate)) {
                    acc[key].latestUpdate = document.updatedDate;
                }
                return acc;
            }, {});

            setGroupedData(Object.values(groups));
        }
    }, [data]);

    // Add this function near your other handler functions
    const handleOpenGroupDialog = (group) => {
        setSelectedGroup(group);
        setOpenGroupDialog(true);
    };

    const handleCloseGroupDialog = () => {
        setOpenGroupDialog(false);
        setSelectedGroup(null);
    };
    const theme = useTheme();



    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('latestUpdate');
    const [selectedDate, setSelectedDate] = useState(null);
    const [openPdfDialog, setOpenPdfDialog] = useState(false);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [currentDocumentId, setCurrentDocumentId] = useState(null);
    const [actionMessage, setActionMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showSearchInfo, setShowSearchInfo] = useState(false);
    const [lastViewedId, setLastViewedId] = useState(null);
    const searchInfoRef = useRef(null);
    const navigate = useNavigate();

    const url = API_URL1;

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await apiServices.getDocuments();
            console.log('Fetched documents:', response);

            if (!response || !response.documents) {
                throw new Error('Invalid response structure');
            }

            const documents = response.documents
                // .filter(doc => doc.status?.toLowerCase() === 'pending')
                .map(doc => ({
                    id: doc.id,
                    declarationNumber: doc.declaration_number,
                    versionId: doc.current_version?.id,
                    declarationDate: doc.declaration_date || doc.updated_at,
                    file: doc.current_version?.file_path,
                    fileName: doc.current_version?.file_path ? doc.current_version.file_path.split('/').pop() : "",
                    updatedDate: doc.updated_at,
                    documentType: doc.document_type?.name || '',
                    status: doc.status || '',
                    // Prefer comments, fallback to rework_reason.description if comments is empty
                      rejectionReason:
    doc.file_approval_history?.approval_status === "Rejected"
      ? doc.file_approval_history?.comments || ""
      : "",
                    version: doc.current_version?.version_number,
                }));

            // Group documents by declarationNumber
            const grouped = documents.reduce((acc, doc) => {
                const key = doc.declarationNumber;
                if (!acc[key]) {
                    acc[key] = {
                        declarationNumber: key,
                        declarationDate: doc.declarationDate,
                        documents: [],
                        latestUpdate: doc.updatedDate,
                        status: doc.status.toUpperCase()
                    };
                }
                acc[key].documents.push(doc);
                // Update latest update date if newer
                if (new Date(doc.updatedDate) > new Date(acc[key].latestUpdate)) {
                    acc[key].latestUpdate = doc.updatedDate;
                }
                return acc;
            }, {});

            setGroupedData(Object.values(grouped));
            setFilteredData(Object.values(grouped));

        } catch (error) {
            console.error('Error fetching documents:', error);
            setErrorMessage(`Error fetching documents: ${error.message}`);
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortData = (dataToSort, order, orderBy) => {
        return [...dataToSort].sort((a, b) => {
            let comparison = 0;
            if (orderBy === 'declarationNumber') {
                comparison = a.declarationNumber?.localeCompare(b.declarationNumber) || 0;
            } else if (orderBy === 'fileName') {
                comparison = a.fileName?.localeCompare(b.fileName) || 0;
            } else if (orderBy === 'updatedDate') {
                comparison = new Date(a.updatedDate).getTime() - new Date(b.updatedDate).getTime();
            } else if (orderBy === 'documentType') {
                comparison = a.documentType?.localeCompare(b.documentType) || 0;
            } else if (orderBy === 'latestUpdate') {
                comparison = new Date(a.latestUpdate).getTime() - new Date(b.latestUpdate).getTime();
            }
            return order === 'asc' ? comparison : -comparison;
        });
    };


  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setSelected([]);
  };
  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedDate(null);
    setSelected([]);
  };
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSearchTerm(date ? dayjs(date).format('DD/MM/YYYY').toLowerCase() : '');
        setCurrentPage(0);
        handleClose();
    };


    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'date-picker-popover' : undefined;

    useEffect(() => {
        const filtered = groupedData.filter((item) => {
            const formattedUpdatedDate = dayjs(item.latestUpdate).format('DD/MM/YYYY').toLowerCase();
            const matchesSearch =
                item.declarationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formattedUpdatedDate.includes(searchTerm.toLowerCase()) ||
                item.documentType?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDocType = !filterDoc || item.documentType === filterDoc;
              const matchesDate =
    !selectedDate ||
    new Date(item.declarationDate).toDateString() ===
      new Date(selectedDate).toDateString();
            return matchesSearch && matchesDocType&& matchesDate;
        });
        setFilteredData(filtered);
}, [groupedData, searchTerm, filterDoc, selectedDate]);

    const sortedData = useMemo(() => {
        return sortData(filteredData, order, orderBy);
    }, [filteredData, order, orderBy]);

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };
    const [selected, setSelected] = useState([]); // State for selected document IDs
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const handleOpenPdf = async (declarationNumber, versionId) => {
  if (!declarationNumber || !versionId) {
    console.error("❌ Missing declarationNumber or versionId");
    setErrorMessage("Invalid document reference.");
    setTimeout(() => setErrorMessage(""), 3000);
    return;
  }

  try {
    const secureUrl = `${url.replace(/\/+$/, '')}/api/declaration-documents/${encodeURIComponent(
      declarationNumber
    )}/view-secure-pdf/${versionId}/`;

    const response = await fetch(secureUrl, {
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

    // ✅ Allow both PDF and image types
    if (blob.type === "application/pdf") {
      setSelectedPdfUrl({ url: blobUrl, type: "pdf" });
    } else if (blob.type.startsWith("image/")) {
      setSelectedPdfUrl({ url: blobUrl, type: "image" });
    } else {
      throw new Error("Unsupported file type for viewing.");
    }

    setOpenPdfDialog(true);
  } catch (error) {
    console.error("❌ Failed to load document:", error);
    setErrorMessage("Unable to preview this document.");
    setTimeout(() => setErrorMessage(""), 3000);
  }
};

    // New function to handle viewing all documents in a group
    const handleViewAllDocuments = (group) => {
        if (!group || !Array.isArray(group.documents) || group.documents.length === 0) {
            alert("No documents to view.");
            return;
        }

        group.documents.forEach(async (doc) => {
            if (!doc || !doc.declarationNumber || !doc.versionId) {
                console.error("Missing declarationNumber or versionId for a document.");
                return;
            }

            try {
                const secureUrl = `${url.replace(/\/+$/, '')}/api/declaration-documents/${encodeURIComponent(
                    doc.declarationNumber
                )}/view-secure-pdf/${doc.versionId}/`;

                const response = await fetch(secureUrl, {
                    method: 'GET',
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                // Open in a new tab
                window.open(blobUrl, '_blank');

            } catch (error) {
                console.error("Error opening secure PDF for a document:", error);
                // Optionally, alert the user about the specific document failure
                // alert(`Failed to open document ${doc.fileName}`);
            }
        });
    };


    const handleClosePdf = () => {
        setOpenPdfDialog(false);
        setSelectedPdfUrl('');
    };

    // const handleDownload = (filePath) => {
    //     const fullUrl = filePath.startsWith('http') ? filePath : `${url}/${filePath.replace(/^\/+/, '')}`;
    //     window.open(fullUrl, '_blank');
    // };

    const handleReset = () => {
        setSearchTerm('');
        setFilterDoc('');
        setSelectedDate(null);
        setCurrentPage(0);
    };

    const visibleRows = useMemo(() => {
        return sortedData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage]);

    const createSortHandler = (property) => (event) => {
        handleRequestSort(event, property);
    };

    const handleApproval = async (declarationNumber, newStatus) => {
        setActionMessage('');
        setIsLoading(true);

        try {
            console.log('Approval:', declarationNumber, newStatus);
            if (newStatus === 'Approved') {
                await apiServices.verifyDocument(declarationNumber, { approval_status: 'Approved' });
            } else if (newStatus === 'Rejected') {
                await apiServices.verifyDocument(declarationNumber, { approval_status: 'Rejected' });
            }

            const updatedData = data.map((item) =>
                item.declarationNumber === declarationNumber
                    ? { ...item, status: newStatus }
                    : item
            );
            setData(updatedData);
            setFilteredData(updatedData);
            setActionMessage(`Document ${declarationNumber} has been ${newStatus}`);
            setTimeout(() => {
                setActionMessage('');
            }, 3000);
            fetchDocuments();
            // ..selectedGroup.status = 'Approved'; // Update the status in the selected group
            // ✅ Correct way to update selectedGroup
            setSelectedGroup((prev) => {
                if (!prev) return prev;

                // Update only the matching document's status
                const updatedDocs = prev.documents.map((doc) =>
                    doc.id === declarationNumber
                        ? { ...doc, status: newStatus }
                        : doc
                );

                return { ...prev, documents: updatedDocs };
            });

        } catch (error) {
            console.error('Error during approval/rejection:', error);
            setErrorMessage('There was an error processing your request.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        } finally {
            setIsLoading(false); // End loading
        }
    };

   const handleRejectSubmit = async (declarationNumber) => {
    // ... (rest of your existing code)

    try {
        setIsLoading(true);
        await apiServices.verifyDocument(currentDocumentId, {
            approval_status: "Rejected",
            comments: rejectionReason,
        });

        // The following lines update the local state, but you also need to re-fetch from the server
        const updatedData = data.map((doc) =>
            doc.id === currentDocumentId
                ? { ...doc, status: "Rejected", rejectionReason }
                : doc
        );

        setData(updatedData);
        setFilteredData(updatedData);
        setIsRejectDialogOpen(false);
        setRejectionReason("");
        setActionMessage('Document has been rejected successfully');

        // 👇 Add this line to refresh the data after a successful rejection
        fetchDocuments(); 

        setTimeout(() => {
            setActionMessage('');
        }, 3000);
        
        setSelectedGroup((prev) => {
            if (!prev) return prev;
            const updatedDocs = prev.documents.map((doc) =>
                doc.id === declarationNumber
                    ? { ...doc, status: "Rejected" }
                    : doc
            );
            return { ...prev, documents: updatedDocs };
        });
    } catch (error) {
        // ... (rest of your existing code)
    } finally {
        setIsLoading(false);
    }
};

    const openRejectDialog = (documentId) => {
        setCurrentDocumentId(documentId);
        setRejectionReason('');
        setIsRejectDialogOpen(true);
    };

    const closeRejectDialog = () => {
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        setCurrentDocumentId(null);
    };
    const handleDownloadSelected = async () => {
        if (selected.length === 0) {
            setSnackbar({ open: true, message: "Please select at least one document to download.", severity: 'warning' });
            return;
        }

        try {
            setIsLoading(true);
            const zip = new JSZip();
            const selectedDocuments = data.filter(doc => selected.includes(doc.id));

            // Group documents by declaration number
            const groupedByDeclaration = selectedDocuments.reduce((acc, doc) => {
                if (!acc[doc.declarationNumber]) {
                    acc[doc.declarationNumber] = [];
                }
                acc[doc.declarationNumber].push(doc);
                return acc;
            }, {});

            // Process each group and add files to the zip
            await Promise.all(
                Object.entries(groupedByDeclaration).map(async ([declarationNumber, docs]) => {
                    const declarationFolder = zip.folder(declarationNumber);

                    await Promise.all(docs.map(async (doc) => {
                        try {
                            const fullUrl = doc.filePath.startsWith('http')
                                ? doc.filePath
                                : `${url}/${doc.filePath.replace(/^\/+/, '')}`;

                            const response = await fetch(fullUrl);
                            if (!response.ok) {
                                console.error(`Failed to fetch ${doc.fileName} from ${fullUrl}. Status: ${response.status}`);
                                throw new Error(`Failed to fetch ${doc.fileName}`);
                            }
                            const blob = await response.blob();
                            declarationFolder.file(doc.fileName, blob);
                        } catch (error) {
                            console.error(`Error downloading ${doc.fileName}:`, error);
                            // Optionally, notify user about failed individual downloads
                            setSnackbar(prev => ({
                                open: true,
                                message: `Failed to download ${doc.fileName}.`,
                                severity: 'error'
                            }));
                        }
                    }));
                })
            );

            // Generate and save the zip file
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'documents_by_declaration.zip');
            setSnackbar({ open: true, message: 'Selected documents downloaded successfully!', severity: 'success' });
        } catch (error) {
            console.error('Error creating zip file:', error);
            setSnackbar({ open: true, message: 'Failed to create zip file for download.', severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
const handleDownload = async (declarationNumber, versionId, fileName) => {
  try {
    const token = localStorage.getItem("token");
    const secureUrl = `${url.replace(/\/+$/, '')}/api/declaration-documents/${encodeURIComponent(
      declarationNumber
    )}/view-secure-pdf/${versionId}/`;

    const response = await fetch(secureUrl, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    saveAs(blob, fileName || "document.pdf");

    setSnackbar({ open: true, message: `"${fileName}" downloaded successfully!`, severity: "success" });
  } catch (error) {
    console.error("Error downloading file:", error);
    setSnackbar({ open: true, message: "Failed to download file.", severity: "error" });
  }
};

    const uniqueDocumentTypes = useMemo(() => {
        return [...new Set(data.map(doc => doc.documentType))].filter(Boolean);
    }, [data]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchInfoRef.current && !searchInfoRef.current.contains(event.target)) {
                setShowSearchInfo(false);
            }
        };

        if (showSearchInfo) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSearchInfo]);

    return (
         <Box sx={{zIndex:0,
                    padding: "20px",
                    position: "relative", // Corrected from "rela" to "relative"
                    top: "70px",
                    width: '100%',
                    fontSize: '12px',
                    paddingRight: '50px',
                    boxSizing: 'border-box'
                }}>
          <Box
                  sx={{
                    zIndex: 0,
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
                    <Typography color="text.primary" sx={{ fontWeight: 550 }}>
                     Document Approval
                    </Typography>
                  </Box>

            {actionMessage && (
                <Box sx={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    {actionMessage}
                </Box>
            )}

            {errorMessage && (
                <Box sx={{
                    backgroundColor: '#ffebee',
                    color: '#d32f2f',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <CancelIcon sx={{ mr: 1 }} />
                    {errorMessage}
                </Box>
            )}

            <Card sx={{
                width: '100%',
                mixWidth: 600,
                p: 2,
                backgroundColor: theme.palette.background.paper,
                boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                background: theme.palette.grey[50],
                mx: 'auto',
                boxSizing: 'border-box'
            }}>
                {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                )}

           {!isLoading && (
  <>
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

    <TableContainer sx={{ maxHeight: 277, overflowY: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            {headLabel.map((headCell) => (
              <TableCell
                key={headCell.id}
                align="left"
                sortDirection={orderBy === headCell.id ? order : false}
                sx={{ fontWeight: 'bold', fontSize: '12px', width: headCell.width, padding: '8px' }}
              >
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                  sx={{ fontWeight: 'bold', fontSize: '12px' }}
                >
                  {headCell.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredData.length > 0 ? (
            visibleRows.map((group) => (
              <TableRow hover key={group.declarationNumber}>
                <TableCell
                  align="left"
                  sx={{ padding: '8px', fontSize: '12px', cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
                  onClick={() => handleOpenGroupDialog(group)}
                >
                  {group.declarationNumber}
                </TableCell>
                <TableCell align="left" sx={{ padding: '8px', fontSize: '12px' }}>
                  {group.declarationDate ? dayjs(group.declarationDate).format('DD/MM/YYYY') : 'N/A'}
                </TableCell>
                <TableCell align="center" sx={{ padding: '8px', fontSize: '12px' }}>
                  <StatusDotsWithCount documents={group.documents} />
                </TableCell>
                <TableCell align="left" sx={{ padding: '8px', fontSize: '12px' }}>
                  {dayjs(group.latestUpdate).format('DD/MM/YYYY')}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={headLabel.length} align="center" sx={{ fontSize: '12px', py: 3 }}>
                No pending documents found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

    <TablePagination
      component="div"
      count={filteredData.length}
      page={currentPage}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={[5, 10, 25]}
      sx={{ fontSize: '12px' }}
    />
  </>
)}

            </Card>
            <Dialog
                open={openGroupDialog}
                onClose={handleCloseGroupDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                    <span>Documents for Declaration: {selectedGroup?.declarationNumber}</span>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleViewAllDocuments(selectedGroup)}
                        sx={{ fontSize: "12px", textTransform: "none", mr: 1 }}
                    >
                        📂 View All
                    </Button>
                </DialogTitle>
                <DialogContent>
                    {selectedGroup && (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>File Name</TableCell>
                                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>Document Type</TableCell>
                                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedGroup.documents.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell sx={{ fontSize: '12px' }}>
                                                {doc.fileName}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '12px' }}>{doc.documentType}</TableCell>
<TableCell sx={{ fontSize: "12px" }}>
  <Box display="flex" alignItems="center" gap={1}>
    {/* Status Chip */}
    <StatusIndicator status={doc.status}>
      {doc.status}
    </StatusIndicator>

    {/* Rejection Icon with Tooltip */}
    {doc.status === "Rejected" && (
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1 }}
            >
              Rejection Details
            </Typography>
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                sx={{ display: "block", fontWeight: 500 }}
              >
                Reason:
              </Typography>
              <Typography variant="body2">
                {doc.rejectionReason || "No reason provided"}
              </Typography>
            </Box>
          </Box>
        }
        arrow
        placement="top"
      >
        <ErrorOutlineIcon
          fontSize="small"
          sx={{
            color: "#d32f2f",
            bgcolor: "#fff", // same red as your REJECTED chip
            borderRadius: "50%",
            padding: "3px",
            cursor: "pointer",
            "&:hover": {
               // darker red on hover
              transform: "scale(1.1)",
            },
            transition: "all 0.2s ease",
          }}
        />
      </Tooltip>
    )}
  </Box>
</TableCell>



                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleOpenPdf(doc.declarationNumber, doc.versionId)}
                                                        size="small"
                                                        sx={{
                                                            color: theme.palette.primary.main,
                                                            '&:hover': {
                                                                backgroundColor: theme.palette.primary.light,
                                                            },
                                                        }}
                                                    >
                                                        <SearchIcon fontSize="small" />
                                                    </IconButton>
                                                    <Tooltip title="Download">
                                                        <IconButton
  size="small"
  onClick={() => handleDownload(doc.declarationNumber, doc.versionId, doc.fileName)}
  sx={{ color: theme.palette.success.main, '&:hover': { backgroundColor: theme.palette.success.light } }}
>
  <Download size={16} />
</IconButton>

                                                    </Tooltip>

                                                    {doc.status === 'Pending' && (
                                                        <>
                                                            <IconButton
                                                                color="success"
                                                                onClick={() => handleApproval(doc.id, 'Approved')}
                                                                size="small"
                                                                disabled={isLoading}
                                                            >
                                                                <CheckCircleIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => openRejectDialog(doc.id)}
                                                                size="small"
                                                                disabled={isLoading}
                                                            >
                                                                <CancelIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}

                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseGroupDialog}
                        sx={{ fontSize: '12px' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {/* PDF Dialog */}
            <Dialog open={openPdfDialog} onClose={handleClosePdf} fullWidth maxWidth="md">
                <DialogTitle sx={{ fontSize: '12px' }}>Document Viewer</DialogTitle>
                <DialogContent>
                   {selectedPdfUrl ? (
  selectedPdfUrl.type === "pdf" ? (
    <iframe
      src={selectedPdfUrl.url}
      title="PDF Viewer"
      width="100%"
      height="600px"
      style={{ border: "none" }}
    />
  ) : (
    <img
      src={selectedPdfUrl.url}
      alt="Document Preview"
      style={{ width: "100%", maxHeight: "600px", objectFit: "contain" }}
    />
  )
) : (
  <Typography>No document selected.</Typography>
)}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePdf} sx={{ fontSize: '12px' }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onClose={closeRejectDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontSize: '14px' }}>Reject Document</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: '12px', mb: 2 }}>
                        Please provide a reason for rejecting this document:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="rejectionReason"
                        label="Rejection Reason"
                        type="text"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        sx={{ fontSize: '12px' }}
                        placeholder="Enter the reason for rejection..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeRejectDialog}
                        sx={{ fontSize: '12px' }}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleRejectSubmit(currentDocumentId, 'REJECTED')}
                        color="error"
                        disabled={!rejectionReason?.trim() || isLoading}
                        sx={{ fontSize: '12px' }}
                    >
                        {isLoading ? 'Processing...' : 'Submit Rejection'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DocumentApproval;