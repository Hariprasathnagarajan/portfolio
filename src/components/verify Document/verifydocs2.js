import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    DialogActions,
    useTheme,
    MenuItem,
    Dialog,
    DialogContent,
    DialogTitle,
    Select,
    OutlinedInput,
    Popover,
    TableSortLabel,
    Checkbox,
    FormControl,
    InputLabel,
    CircularProgress,
    styled,
    Snackbar,
    Alert,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Download } from 'lucide-react';
import apiServices from '../../ApiServices/ApiServices'; // Assuming this path is correct
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import authService from "../../ApiServices/ApiServices"; // Assuming this path is correct
import 'dayjs/locale/en';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Define user roles for consistent access control
const ROLES = {
    ADMIN: "ADMIN",
    PRODUCT_ADMIN: "PRODUCT_ADMIN",
    VIEWER: "VIEWER",
    PRODUCT_OWNER: "PRODUCT_OWNER",
    UPLOADER: "UPLOADER",
    REVIEWER: "REVIEWER"
};

// Styled component for status indicators
const StatusIndicator = styled(Box)(({ status }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'black',
    backgroundColor: status === 'APPROVED' ? '#A5D6A7' :
        status === 'REJECTED' ? '#F44336' :
            status === 'PENDING' ? '#FFE082' : '#9E9E9E',
    height: '24px',
    minWidth: '80px',
}));

// Component to display status dots with counts for grouped documents
const StatusDotsWithCount = ({ documents }) => {
    const statusCounts = documents.reduce((acc, doc) => {
        const status = doc.status.toUpperCase();
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
                                zIndex: 0,
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: status === 'APPROVED' ? '#A5D6A7' :
                                    status === 'REJECTED' ? '#F44336' :
                                        status === 'PENDING' ? '#FFE082' : '#9E9E9E',
                                boxShadow: '0 0 4px 1px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Typography variant="caption" sx={{ zIndex: 0, fontSize: '0.75rem' }}>
                            {statusCounts[status] || 0}
                        </Typography>
                    </Box>
                ) : null
            ))}
        </Box>
    );
};

// Table header labels and their properties
const headLabel = [
    { id: 'declarationNumber', label: 'Declaration Number', align: 'left', width: '20%' },
    { id: 'declarationDate', label: 'Declaration Date', align: 'left', width: '15%' },
    { id: 'documentsCount', label: 'Documents', align: 'center', width: '15%' },
    { id: 'assignedUser', label: 'Assigned To', align: 'left', width: '20%' },
    { id: 'updatedDate', label: 'Updated Date', align: 'left', width: '20%' },
];

