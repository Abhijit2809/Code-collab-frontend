import React from 'react';
import { FaUserCircle, FaCrown } from 'react-icons/fa';

const UserList = ({ users = [], currentUser }) => (
  <div style={{ padding: 20, height: '100%', overflowY: 'auto' }}>
    <h3 style={{ display: 'flex', alignItems: 'center', margin: '0 0 20px 0' }}>
      👥 Live Users ({users.length})
    </h3>
    
    {users.length === 0 ? (
      <p style={{ color: '#666', textAlign: 'center' }}>Waiting...</p>
    ) : (
      users.map((user) => (
        <div key={user.socketId} style={{
          display: 'flex',
          alignItems: 'center',
          padding: 12,
          marginBottom: 8,
          background: user.userId === currentUser?.id ? '#404040' : 'transparent',
          borderRadius: 6
        }}>
          <FaUserCircle size={24} style={{ marginRight: 12 }} />
          
          <span style={{ fontWeight: 500 }}>
            {user.username || 'Anonymous'}
          </span>

          {user.userId === currentUser?.id && (
            <>
              <FaCrown size={16} style={{ marginLeft: 8, color: '#ffd700' }} />
              <span style={{ marginLeft: 6, fontSize: 12, color: '#aaa' }}>
                (You)
              </span>
            </>
          )}
        </div>
      ))
    )}
  </div>
);

export default UserList;