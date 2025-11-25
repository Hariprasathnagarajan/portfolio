import React, { useState, useRef, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
import './FileUploadPage.css';
import Loader from "react-js-loader";
import { useNavigate } from 'react-router-dom';
import apiServices from '../../ApiServices/ApiServices';
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Box } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import dayjs from 'dayjs';
/** ---------- Utilities ---------- */
const pad2 = (n) => String(n).padStart(2, '0');

// dd/mm/yyyy -> Date (local)  (returns null if invalid)
const parseDisplayDate = (ddmmyyyy) => {
  if (!ddmmyyyy) return null;
  const parts = ddmmyyyy.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map((p) => parseInt(p, 10));
  if (!yyyy || !mm || !dd) return null;
  const dt = new Date(yyyy, mm - 1, dd);
  // validate round-trip
  if (dt.getFullYear() !== yyyy || (dt.getMonth() + 1) !== mm || dt.getDate() !== dd) return null;
  return dt;
};

// Date -> dd/mm/yyyy
const toDisplayDate = (dt) => `${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()}`;

// dd/mm/yyyy -> yyyy-mm-dd (backend)
const toBackendDate = (ddmmyyyy) => {
  const dt = parseDisplayDate(ddmmyyyy);
  if (!dt) return '';
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
};

// clamp to max (inclusive)
const clampToMaxToday = (dt) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const c = new Date(dt);
  c.setHours(0,0,0,0);
  if (c > today) return today;
  return c;
};

