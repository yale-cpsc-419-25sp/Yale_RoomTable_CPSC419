import { useState, useEffect } from 'react';
import "../search.css"

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [friendId, setFriendId] = useState('');
  const [error, setError] = useState('');

  // Fetch list of friends from flask-server
  useEffect(() => {
    fetch('/api/friends')
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setFriends(data.friends);
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
      setFriends(prev => [...prev, friendId]);
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
        </div>
      </div>
    </div>
  );
}
