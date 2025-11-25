import React, { useState, useEffect } from 'react';
import apiServices from '../../ApiServices/ApiServices';
import Loader from "react-js-loader";
import './NotificationDropdown.css';

const NotificationPage = ({ newNotification, onNotificationsUpdate }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [orgId, setOrgId] = useState("");
  const [activeTab, setActiveTab] = useState('all');
  const [indicatorPosition, setIndicatorPosition] = useState(0);

  const normalizeTimestamp = (not) =>
    not.timestamp || not.created_at || not.delivered_at || null;

  const fetchOrgAndNotifications = async () => {
    try {
      const details_data = await apiServices.details();
      let org_id = details_data?.details?.[7]?.id || details_data?.details?.[1]?.id;
      if (!org_id) throw new Error('Organization ID not found');
      setOrgId(org_id);

      const response = await apiServices.OrgNotification();

      const processed = response.map((not) => ({
        not_message: not.notification.message,
        not_title: not.notification.title,
        id: not.id,
        is_read: not.is_read,
        timestamp: normalizeTimestamp(not)
      }));

      // Sort newest first
      const sorted = processed.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setNotifications(sorted);
      if (onNotificationsUpdate) onNotificationsUpdate(sorted);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  useEffect(() => {
    if (!orgId) fetchOrgAndNotifications();
  }, [orgId]);

  useEffect(() => {
    if (newNotification) {
      setNotifications((prev) => {
        const updated = [
          {
            ...newNotification,
            timestamp: normalizeTimestamp(newNotification)
          },
          ...prev
        ];
        // Always sort after adding new notification
        return updated.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      });
      setIsOpen(true);
    }
  }, [newNotification]);

  useEffect(() => {
    setIndicatorPosition(activeTab === 'all' ? 0 : 100);
  }, [activeTab]);

  const handleTabChange = (tab, event) => {
    event?.stopPropagation();
    setActiveTab(tab);
    setVisibleCount(10);
  };

  const closeNotification = () => setIsOpen(false);

  const handleShowMore = (event) => {
    event.stopPropagation();
    setVisibleCount((prevCount) => prevCount + 10);
  };

  const handleNotificationClick = async (event, id) => {
    event.stopPropagation();
    try {
      await apiServices.notificationMarkasRead(id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return (
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' · ' +
      date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    );
  };

  const filteredNotifications = notifications.filter(notification =>
    activeTab === 'all' || !notification.is_read
  );

  const visibleNotifications = filteredNotifications.slice(0, visibleCount);

  if (!isOpen) return null;

  return (
    <div className="notification-container" onClick={(e) => e.stopPropagation()}>
      <div className="notification-header">
        <h3>Notifications</h3>
        <button className="close-btn" onClick={closeNotification}>&times;</button>
      </div>

      <div className="tab-container">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={(e) => handleTabChange('all', e)}
          >
            All
          </button>
          <button
            className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={(e) => handleTabChange('unread', e)}
          >
            Unread
            {notifications.some(n => !n.is_read) && (
              <span className="unread-badge">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </button>
        </div>
        <div
          className="tab-indicator"
          style={{ transform: `translateX(${indicatorPosition}%)` }}
        />
      </div>

      {loading ? (
        <div className="notification-loading">
          <Loader type="box-up" bgColor={'#000b58'} color={'#000b58'} size={50} />
          <p className="loading-text">Loading notifications...</p>
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : visibleNotifications.length > 0 ? (
        <>
          <div className="notification-list-container">
            <ul className="notification-list">
              {visibleNotifications.map((notification, index) => (
                <li
                  key={notification.id || index}
                  className={`notification-card ${notification.is_read ? 'read' : 'unread'}`}
                  onClick={(e) => handleNotificationClick(e, notification.id)}
                >
                  <div className="notification-content">
                    <p className="notification-message">{notification.not_message}</p>
                    <div className="notification-meta">
                      <span className="notification-title">{notification.not_title}</span>
                      <span className="notification-time">{formatDate(notification.timestamp)}</span>
                    </div>
                  </div>
                  {!notification.is_read && <div className="unread-indicator"></div>}
                </li>
              ))}
            </ul>
          </div>

          {filteredNotifications.length > visibleCount && (
            <button className="show-more-btn" onClick={handleShowMore}>
              {filteredNotifications.length - visibleCount > 10
                ? `Show 10 More`
                : `Show All`}
            </button>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>No {activeTab === 'unread' ? 'unread' : ''} notifications</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;