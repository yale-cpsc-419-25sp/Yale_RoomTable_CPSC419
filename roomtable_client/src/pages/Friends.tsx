import React, { useState, useEffect } from 'react';
import "../../../static/search.css"

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
    <div className='flex justify-left items-center w-full mx-auto px-6'>
      <div className="mb-4">
        <h1 className="text-red-500 font-semibold">{error && error}</h1>
      </div>

      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Add Friends</h1>
        <h2 className="text-lg text-gray-600 mb-4">Insert the Net ID of a Friend.</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            placeholder="Net ID"
            className="p-3 border border-gray-300 rounded-md text-lg"
          />
          <button type="submit" className="search-button">Add Friend</button>
        </form>
        <div>
          <h2 className="text-2xl font-semibold mb-4 pt-12">Friends List</h2>
          <ul className="list-none space-y-2">
            {friends.map(fid => (
              <li key={fid}>
                <a href={`/friends/${fid}`}  className="text-blue-800 hover:text-blue-700">{fid}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      
    </div>
  );
}
