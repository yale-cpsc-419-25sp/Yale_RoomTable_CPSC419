const handleLogout = async () => {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      window.location.href = '/';
    } else {
      alert('Logout failed. Please try again.');
    }
  } catch (error) {
    console.error('Error logging out:', error);
    alert('An error occurred. Please try again.');
  }
};

export default handleLogout;