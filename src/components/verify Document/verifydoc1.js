import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
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
import apiServices from '../../ApiServices/ApiServices';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import authService from "../../ApiServices/ApiServices";
import 'dayjs/locale/en';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ROLES = {
  ADMIN: "ADMIN",
  PRODUCT_ADMIN: "PRODUCT_ADMIN",
  VIEWER: "VIEWER",
  PRODUCT_OWNER: "PRODUCT_OWNER",
  UPLOADER: "UPLOADER",
  REVIEWER: "REVIEWER"
};

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
                            sx={{zIndex:0,
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: status === 'APPROVED' ? '#A5D6A7' :
                                               status === 'REJECTED' ? '#F44336' :
                                               status === 'PENDING' ? '#FFE082' : '#9E9E9E',
                                boxShadow: '0 0 4px 1px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Typography variant="caption" sx={{zIndex:0, fontSize: '0.75rem' }}>
                            {statusCounts[status] || 0}
                        </Typography>
                    </Box>
                ) : null
            ))}
        </Box>
    );
};

const headLabel = [
    { id: 'declarationNumber', label: 'Declaration Number', align: 'left', width: '20%' },
    { id: 'declarationDate', label: 'Declaration Date', align: 'left', width: '15%' },
    { id: 'documentsCount', label: 'Documents', align: 'center', width: '15%' },
    { id: 'assignedUser', label: 'Assigned To', align: 'left', width: '20%' },
    { id: 'updatedDate', label: 'Updated Date', align: 'left', width: '20%' },
];

