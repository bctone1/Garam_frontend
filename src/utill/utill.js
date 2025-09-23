export function showNotification(message, type = 'info', duration = 3000) {
    const existingNotification = document.querySelector('.admin-notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    </div>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        minWidth: '300px',
        maxWidth: '500px',
        opacity: 0,
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        backgroundColor: '#d1ecf1', // 기본 info 색
        color: '#0c5460',
        border: '1px solid #bee5eb',
    });

    const colors = {
        success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
        error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
        warning: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
        info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
    };

    const colorScheme = colors[type] || colors.info;
    Object.assign(notification.style, {
        backgroundColor: colorScheme.bg,
        color: colorScheme.color,
        border: `1px solid ${colorScheme.border}`,
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    const closeBtn = notification.querySelector('.notification-close');
    const closeNotification = () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    };

    closeBtn.addEventListener('click', closeNotification);

    if (duration > 0) setTimeout(closeNotification, duration);
}

export function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}
