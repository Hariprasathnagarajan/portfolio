import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  TextField,
  Button,
  RadioGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  Fab,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { API_URL, API_URL2 } from '../ApiServices/ApiServices';

const ChatBox = ({ open, onClose, currentDocument, threadId, username, source, org, onSendMessage }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const role = localStorage.getItem("role");

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [skippedMessages, setSkippedMessages] = useState([]);
  
  // Load more state
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const limit = 25;
  const [localStatus, setLocalStatus] = useState(currentDocument?.status || '');
  // Message tracking state
  const [totalServerCount, setTotalServerCount] = useState(0);
  const [lastKnownCount, setLastKnownCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [uploadFile, setUploadFile] = useState(null);
  const [message_id, setMessageid] = useState(null);
  const [showUploadChoice, setShowUploadChoice] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [displayMessages, setDisplayMessages] = useState("");

  // New features
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs to prevent race conditions
  const pollingRef = useRef(null);
  const isPollingActive = useRef(false);
  const skipPolling = useRef(false);
  const lastMessageIdRef = useRef(null);
  const isDuplicateCheck = useRef(new Set());

  // Helper to get load-more URL
  const getLoadMoreUrl = useCallback(() => {
    if (source === 'reconciliation') {
      if (!org) return `${API_URL}chat/reconciliation/${currentDocument.id}/load-more/`;
      return `${API_URL}chat/reconciliation/${currentDocument.id}/${org}/load-more/`;
    }
    if (!org) return `${API_URL}chat/declaration/${currentDocument.id}/load-more/`;
    return `${API_URL}chat/declaration/${currentDocument.id}/${org}/load-more/`;
  }, [source, org, currentDocument]);

  // Helper to get mark-as-read URL
  const getMarkReadUrl = useCallback((msgId) => {
    if (source === 'reconciliation') {
      if (!org) return `${API_URL}chat/reconciliation/${currentDocument.id}/markread/${msgId}/`;
      return `${API_URL}chat/reconciliation/${currentDocument.id}/${org}/markread/${msgId}/`;
    }
    if (!org) return `${API_URL}chat/declaration/${currentDocument.id}/markread/${msgId}/`;
    return `${API_URL}chat/declaration/${currentDocument.id}/${org}/markread/${msgId}/`;
  }, [source, org, currentDocument, threadId]);

  // Helper functions to get API URLs based on source
  const getBaseUrl = useCallback(() => {
    if (source === 'reconciliation') {
      return `${API_URL}chat/reconciliation/`;
    }
    return `${API_URL}chat/declaration/`;
  }, [source]);

  const getSendBaseUrl = useCallback(() => {
    if (source === 'reconciliation') {
      return `${API_URL}chats/reconciliation/`;
    }
    return `${API_URL}chats/declaration/`;
  }, [source]);

  const getCheckNewUrl = useCallback(() => {
    if (source === 'reconciliation') {
      return `${API_URL}reconciliation-chat/`;
    }
    return `${API_URL}declaration-chat/`;
  }, [source]);

  // Build URL with username/org logic
  const buildUrl = useCallback((baseUrl, endpoint = '') => {
    let url = baseUrl;
    
    if (!username) {
      url += `${currentDocument.id}/${endpoint}`;
    } else {
      if (!org || org === "Current") {
        url += `${currentDocument.id}/${endpoint}`;
      } else {
        url += `${currentDocument.id}/${org}/${endpoint}`;
      }
    }
    
    return url;
  }, [username, org, currentDocument]);

  // Mark message as read
  const markMessageAsRead = useCallback(async (msgId) => {
    try {
      const token = localStorage.getItem("token");
      const url = getMarkReadUrl(msgId);
      await axios.patch(url, {}, { 
        headers: { Authorization: `Token ${token}` } 
      });
      
      // Update local state to mark as read
      setChatMessages(prev => prev.map(msg => 
        msg.id === msgId ? { ...msg, is_read: true } : msg
      ));
    } catch (err) {
      console.error("Failed to mark message as read", err);
    }
  }, [getMarkReadUrl]);

  // Mark all unread messages as read
  const markAllUnreadMessagesAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const unreadMessages = chatMessages.filter(
        msg => !msg.is_read && msg.sender_or_receiver !== 'sender'
      );
      
      for (const msg of unreadMessages) {
        const url = getMarkReadUrl(msg.id);
        await axios.patch(url, {}, { 
          headers: { Authorization: `Token ${token}` } 
        });
      }
      
      // Update all messages to mark as read
      setChatMessages(prev => prev.map(msg => 
        !msg.is_read && msg.sender_or_receiver !== 'sender' 
          ? { ...msg, is_read: true } 
          : msg
      ));
    } catch (err) {
      console.error("Failed to mark all messages as read", err);
    }
  }, [chatMessages, getMarkReadUrl]);

  // Detect scroll position
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const atBottom = scrollHeight - scrollTop - clientHeight < 20;
    setIsAtBottom(atBottom);
    
    // Hide new message indicator if scrolled to bottom
    if (atBottom && newMessagesCount > 0) {
      setNewMessagesCount(0);
      setIsScrollButtonVisible(false);
    }
    
    // Show scroll button if not at bottom and there are new messages
    setIsScrollButtonVisible(!atBottom && newMessagesCount > 0);
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setNewMessagesCount(0);
    setIsScrollButtonVisible(false);
    
    // Mark all messages as read when scrolling to bottom
    if (chatMessages.some(msg => !msg.is_read && msg.sender_or_receiver !== 'sender')) {
      markAllUnreadMessagesAsRead();
    }
  };

  // Fetch initial chat messages
  const fetchInitialMessages = useCallback(async () => {
    if (!currentDocument?.id || !open) return;
    
    setIsLoading(true);
    setIsInitialLoad(true);
    
    // Clear duplicate check on new fetch
    isDuplicateCheck.current.clear();
    
    try {
      const token = localStorage.getItem("token");
      const baseUrl = getBaseUrl();
      const url = buildUrl(baseUrl);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` }
      });

      if (response.data && Array.isArray(response.data.messages)) {
        const messagesWithType = response.data.messages.map(msg => ({
          ...msg,
          isUser: msg.sender_or_receiver === 'sender',
          senderType: role !== "auditor" ? "user" : "auditor",
          isFile: !!msg.file[0]
        }));

        setChatMessages(messagesWithType);
        setCurrentOffset(messagesWithType.length);
        
        // Track message IDs to prevent duplicates
        messagesWithType.forEach(msg => isDuplicateCheck.current.add(msg.id));
        
        // Set total count and determine if more messages exist
        const totalCount = response.data.total_count || response.data.total || messagesWithType.length;
        setTotalServerCount(totalCount);
        setLastKnownCount(totalCount);
        setHasMoreMessages(totalCount > messagesWithType.length);
        
        // Store last message ID for polling reference
        if (messagesWithType.length > 0) {
          lastMessageIdRef.current = messagesWithType[messagesWithType.length - 1].id;
        }
        
        // Auto scroll to bottom on initial load
        setTimeout(() => {
          scrollToBottom();
          setIsInitialLoad(false);
        }, 100);
      }
    } catch (err) {
      console.error("Failed to fetch initial messages", err);
      setIsInitialLoad(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentDocument, open, getBaseUrl, buildUrl, role]);

  // Load more messages - FIXED VERSION
  const handleLoadMore = useCallback(async () => {
    if (!hasMoreMessages || loadingMore || !currentDocument?.id) return;
    
    setLoadingMore(true);
    const previousScrollHeight = messagesContainerRef.current?.scrollHeight || 0;
    
    try {
      const token = localStorage.getItem("token");
      const url = `${getLoadMoreUrl()}?offset=${currentOffset}&limit=${limit}`;
      
      const response = await axios.get(url, { 
        headers: { Authorization: `Token ${token}` } 
      });
      console.log("Load more response:", response.data);
      if (response.data) {
        // Check multiple possible response structures
        let newMessages = [];
        
        // Try different possible response structures
        if (Array.isArray(response.data.messages)) {
          newMessages = response.data.messages;
        } else if (Array.isArray(response.data.new_message)) {
          newMessages = response.data.new_message;
        } else if (Array.isArray(response.data)) {
          newMessages = response.data;
        }

        if (newMessages.length > 0) {
          // Filter out duplicates
          const filteredMessages = newMessages.filter(msg => !isDuplicateCheck.current.has(msg.id));
          
          if (filteredMessages.length > 0) {
            // Transform messages with proper properties
            const transformedMessages = filteredMessages.map(msg => ({
              ...msg,
              isUser: msg.sender_or_receiver === 'sender',
              senderType: role !== "auditor" ? "user" : "auditor",
              isFile: !!msg.file?.[0]
            }));

            // Add to duplicate check
            transformedMessages.forEach(msg => isDuplicateCheck.current.add(msg.id));

            // Prepend older messages to the beginning (since we're loading older messages)
            setChatMessages(prev => [...transformedMessages, ...prev]);
            setCurrentOffset(prev => prev + transformedMessages.length);
            setHasMoreMessages(transformedMessages.length === limit);
            
            console.log(`Loaded ${transformedMessages.length} more messages`);
          } else {
            setHasMoreMessages(false);
            console.log('No new messages to load (all duplicates)');
          }
        } else {
          setHasMoreMessages(false);
          console.log('No more messages to load');
        }
      }
    } catch (err) {
      console.error("Failed to load more messages", err);
      setHasMoreMessages(false);
    } finally {
      // Maintain scroll position after loading more messages
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const newScrollHeight = messagesContainerRef.current.scrollHeight;
          const scrollDifference = newScrollHeight - previousScrollHeight;
          messagesContainerRef.current.scrollTop = scrollDifference;
        }
        setLoadingMore(false);
      }, 100);
    }
  }, [hasMoreMessages, loadingMore, currentDocument, getLoadMoreUrl, currentOffset, limit, role]);

  // Check for new messages (optimized polling) - FIXED VERSION
  const checkForNewMessages = useCallback(async () => {
    if (!currentDocument?.id || !open || isPollingActive.current || skipPolling.current) return;
    
    isPollingActive.current = true;
    
    try {
      const token = localStorage.getItem("token");
      const checkNewUrl = getCheckNewUrl();
      let url = "";

      if (!username) {
        url = `${checkNewUrl}${currentDocument.id}/check-new/${lastKnownCount}/`;
      } else {
        if (!org || org === "Current") {
          url = `${checkNewUrl}${currentDocument.id}/check-new/${lastKnownCount}/`;
        } else {
          url = `${checkNewUrl}${currentDocument.id}/${org}/check-new/${lastKnownCount}/`;
        }
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` }
      });

      // Check if there are new messages
      if (response.data.current_count > lastKnownCount || response.data.new_message) {
        await fetchNewMessages(response.data.current_count || response.data.total_count);
      }
    } catch (err) {
      console.error("Failed to check for new messages", err);
    } finally {
      isPollingActive.current = false;
    }
  }, [currentDocument, open, lastKnownCount, username, org, getCheckNewUrl]);

  // Fetch only new messages - FIXED VERSION
  const fetchNewMessages = useCallback(async (newTotalCount) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = getBaseUrl();
      const url = buildUrl(baseUrl, `latest/?from_count=${lastKnownCount}`);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Token ${token}` }
      });

      if (response.data) {
        let newMessages = [];
        
        // Check multiple possible response structures for new messages
        if (Array.isArray(response.data.messages)) {
          newMessages = response.data.messages;
        } else if (Array.isArray(response.data.new_message)) {
          newMessages = response.data.new_message;
        } else if (Array.isArray(response.data)) {
          newMessages = response.data;
        }

        if (newMessages.length > 0) {
          // Filter out duplicates
          const filteredMessages = newMessages.filter(msg => !isDuplicateCheck.current.has(msg.id));
          
          if (filteredMessages.length > 0) {
            // Transform new messages with proper properties
            const transformedMessages = filteredMessages.map(msg => ({
              ...msg,
              isUser: msg.sender_or_receiver === 'sender',
              senderType: role !== "auditor" ? "user" : "auditor",
              isFile: !!msg.file?.[0]
            }));

            // Add to duplicate check
            transformedMessages.forEach(msg => isDuplicateCheck.current.add(msg.id));

            // Append new messages to the end
            setChatMessages(prev => [...prev, ...transformedMessages]);
            
            // Update counts
            setLastKnownCount(newTotalCount);
            setTotalServerCount(newTotalCount);
            
            // Update last message ID
            if (transformedMessages.length > 0) {
              lastMessageIdRef.current = transformedMessages[transformedMessages.length - 1].id;
            }
            
            // Show new message indicator if not at bottom
            if (!isAtBottom) {
              setNewMessagesCount(prev => prev + transformedMessages.length);
              setIsScrollButtonVisible(true);
            } else {
              // Auto scroll if at bottom
              setTimeout(() => scrollToBottom(), 100);
            }
            
            // Show notification for new messages from others
            const hasNewFromOthers = transformedMessages.some(msg => msg.sender_or_receiver !== 'sender');
            if (hasNewFromOthers) {
              setNotificationMsg("New message received");
              setShowNotification(true);
            }
            
            console.log(`Fetched ${transformedMessages.length} new messages`);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch new messages", err);
    }
  }, [getBaseUrl, buildUrl, lastKnownCount, role, isAtBottom]);

  // Initialize chat when threadId or document changes
  useEffect(() => {
    if (threadId && open && currentDocument?.id) {
      // Reset all state
      setChatMessages([]);
      setCurrentOffset(0);
      setNewMessagesCount(0);
      setIsScrollButtonVisible(false);
      setTotalServerCount(0);
      setLastKnownCount(0);
      setHasMoreMessages(false);
      lastMessageIdRef.current = null;
      isDuplicateCheck.current.clear();
      
      // Clear any existing polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      
      // Fetch initial messages
      fetchInitialMessages();
    }
  }, [threadId, open, currentDocument?.id, fetchInitialMessages]);

  // Setup polling for new messages
  useEffect(() => {
    if (!open || !currentDocument?.id) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Start polling after initial load is complete
    if (!isInitialLoad && lastKnownCount > 0) {
      pollingRef.current = setInterval(checkForNewMessages, 2000); // Reduced interval for faster updates
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [open, currentDocument?.id, isInitialLoad, lastKnownCount, checkForNewMessages]);

  // Auto scroll to bottom when new messages arrive and user is at bottom
  useEffect(() => {
    if (isAtBottom && !isInitialLoad) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages.length, isAtBottom, isInitialLoad]);

  const handleUploadAction = async (action, fileOrMessageId = null, documentType = null) => {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("action", action);
    formData.append("declaration_number", currentDocument.declarationNum);

    // Use passed message id OR fallback to state
    if (action === "skip") {
      formData.append("message_id", fileOrMessageId);
    } else {
      formData.append("message_id", message_id);
    }

    if (documentType) {
      formData.append("document_type", documentType);
    }

    if (action === "add" && fileOrMessageId) {
      formData.append("file_id", fileOrMessageId);
    }

    const url = `${API_URL}upload-action/chat/`;
      
      const response = await axios.post(url, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        }
      });
      
      if (response.status === 200 || response.status === 201) {
        // Show appropriate success message
        if (action === 'skip') {
          setNotificationMsg("Document skipped successfully");
        } else {
          setNotificationMsg("File uploaded successfully");
          
          if (response.data.replaced_info) {
            setNotificationMsg(response.data.replaced_info);
          }
        }
        
        setShowNotification(true);
        
        // Refresh messages after action
        setTimeout(() => {
          fetchInitialMessages();
        }, 500);
        
        return response.data;
      }
    } catch (error) {
      console.error("Upload action failed:", error);
      
      if (action === 'skip') {
        setNotificationMsg("Failed to skip document");
      } else {
        setNotificationMsg("Failed to upload file");
      }
      
      setShowNotification(true);
      throw error;
    }
  };

  // FIXED: handleUploadChoice function
  const handleUploadChoice = useCallback((choice) => {
    if (!uploadFile) {
      console.error("No upload file selected");
      return;
    }
    
    console.log("Upload choice:", choice, "File:", uploadFile);
    
    if (choice === "replace") {
      setShowUploadChoice(false);
      setReplaceMode(true);
    } else if (choice === "additional") {
      setShowUploadChoice(false);
      uploadDocument(uploadFile, "additional");
    }
  }, [uploadFile]);

  const handleReplaceConfirm = () => {
    if (!selectedDocType) {
      console.error("No document type selected");
      return;
    }
    uploadDocument(uploadFile, "replace", selectedDocType);
    resetUploadStates();
  };

  const resetUploadStates = () => {
    setUploadFile(null);
    setReplaceMode(false);
    setSelectedDocType("");
    setMessageid(null);
    setShowUploadChoice(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadDocument = async (file, mode, docType = null) => {
    if (!file) {
      console.error("No file to upload");
      return;
    }
    
    skipPolling.current = true;
    
    try {
      if (mode === "replace") {
        await handleUploadAction('add', file, docType);
      } else {
        await handleUploadAction('add', file, "Others");
      }
      
      setNotificationMsg("File uploaded successfully");
      setShowNotification(true);
    } catch (error) {
      console.error("Upload failed:", error);
      setNotificationMsg("Upload failed");
      setShowNotification(true);
    } finally {
      skipPolling.current = false;
      resetUploadStates();
    }
  };

  const handleSkipDocument = async (action, messageId) => {
  skipPolling.current = true;
  try {
    await handleUploadAction('skip', messageId);
    setSkippedMessages(prev => [...prev, messageId]);  // ✅ use messageId
  } catch (error) {
    // already handled in handleUploadAction
  } finally {
    skipPolling.current = false;
  }
};

// FIXED: sendMessageOrFile with proper status update
const sendMessageOrFile = async (payload) => {
  try {
    const token = localStorage.getItem("token");
    const baseUrl = getSendBaseUrl();
    const url = buildUrl(baseUrl, 'send/');

    skipPolling.current = true;

    const response = await axios.post(url, payload, {
      headers: { 
        Authorization: `Token ${token}`, 
        ...(payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : {}) 
      }
    });

    if (response.data) {
      // Clear input
      setMessage("");

      // ✅ Update status instantly if Closed - FIXED VERSION
      if (currentDocument.status === "Closed") {
        let newStatus = "";
        if (role === "Viewer") newStatus = "Pending with Auditor";
        if (role === "Auditor") newStatus = "Pending with Client";

        if (newStatus) {
          // ✅ UPDATE LOCAL STATUS STATE
          setLocalStatus(newStatus);

          // Update backend
          await axios.patch(
            `${API_URL}documents/${currentDocument.id}/update-status/`,
            { status: newStatus },
            { headers: { Authorization: `Token ${token}` } }
          );

          // ✅ EMIT STATUS CHANGE EVENT (ONLY ONCE)
          window.dispatchEvent(new CustomEvent('statusChanged', {
            detail: {
              declarationId: currentDocument.id,
              newStatus: newStatus,
              declarationNum: currentDocument.declarationNum
            }
          }));
        }
      }

      // Refresh messages after a brief delay
      setTimeout(() => {
        // Only refresh if we're still on the same chat
        if (open && currentDocument?.id) {
          checkForNewMessages();
        }
      }, 500);
    }
  } catch (err) {
    console.error("Failed to send", err);
  } finally {
    skipPolling.current = false;
  }
};
// ADD THIS: Sync status from props when currentDocument changes
useEffect(() => {
  if (currentDocument?.status) {
    setLocalStatus(currentDocument.status);
  }
}, [currentDocument?.status]);
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const formData = new FormData();
    formData.append("message", message);
    await sendMessageOrFile(formData);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await sendMessageOrFile(formData);
    e.target.value = ''; // Reset file input
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  // Mark all messages as read when opening the chat
  useEffect(() => {
    if (open && chatMessages.length > 0) {
      markAllUnreadMessagesAsRead();
    }
  }, [open, chatMessages.length]);

  if (!open || !currentDocument) return null;

  return (
    <Box sx={{
      position: 'fixed',
      right: 2,
      bottom: 0,
      width: 320,
      height: 470,
      backgroundColor: theme.palette.background.paper,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${theme.palette.divider}`,
      zIndex: 0,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: "#23308f",
      }}>
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
            {currentDocument?.declarationNum?.charAt(0) || 'D'}
          </Box>
          <Box>
                       <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'white' }}>
              {username}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'white' }}>
              {currentDocument.declarationNum}
            </Typography>
            <Typography variant="caption" sx={{ color: '#f7f7f7ff' }}>
              {localStatus}
            </Typography>
{currentDocument.thread_type && (
  <Box
    component="span"
    sx={{
      ml: 1,
      fontSize: "0.7rem",
      px: 0.6,
      py: 0.1,
      borderRadius: "6px",
      backgroundColor: "rgba(255,255,255,0.2)",
      color: "#fff",
      display: "inline-block",
      verticalAlign: "middle",
      marginTop: "2px",
    }}
  >
    {currentDocument.thread_type}
  </Box>
)}

          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: theme.palette.grey[50],
          position: 'relative'
        }}
        onScroll={handleScroll}
      >
        {isLoading && isInitialLoad && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {hasMoreMessages && !isInitialLoad && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              size="small"
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outlined"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </Button>
          </Box>
        )}

        {chatMessages.map((msg) => {
          const isSender = msg.sender_or_receiver === 'sender';
          return (
            <Box 
              key={msg.id} 
              data-msg-id={msg.id}
              sx={{
                display: 'flex',
                flexDirection: isSender ? 'row-reverse' : 'row',
                mb: 2,
                gap: 1,
                alignItems: 'flex-start',
              }}
            >
              {!isSender && (
                <Avatar sx={{
                  width: 28,
                  height: 28,
                  fontSize: '0.7rem',
                  bgcolor: msg.senderType === 'auditor' ? theme.palette.secondary.light : theme.palette.grey[300],
                  color: msg.senderType === 'auditor' ? theme.palette.secondary.dark : theme.palette.text.secondary,
                }}>
                  {msg.sender.charAt(0)}
                </Avatar>
              )}
              <Box sx={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {!isSender && (
<Typography
  variant="caption"
  sx={{
    fontWeight: 500,
    color: theme.palette.text.primary,
    ml: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5, // small space between name and role
  }}
>
  {msg.sender}
  {msg.sender_role && (
    <Box
      component="span"
      sx={{
        fontSize: '0.6rem',
        px: 0.5,
        py: 0.1,
        borderRadius: '4px',
        backgroundColor: 'rgba(0,0,0,0.1)', // light badge bg
        color: theme.palette.text.secondary,
        display: 'inline-block',
      }}
    >
      {msg.sender_role}
    </Box>
  )}
</Typography>

                )}
                <Box sx={{
                  backgroundColor: isSender ? theme.palette.primary.lighter :
                    (msg.senderType === 'auditor' ? theme.palette.secondary.lighter : theme.palette.grey[200]),
                  borderRadius: isSender ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  p: 1.5,
                  wordBreak: 'break-word',
                  border: `1px solid ${isSender ? theme.palette.primary.light :
                    (msg.senderType === 'auditor' ? theme.palette.secondary.light : theme.palette.grey[300])}`,
                }}>
                  {(msg.isFile || msg.skiped_files) ? (
                    (() => {
                      // Handle skipped file
                      if (msg.skiped_files) {
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              component="img"
                              src="https://cdn-icons-png.flaticon.com/512/565/565547.png"
                              alt="Skipped File"
                              sx={{ width: 28, height: 28 }}
                            />
                            <Typography sx={{ fontSize: '0.85rem', color: theme.palette.text.primary }}>
                              {msg.attached_files[0]?.file?.name || "Skipped File"}
                            </Typography>
                          </Box>
                        );
                      }
                      const fileUrl = msg.file[0];
                      const fileName = typeof msg.file[0] === 'string' ? msg.file[0].split('/').pop() : "Download file";
                      const ext = fileName.split('.').pop().toLowerCase();
                      const fileUrlStr = typeof fileUrl === 'string' ? fileUrl : '';
                      const fileUrlWithBase = fileUrlStr.startsWith('http')
                        ? fileUrlStr
                        : `${API_URL2}${fileUrlStr.startsWith('/') ? '' : '/'}${fileUrlStr}`;
                      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
                        // Image preview
                        return (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                            <Box
                              component="img"
                              src={fileUrlWithBase}
                              alt={fileName}
                              sx={{
                                maxWidth: 180,
                                maxHeight: 180,
                                borderRadius: 2,
                                mb: 0.5,
                                boxShadow: 1,
                                cursor: 'pointer',
                              }}
                              onClick={() => window.open(fileUrlWithBase, '_blank')}
                            />
                           <Typography
  component="a"
  href={fileUrlWithBase}
  target="_blank"
  rel="noopener noreferrer"
  title={fileName} // full name on hover
  sx={{
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontSize: '0.8rem',
    '&:hover': { textDecoration: 'underline' }
  }}
>
  {fileName.length > 15 ? fileName.substring(0, 15) + "..." : fileName}
</Typography>

                          </Box>
                        );
                      } else if (ext === 'pdf') {
                        // PDF preview
                        // If the file is skipped, do not show buttons
                        if (msg.is_skiped) {
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                component="img"
                                src="https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/pdf.svg"
                                alt="PDF"
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              <Tooltip title={fileName} arrow>
  <Typography
    component="a"
    href={fileUrlWithBase}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      color: theme.palette.primary.main,
      textDecoration: 'none',
      fontSize: '0.8rem',
      cursor: 'pointer',
      '&:hover': { textDecoration: 'underline' }
    }}
  >
    {fileName.length > 15 ? fileName.substring(0, 15) + "..." : fileName}
  </Typography>
</Tooltip>

                            </Box>
                          );
                        }
                        // If the file is replaced, show replaced_info
                        if (msg.is_replaced) {
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                component="img"
                                src="https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/pdf.svg"
                                alt="PDF"
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                               <Tooltip title={fileName}>
  <Typography
    component="a"
    href={fileUrlWithBase}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      color: theme.palette.primary.main,
      textDecoration: "none",
      fontSize: "0.8rem",
      maxWidth: "150px", // restrict width so ellipsis can apply
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      display: "inline-block",
      "&:hover": { textDecoration: "underline" },
    }}
  >
    {fileName.length > 15 ? fileName.substring(0, 15) + "..." : fileName}
  </Typography>
</Tooltip>
                                {/* <Typography
                                  variant="caption"
                                  sx={{ color: "green", fontStyle: "italic", display: "block", mt: 0.5 }}
                                >
                                  {msg.replaced_info}
                                </Typography> */}
                              </Box>
                            </Box>
                          );
                        }
                        // Otherwise, show Add/Skip buttons
                        return (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  <Box
    component="img"
    src="https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/pdf.svg"
    alt="PDF"
    sx={{ width: 32, height: 32, mr: 1 }}
  />
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
    <Tooltip title={fileName}>
      <Typography
        component="a"
        href={fileUrlWithBase}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: theme.palette.primary.main,
          textDecoration: "none",
          fontSize: "0.8rem",
          maxWidth: "150px", // controls visible length (~15 chars)
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          display: "inline-block",
          "&:hover": { textDecoration: "underline" },
        }}
      >
       {fileName.length > 15 ? fileName.substring(0, 15) + "..." : fileName}
      </Typography>
    </Tooltip>

    {role === "Viewer" && source==="declaration" && isSender ? (
      <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => {
            console.log(
              "Setting upload file:",
              msg.file_id,
              "Message ID:",
              msg.id
            );
            setUploadFile(msg.file_id);
            setMessageid(msg.id);
            setShowUploadChoice(true);
          }}
          disabled={skippedMessages.includes(msg.id)}
        >
          {/* {msg.file_id} */}
          Add
        </Button>
        <Button
  size="small"
  variant="outlined"
  color="secondary"
  onClick={() => {
    setMessageid(msg.id);   // set first
    handleSkipDocument("skip", msg.id); // then skip
  }}
>
  Skip
</Button>

      </Box>
    ) : null}
  </Box>
