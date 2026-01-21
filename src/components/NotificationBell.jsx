import { useState } from 'react';
import { useData } from '../context/DataContext';

export default function NotificationBell() {
    const { notifications, markNotificationAsRead } = useData();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.length;

    const handleMarkRead = (id) => {
        markNotificationAsRead(id);
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    position: 'relative'
                }}
                className="btn-icon"
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: 'var(--danger)',
                        color: 'white',
                        borderRadius: '50%',
                        fontSize: '0.7rem',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="card" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '300px',
                    zIndex: 1000,
                    padding: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    <h4 style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', margin: 0 }}>Notificações</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} style={{
                                    padding: '0.8rem',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '0.9rem' }}>{notif.message}</span>
                                    <button
                                        onClick={() => handleMarkRead(notif.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--accent-primary)',
                                            fontSize: '1.2rem'
                                        }}
                                        title="Marcar como lida"
                                    >
                                        ✓
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Nenhuma notificação nova.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
