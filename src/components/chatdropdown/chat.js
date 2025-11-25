// src/components/ChatDropdown/ChatDropdown.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import ApiService from "../../ApiServices/ApiServices";
import Loader from "react-js-loader";
import "./ChatDropdown.css";

const ChatDropdown = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);

  const fetchChats = async () => {
    try {
      const res = await ApiService.getUnreadMessages();
          console.log("Unread threads from API:", res.unread_messages);
    console.log("Current role from localStorage:", localStorage.getItem("role"));
      const sorted = (res.unread_messages || []).sort(
        (a, b) =>
          new Date(b.messages?.[0]?.timestamp) -
          new Date(a.messages?.[0]?.timestamp)
      );
      setChats(sorted);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError("Failed to load chat messages");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, []);

  const closeChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (onClose) onClose();
    }, 300);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const markThreadAsRead = async (thread) => {
    try {
      await ApiService.markThreadAsRead(thread.thread_id, thread.thread_type);
      setChats((prev) =>
        prev.map((t) =>
          t.thread_id === thread.thread_id ? { ...t, unread_count: 0 } : t
        )
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const filteredChats = chats.filter((thread) => thread.unread_count > 0);
  const visibleChats = filteredChats.slice(0, visibleCount);
  const unreadCount = chats.filter((c) => c.unread_count > 0).length;

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div className="chat-backdrop" onClick={closeChat}></div>

      {/* Chat popup */}
      <div
        className={`chat-container ${isClosing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chat-header">
          <h3>Chats</h3>
          <button className="close-btn" onClick={closeChat}>
            &times;
          </button>
        </div>


        {loading ? (
          <div className="chat-loading">
            <Loader type="box-up" bgColor={"#000b58"} color={"#000b58"} size={50} />
            <p className="loading-text">Loading chats...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : visibleChats.length > 0 ? (
          <>
            <div className="chat-list-container">
              <ul className="chat-list">
                {visibleChats.map((thread, idx) => (
                  <li
                    key={idx}
                    className={`chat-card ${thread.unread_count > 0 ? "unread" : "read"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      markThreadAsRead(thread);
                    }}
                  >
                    <div className="chat-content">
<div className="chat-meta">
<span className="chat-title">
  {thread.declaration_number || thread.reconciliation_title || "Untitled"}
  {thread.organization && localStorage.getItem("role")?.toLowerCase() === "auditor"
    ? ` - ${thread.organization}`
    : ""}
</span>


  <span className="chat-time">
    {thread.unread_count > 0
      ? `${thread.unread_count} unread`
      : "All read"}
  </span>
</div>

                      <div className="chat-messages">
                        {thread.messages.map((msg) => (
                          <p key={msg.message_id} className="chat-message">
                                 <strong>
        {msg.sender_name} ({msg.sender_role})
      </strong>: {msg.message}
                            <br />
                            <span className="chat-timestamp">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {filteredChats.length > visibleCount && (
              <button
                className="show-more-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowMore();
                }}
              >
                {filteredChats.length - visibleCount > 10
                  ? "Show 10 More"
                  : "Show All"}
              </button>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No unread chats</p>
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

export default ChatDropdown;