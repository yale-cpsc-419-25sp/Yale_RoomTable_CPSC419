import { useState, useEffect, useRef } from 'react';
import "../search.css"

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const searchTimeoutRef = useRef(null);

  // Fetch list of friends and requests
  useEffect(() => {
    fetch('/api/friends')
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setFriends(data.friends);
      });

    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setRequests(data.requests);
      });
  }, []);

  // Handle search query changes with debounce
  useEffect(() => {
    // If less than 2 characters inputed in the query, clear results (too general)
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Clear previous timeout if it exists
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a timeout while results are fetched, preventing too many requests 
    // from being sent to the server while user types
    searchTimeoutRef.current = setTimeout(() => {
      fetch(`/api/friends/search?query=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
            setSearchResults([]);
          } else {
            setError('');
            setSearchResults(data.results || []);
          }
        })
        .catch(err => {
          setError('Failed to search for friends');
          setSearchResults([]);
        })
        .finally(() => setIsSearching(false));
    }, 300);

    // Make sure the previous timeout is cleared for the next search
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle direct friend request from search results
  const handleDirectAdd = async (netid, name) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ friend_id: netid })
      });
      
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setError('');
        // Display success message (times out after 3 seconds)
        setSuccessMessage(`Friend request sent to ${name}!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        setRequests(prev => [...prev, { friend_id: netid, status: 'sent' }]);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to send friend request');
    }
  };

  // Handle removing a friend
  const handleRemove = async (friend_id) => {
    try {
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
        setFriends(prev => prev.filter(fid => fid !== friend_id));
      }
    } catch (err) {
      setError('Failed to remove friend');
    }
  };

  const handleDenyRequest = async (friend_id) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_id })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setError('');
        setRequests(prev => prev.filter(req => req.friend_id !== friend_id));
      }
    } catch (err) {
      setError('Failed to deny request');
    }
  };

  const handleAcceptRequest = async (friend_id) => {
    try {
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
        setRequests(prev => prev.filter(req => req.friend_id !== friend_id));
        setFriends(prev => [...prev, friend_id]);
      }
    } catch (err) {
      setError('Failed to accept request');
    }
  };

  return (
    <div className='flex justify-left items-center w-full mx-auto p-6'>
      <div className="mb-4">
        <h1 className="text-red-500 font-semibold">{error && error}</h1>
        {/* Success message for friend request */}
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
            {successMessage}
          </div>
        )}
      </div>

      <div className='mb-8 w-full max-w-4xl'>
        <h1 className='text-3xl font-bold mb-4'>Friends</h1>
        
        {/* Search Friends Section - now the only way to add friends */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Search for Friends</h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full p-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Loading spinner */}
            {isSearching && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="mt-4 border rounded-lg shadow-lg overflow-hidden">
              {searchResults.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {searchResults.map(person => (
                    <li key={person.netid} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{person.name}</div>
                        <div className="text-sm text-gray-500">
                          {person.college} • Class of {person.year} • {person.netid}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDirectAdd(person.netid, person.name)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Add Friend
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {isSearching ? 'Searching...' : 'No results found'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Your Friends</h2>
          {friends.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {friends.map(fid => (
                  <li key={fid} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                    <a 
                      href={`/friends/${fid}`} 
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {fid}
                    </a>
                    <button
                      onClick={() => handleRemove(fid)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">You haven't added any friends yet.</p>
          )}
        </div>

        {/* Friend Requests */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Friend Requests</h2>
          {requests.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {requests.map(req => (
                  <li key={req.friend_id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{req.friend_id}</span>
                      <div className="flex gap-2">
                        {req.status === 'received' ? (
                          <>
                            <button
                              onClick={() => handleDenyRequest(req.friend_id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-colors"
                            >
                              Deny
                            </button>
                            <button
                              onClick={() => handleAcceptRequest(req.friend_id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-colors"
                            >
                              Accept
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleDenyRequest(req.friend_id)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">You have no pending friend requests.</p>
          )}
        </div>
      </div>
    </div>
  );
}