/** ---------- Lightweight Calendar (no external libs) ---------- */
const Calendar = ({ value, onSelect, maxDate }) => {
  // value is a Date or null
  const init = value ? new Date(value) : new Date();
  const [view, setView] = useState(new Date(init.getFullYear(), init.getMonth(), 1));

  const startOfMonth = new Date(view.getFullYear(), view.getMonth(), 1);
  const endOfMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0);
  const startWeekday = startOfMonth.getDay(); // 0 Sun ... 6 Sat

  // Make a grid of days (Sun-Sat)
  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= endOfMonth.getDate(); d++) {
    days.push(new Date(view.getFullYear(), view.getMonth(), d));
  }

  const canGoNext = (() => {
    if (!maxDate) return true;
    const nextMonthFirst = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    return nextMonthFirst <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  })();

  const canGoPrev = true;

  const isSameDay = (a, b) =>
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div style={{ width: 260, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', padding: 8, zIndex: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18 }} aria-label="Previous month">‹</button>
        <div style={{ fontWeight: 600 }}>{view.toLocaleString(undefined, { month: 'long' })} {view.getFullYear()}</div>
        <button type="button" disabled={!canGoNext} onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} style={{ border: 'none', background: canGoNext ? 'transparent' : '#f3f4f6', cursor: canGoNext ? 'pointer' : 'not-allowed', fontSize: 18 }} aria-label="Next month">›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 4 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const disabled = maxDate ? d > maxDate : false;
          const selected = value ? isSameDay(d, value) : false;
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => !disabled && onSelect(d)}
              disabled={disabled}
              style={{
                padding: '6px 0',
                borderRadius: 6,
                border: '1px solid ' + (selected ? '#2563eb' : '#e5e7eb'),
                background: selected ? '#dbeafe' : disabled ? '#f3f4f6' : '#fff',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** ---------- Custom DatePicker (DD/MM/YYYY) ---------- */
const CustomDatePicker = ({ value, onChange, maxToday = true, placeholder = 'DD/MM/YYYY' }) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const popRef = useRef(null);
  const containerRef = useRef(null);

  const today = new Date();
  today.setHours(0,0,0,0);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const currentDateObj = value ? parseDisplayDate(value) : null;
  const maxDate = maxToday ? today : null;

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        className="declaration-date-input"
        placeholder={placeholder}
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          // allow typing like 12/08/2025
          const v = e.target.value.replace(/[^\d/]/g, '');
          // Keep at most dd/mm/yyyy
          if (v.length <= 10) onChange(v);
        }}
        onBlur={(e) => {
          const txt = e.target.value.trim();
          if (txt === '') return; // allow clear without error
          let dt = parseDisplayDate(txt);
          if (!dt) {
            // invalid -> set to today
            dt = today;
          }
          if (maxToday) dt = clampToMaxToday(dt);
          onChange(toDisplayDate(dt));
        }}
        required
      />
      <button
        type="button"
        aria-label="Open calendar"
        onClick={() => setOpen((o) => !o)}
        style={{ position: 'absolute', right: 6, top: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16 }}
      >
        📅
      </button>
      {value && (
        <button
          type="button"
          aria-label="Clear date"
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: 34, top: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 22 }}
      >
          ×
        </button>
      )}

      {open && (
        <div ref={popRef} style={{ position: 'absolute', top: '110%', left: 0 }}>
          <Calendar
            value={currentDateObj}
            onSelect={(dt) => {
              const cleaned = maxToday ? clampToMaxToday(dt) : dt;
              onChange(toDisplayDate(cleaned));
              setOpen(false);
            }}
            maxDate={maxDate}
          />
        </div>
      )}
    </div>
  );
};
/** ---------- Main Component ---------- */
const FileUploadPage = () => {
  const [declarationNumber, setDeclarationNumber] = useState('');
  const [declarationDate, setDeclarationDate] = useState(''); // dd/mm/yyyy
  const [isFileUploadEnabled, setIsFileUploadEnabled] = useState(false);
  const [approvedFiles, setApprovedFiles] = useState([]);
  const [files, setFiles] = useState({
    declaration: null,
    invoice: null,
    packingList: null,
    awsBol: null,
    countryOfOrigin: null,
    deliveryOrder: null,
    other: [], 
  });
  const [showSearchInfo, setShowSearchInfo] = useState(false);
  const [isGoButtonClicked, setIsGoButtonClicked] = useState(false);

  const infoWrapRef = useRef(null);
useEffect(() => {
  const handleClickOutside = (e) => {
    if (infoWrapRef.current && !infoWrapRef.current.contains(e.target)) {
      setShowSearchInfo(false);
    }
  };
  if (showSearchInfo) {
    document.addEventListener("mousedown", handleClickOutside);
  }
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showSearchInfo]);

  const getTodayDisplay = () => toDisplayDate(new Date());

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoClick = async () => {
    if (declarationNumber.length === 13) {
      try {
        setIsLoading(true);
        const response = await apiServices.checkdeclarationdoc(declarationNumber);
        console.log('Response:', response);
        if (response) {
          const updatedDocuments = {
            declaration_date: null,
            declaration: null,
            invoice: null,
            packingList: null,
            awsBol: null,
            countryOfOrigin: null,
            deliveryOrder: null,
            other: [],
          };

          Object.keys(response).forEach((key) => {
            const document = response[key];
            if (document?.document_type?.name && document.status != "Rejected") {
              const docTypeName = document.document_type.name.toLowerCase();
              const mappings = {
                'declaration_date': 'declaration_date',
                'declaration': 'declaration',
                'invoice': 'invoice',
                'packinglist': 'packingList',
                'awsbol': 'awsBol',
                'countryoforigin': 'countryOfOrigin',
                'deliveryorder': 'deliveryOrder',
                'other': 'other',
              };

              const mappedKey = mappings[docTypeName];
              if (mappedKey) {
                const filePath = document.current_version?.file_path || '';
                const fileName = filePath.split('/').pop();
                const status = document.status;

                updatedDocuments[mappedKey] = {
                  fileName,
                  alreadyUploaded: true,
                  status,
                };

                if (status === 'approved') {
                  setApprovedFiles((prev) => [...prev, fileName]);
                }
              }
            }
          });

          setFiles(updatedDocuments);
          setIsFileUploadEnabled(true);
          setIsGoButtonClicked(true);
          // Default date -> today (DD/MM/YYYY)
          setDeclarationDate(getTodayDisplay());
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error validating declaration number. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Declaration number must be 13 digits long.');
    }
  };

  const handleFileChange = (e, type) => {
  const selectedFiles = Array.from(e.target.files);

  selectedFiles.forEach((file) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPEG, PNG, and SVG files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB.");
      return;
    }
  });

  if (type === "other") {
    
    setFiles((prev) => ({ ...prev, other: [...prev.other, ...selectedFiles] }));
  } else {
    setFiles((prev) => ({ ...prev, [type]: selectedFiles[0] }));
  }
};

 const handleFileDelete = (type, index = null) => {
  if (type === "other" && index !== null) {
    setFiles((prev) => {
      const updatedOthers = [...prev.other];
      updatedOthers.splice(index, 1);
      return { ...prev, other: updatedOthers };
    });
  } else {
    setFiles((prev) => ({ ...prev, [type]: null }));
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('declaration_Number', declarationNumber);
    formData.append('declaration_date', toBackendDate(declarationDate)); // yyyy-mm-dd to backend

   
    Object.keys(files).forEach((key) => {
  if (key === "other" && files.other.length > 0) {
    // ✅ Multiple files for Others
    files.other.forEach((file) => {
      formData.append("Others", file);
    });
  } else if (files[key] && !files[key].alreadyUploaded) {
    formData.append(key, files[key]);
  }
});


    if (formData.has('declaration_Number') && formData.has('declaration_date') && formData.size === 2) {
      alert('No new files to upload.');
      return;
    }

    try {
      setIsLoading(true);
      await apiServices.uploadDocument(formData);
      alert('Files submitted successfully!');
      navigate('/documentlist');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit files.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="file-upload-page-outer">
      <div className="file-upload-page">
        <h1 className="page-title">Document upload</h1>
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="declaration-section" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="declarationNumber" className="declaration-label">Declaration Number</label>
            <input
              type="text"
              id="declarationNumber"
              className="declaration-input"
              value={declarationNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setDeclarationNumber(value);
              }}
              maxLength={13}
              placeholder="Enter Declaration Number"
              onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // avoid form submit/reload
      handleGoClick();    // trigger Go button action
    }
  }}
            />
            <button 
              type="button" 
              className="go-button" 
              onClick={handleGoClick} 
              disabled={declarationNumber.length !== 13}
            >
              Go
            </button>

            {/* Info Icon */}
            <div style={{ position: "relative" }} ref={infoWrapRef}>
              <IoMdInformationCircleOutline
                size={22}
                style={{
                  cursor: isGoButtonClicked ? "pointer" : "not-allowed",
                  color: isGoButtonClicked ? "#2563eb" : "#9ca3af"
                }}
                onClick={() => {
                  if (isGoButtonClicked) setShowSearchInfo((prev) => !prev);
                }}
              />
              {showSearchInfo && (
                <div
                  style={{
                    position: "absolute",
                    top: "30px",
                    left: "0",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    padding: "10px",
                    width: "180px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    fontSize: "14px",
                    zIndex: 100
                  }}
                >
                  <strong>Accepted formats:</strong><br />
                  PDF, JPEG, PNG, SVG.<br />
                </div>
              )}
            </div>
          </div>

          {isFileUploadEnabled && (
            <div className="file-upload-section">
<div className="file-upload-item">
      <label className="file-upload-label">Declaration Date</label>
     <Box mt={1} sx={{ width: 180 }}> {/* Adjust width as needed */}
 <LocalizationProvider dateAdapter={AdapterDayjs}>
<DatePicker
  value={declarationDate ? dayjs(declarationDate, 'DD/MM/YYYY') : null}
  onChange={(newValue) => {
    if (newValue) {
      setDeclarationDate(newValue.format('DD/MM/YYYY'));
    } else {
      setDeclarationDate('');
    }
  }}
  format="DD/MM/YYYY"
  disableFuture   // ⬅️ instead of disableFuture
  slotProps={{
    textField: { variant: 'outlined', size: 'small', fullWidth: true },
  }}
  showToolbar
/>

  </LocalizationProvider>
</Box>

    </div> 
    {/* <div className="file-upload-item">
  <label className="file-upload-label">Declaration Date</label>
  <input
    type="text"
    className="declaration-date-input"
    value={declarationDate}
    readOnly
  />
</div> */}


              {[
                { key: 'declaration', label: 'Declaration' },
                { key: 'invoice', label: 'Invoice' },
                { key: 'packingList', label: 'Packing List' },
                { key: 'awsBol', label: 'AWS/BOL' },
                { key: 'countryOfOrigin', label: 'Country Of Origin' },
                { key: 'deliveryOrder', label: 'Delivery Order' },
                { key: 'other', label: 'Others' },
              ].map((item) =>
                item.key === "other" ? (
   <div className="file-upload-item" key="other">
  <label className="file-upload-label">Others</label>
  <div className="file-actions" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
    
    {/* File list (each file row with ❌) */}
    {files.other.length > 0 && (
      <ul className="file-list" style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: 370, padding: 0 }}>
        {files.other.map((f, idx) => (
          <li
            key={idx}
            className="file-list-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <span className="file-name">{f.name}</span>
            <button
              type="button"
              className="delete-icon"
              onClick={() => handleFileDelete("other", idx)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    )}

    {/* Upload button always at bottom right */}
    <div style={{ display: "flex", justifyContent: "flex-end" , marginLeft: 590}}>
      <label className="upload-icon">
        <CloudUploadIcon 
      sx={{ 
        color: '#1976d2',
        fontSize: '20px',
        '&:hover': { 
          color: '#1565c0'  
        }
      }}
    />
        <input
          type="file"
          accept=".pdf,.jpeg,.jpg,.png,.svg"
          className="hidden-input"
          multiple
          onChange={(e) => handleFileChange(e, "other")}
        />
      </label>
    </div>
  </div>
</div>

                ) : (
                  <div className="file-upload-item" key={item.key}>
                    <label className="file-upload-label">{item.label}</label>
                    <div className="file-actions">
                      {!files[item.key] ? (
                        <label className="upload-icon">
                          <CloudUploadIcon 
      sx={{ 
        color: '#1976d2',
        fontSize: '20px',
        '&:hover': { 
          color: '#1565c0'  
        }
      }}
    />
                          <input
                            type="file"
                            accept=".pdf,.jpeg,.jpg,.png,.svg"
                            className="hidden-input"
                            onChange={(e) => handleFileChange(e, item.key)}
                          />
                        </label>
                      ) : files[item.key]?.alreadyUploaded ? (
                        <>
                          <span className="file-name">{files[item.key].fileName}</span>
                          <span className="already-uploaded-message">File already uploaded</span>
                        </>
                      ) : (
                        <>
                          <span className="file-name">{files[item.key].name}</span>
                          <button
                            type="button"
                            className="delete-icon"
                            onClick={() => handleFileDelete(item.key)}
                          >
                            ❌
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              )}

              <button type="submit" className="submit-button">Submit</button>
            </div>
          )}
        </form>
      </div>

      {approvedFiles.length > 0 && (
        <div className="approved-files-section">
          <h3>Approved Files:</h3>
          <ul>{approvedFiles.map((file, idx) => (<li key={idx}>{file}</li>))}</ul>
        </div>
      )}

      {isLoading && (
        <div className="loading-popup">
          <div className="loading-popup-content">
            <Loader type="box-up" bgColor={'#000b58'} color={'#000b58'} size={100} />
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;