const DocumentTableHead = React.memo(({ order, orderBy, onRequestSort, numSelected, filteredDataLength, onSelectAllClick }) => {
    const theme = useTheme();

    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead key={`${order}-${orderBy}`} sx={{ zIndex:0,
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
                        sx={{zIndex:0,
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
                        sx={{zIndex:0,
                            fontWeight: '600',
                            fontSize:"12px",
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

const DocumentList = () => {
    const [data, setData] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [role, setRole] = useState("VIEWER");
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();
    const url = 'http://localhost:8000';
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('declarationNumber');
    const [selected, setSelected] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [openGroupDialog, setOpenGroupDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [reviewers, setReviewers] = useState([]);
    const [assignedUsers, setAssignedUsers] = useState({});
    const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
    const [showSelectedAssignModal, setShowSelectedAssignModal] = useState(false);
    const [selectedReviewer, setSelectedReviewer] = useState('');
    const [selectedReviewerForSelected, setSelectedReviewerForSelected] = useState('');
    const [loadingAssignments, setLoadingAssignments] = useState({});
    const [userNames, setUserNames] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const anchorRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [currentDocumentId, setCurrentDocumentId] = useState(null);
    const [actionMessage, setActionMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const open = Boolean(anchorEl);
    const id = open ? 'date-picker-popover' : undefined;

    const fetchDocumentsWithStructure = async () => {
        try {
            const response = await apiServices.getDocuments();

            if (response && Array.isArray(response.documents)) {
                const documentsWithDate = await Promise.all(
                    response.documents.map(async (doc) => {
                        let declarationDate = null;
                        try {
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
                            declarationDate: declarationDate || doc.created_at,
                            assignedTo: doc.assigned_to?.first_name || 'Unassigned',
                            assignedUserId: doc.assigned_to?.id || null,
                        };
                    })
                );

                const initialAssignedUsers = {};
                const initialUserNames = {};

                documentsWithDate.forEach(doc => {
                    if (doc.assignedUserId) {
                        initialAssignedUsers[doc.id] = doc.assignedUserId;
                        initialUserNames[doc.id] = doc.assignedTo;
                    }
                });

                setAssignedUsers(initialAssignedUsers);
                setUserNames(initialUserNames);

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

            } catch (error) {
              console.error("Error fetching details:", error);
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
    }, []);

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
    }, [data]);

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

    const handleDateChange = (date) => {
        const formattedDate = date ? dayjs(date).format('DD-MM-YYYY') : '';
        setSelectedDate(date);
        setSearchTerm(formattedDate.toLowerCase());
        setCurrentPage(0);
        handleClose();
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

            const groupedByDeclaration = selectedDocuments.reduce((acc, doc) => {
                if (!acc[doc.declarationNumber]) {
                    acc[doc.declarationNumber] = [];
                }
                acc[doc.declarationNumber].push(doc);
                return acc;
            }, {});

            await Promise.all(
                Object.entries(groupedByDeclaration).map(async ([declarationNumber, docs]) => {
                    const declarationFolder = zip.folder(declarationNumber);

                    await Promise.all(docs.map(async (doc) => {
                        try {
                            const fullUrl = doc.filePath.startsWith('http')
                                ? doc.filePath
                                : `${url}/${doc.filePath.replace(/^\/+/, '')}`;

                            const response = await fetch(fullUrl);
                            if (!response.ok) throw new Error(`Failed to fetch ${doc.fileName}`);
                            
                            const blob = await response.blob();
                            declarationFolder.file(doc.fileName, blob);
                        } catch (error) {
                            console.error(`Error downloading ${doc.fileName}:`, error);
                            setSnackbar(prev => ({
                                open: true,
                                message: `Failed to download ${doc.fileName}.`,
                                severity: 'error'
                            }));
                        }
                    }));
                })
            );

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

    const handleOpenPdf = async (versionId, filePath) => {
        try {
            const fileUrl = await apiServices.getDecryptedPdfUrl(versionId);
            
            if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('blob:')) {
                throw new Error("Invalid file URL");
            }

            window.open(fileUrl, "_blank");
            setTimeout(() => URL.revokeObjectURL(fileUrl), 10000);
        } catch (error) {
            console.error("Failed to fetch or open decrypted file:", error);
            if (error.response && error.response.status === 401) {
                setSnackbar({ open: true, message: "Authorization failed. Please log in again.", severity: 'error' });
            } else {
                setSnackbar({ open: true, message: "Failed to open file. Please try again.", severity: 'error' });
            }
        }
    };

    const handleApproval = async (documentId, newStatus) => {
        setActionMessage('');
        setIsLoading(true);

        try {
            await apiServices.verifySingleDocument(documentId, { approval_status: newStatus });
            
            setData(prevData => prevData.map(doc => 
                doc.id === documentId ? { ...doc, status: newStatus } : doc
            ));

            setActionMessage(`Document has been ${newStatus}`);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (error) {
            console.error('Error during approval/rejection:', error);
            setErrorMessage('There was an error processing your request.');
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const openRejectDialog = (documentId) => {
        setCurrentDocumentId(documentId);
        setIsRejectDialogOpen(true);
    };

    const closeRejectDialog = () => {
        setIsRejectDialogOpen(false);
        setRejectionReason('');
        setCurrentDocumentId(null);
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            setErrorMessage('Please enter a reason for rejection');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        try {
            setIsLoading(true);
            await apiServices.verifySingleDocument(currentDocumentId, {
                approval_status: "REJECTED",
                comments: rejectionReason,
            });

            setData(prevData => prevData.map(doc => 
                doc.id === currentDocumentId ? { ...doc, status: "REJECTED" } : doc
            ));

            setIsRejectDialogOpen(false);
            setRejectionReason("");
            setActionMessage('Document has been rejected successfully');

            setTimeout(() => setActionMessage(''), 3000);
        } catch (error) {
            console.error("Error rejecting document:", error);
            setErrorMessage('Error rejecting document');
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (filePath) => {
        try {
            setIsLoading(true);
            const fullUrl = filePath.startsWith('http') ? filePath : `${url}/${filePath.replace(/^\/+/, '')}`;
            const response = await fetch(fullUrl);
            
            if (!response.ok) throw new Error(`Failed to fetch file`);
            
            const blob = await response.blob();
            const fileName = filePath.split('/').pop();
            saveAs(blob, fileName);
            setSnackbar({ open: true, message: `"${fileName}" downloaded successfully!`, severity: 'success' });
        } catch (error) {
            console.error("Error during single file download:", error);
            setSnackbar({ open: true, message: "Failed to download file. Please try again.", severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNewDocument = () => navigate('/upload');
    const handleReset = () => {
        setSearchTerm('');
        setSelectedDate(null);
        setCurrentPage(0);
    };

    const filteredData = useMemo(() => {
        return groupedData.filter((group) => {
            const formattedCreatedDate = dayjs(group.latestUpdate).format('DD-MM-YYYY').toLowerCase();
            const formattedDeclarationDate = group.declarationDate
                ? dayjs(group.declarationDate).format('DD-MM-YYYY').toLowerCase()
                : '';

            return group.documents.some(doc =>
                doc.declarationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formattedCreatedDate.includes(searchTerm.toLowerCase()) ||
                formattedDeclarationDate.includes(searchTerm.toLowerCase()) ||
                doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [groupedData, searchTerm]);

    const sortedData = useMemo(() => sortData(filteredData, order, orderBy), [filteredData, order, orderBy]);
    const visibleRows = useMemo(() => sortedData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage), 
        [sortedData, currentPage, rowsPerPage]);

    const handleChangePage = (event, newPage) => setCurrentPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const handleClick = useCallback((id) => {
        setSelected(prev => prev.includes(id) 
            ? prev.filter(selectedId => selectedId !== id) 
            : [...prev, id]
        );
    }, []);

    const isSelected = useCallback((id) => selected.includes(id), [selected]);
    const allDocumentIds = useMemo(() => filteredData.flatMap(group => group.documents.map(doc => doc.id)), [filteredData]);

    const handleSelectAllClick = (event) => {
        setSelected(event.target.checked ? allDocumentIds : []);
    };

    const handleOpenGroupDialog = (group) => {
        setSelectedGroup(group);
        setOpenGroupDialog(true);
    };

    const handleCloseGroupDialog = () => {
        setOpenGroupDialog(false);
        setSelectedGroup(null);
    };

    const getReviewerNameById = (reviewerId) => {
        const reviewer = reviewers.find(r => r.id === reviewerId);
        return reviewer ? reviewer.name : 'Unassigned';
    };

    const handleSelectChange = async (e, docId) => {
        const selectedUserId = e.target.value;
        const previousValue = assignedUsers[docId];

        setLoadingAssignments(prev => ({ ...prev, [docId]: true }));
        setAssignedUsers(prev => ({ ...prev, [docId]: selectedUserId }));
        
        const selectedUserName = getReviewerNameById(selectedUserId);
        setUserNames(prev => ({ ...prev, [docId]: selectedUserName }));

        try {
            await apiServices.assignedUser(selectedUserId, docId);
            const updatedDocuments = await fetchDocumentsWithStructure();
            setData(updatedDocuments);
            setSnackbar({ open: true, message: 'User assigned successfully', severity: 'success' });
        } catch (error) {
            console.error("Error assigning user:", error);
            setAssignedUsers(prev => ({ ...prev, [docId]: previousValue }));
            setUserNames(prev => ({ ...prev, [docId]: getReviewerNameById(previousValue) }));
            setSnackbar({ open: true, message: 'Failed to assign user', severity: 'error' });
        } finally {
            setLoadingAssignments(prev => ({ ...prev, [docId]: false }));
        }
    };

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

            await apiServices.SelectedAssign(reviewerId, pendingDocIds);
            
            const newAssignedUsers = { ...assignedUsers };
            const newUserNames = { ...userNames };
            pendingDocIds.forEach(id => {
                newAssignedUsers[id] = reviewerId;
                newUserNames[id] = getReviewerNameById(reviewerId);
            });

            setAssignedUsers(newAssignedUsers);
            setUserNames(newUserNames);
            setData(await fetchDocumentsWithStructure());

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

    const handleSelectedAssign = async (reviewerId, selectedDocIds) => {
        try {
            setIsLoading(true);
            const newAssignedUsers = { ...assignedUsers };
            const newUserNames = { ...userNames };
            selectedDocIds.forEach(id => {
                newAssignedUsers[id] = reviewerId;
                newUserNames[id] = getReviewerNameById(reviewerId);
            });

            setAssignedUsers(newAssignedUsers);
            setUserNames(newUserNames);
            await apiServices.SelectedAssign(reviewerId, selectedDocIds);
            setData(await fetchDocumentsWithStructure());

            setShowSelectedAssignModal(false);
            setSelectedReviewerForSelected('');
            setSelected([]);
            setSnackbar({ open: true, message: 'Selected documents assigned successfully!', severity: 'success' });
        } catch (error) {
            console.error("Error during selected assign:", error);
            setSnackbar({ open: true, message: 'Failed to assign selected documents', severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCalendarClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleBackupClick = () => navigate('/backup');

    return (
        <Box sx={{zIndex:0,
            padding: "20px",
            position: "relative",
            top: "125px",
            width: '100%',
            fontSize: '12px',
            paddingRight: '50px',
            boxSizing: 'border-box'
        }}>
            {isLoading && (
                <Box sx={{zIndex:0,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: theme.palette.primary.main,
                    zIndex: 9999,
                    animation: 'pulse 1.5s infinite'
                }} />
            )}

            <Card sx={{zIndex:0,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                padding:'10px',
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                        <OutlinedInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search"
                            sx={{zIndex:0,
                                maxWidth: 120,
                                height: '35px',
                                paddingLeft:"3px",
                                paddingRight:"0px",
                                fontSize:"12px",
                                background: theme.palette.common.white,
                            }}
                            startAdornment={<InputAdornment position="start"><SearchIcon /></InputAdornment>}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton ref={anchorRef} onClick={handleCalendarClick}>
                                        <CalendarMonthIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                        <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker value={selectedDate} onChange={handleDateChange} format="DD-MM-YYYY" />
                            </LocalizationProvider>
                        </Popover>
                        <Button variant="outlined" onClick={handleReset} sx={{zIndex:0, minWidth: 60, fontSize: '10px', height: '35px', ml: 1 }}>
                            Reset
                        </Button>
                    </Box>

                    <Box display="flex" gap={1}>
                        {role === ROLES.ADMIN && (
                            <>
                                {selected.length > 0 && (
                                    <Button variant="outlined" onClick={() => setShowSelectedAssignModal(true)} disabled={isLoading}>
                                        Assign Selected
                                    </Button>
                                )}
                                <Button variant="outlined" onClick={handleBackupClick} disabled={isLoading}>
                                    Backup
                                </Button>
                            </>
                        )}

                        {role === ROLES.UPLOADER && (
                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNewDocument}>
                                Add New
                            </Button>
                        )}

                        {selected.length > 0 && (
                            <Button variant="contained" startIcon={<Download size={16} />} onClick={handleDownloadSelected} disabled={isLoading}>
                                {isLoading ? <CircularProgress size={16} /> : 'Download'}
                            </Button>
                        )}
                    </Box>
                </Box>

                <Dialog open={showBulkAssignModal} onClose={() => setShowBulkAssignModal(false)}>
                    <DialogTitle>Assign All Pending Documents</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" gutterBottom>
                            Total pending documents: {filteredData.filter(group => group.documents.some(doc => doc.status.toUpperCase() === 'PENDING')).length}
                        </Typography>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Select Reviewer</InputLabel>
                            <Select value={selectedReviewer} onChange={(e) => setSelectedReviewer(e.target.value)} label="Select Reviewer">
                                {reviewers.map((reviewer) => (
                                    <MenuItem key={reviewer.id} value={reviewer.id}>{reviewer.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowBulkAssignModal(false)}>Cancel</Button>
                        <Button onClick={() => handleBulkAssign(selectedReviewer)} disabled={!selectedReviewer || isLoading}>
                            {isLoading ? <CircularProgress size={20} /> : 'Assign'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={showSelectedAssignModal} onClose={() => setShowSelectedAssignModal(false)}>
                    <DialogTitle>Assign Selected Documents</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" gutterBottom>Selected: {selected.length}</Typography>
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Select Reviewer</InputLabel>
                            <Select value={selectedReviewerForSelected} onChange={(e) => setSelectedReviewerForSelected(e.target.value)} label="Select Reviewer">
                                {reviewers.map((reviewer) => (
                                    <MenuItem key={reviewer.id} value={reviewer.id}>{reviewer.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowSelectedAssignModal(false)}>Cancel</Button>
                        <Button onClick={() => handleSelectedAssign(selectedReviewerForSelected, selected)} disabled={!selectedReviewerForSelected || isLoading}>
                            {isLoading ? <CircularProgress size={20} /> : 'Assign'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={isRejectDialogOpen} onClose={closeRejectDialog}>
                    <DialogTitle>Reject Document</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1" gutterBottom>Reason for rejection:</Typography>
                        <OutlinedInput fullWidth multiline rows={4} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeRejectDialog}>Cancel</Button>
                        <Button onClick={handleRejectSubmit} disabled={isLoading}>
                            {isLoading ? <CircularProgress size={20} /> : 'Submit'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <TableContainer sx={{zIndex:0, width: '100%', maxHeight: '350px', overflowY: 'auto' }}>
                    <Table size="small" stickyHeader>
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
                                return (
                                    <TableRow hover key={group.declarationNumber} selected={isItemSelected} sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] } }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={group.documents.every(doc => isSelected(doc.id))}
                                                indeterminate={group.documents.some(doc => isSelected(doc.id)) && !group.documents.every(doc => isSelected(doc.id))}
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
                                            />
                                        </TableCell>
                                        <TableCell align="left" sx={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }} onClick={() => handleOpenGroupDialog(group)}>
                                            {group.declarationNumber}
                                        </TableCell>
                                        <TableCell align="left">
                                            {group.declarationDate ? dayjs(group.declarationDate).format('DD-MM-YYYY') : 'N/A'}
                                        </TableCell>
                                        <TableCell align="left">
                                            <StatusDotsWithCount documents={group.documents} />
                                        </TableCell>
                                        <TableCell align="left">
                                            {group.assignedUserId ? (
                                                <Box display="flex" alignItems="center">
                                                    {loadingAssignments[group.documents[0]?.id] ? 
                                                        <CircularProgress size={20} /> : 
                                                        <Typography>{group.assignedTo}</Typography>
                                                    }
                                                </Box>
                                            ) : 'Unassigned'}
                                        </TableCell>
                                        <TableCell align="left">
                                            {dayjs(group.latestUpdate).format('DD-MM-YYYY HH:mm')}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {visibleRows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body2" color="textSecondary">No documents found</Typography>
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
                    sx={{ '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '12px' } }}
                />
            </Card>

            <Dialog open={openGroupDialog} onClose={handleCloseGroupDialog} maxWidth="md" fullWidth>
                <DialogTitle>Documents for Declaration: {selectedGroup?.declarationNumber}</DialogTitle>
                <DialogContent>
                    {selectedGroup && (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Document Type</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>File Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedGroup.documents.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell>{doc.documentType}</TableCell>
                                            <TableCell>{doc.fileName}</TableCell>
                                            <TableCell>
                                                <StatusIndicator status={doc.status}>
                                                    {doc.status}
                                                </StatusIndicator>
                                            </TableCell>
                                            <TableCell>
                                                {role === ROLES.ADMIN || role === ROLES.PRODUCT_ADMIN ? (
                                                    <FormControl size="small" fullWidth>
                                                        <Select
                                                            value={assignedUsers[doc.id] || ''}
                                                            onChange={(e) => handleSelectChange(e, doc.id)}
                                                            displayEmpty
                                                            sx={{ height: '32px' }}
                                                        >
                                                            <MenuItem value=""><em>Unassigned</em></MenuItem>
                                                            {reviewers.map((reviewer) => (
                                                                <MenuItem key={reviewer.id} value={reviewer.id}>
                                                                    {reviewer.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    <Typography>{userNames[doc.id] || 'Unassigned'}</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" gap={1}>
                                                    <Tooltip title="View">
                                                        <IconButton onClick={() => handleOpenPdf(doc.versionId, doc.filePath)}>
                                                            <SearchIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Download">
                                                        <IconButton onClick={() => handleDownload(doc.filePath)}>
                                                            <Download size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {doc.status === 'PENDING' ? (
                                                        <>
                                                            <Tooltip title="Approve">
                                                                <IconButton 
                                                                    color="success" 
                                                                    onClick={() => handleApproval(doc.id, 'APPROVED')}
                                                                    disabled={isLoading}
                                                                >
                                                                    <CheckCircleIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Reject">
                                                                <IconButton 
                                                                    color="error" 
                                                                    onClick={() => openRejectDialog(doc.id)}
                                                                    disabled={isLoading}
                                                                >
                                                                    <CancelIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    ) : (
                                                        <StatusIndicator status={doc.status}>
                                                            {doc.status}
                                                        </StatusIndicator>
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
                    <Button onClick={handleCloseGroupDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(p => ({...p, open: false}))}>
                <Alert onClose={() => setSnackbar(p => ({...p, open: false}))} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DocumentList;