</Box>

                        );
                      } else {
                        // Generic file
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              component="img"
                              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReTwWkt4HK3eAed65gOh1dwiJyIvjIIaRoag&s"
                              alt="File"
                              sx={{ width: 28, height: 28, mr: 1 }}
                            />
                            <Typography
                              component="a"
                              href={fileUrlWithBase}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: theme.palette.primary.main,
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {fileName.length > 15 ? fileName.substring(0, 15) + "..." : fileName}
                            </Typography>
                            <Typography
                                  variant="caption"
                                  sx={{ color: "green", fontStyle: "italic", display: "block", mt: 0.5 }}
                                >
                                  {msg.replaced_info}
                                </Typography>
                          </Box>
                        );
                      }
                    })()
                  ) : (
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {msg.message}
                    </Typography>
                  )}
                  {msg.replaced_info && (
                    <Typography
                      variant="caption"
                      sx={{ color: "green", fontStyle: "italic", display: "block", mt: 0.5 }}
                    >
                      {msg.replaced_info}
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" sx={{
                  color: theme.palette.text.secondary,
                  textAlign: isSender ? 'right' : 'left',
                  px: 1,
                  fontSize: '0.65rem'
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* New message indicator/scroll button */}
      {isScrollButtonVisible && (
        <Fab
          color="primary"
          aria-label="scroll to bottom"
          onClick={scrollToBottom}
          sx={{
            position: 'absolute',
            bottom: 70,
            right: 16,
            width: 40,
            height: 40,
          }}
        >
          <ArrowDownwardIcon />
          {newMessagesCount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
              }}
            >
              {newMessagesCount}
            </Box>
          )}
        </Fab>
      )}

      {/* Input */}
      <Box sx={{
        p: 1.5,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}>
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

      {/* ENHANCED: Choice Dialog with modern styling */}
      <Dialog 
        open={showUploadChoice} 
        onClose={() => setShowUploadChoice(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            minWidth: '320px',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontWeight: 600,
          color: theme.palette.primary.main
        }}>
          Document Upload Options
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: theme.palette.text.secondary }}>
            How would you like to handle this document?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleUploadChoice("replace")}
              sx={{ 
                justifyContent: 'flex-start',
                p: 2,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                borderColor: theme.palette.warning.main,
                color: theme.palette.warning.main,
                backgroundColor: theme.palette.warning.lighter,
                '&:hover': {
                  backgroundColor: theme.palette.warning.light,
                  borderColor: theme.palette.warning.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }
              }}
            >
              🔄 Replace Current Document
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleUploadChoice("additional")}
              sx={{ 
                justifyContent: 'flex-start',
                p: 2,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                borderColor: theme.palette.success.main,
                color: theme.palette.success.main,
                backgroundColor: theme.palette.success.lighter,
                '&:hover': {
                  backgroundColor: theme.palette.success.light,
                  borderColor: theme.palette.success.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }
              }}
            >
              ➕ Add as Additional Document
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowUploadChoice(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.grey[100],
              }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* ENHANCED: Replace Mode Dialog with modern styling */}
      <Dialog 
        open={replaceMode} 
        onClose={resetUploadStates}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            minWidth: '360px',
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontWeight: 600,
          color: theme.palette.warning.main
        }}>
          🔄 Select Document Type to Replace
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: theme.palette.text.secondary }}>
            Choose which document type you want to replace:
          </Typography>
          <RadioGroup 
            value={selectedDocType} 
            onChange={(e) => setSelectedDocType(e.target.value)}
            sx={{ gap: 1 }}
          >
            <FormControlLabel 
              value="declaration" 
              control={<Radio sx={{ color: theme.palette.warning.main }} />} 
              label="📄 Declaration"
              sx={{
                margin: 0,
                p: 1.5,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.grey[300]}`,
                '&:hover': {
                  backgroundColor: theme.palette.grey[50],
                }
              }}
            />
            <FormControlLabel 
              value="invoice" 
              control={<Radio sx={{ color: theme.palette.warning.main }} />} 
              label="🧾 Invoice"
              sx={{
                margin: 0,
                p: 1.5,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.grey[300]}`,
                '&:hover': {
                  backgroundColor: theme.palette.grey[50],
                }
              }}
            />
            <FormControlLabel 
              value="packingList" 
              control={<Radio sx={{ color: theme.palette.warning.main }} />} 
              label="📦 Packing List"
              sx={{
                margin: 0,
                p: 1.5,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.grey[300]}`,
                '&:hover': {
                  backgroundColor: theme.palette.grey[50],
                }
              }}
            />
            <FormControlLabel 
              value="awsBol" 
              control={<Radio sx={{ color: theme.palette.warning.main }} />} 
              label="✈️ AWB/BOL"
              sx={{
                margin: 0,
                p: 1.5,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.grey[300]}`,
                '&:hover': {
                  backgroundColor: theme.palette.grey[50],
                }
              }}
            />
            <FormControlLabel 
              value="countryOfOrigin" 
              control={<Radio sx={{ color: theme.palette.warning.main }} />} 
              label="🌍 Country of Origin"
              sx={{
                margin: 0,
                p: 1.5,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.grey[300]}`,
                '&:hover': {
                  backgroundColor: theme.palette.grey[50],
                }
              }}
            />
            <FormControlLabel 
              value="deliveryOrder" 
              control={<Radio sx={{ color: theme.palette.warning.main }} />} 
              label="🚚 Delivery Order"
              sx={{
                margin: 0,
                p: 1.5,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.grey[300]}`,
                '&:hover': {
                  backgroundColor: theme.palette.grey[50],
                }
              }}
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={resetUploadStates}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.grey[100],
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReplaceConfirm}
            disabled={!selectedDocType}
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              backgroundColor: theme.palette.warning.main,
              '&:hover': {
                backgroundColor: theme.palette.warning.dark,
              },
              '&:disabled': {
                backgroundColor: theme.palette.grey[300],
                color: theme.palette.grey[500],
              }
            }}
          >
            🔄 Confirm Replace
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity="info" sx={{ width: '100%' }}>
          {notificationMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatBox;



