import { useState, useEffect } from 'react';
import "../search.css"

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [friendId, setFriendId] = useState('');
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);

  // Fetch list of friends from flask-server
  useEffect(() => {
    fetch('/api/friends')
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setFriends(data.friends);
      });
      // Fetch list of friend requests from flask-server
      fetch('/api/requests')
      .then(res2 => res2.json())
      .then(data2 => {
        if (data2.error) setError(data2.error);
        else setRequests(data2.requests);
      });
  }, []);

  // Handle form submission to add a friend
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
      // Add friend requests to local state
      setRequests(prev => [...prev, { friend_id: friendId, status: 'sent' }]);
    }
  };

  // Handle removing a friend
  const handleRemove = async (friend_id: string) => {
    const res = await fetch('/api/friends', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friend_id })
    });
  
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      setError('');
      // Remove friend from local state
      setFriends(prev => prev.filter(fid => fid !== friend_id));
    }
  };

  const handleDenyRequest = async (friend_id: string) => {
    const res = await fetch('/api/requests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friend_id })
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    }
    else {
      setError('');
      // Remove request from local state
      setRequests(prev => prev.filter(req => req.friend_id !== friend_id));
    }
  };

  const handleAcceptRequest = async (friend_id: string) => {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friend_id })
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      setError('');
      // Remove request from local state
      setRequests(prev => prev.filter(req => req.friend_id !== friend_id));
      // Add friend to local state
      setFriends(prev => [...prev, friend_id]);
    }
  };

  return (
    <div className='flex justify-left items-center w-full mx-auto p-6'>
      <div className="mb-4">
        <h1 className="text-red-500 font-semibold">{error && error}</h1>
      </div>

      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Add Friends</h1>
        <h2 className="text-lg text-gray-600 mb-4">Insert the Net ID of a Friend.</h2>
        {/* Form to add friend using their net id through handleSubmit */}
        <form onSubmit={handleSubmit} className="flex justify-between items-center gap-4">
          <input
            type="text"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            placeholder="Net ID"
            className="p-3 border border-gray-300 rounded-md text-lg"
          />
          <button type="submit" className="search-button">Add Friend</button>
        </form>
      

        <div className="mt-12 overflow-hidden rounded-xl shadow-md border border-gray-300">
          <table className="text-white bg-[#00356B] w-full">
            <thead>
              <th className="px-4 py-2 text-left">Friends List</th>
            </thead>
            <tbody>
              {/* Display all friends of the current user and allow them to remove those friends */}
              {friends.map((fid, index) => (
                <tr key={fid} className={index % 2 === 0 ? "bg-gray-100 w-full" : "bg-gray-200 w-full"}>
                  <td className="px-4 py-2">
                    <a href={`/friends/${fid}`} className="text-blue-700 underline hover:text-blue-900 mr-4">{fid}</a>
                    <button 
                      onClick={() => handleRemove(fid)} 
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="text-white bg-[#00356B] w-full">
            <thead>
              <th className="px-4 py-2 text-left">Friend Requests</th>
            </thead>
            <tbody>
              {/* Display all friends of the current user and allow them to remove those friends */}
              {requests.map((req, index) => (
                <tr key={req.friend_id} className={index % 2 === 0 ? "bg-gray-100 w-full" : "bg-gray-200 w-full"}>
                  <td className="px-4 py-2">
                    <a className="text-blue-700 underline hover:text-blue-900 mr-4">{req.friend_id}</a>
                    { /* If incoming request, user can accept or deny the request */}
                    { /* https://legacy.reactjs.org/docs/conditional-rendering.html */}
                    {req.status == 'received' ? (
                    <>
                      <button 
                        onClick={() => handleDenyRequest(req.friend_id)} 
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Deny Request
                      </button>
                      <button 
                        onClick={() => handleAcceptRequest(req.friend_id)} 
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      >
                        Accept Request
                      </button>
                    </>
                  ) : 
                  /* If outgoing request, user can rescind the request */
                  (
                    <button 
                      onClick={() => handleDenyRequest(req.friend_id)} 
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Rescind Request
                    </button>
                  )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
