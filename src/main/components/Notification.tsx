// src/main/components/Notification.tsx
import React, { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  isRead: boolean
  actions?: NotificationAction[]
  persistent?: boolean
}

interface NotificationAction {
  id: string
  label: string
  action: string
  style?: 'primary' | 'secondary' | 'danger'
}

const Notification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    loadNotifications()
    setupNotificationListeners()
  }, [])

  const loadNotifications = async () => {
    try {
      const savedNotifications = await window.electronAPI?.getData('notifications') || []
      setNotifications(savedNotifications)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  const saveNotifications = async (updatedNotifications: Notification[]) => {
    try {
      setNotifications(updatedNotifications)
      await window.electronAPI?.saveData('notifications', updatedNotifications)
    } catch (error) {
      console.error('Failed to save notifications:', error)
    }
  }

  const setupNotificationListeners = () => {
    // Listen for new notifications from the app
    if (window.electronAPI?.onNotification) {
      window.electronAPI.onNotification((notification: Notification) => {
        addNotification(notification)
      })
    }
  }

  const addNotification = (notification: Notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || `notif_${Date.now()}`,
      timestamp: notification.timestamp || Date.now(),
      isRead: false
    }

    const updatedNotifications = [newNotification, ...notifications]
    saveNotifications(updatedNotifications)
  }

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    )
    saveNotifications(updatedNotifications)
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, isRead: true }))
    saveNotifications(updatedNotifications)
  }

  const deleteNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId)
    saveNotifications(updatedNotifications)
  }

  const clearAllNotifications = () => {
    saveNotifications([])
  }

  const handleNotificationAction = async (notificationId: string, actionId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (!notification?.actions) return

    const action = notification.actions.find(a => a.id === actionId)
    if (!action) return

    try {
      // Execute the action
      await window.electronAPI?.executeAction(action.action)
      
      // Mark notification as read
      markAsRead(notificationId)
    } catch (error) {
      console.error('Failed to execute notification action:', error)
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead
    if (filter === 'read') return notif.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const getNotificationClass = (type: string) => {
    switch (type) {
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'error'
      default: return 'info'
    }
  }

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h2>🔔 Notifications</h2>
        <div className="notification-actions">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`toggle-btn ${isOpen ? 'active' : ''}`}
          >
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            🔔 Notifications
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="notification-panel">
          <div className="panel-header">
            <div className="panel-controls">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="filter-select"
              >
                <option value="all">All ({notifications.length})</option>
                <option value="unread">Unread ({unreadCount})</option>
                <option value="read">Read ({notifications.length - unreadCount})</option>
              </select>
              
              <div className="panel-actions">
                <button 
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="mark-all-read-btn"
                >
                  Mark All Read
                </button>
                <button 
                  onClick={clearAllNotifications}
                  disabled={notifications.length === 0}
                  className="clear-all-btn"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="notifications-list">
            {filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <p>No notifications</p>
                <p>You're all caught up!</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${getNotificationClass(notification.type)} ${notification.isRead ? 'read' : 'unread'}`}
                >
                  <div className="notification-content">
                    <div className="notification-header">
                      <span className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <h4 className="notification-title">{notification.title}</h4>
                      <span className="notification-time">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="notification-message">{notification.message}</p>
                    
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="notification-actions">
                        {notification.actions.map(action => (
                          <button
                            key={action.id}
                            onClick={() => handleNotificationAction(notification.id, action.id)}
                            className={`action-btn ${action.style || 'secondary'}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="notification-controls">
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="mark-read-btn"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="delete-btn"
                      title="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="notification-settings">
        <h3>⚙️ Notification Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Browser notifications
            </label>
            <p>Show system notifications for important events</p>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              AI assistant notifications
            </label>
            <p>Get notified when AI completes tasks</p>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Shopping alerts
            </label>
            <p>Price drop and availability notifications</p>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Research updates
            </label>
            <p>Notifications for research progress and results</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notification
