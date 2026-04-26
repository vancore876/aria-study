async function fetchAdminStats() {
  try {
    const res = await fetch('/admin/stats');
    const data = await res.json();

    document.getElementById('total-users').textContent = data.users || 0;
    document.getElementById('active-now').textContent = data.activeNow || 0;
    document.getElementById('active-today').textContent = data.activeToday || 0;
    document.getElementById('signups-today').textContent = data.signupsToday || 0;
    document.getElementById('plus-users').textContent = data.plusSubscribers || 0;
    document.getElementById('pro-users').textContent = data.proSubscribers || 0;
    document.getElementById('total-revenue').textContent = data.revenue || '$0';
  } catch (err) {
    console.error('Failed to fetch stats:', err);
  }
}

document.addEventListener('DOMContentLoaded', fetchAdminStats);
