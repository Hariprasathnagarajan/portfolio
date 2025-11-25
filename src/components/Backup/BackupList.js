import React, { useState, useEffect } from "react";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  useTheme,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  FormControlLabel,
  InputAdornment,
  CircularProgress,
  OutlinedInput,
  Paper,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BackupIcon from '@mui/icons-material/Backup';
import apiServices, { API_URL } from "../../ApiServices/ApiServices";
import { Download } from 'lucide-react'; 
import Tooltip from '@mui/material/Tooltip';

const BackupList = () => {
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [backupType, setBackupType] = useState("");
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [page, setPage] = useState(0);

  const [backupList, setBackupList] = useState([]);
  const role = localStorage.getItem('role');
  const [filteredBackupList, setFilteredBackupList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();

  // ------------------ Notification Helper ------------------
  const triggerNotification = (message, type = "success") => {
    window.dispatchEvent(
      new CustomEvent("showNotification", { detail: { message, type } })
    );
  };
  // ---------------------------------------------------------

  useEffect(() => {
    fetchBackupList();
  }, []);

useEffect(() => {
  const filtered = backupList.filter((backup) => {
    const matchesSearch = backup.backup_file
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesDate =
      !selectedDate ||
      new Date(backup.end_datetime).toDateString() ===
        new Date(selectedDate).toDateString();

    return matchesSearch && matchesDate;
  });

  setFilteredBackupList(filtered);
}, [searchQuery, backupList, selectedDate]);


  const fetchBackupList = async () => {
    setLoading(true);
    try {
      const response = await apiServices.backuplist();
      setBackupList(response?.backups.sort((a, b) => new Date(b.end_datetime) - new Date(a.end_datetime)) || []);
      setFilteredBackupList(response?.backups || []);
    } catch (error) {
      console.error("Error fetching backup list:", error);
      triggerNotification("Failed to fetch backup list", "error");
    } finally {
      setLoading(false);
    }
  };

const handleClearSearch = () => {
  setSearchTerm('');
  setSelectedDate(null);
  setPage(0);
//  setSelected([]);
  };

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);
  const handleBackupSelection = (type) => setBackupType(type);

  const createBackup = async () => {
    try {
      if (backupType === "manual") {
        setStartDateError('');
        setEndDateError('');
        let hasError = false;

        if (!startDate || !endDate) {
          triggerNotification("Please select both start and end dates for manual backup", "error");
          return;
        }

        if (dayjs(startDate).isAfter(dayjs(endDate))) {
          setStartDateError('Start date cannot be later than end date.');
          hasError = true;
        }
        if (hasError) return;

        const formattedStart = dayjs(startDate).format('DD/MM/YYYY');
        const formattedEnd = dayjs(endDate).format('DD/MM/YYYY');

        const response = await apiServices.rangesearch({ 
          start_date: formattedStart, 
          end_date: formattedEnd 
        });

        if (response.data && response.data.backup_id) {
          downloadBackup(response.data.backup_id, `backup_${formattedStart}_${formattedEnd}.zip`);
          triggerNotification("Manual backup created successfully");
        } else {
          triggerNotification("Manual backup created");
        }
      } else {
        const response = await apiServices.autobackup();
        if (response?.data?.backup_id) {
          downloadBackup(response.data.backup_id, `auto_backup_${dayjs().format("DD_MM_YYYY")}.zip`);
          triggerNotification("Automatic backup created successfully");
        } else {
          triggerNotification("Automatic backup created");
        }
      }

      fetchBackupList();
      closePopup();
    } catch (error) {
      console.error("Backup creation failed:", error);

      if (error.response) {
        const message = error.response.data?.message || `Error: ${error.response.status}`;
        triggerNotification(message, "error");
      } else if (error.request) {
        triggerNotification("No response received from the server", "error");
      } else {
        triggerNotification(`Backup failed: ${error.message}`, "error");
      }
    }
  };

  const downloadBackup = async (backupId, backupFileName) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}backup/download/${backupId}/`, {
        method: "GET",
        headers: { Authorization: `Token ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/zip")) {
        throw new Error("Invalid file type received from server");
      }

      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Received empty file");

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = backupFileName || "backup.zip";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      triggerNotification(`Download failed: ${error.message}`, "error");
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleReset = () => setSearchQuery("");

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
    flexDirection: "row", // Changed from "column" to "row"
    justifyContent: "space-between", // This will push items to opposite ends
    alignItems: "center", // Vertically center align items
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
    Backup List
  </Typography>
  <Button 
    variant="contained" 
    startIcon={<AddIcon />} 
    onClick={openPopup} 
    sx={{ 
      backgroundColor: 'black', 
      color: 'white', 
      fontSize: '12px', 
      borderRadius: '10px', 
      padding: '10px', 
      minWidth: '140px', 
      '&:hover': { backgroundColor: '#424242' } 
    }}
  >
    Create Backup
  </Button>
</Box>
        
<Card sx={{zIndex:0,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                padding:'10px',
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
            }}>
      <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
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
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>}

      {!loading && (
        <Card sx={{ boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5', fontSize:'12px' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold',fontSize:'12px' }}>Backup Name</TableCell>
                  {["PRODUCT_OWNER", "PRODUCT_ADMIN"].includes(role) && <TableCell sx={{ fontWeight: 'bold' }}>Organization</TableCell>}
                  <TableCell sx={{ fontWeight: 'bold',fontSize:'12px' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold',fontSize:'12px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBackupList.length > 0 ? filteredBackupList.map((backup) => (
                  <TableRow key={backup.backup_id}>
                    <TableCell>{backup.backup_file.split("/").pop()}</TableCell>
                    {["PRODUCT_OWNER", "PRODUCT_ADMIN"].includes(role) && <TableCell>{backup.organization}</TableCell>}
                    <TableCell>{(() => { const date = new Date(backup.end_datetime); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}/${month}/${year}`; })()}</TableCell>
                    <TableCell>
                      <Tooltip title="Download">
                        <IconButton size="small" onClick={() => downloadBackup(backup.backup_id, backup.backup_file.split("/").pop())} sx={{ color: theme.palette.success.main, '&:hover': { backgroundColor: theme.palette.success.light } }}>
                          <Download size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No backups found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
</Card>
      <Dialog open={showPopup} onClose={closePopup} maxWidth="sm" fullWidth>
        <DialogTitle>Select Backup Type</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <FormControlLabel control={<Radio checked={backupType === "auto"} onChange={() => handleBackupSelection("auto")} />} label="Automatic Backup" />
            <FormControlLabel control={<Radio checked={backupType === "manual"} onChange={() => handleBackupSelection("manual")} />} label="Manual Backup (Select Start & End Date)" />

            {backupType === "manual" && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 4 }}>
                  <DatePicker label="Start Date" value={startDate} onChange={(newValue) => { setStartDate(newValue); setStartDateError(''); }} format="DD/MM/YYYY" slots={{ openPickerIcon: (props) => (<IconButton {...props}><CalendarTodayIcon /></IconButton>) }} slotProps={{ textField: { error: !!startDateError, helperText: startDateError } }} />
                  <DatePicker label="End Date" value={endDate} onChange={(newValue) => { setEndDate(newValue); setEndDateError(''); }} format="DD/MM/YYYY" slots={{ openPickerIcon: (props) => (<IconButton {...props}><CalendarTodayIcon /></IconButton>) }} slotProps={{ textField: { error: !!endDateError, helperText: endDateError } }} />
                </Box>
              </LocalizationProvider>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePopup}>Cancel</Button>
          <Button onClick={createBackup} disabled={!backupType || (backupType === "manual" && (!startDate || !endDate))} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupList;
