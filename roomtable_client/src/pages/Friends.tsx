import React, { useState, useEffect } from 'react';

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [friendId, setFriendId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/friends')
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setFriends(data.friends);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ friend_id: friendId })
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      setError('');
      setFriendId('');
      setFriends(prev => [...prev, friendId]);
    }
  };

  return (
    <div>
      <div className="banner">
        <a href="/saved" className="nav-link">My Saved Rooms</a>
        <a href="/friends" className="nav-link">Add Friends</a>
        <a href="/search" className="nav-link">Search Rooms</a>
        <a href="/review" className="nav-link">Reviews</a>
        <form action="/logout" method="get">
          <button type="submit" className="logout">Log Out</button>
        </form>
      </div>

      <h1>{error && <span style={{ color: 'red' }}>{error}</span>}</h1>

      <h1>Add Friends</h1>
      <h2>Insert the Net ID of a Friend.</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={friendId}
          onChange={(e) => setFriendId(e.target.value)}
          placeholder="Net ID"
        />
        <button type="submit">Add Friend</button>
      </form>

      <div>
        <h2>Friends List</h2>
        <ul>
          {friends.map(fid => (
            <li key={fid}>
              <a href={`/friends/${fid}`}>{fid}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
