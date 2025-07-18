import React from 'react';
import { X, ChevronDown, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { markNotificationAsRead } from '../utils/notificationsHelper';

const NotificationsModal = ({ isOpen, onClose, notifications, unreadCount }) => {
    const navigate = useNavigate();

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markNotificationAsRead(notification._id);
        }
        onClose();

        // Navigate based on notification type
        if (notification.onModel === 'Application') {
            navigate(`/my-applications/${notification.relatedEntity._id}`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {notifications.length === 0 ? (
                        <div className="text-center text-gray-500">
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group relative p-4 rounded-lg transition-colors duration-200 ${notification.isRead ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                                        } cursor-pointer`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                                                    <ChevronDown size={20} />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {notification.onModel === 'Application' && (
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                                                    <FileText size={20} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {!notification.isRead && (
                                        <div className="absolute inset-0 bg-blue-500/5 rounded-lg" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 text-center text-sm text-gray-500">
                    {unreadCount > 0 && (
                        <p>You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
