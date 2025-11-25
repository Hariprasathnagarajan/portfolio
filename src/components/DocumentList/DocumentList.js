import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    styled
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Download } from 'lucide-react';
import apiServices from '../../ApiServices/ApiServices';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
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

const StatusText = styled(Typography)(({ status, theme }) => ({
    fontWeight: 'bold',
    color: 
        status === 'APPROVED' ? theme.palette.success.main :
        status === 'REJECTED' ? theme.palette.error.main :
        status === 'PENDING' ? theme.palette.warning.main :
        theme.palette.text.primary,
    fontSize: '12px'
}));

const StatusDotsWithCount = ({ documents }) => {
    const statusCounts = documents.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
    }, {});

    const statusColors = {
        APPROVED: 'rgba(76, 175, 80, 0.7)',
        REJECTED: 'rgba(244, 67, 54, 0.7)',
        PENDING: 'rgba(255, 193, 7, 0.7)'
    };

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
                                backgroundColor: statusColors[status] || 'rgba(0, 0, 0, 0.3)',
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

const headLabel = [
    { id: 'declarationNumber', label: 'Declaration Number', align: 'left', width: '20%' },
    { id: 'declarationDate', label: 'Declaration Date', align: 'left', width: '15%' },
    { id: 'documentsCount', label: 'Documents', align: 'center', width: '15%' },
    { id: 'assignedUser', label: 'Assigned To', align: 'left', width: '20%' },
    { id: 'updatedDate', label: 'Updated Date', align: 'left', width: '20%' },
];