// Memoized component for the table head to prevent unnecessary re-renders
const DocumentTableHead = React.memo(({ order, orderBy, onRequestSort, numSelected, filteredDataLength, onSelectAllClick }) => {
    const theme = useTheme();

    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    // Debugging logs for select all/unselect all
    useEffect(() => {
        console.log("DocumentTableHead - numSelected:", numSelected, "filteredDataLength:", filteredDataLength);
        console.log("DocumentTableHead - Checkbox checked prop:", filteredDataLength > 0 && numSelected === filteredDataLength);
        console.log("DocumentTableHead - Checkbox indeterminate prop:", numSelected > 0 && numSelected < filteredDataLength);
    }, [numSelected, filteredDataLength]);

    return (
        // Added a key to ensure TableHead re-renders when sorting changes, which can sometimes affect checkbox state
        <TableHead key={`${order}-${orderBy}`} sx={{
            zIndex: 0,
            background: theme.palette.grey[100],
            borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        indeterminate={numSelected > 0 && numSelected < filteredDataLength}
                        checked={filteredDataLength > 0 && numSelected === filteredDataLength}
                        onChange={onSelectAllClick}
                        inputProps={{ 'aria-label': 'select all documents' }}
                        sx={{
                            zIndex: 0,
                            color: theme.palette.grey[600],
                            '&.Mui-checked': {
                                color: theme.palette.primary.main,
                            },
                        }}
                    />
                </TableCell>
                {headLabel.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align}
                        sx={{
                            zIndex: 0,
                            fontWeight: '600', // Ensures header text is bold
                            fontSize: "12px",
                            padding: '12px 8px',
                            whiteSpace: 'nowrap',
                            width: headCell.width,
                            color: theme.palette.text.primary,
                            '& .MuiTableSortLabel-root': {
                                color: theme.palette.text.primary,
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                },
                                '&.Mui-active': {
                                    color: theme.palette.primary.main,
                                },
                            },
                        }}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                            aria-label={`Sort by ${headCell.label}`}
                            tabIndex={0}
                            onKeyPress={(e) => e.key === 'Enter' && createSortHandler(headCell.id)(e)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <span style={{ display: 'none' }}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </span>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}

            </TableRow>
        </TableHead>
    );
});

// Main DocumentList component
const DocumentLists = () => {
    const [data, setData] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [role, setRole] = useState("VIEWER");
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();
    const url = 'http://localhost:8000'; // Base URL for file paths
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('declarationNumber');
    const [selected, setSelected] = useState([]); // State for selected document IDs
    const [selectedDate, setSelectedDate] = useState(null); // State for date filter
    const [openGroupDialog, setOpenGroupDialog] = useState(false); // State for group details dialog
    const [selectedGroup, setSelectedGroup] = useState(null); // State for the currently selected group
    const [reviewers, setReviewers] = useState([]); // List of available reviewers
    const [assignedUsers, setAssignedUsers] = useState({}); // Mapping of document ID to assigned user ID
    const [showBulkAssignModal, setShowBulkAssignModal] = useState(false); // State for bulk assign modal
    const [showSelectedAssignModal, setShowSelectedAssignModal] = useState(false); // State for selected assign modal
    const [selectedReviewer, setSelectedReviewer] = useState(''); // Reviewer selected in bulk assign modal
    const [selectedReviewerForSelected, setSelectedReviewerForSelected] = useState(''); // Reviewer selected for specific docs
    const [loadingAssignments, setLoadingAssignments] = useState({}); // Loading state for individual assignments
    const [userNames, setUserNames] = useState({}); // Mapping of document ID to assigned user name
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' }); // Snackbar for notifications
    const anchorRef = useRef(null); // Ref for date picker popover anchor
    const [anchorEl, setAnchorEl] = useState(null); // Anchor element for date picker popover
const [actionMessage, setActionMessage] = useState('');
const [filteredDataState, setFilteredData] = useState([]); // You already have filteredData from useMemo, so rename to avoid conflict
const [errorMessage, setErrorMessage] = useState('');
const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
const [rejectionReason, setRejectionReason] = useState('');
const [currentDocumentId, setCurrentDocumentId] = useState(null);

    // Helper function to get reviewer name by ID
    const getReviewerNameById = (reviewerId) => {
        const reviewer = reviewers.find(r => r.id === reviewerId);
        return reviewer ? reviewer.name : 'Unassigned';
    };

    // Handlers for date picker popover
    const handleCalendarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Handler for navigating to backup page
    const handleBackupClick = () => {
        navigate('/backup');
    };

    const open = Boolean(anchorEl); // Boolean for popover open state
    const id = open ? 'date-picker-popover' : undefined; // ID for popover

    // Function to fetch documents and structure them with declaration dates and assigned users
    const fetchDocumentsWithStructure = async () => {
        try {
            const response = await apiServices.getDocuments();

            if (response && Array.isArray(response.documents)) {
                const documentsWithDate = await Promise.all(
                    response.documents.map(async (doc) => {
                        let declarationDate = null;
                        try {
                            // Attempt to fetch declaration date for each document
                            const declResp = await apiServices.getDeclarationByNumber(doc.declaration_number);
                            declarationDate = declResp?.date || null;
                        } catch (error) {
                            console.warn(`Failed to fetch declaration date for ${doc.declaration_number}`, error);
                        }

                        return {
                            id: doc.id,
                            declarationNumber: doc.declaration_number,
                            fileName: doc.current_version?.file_path?.split('/').pop() || '',
                            filePath: doc.current_version?.file_path || '',
                            versionId: doc.current_version?.id || '',
                            updatedDate: doc.updated_at,
                            documentType: doc.document_type?.name || '',
                            status: doc.status.toUpperCase() || '',
                            file: doc.current_version?.file_path || '',
                            declarationDate: declarationDate || doc.created_at, // Use fetched date or creation date
                            assignedTo: doc.assigned_to?.first_name || 'Unassigned',
                            assignedUserId: doc.assigned_to?.id || null,
                        };
                    })
                );

                const initialAssignedUsers = {};
                const initialUserNames = {};

                // Populate initial assigned users and names
                documentsWithDate.forEach(doc => {
                    if (doc.assignedUserId) {
                        initialAssignedUsers[doc.id] = doc.assignedUserId;
                        initialUserNames[doc.id] = doc.assignedTo;
                    }
                });

                setAssignedUsers(initialAssignedUsers);
                setUserNames(initialUserNames);

                // Sort documents by updated date in descending order
                return documentsWithDate.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));
            } else {
                console.error('Expected documents array but got:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            return [];
        }
    };
 const fetchDocuments = async () => {
            try {
                setIsLoading(true);
                const documentsData = await fetchDocumentsWithStructure();
                setData(documentsData);
            } catch (error) {
                console.error('Error in fetchDocuments:', error);
                setSnackbar({ open: true, message: 'Error fetching documents', severity: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
    // useEffect hook for initial data fetching and role determination
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const details_data = await authService.details();
                const email = details_data.details[1]?.email || details_data.details[5]?.email;
                const name = details_data.type === "User"
                    ? details_data.details[1]?.first_name
                    : details_data.details[5]?.first_name;
                const company_name = details_data.type === "User"
                    ? details_data.details[7]?.company_name
                    : details_data.details[1]?.company_name;

                if (email) localStorage.setItem("email", email);
                if (name) localStorage.setItem("name", name);
                if (company_name) localStorage.setItem("company_name", company_name);

                let finalRole = ROLES.VIEWER;

                if (details_data.type === "User") {
                    const fetchedRole = details_data.details[5]?.name;
                    localStorage.setItem("role", fetchedRole);
                    finalRole = fetchedRole;
                } else if (details_data.type === "Organization") {
                    const orgRole = details_data.details[3]?.name;
                    finalRole = orgRole === "Organization Admin" ? ROLES.ADMIN : (orgRole || ROLES.VIEWER);
                }

                setRole(finalRole);
                console.log("Fetched Role:", finalRole);

            } catch (error) {
                console.error("Error fetching details:", error);
            }
        };

       

        const fetchReviewers = async () => {
            try {
                const data = await apiServices.reviewerlist();
                if (data && Array.isArray(data.reviewer_list)) {
                    setReviewers(data.reviewer_list.map(reviewer => ({
                        id: reviewer.id,
                        name: reviewer.auth_user.first_name,
                        username: reviewer.auth_user.username,
                        email: reviewer.auth_user.email,
                        mobile: reviewer.mobile,
                        role: reviewer.role?.name,
                    })));
                }
            } catch (error) {
                console.error("Error fetching reviewers:", error);

            }
        };

        fetchDocuments();
        fetchDetails();
        fetchReviewers();
    }, []); // Empty dependency array means this runs once on mount

    // useEffect hook to group data when 'data' changes
    useEffect(() => {
        if (data.length > 0) {
            const groups = data.reduce((acc, document) => {
                const key = document.declarationNumber;
                if (!acc[key]) {
                    acc[key] = {
                        declarationNumber: key,
                        declarationDate: document.declarationDate,
                        documents: [],
                        latestUpdate: document.updatedDate,
                        status: document.status.toUpperCase(),
                        assignedTo: document.assignedTo,
                        assignedUserId: document.assignedUserId
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
    }, [data]); // Re-run when 'data' changes

    // Handler for sorting table columns
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Function to sort the data based on current order and orderBy state
    const sortData = (dataToSort, order, orderBy) => {
        return [...dataToSort].sort((a, b) => {
            let comparison = 0;
            if (orderBy === 'declarationNumber') {
                comparison = a.declarationNumber?.localeCompare(b.declarationNumber) || 0;
            } else if (orderBy === 'updatedDate') {
                comparison = new Date(a.latestUpdate).getTime() - new Date(b.latestUpdate).getTime();
            } else if (orderBy === 'declarationDate') {
                comparison = new Date(a.declarationDate || 0).getTime() - new Date(b.declarationDate || 0).getTime();
            } else if (orderBy === 'assignedUser') {
                comparison = a.assignedTo?.localeCompare(b.assignedTo) || 0;
            }
            return order === 'asc' ? comparison : -comparison;
        });
    };

    // Handler for date filter change
    const handleDateChange = (date) => {
        const formattedDate = date ? dayjs(date).format('DD-MM-YYYY') : '';
        setSelectedDate(date);
        setSearchTerm(formattedDate.toLowerCase());
        setCurrentPage(0);
        handleClose(); // Close the date picker popover
    };

    // Handler for downloading selected documents as a zip file
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

    // Handler for opening PDF files in a new tab
    const handleOpenPdf = async (versionId, filePath) => {
        try {
            // Call the API service to get the decrypted PDF URL (expected to be a Blob URL)
            const fileUrl = await apiServices.getDecryptedPdfUrl(versionId);

            // Log the URL received for debugging purposes
            console.log("Received file URL from API service:", fileUrl);

            // Basic validation to ensure we received a valid Blob URL
            if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('blob:')) {
                console.error("API did not return a valid Blob URL. Content might be empty or corrupted.", fileUrl);
                setSnackbar({ open: true, message: "Failed to get a valid file URL from the server. Please try again.", severity: 'error' });
                return;
            }

            // Open the URL directly in a new window/tab
            // This is generally preferred for PDFs as it utilizes the browser's native viewer
            window.open(fileUrl, "_blank");

            // Clean up the object URL after a short delay to free up memory.
            // The browser typically handles this when the tab is closed, but it's good practice.
            setTimeout(() => URL.revokeObjectURL(fileUrl), 10000);

        } catch (error) {
            console.error("❌ Failed to fetch or open decrypted file:", error);
            if (error.response && error.response.status === 401) {
                setSnackbar({ open: true, message: "You are not authorized to view this file. Please log in again.", severity: 'error' });
            } else {
                setSnackbar({ open: true, message: "Failed to open file. Please try again. (Check console for details)", severity: 'error' });
            }
        }
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

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            setErrorMessage('Please enter a reason for rejection');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        try {
            setIsLoading(true);
            await apiServices.verifyDocument(currentDocumentId, {
                approval_status: "Rejected",
                comments: rejectionReason,
            });

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

            setTimeout(() => {
                setActionMessage('');
                navigate("/Documentlist");
            }, 3000);

        } catch (error) {
            console.error("Error rejecting document:", error);
            setErrorMessage('Error rejecting document');
            setTimeout(() => setErrorMessage(''), 3000);
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
    // Handler for direct file download (now uses file-saver for direct download prompt)
    const handleDownload = async (filePath) => {
        try {
            setIsLoading(true);
            const fullUrl = filePath.startsWith('http') ? filePath : `${url}/${filePath.replace(/^\/+/, '')}`;

            const response = await fetch(fullUrl);
            if (!response.ok) {
                console.error(`Failed to fetch file from ${fullUrl}. Status: ${response.status}`);
                throw new Error(`Failed to fetch file for download.`);
            }
            const blob = await response.blob();
            const fileName = filePath.split('/').pop(); // Extract file name from path
            saveAs(blob, fileName); // Trigger direct download using file-saver
            setSnackbar({ open: true, message: `"${fileName}" downloaded successfully!`, severity: 'success' });
        } catch (error) {
            console.error("Error during single file download:", error);
            setSnackbar({ open: true, message: "Failed to download file. Please try again.", severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for navigating to the add new document page
    const handleAddNewDocument = () => {
        navigate('/upload');
    };

    // Handler for resetting search and filters
    const handleReset = () => {
        setSearchTerm('');
        setSelectedDate(null);
        setCurrentPage(0);
    };

    // Memoized filtered data based on search term and date
    const filteredData = useMemo(() => {
        return groupedData.filter((group) => {
            const formattedCreatedDate = dayjs(group.latestUpdate).format('DD-MM-YYYY').toLowerCase();
            const formattedDeclarationDate = group.declarationDate
                ? dayjs(group.declarationDate).format('DD-MM-YYYY').toLowerCase()
                : '';

            const hasMatchingDocument = group.documents.some(doc =>
                doc.declarationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formattedCreatedDate.includes(searchTerm.toLowerCase()) ||
                formattedDeclarationDate.includes(searchTerm.toLowerCase()) ||
                doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return hasMatchingDocument;
        });
    }, [groupedData, searchTerm]);

    // Memoized sorted data
    const sortedData = useMemo(() => {
        return sortData(filteredData, order, orderBy);
    }, [filteredData, order, orderBy]);

    // Handlers for table pagination
    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    // Callback for handling individual row selection
    const handleClick = useCallback((id) => {
        setSelected((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((selectedId) => selectedId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    }, []);

    // Callback to check if a document is selected
    const isSelected = useCallback((id) => selected.includes(id), [selected]);

    // Memoized list of all document IDs for select-all functionality
    const allDocumentIds = useMemo(() => {
        // This flattens all document IDs from the *filtered* data
        const ids = filteredData.flatMap(group => group.documents.map(doc => doc.id));
        console.log("Calculated allDocumentIds (filtered):", ids); // Debugging log
        return ids;
    }, [filteredData]);

    const numSelected = selected.length;
    const rowCount = allDocumentIds.length; // Total number of selectable rows

    // Handler for select all checkbox
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = allDocumentIds; // Select all IDs from the filtered data
            setSelected(newSelecteds);
            console.log("Select All clicked. New selected IDs:", newSelecteds); // Debugging log
        } else {
            setSelected([]); // Clear all selected IDs
            console.log("Unselect All clicked. Selected IDs cleared."); // Debugging log
        }
    };

    // Debugging log for the 'selected' state
    useEffect(() => {
        console.log("Current 'selected' state:", selected);
    }, [selected]);


    // Handlers for the group details dialog
    const handleOpenGroupDialog = (group) => {
        setSelectedGroup(group);
        setOpenGroupDialog(true);
    };

    const handleCloseGroupDialog = () => {
        setOpenGroupDialog(false);
        setSelectedGroup(null);
    };

    // Handler for assigning a reviewer to a single document
    const handleSelectChange = async (e, docId) => {
        const selectedUserId = e.target.value;
        const previousValue = assignedUsers[docId];

        setLoadingAssignments(prev => ({ ...prev, [docId]: true }));

        // Optimistically update UI
        setAssignedUsers(prev => ({
            ...prev,
            [docId]: selectedUserId,
        }));

        const selectedUserName = getReviewerNameById(selectedUserId);

        setUserNames(prev => ({
            ...prev,
            [docId]: selectedUserName,
        }));

        try {
            await apiServices.assignedUser(selectedUserId, docId);

            // ✅ Log success
            console.log(`✅ Assigned to: ${selectedUserName}`);

            const updatedDocuments = await fetchDocumentsWithStructure();
            setData(updatedDocuments);
            setSnackbar({ open: true, message: 'User assigned successfully', severity: 'success' });
        } catch (error) {
            console.error("❌ Error assigning user:", error);

            // Revert UI
            setAssignedUsers(prev => ({
                ...prev,
                [docId]: previousValue,
            }));
            setUserNames(prev => ({
                ...prev,
                [docId]: getReviewerNameById(previousValue),
            }));

            // ✅ Log fallback
            console.log(`⚠️ Reverted to: ${getReviewerNameById(previousValue)}`);

            setSnackbar({ open: true, message: 'Failed to assign user', severity: 'error' });
        } finally {
            setLoadingAssignments(prev => ({ ...prev, [docId]: false }));
        }
    };


    // Handler for bulk assigning all pending documents
    const handleBulkAssign = async (reviewerId) => {
        try {
            setIsLoading(true);

            const pendingDocIds = filteredData
                .flatMap(group => group.documents)
                .filter(doc => doc.status.toUpperCase() === 'PENDING')
                .map(doc => doc.id);

            if (pendingDocIds.length === 0) {
                setSnackbar({ open: true, message: "No pending documents to assign.", severity: 'warning' });
                return;
            }

            // Call API to assign documents
            await apiServices.SelectedAssign(reviewerId, pendingDocIds);

            // Update the UI immediately for assigned documents
            const newAssignedUsers = { ...assignedUsers };
            const newUserNames = { ...userNames };

            pendingDocIds.forEach(id => {
                newAssignedUsers[id] = reviewerId;
                newUserNames[id] = getReviewerNameById(reviewerId);
            });

            setAssignedUsers(newAssignedUsers);
            setUserNames(newUserNames);

            const updatedDocuments = await fetchDocumentsWithStructure(); // Re-fetch to ensure data consistency
            setData(updatedDocuments);

            setShowBulkAssignModal(false);
            setSelectedReviewer('');
            setSnackbar({ open: true, message: 'All pending documents assigned successfully!', severity: 'success' });
        } catch (error) {
            console.error("Error during bulk assign:", error);
            setSnackbar({ open: true, message: "Failed to assign documents. Please try again.", severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for assigning selected documents to a reviewer
    const handleSelectedAssign = async (reviewerId, selectedDocIds) => {
        try {
            setIsLoading(true);

            // Optimistically update UI
            const newAssignedUsers = { ...assignedUsers };
            const newUserNames = { ...userNames };

            selectedDocIds.forEach(id => {
                newAssignedUsers[id] = reviewerId;
                newUserNames[id] = getReviewerNameById(reviewerId);
            });

            setAssignedUsers(newAssignedUsers);
            setUserNames(newUserNames);

            // Call API to assign selected documents
            await apiServices.SelectedAssign(reviewerId, selectedDocIds);

            const updatedDocuments = await fetchDocumentsWithStructure(); // Re-fetch to ensure data consistency
            setData(updatedDocuments);

            setShowSelectedAssignModal(false);
            setSelectedReviewerForSelected('');
            setSelected([]); // Clear selection after assignment
            setSnackbar({ open: true, message: 'Selected documents assigned successfully!', severity: 'success' });
        } catch (error) {
            console.error("Error during selected assign:", error);
            setSnackbar({ open: true, message: 'Failed to assign selected documents', severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Memoized visible rows for current page
    const visibleRows = useMemo(() => {
        return sortedData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage]);

    return (
        <Box sx={{
            zIndex: 0,
            padding: "20px",
            position: "relative", // Corrected from "rela" to "relative"
            top: "125px",
            width: '100%',
            fontSize: '12px',
            paddingRight: '50px',
            boxSizing: 'border-box'
        }}>
            {isLoading && (
                <Box sx={{
                    zIndex: 0,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: theme.palette.primary.main,
                    zIndex: 9999,
                    animation: 'pulse 1.5s infinite' // Simple pulsing animation for loading bar
                }} />
            )}

            <Card sx={{
                zIndex: 0,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                        <OutlinedInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search"
                            sx={{
                                zIndex: 0,
                                maxWidth: 120,
                                height: '35px',
                                paddingLeft: "3px",
                                paddingRight: "0px",
                                fontSize: "12px",
                                background: theme.palette.common.white,
                            }}
                            startAdornment={
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            }
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        ref={anchorRef}
                                        onClick={handleCalendarClick} // Use the specific calendar click handler
                                        aria-label="Select date for filtering"
                                    >
                                        <CalendarMonthIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                            aria-label="Search documents"
                        />
                        <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    format="DD-MM-YYYY"
                                    aria-label="Select date for filtering"
                                />
                            </LocalizationProvider>
                        </Popover>
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                            sx={{
                                zIndex: 0,
                                minWidth: 60,
                                fontSize: '10px',
                                height: '35px',
                                ml: 1,
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    borderColor: theme.palette.primary.dark,
                                    backgroundColor: theme.palette.primary.light,
                                },
                            }}
                        >
                            Reset
                        </Button>
                    </Box>

                    <Box display="flex" gap={1}>
                        {role === ROLES.ADMIN && (
                            <>
                                {selected.length > 0 && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowSelectedAssignModal(true)}
                                        disabled={isLoading}
                                        sx={{
                                            zIndex: 0,
                                            minWidth: 60,
                                            fontSize: '10px',
                                            height: '35px',
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            '&:hover': {
                                                borderColor: theme.palette.primary.dark,
                                                backgroundColor: theme.palette.primary.light,
                                            },
                                        }}
                                    >
                                        Assign Selected
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    onClick={handleBackupClick}
                                    disabled={isLoading}
                                    sx={{
                                        zIndex: 0,
                                        minWidth: 60,
                                        fontSize: '10px',
                                        height: '35px',
                                        borderColor: theme.palette.primary.main,
                                        color: theme.palette.primary.main,
                                        '&:hover': {
                                            borderColor: theme.palette.primary.dark,
                                            backgroundColor: theme.palette.primary.light,
                                        },
                                    }}
                                >
                                    Backup
                                </Button>
                            </>
                        )}

                        {role === ROLES.UPLOADER && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddNewDocument}
                                sx={{
                                    zIndex: 0,
                                    minWidth: 100,
                                    fontSize: '10px',
                                    height: '35px',
                                    backgroundColor: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                    },
                                }}
                            >
                                Add New
                            </Button>
                        )}

                        {selected.length > 0 && (
                            <Button
                                variant="contained"
                                startIcon={<Download size={16} />}
                                onClick={handleDownloadSelected}
                                sx={{
                                    zIndex: 0,
                                    minWidth: 100,
                                    fontSize: '10px',
                                    height: '35px',
                                    backgroundColor: theme.palette.success.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.success.dark,
                                    },
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? <CircularProgress size={16} /> : 'Download'}
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Bulk Assign Modal */}
                <Dialog open={showBulkAssignModal} onClose={() => setShowBulkAssignModal(false)}>
                    <DialogTitle sx={{ zIndex: 0, fontSize: '14px', fontWeight: 'bold' }}>Assign All Pending Documents</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" gutterBottom>
                            Total number of pending documents: {filteredData.filter(group =>
                                group.documents.some(doc => doc.status.toUpperCase() === 'PENDING')).length}
                        </Typography>
                        <FormControl fullWidth sx={{ zIndex: 0, mt: 2 }}>
                            <InputLabel>Select Reviewer</InputLabel>
                            <Select
                                value={selectedReviewer}
                                onChange={(e) => setSelectedReviewer(e.target.value)}
                                label="Select Reviewer"
                            >
                                {reviewers.map((reviewer) => (
                                    <MenuItem key={reviewer.id} value={reviewer.id}>
                                        {reviewer.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowBulkAssignModal(false)} sx={{ zIndex: 0, fontSize: '12px' }}>Cancel</Button>
                        <Button
                            onClick={() => handleBulkAssign(selectedReviewer)}
                            disabled={!selectedReviewer || isLoading}
                            color="primary"
                            sx={{ zIndex: 0, fontSize: '12px' }}
                        >
                            {isLoading ? <CircularProgress size={20} /> : 'Assign'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Selected Assign Modal */}
                <Dialog open={showSelectedAssignModal} onClose={() => setShowSelectedAssignModal(false)}>
                    <DialogTitle sx={{ zIndex: 0, fontSize: '14px', fontWeight: 'bold' }}>Assign Selected Documents</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" gutterBottom>
                            Number of selected documents: {selected.length}
                        </Typography>
                        <FormControl fullWidth sx={{ zIndex: 0, mt: 2 }}>
                            <InputLabel>Select Reviewer</InputLabel>
                            <Select
                                value={selectedReviewerForSelected}
                                onChange={(e) => setSelectedReviewerForSelected(e.target.value)}
                                label="Select Reviewer"
                            >
                                {reviewers.map((reviewer) => (
                                    <MenuItem key={reviewer.id} value={reviewer.id}>
                                        {reviewer.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowSelectedAssignModal(false)} sx={{ zIndex: 0, fontSize: '12px' }}>Cancel</Button>
                        <Button
                            onClick={() => handleSelectedAssign(selectedReviewerForSelected, selected)}
                            disabled={!selectedReviewerForSelected || isLoading}
                            color="primary"
                            sx={{ zIndex: 0, fontSize: '12px' }}
                        >
                            {isLoading ? <CircularProgress size={20} /> : 'Assign'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <TableContainer sx={{
                    zIndex: 0,
                    width: '100%',
                    maxHeight: '350px',
                    overflowY: 'auto',
                }}>
                    <Table size="small" aria-label="Documents table" stickyHeader>
                        <DocumentTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            onSelectAllClick={handleSelectAllClick}
                            numSelected={selected.length}
                            filteredDataLength={filteredData.length}
                        />
                        <TableBody>
                            {visibleRows.map((group) => {
                                const isItemSelected = group.documents.some(doc => isSelected(doc.id));
                                const labelId = `enhanced-table-checkbox-${group.declarationNumber}`;

                                return (
                                    <TableRow
                                        hover
                                        key={group.declarationNumber}
                                        selected={isItemSelected}
                                        sx={{
                                            zIndex: 0,
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: theme.palette.grey[50],
                                            },
                                            '&:hover': {
                                                backgroundColor: theme.palette.grey[100],
                                            },
                                            '& td': {
                                                fontSize: '12px',
                                                padding: '8px',
                                                whiteSpace: 'nowrap',
                                            },
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={group.documents.every(doc => isSelected(doc.id))}
                                                indeterminate={
                                                    group.documents.some(doc => isSelected(doc.id)) &&
                                                    !group.documents.every(doc => isSelected(doc.id))
                                                }
                                                onChange={(event) => {
                                                    const newSelected = [...selected];
                                                    group.documents.forEach(doc => {
                                                        const selectedIndex = newSelected.indexOf(doc.id);
                                                        if (event.target.checked && selectedIndex === -1) {
                                                            newSelected.push(doc.id);
                                                        } else if (!event.target.checked && selectedIndex !== -1) {
                                                            newSelected.splice(selectedIndex, 1);
                                                        }
                                                    });
                                                    setSelected(newSelected);
                                                }}
                                                inputProps={{
                                                    'aria-labelledby': labelId,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            align="left"
                                            sx={{
                                                zIndex: 0,
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                width: '20%',
                                                // Link-like styling
                                                color: '#1976d2',
                                                textDecoration: 'underline',
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                    color: '#1565c0' // Slightly darker on hover
                                                }
                                            }}
                                            onClick={() => handleOpenGroupDialog(group)}
                                        >
                                            <Typography variant="body2" sx={{ zIndex: 0 }} className="declaration-number-text">
                                                {group.declarationNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="left" sx={{ zIndex: 0, width: '15%' }}>
                                            {group.declarationDate ? (
                                                <Typography variant="body2">
                                                    {dayjs(group.declarationDate).format('DD-MM-YYYY')}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    N/A
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="left" sx={{ zIndex: 0, width: '15%' }}>
                                            <StatusDotsWithCount documents={group.documents} />
                                        </TableCell>
                                        <TableCell align="left" sx={{ zIndex: 0, width: '20%' }}>
                                            {group.assignedUserId ? (
                                                <Box display="flex" alignItems="center">
                                                    {loadingAssignments[group.documents[0]?.id] ? (
                                                        <CircularProgress size={20} />
                                                    ) : (
                                                        <Typography variant="body2">
                                                            {group.assignedTo}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary">
                                                    Unassigned
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="left" sx={{ zIndex: 0, width: '20%' }}>
                                            <Typography variant="body2">
                                                {dayjs(group.latestUpdate).format('DD-MM-YYYY HH:mm')}
                                            </Typography>
                                        </TableCell>
                                        {/* <TableCell align="center" sx={{ width: '10%' }}>
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Tooltip title="View Documents">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenGroupDialog(group)}
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
                                            </Box>
                                        </TableCell> */}
                                    </TableRow>
                                );
                            })}
                            {visibleRows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            No documents found
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
                    page={currentPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '12px',
                        },
                    }}
                />
            </Card>

            {/* Dialog for displaying documents within a declaration group */}
            <Dialog
                open={openGroupDialog}
                onClose={handleCloseGroupDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                    Documents for Declaration: {selectedGroup?.declarationNumber}
                </DialogTitle>
                <DialogContent>
                    {selectedGroup && (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>Document Type</TableCell>
                                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>File Name</TableCell>
                                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>Assigned To</TableCell>
                                        <TableCell sx={{ fontSize: '12px', fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedGroup.documents.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell sx={{ fontSize: '12px' }}>{doc.documentType}</TableCell>
                                            <TableCell sx={{ fontSize: '12px' }}>{doc.fileName}</TableCell>
                                            <TableCell>
                                                <StatusIndicator status={doc.status}>
                                                    {doc.status}
                                                </StatusIndicator>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '12px' }}>
                                                {role === ROLES.ADMIN || role === ROLES.PRODUCT_ADMIN ? (
                                                    <FormControl size="small" fullWidth>
                                                        <Select
                                                            value={assignedUsers[doc.id] || ''}
                                                            onChange={(e) => handleSelectChange(e, doc.id)}
                                                            displayEmpty
                                                            inputProps={{ 'aria-label': 'Assign reviewer' }}
                                                            sx={{ fontSize: '12px', height: '32px' }}
                                                        >
                                                            <MenuItem value="">
                                                                <em>Unassigned</em>
                                                            </MenuItem>
                                                            {reviewers.map((reviewer) => (
                                                                <MenuItem
                                                                    key={reviewer.id}
                                                                    value={reviewer.id}
                                                                    sx={{ fontSize: '12px' }}
                                                                >
                                                                    {reviewer.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <Typography variant="body2">
                                                        {userNames[doc.id] || 'Unassigned'}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Tooltip title="View">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenPdf(doc.versionId, doc.filePath)}
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
                                                    <Tooltip title="Download">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDownload(doc.filePath)}
                                                            sx={{
                                                                color: theme.palette.success.main,
                                                                '&:hover': {
                                                                    backgroundColor: theme.palette.success.light,
                                                                },
                                                            }}
                                                        >
                                                            <Download size={16} />
                                                        </IconButton>
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
                                                    </Tooltip>
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

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DocumentLists;