const DocumentList = () => {
    const [data, setData] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [role, setRole] = useState("VIEWER");
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const navigate = useNavigate();
    const url = 'http://localhost:8000';
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('declarationNumber');
    const [selected, setSelected] = useState([]);
    const [openPdfDialog, setOpenPdfDialog] = useState(false);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
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

    const getReviewerNameById = (reviewerId) => {
        const reviewer = reviewers.find(r => r.id === reviewerId);
        return reviewer ? reviewer.name : 'Unassigned';
    };

    const handleCalendarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleBackupClick = () => {
        navigate('/backup');
    };

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
                            updatedDate: doc.updated_at,
                            documentType: doc.document_type?.name || '',
                            status: doc.status || '',
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
                console.log("Fetched Role:", finalRole);
            
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
                        status: document.status,
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

    const handleDownload = async (filePath, fileName) => {
        if (!filePath) {
            console.error("No file path provided");
            return;
        }

        try {
            setIsLoading(true);
            const fullUrl = filePath.startsWith('http') 
                ? filePath 
                : `${url}/${filePath.replace(/^\/+/, '')}`;
            
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error('Failed to fetch file');
            
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName || filePath.split('/').pop() || 'document.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download the file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadSelected = async () => {
        if (selected.length === 0) {
            alert("Please select at least one document to download.");
            return;
        }

        try {
            setIsLoading(true);
            const zip = new JSZip();
            const selectedDocuments = data.filter(doc => selected.includes(doc.id));

            await Promise.all(selectedDocuments.map(async (doc) => {
                try {
                    const fullUrl = doc.filePath.startsWith('http') 
                        ? doc.filePath 
                        : `${url}/${doc.filePath.replace(/^\/+/, '')}`;
                    
                    const response = await fetch(fullUrl);
                    if (!response.ok) throw new Error(`Failed to fetch ${doc.fileName}`);
                    const blob = await response.blob();
                    
                    // Organize by declaration number
                    const folder = zip.folder(doc.declarationNumber) || zip;
                    folder.file(doc.fileName, blob);
                } catch (error) {
                    console.error(`Error downloading ${doc.fileName}:`, error);
                }
            }));

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'documents.zip');
        } catch (error) {
            console.error('Error creating zip file:', error);
            alert('Failed to create zip file');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenPdf = (filePath) => {
        if (!filePath) {
            console.error("Invalid PDF file path:", filePath);
            return;
        }

        const fullPdfUrl = filePath.startsWith('http') ? filePath : `${url}/${filePath.replace(/^\/+/, '')}`;
        setSelectedPdfUrl(fullPdfUrl);
        setOpenPdfDialog(true);
    };

    const handleClosePdf = () => {
        setOpenPdfDialog(false);
        setSelectedPdfUrl('');
    };

    const handleAddNewDocument = () => {
        navigate('/upload');
    };

    const handleReset = () => {
        setSearchTerm('');
        setCurrentPage(0);
    };

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

    const handleClick = useCallback((id) => {
        setSelected((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((selectedId) => selectedId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    }, []);

    const isSelected = useCallback((id) => selected.includes(id), [selected]);

    const allDocumentIds = useMemo(() => {
        return filteredData.flatMap(group => group.documents.map(doc => doc.id));
    }, [filteredData]);

    const numSelected = selected.length;
    const rowCount = allDocumentIds.length;

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = allDocumentIds;
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const createSortHandler = (property) => (event) => {
        handleRequestSort(event, property);
    };

    const handleOpenGroupDialog = (group) => {
        setSelectedGroup(group);
        setOpenGroupDialog(true);
    };

    const handleCloseGroupDialog = () => {
        setOpenGroupDialog(false);
        setSelectedGroup(null);
    };

    const handleSelectChange = async (e, docId) => {
        const selectedUserId = e.target.value;
        const previousValue = assignedUsers[docId];
        
        setLoadingAssignments(prev => ({ ...prev, [docId]: true }));
        
        setAssignedUsers(prev => ({
            ...prev,
            [docId]: selectedUserId,
        }));
        
        setUserNames(prev => ({
            ...prev,
            [docId]: getReviewerNameById(selectedUserId),
        }));

        try {
            await apiServices.assignedUser(selectedUserId, docId);
            const updatedDocuments = await fetchDocumentsWithStructure();
            setData(updatedDocuments);
        } catch (error) {
            console.error("Error assigning user:", error);
            setAssignedUsers(prev => ({
                ...prev,
                [docId]: previousValue,
            }));
            setUserNames(prev => ({
                ...prev,
                [docId]: getReviewerNameById(previousValue),
            }));
            alert("Failed to assign user. Please try again.");
        } finally {
            setLoadingAssignments(prev => ({ ...prev, [docId]: false }));
        }
    };

    const handleBulkAssign = async (reviewerId) => {
        try {
            setIsLoading(true);
            
            const pendingDocIds = filteredData
                .flatMap(group => group.documents)
                .filter(doc => doc.status === 'PENDING')
                .map(doc => doc.id);
                
            if (pendingDocIds.length === 0) {
                alert("No pending documents to assign");
                return;
            }

            const result = await apiServices.SelectedAssign(reviewerId, pendingDocIds);
            
            const newAssignedUsers = { ...assignedUsers };
            const newUserNames = { ...userNames };
            
            pendingDocIds.forEach(id => {
                newAssignedUsers[id] = reviewerId;
                newUserNames[id] = getReviewerNameById(reviewerId);
            });
            
            setAssignedUsers(newAssignedUsers);
            setUserNames(newUserNames);
            
            const updatedDocuments = await fetchDocumentsWithStructure();
            setData(updatedDocuments);
            
            setShowBulkAssignModal(false);
            setSelectedReviewer('');
        } catch (error) {
            console.error("Error during bulk assign:", error);
            alert("Failed to assign documents. Please try again.");
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
            
            const result = await apiServices.SelectedAssign(reviewerId, selectedDocIds);
            
            const updatedDocuments = await fetchDocumentsWithStructure();
            setData(updatedDocuments);
            
            setShowSelectedAssignModal(false);
            setSelectedReviewerForSelected('');
            setSelected([]);
        } catch (error) {
            console.error("Error during selected assign:", error);
            alert("Failed to assign selected documents. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const visibleRows = useMemo(() => {
        return sortedData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage]);

    return (
        <Box sx={{
            marginLeft: {
                xs: "0",
                sm: "0",
            },
            marginTop: "25px",
            position:'absolute',
            top:'79px',
            padding: "20px",
            width: {
                xs: '100%',
                sm: '100%',
            },
            transition: 'width 0.3s ease-in-out',
            pr: 3,
            boxSizing: 'border-box'
        }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', paddingRight: '20px', fontSize: '18px', color: 'darkblue' }}>
                Document List
            </Typography>
            
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
                
                {!isLoading && filteredData.length === 0 && (
                    <Typography variant="body1" align="center" sx={{ p: 2 }}>
                        No documents found matching your criteria.
                    </Typography>
                )}

                {!isLoading && filteredData.length > 0 && (
                    <>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box display="flex" gap={1}>
                                {role === ROLES.ADMIN && (
                                    <>
                                        {selected.length > 0 && (
                                            <Button
                                                variant="outlined"
                                                onClick={() => setShowSelectedAssignModal(true)}
                                                disabled={isLoading}
                                                sx={{
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
                            </Box>

                            <Box display="flex" gap={1}>
                                <OutlinedInput
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search"
                                    sx={{
                                        maxWidth: 120, 
                                        fontSize: '12px',
                                        paddingLeft:'3px',
                                        paddingRight:'0px',
                                        height:'35px',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: theme.palette.primary.main,
                                        },
                                        background: theme.palette.common.white,
                                    }}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    }
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleCalendarClick}>
                                                <CalendarMonthIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                />
                                <Popover
                                    id={id}
                                    open={open}
                                    anchorEl={anchorEl}
                                    onClose={handleClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                >
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                                        <DatePicker
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                            renderInput={(params) => <input {...params} />}
                                        />
                                    </LocalizationProvider>
                                </Popover>

                                <Button
                                    variant="outlined"
                                    onClick={handleReset}
                                    sx={{
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
                                    Reset
                                </Button>

                                {role === ROLES.UPLOADER && (
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddNewDocument}
                                        sx={{
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

                        <Dialog open={showBulkAssignModal} onClose={() => setShowBulkAssignModal(false)}>
                            <DialogTitle>Assign All Pending Documents</DialogTitle>
                            <DialogContent>
                                <Typography variant="body1" gutterBottom>
                                    Total number of pending documents: {filteredData.filter(group => 
                                        group.documents.some(doc => doc.status === 'PENDING')).length}
                                </Typography>
                                <FormControl fullWidth sx={{ mt: 2 }}>
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
                                <Button onClick={() => setShowBulkAssignModal(false)}>Cancel</Button>
                                <Button 
                                    onClick={() => handleBulkAssign(selectedReviewer)} 
                                    disabled={!selectedReviewer || isLoading}
                                    color="primary"
                                >
                                    {isLoading ? <CircularProgress size={20} /> : 'Assign'}
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Dialog open={showSelectedAssignModal} onClose={() => setShowSelectedAssignModal(false)}>
                            <DialogTitle>Assign Selected Documents</DialogTitle>
                            <DialogContent>
                                <Typography variant="body1" gutterBottom>
                                    Number of selected documents: {selected.length}
                                </Typography>
                                <FormControl fullWidth sx={{ mt: 2 }}>
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
                                <Button onClick={() => setShowSelectedAssignModal(false)}>Cancel</Button>
                                <Button 
                                    onClick={() => handleSelectedAssign(selectedReviewerForSelected, selected)} 
                                    disabled={!selectedReviewerForSelected || isLoading}
                                    color="primary"
                                >
                                    {isLoading ? <CircularProgress size={20} /> : 'Assign'}
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox" sx={{ width: '5%' }}>
                                            <Checkbox
                                                color="primary"
                                                indeterminate={numSelected > 0 && numSelected < rowCount}
                                                checked={rowCount > 0 && numSelected === rowCount}
                                                onChange={handleSelectAllClick}
                                                inputProps={{
                                                    'aria-label': 'select all documents',
                                                }}
                                            />
                                        </TableCell>
                                        {headLabel.map((headCell) => (
                                            <TableCell
                                                key={headCell.id}
                                                align={headCell.align}
                                                sx={{
                                                    width: headCell.width,
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    color: theme.palette.text.primary,
                                                    borderBottom: `2px solid ${theme.palette.divider}`,
                                                    padding: '12px 16px',
                                                }}
                                                sortDirection={orderBy === headCell.id ? order : false}
                                            >
                                                <TableSortLabel
                                                    active={orderBy === headCell.id}
                                                    direction={orderBy === headCell.id ? order : 'asc'}
                                                    onClick={createSortHandler(headCell.id)}
                                                    sx={{
                                                        '&:focus': {
                                                            color: theme.palette.text.primary,
                                                        },
                                                        '&:hover': {
                                                            color: theme.palette.primary.main,
                                                        }
                                                    }}
                                                >
                                                    {headCell.label}
                                                </TableSortLabel>
                                            </TableCell>
                                        ))}
                                        {(role === ROLES.ADMIN || role === ROLES.PRODUCT_ADMIN || role === ROLES.UPLOADER) && (
                                            <TableCell 
                                                align="center" 
                                                sx={{ 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold',
                                                    width: '10%'
                                                }}
                                            >
                                                Actions
                                            </TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
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
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.action.hover,
                                                    },
                                                    '&.Mui-selected': {
                                                        backgroundColor: theme.palette.action.selected,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.action.selected,
                                                        }
                                                    }
                                                }}
                                            >
                                                <TableCell padding="checkbox" sx={{ width: '5%' }}>
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
                                                        fontSize: '12px', 
                                                        cursor: 'pointer',
                                                        width: '20%'
                                                    }}
                                                    onClick={() => handleOpenGroupDialog(group)}
                                                >
                                                    {group.declarationNumber}
                                                </TableCell>
                                                <TableCell 
                                                    align="left" 
                                                    sx={{ 
                                                        fontSize: '12px',
                                                        width: '15%'
                                                    }}
                                                >
                                                    {group.declarationDate ? dayjs(group.declarationDate).format('DD-MM-YYYY') : 'N/A'}
                                                </TableCell>
                                                <TableCell 
                                                    align="center" 
                                                    sx={{ 
                                                        fontSize: '12px',
                                                        width: '15%'
                                                    }}
                                                >
                                                    <StatusDotsWithCount documents={group.documents} />
                                                </TableCell>
                                                <TableCell 
                                                    align="left" 
                                                    sx={{ 
                                                        fontSize: '12px',
                                                        width: '20%'
                                                    }}
                                                >
                                                    {role === ROLES.ADMIN ? (
                                                        <Select
                                                            value={assignedUsers[group.documents[0]?.id] || group.assignedUserId || ''}
                                                            onChange={(e) => handleSelectChange(e, group.documents[0]?.id)}
                                                            displayEmpty
                                                            sx={{
                                                                minWidth: 120,
                                                                fontSize: '12px',
                                                                height: '35px',
                                                            }}
                                                            renderValue={(selected) => {
                                                                if (!selected) return 'Unassigned';
                                                                return userNames[group.documents[0]?.id] || getReviewerNameById(selected);
                                                            }}
                                                            disabled={loadingAssignments[group.documents[0]?.id]}
                                                            IconComponent={loadingAssignments[group.documents[0]?.id] ? () => <CircularProgress size={20} /> : undefined}
                                                        >
                                                            <MenuItem value="">Unassigned</MenuItem>
                                                            {reviewers.map((reviewer) => (
                                                                <MenuItem key={reviewer.id} value={reviewer.id}>
                                                                    {reviewer.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    ) : (
                                                        userNames[group.documents[0]?.id] || group.assignedTo || 'Unassigned'
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    align="left"
                                                    sx={{
                                                        fontSize: '12px',
                                                        width: '20%'
                                                    }}
                                                >
                                                    {dayjs(group.latestUpdate).format('DD-MM-YYYY HH:mm')}
                                                </TableCell>
                                                {(role === ROLES.ADMIN || role === ROLES.PRODUCT_ADMIN || role === ROLES.UPLOADER) && (
                                                    <TableCell align="center" sx={{ width: '10%' }}>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleOpenGroupDialog(group)}
                                                            sx={{
                                                                fontSize: '10px',
                                                                padding: '4px 8px',
                                                                minWidth: '60px'
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                    })}
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
                                '& .MuiSelect-select': {
                                    fontSize: '12px',
                                }
                            }}
                        />
                    </>
                )}

                <Dialog open={openGroupDialog} onClose={handleCloseGroupDialog} maxWidth="md" fullWidth>
                    {selectedGroup && (
                        <>
                            <DialogTitle sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                                Documents for Declaration: {selectedGroup.declarationNumber}
                            </DialogTitle>
                            <DialogContent>
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
                                                    <TableCell sx={{ fontSize: '12px' }}>{doc.fileName}</TableCell>
                                                    <TableCell sx={{ fontSize: '12px' }}>{doc.documentType}</TableCell>
                                                    <TableCell sx={{ fontSize: '12px' }}>
                                                        <StatusText status={doc.status}>
                                                            {doc.status}
                                                        </StatusText>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleOpenPdf(doc.filePath)}
                                                            sx={{
                                                                fontSize: '10px',
                                                                padding: '4px 8px',
                                                                marginRight: '8px'
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleDownload(doc.filePath, doc.fileName)}
                                                            sx={{
                                                                fontSize: '10px',
                                                                padding: '4px 8px'
                                                            }}
                                                            startIcon={<Download size={14} />}
                                                        >
                                                            Download
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </DialogContent>
                            <DialogActions>
                                <Button 
                                    onClick={handleCloseGroupDialog} 
                                    sx={{ fontSize: '12px' }}
                                >
                                    Close
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>

                <Dialog open={openPdfDialog} onClose={handleClosePdf} maxWidth="lg" fullWidth>
                    <DialogTitle sx={{ fontSize: '14px', fontWeight: 'bold' }}>
                        PDF Viewer
                    </DialogTitle>
                    <DialogContent sx={{ height: '80vh' }}>
                        {selectedPdfUrl && (
                            <iframe 
                                src={selectedPdfUrl} 
                                width="100%" 
                                height="100%" 
                                style={{ border: 'none' }}
                                title="PDF Viewer"
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={handleClosePdf} 
                            sx={{ fontSize: '12px' }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Card>
        </Box>
    );
};

export default DocumentList;