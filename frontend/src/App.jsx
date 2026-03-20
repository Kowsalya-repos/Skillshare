import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const API_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

const getToken = () => localStorage.getItem('token');
const getUser = () => JSON.parse(localStorage.getItem('user') || '{}');

const api = {
  async request(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }
};

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'requester',
    location: {
      city: '',
      state: '',
      country: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const data = await api.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>SkillShare</h1>
          <p>Connect. Learn. Grow Together.</p>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              
              <div className="user-type-selector">
                <label className={formData.userType === 'requester' ? 'selected' : ''}>
                  <input
                    type="radio"
                    value="requester"
                    checked={formData.userType === 'requester'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                  />
                  <div className="type-card">
                    <span className="icon">🔍</span>
                    <span>Skill Seeker</span>
                  </div>
                </label>
                <label className={formData.userType === 'provider' ? 'selected' : ''}>
                  <input
                    type="radio"
                    value="provider"
                    checked={formData.userType === 'provider'}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                  />
                  <div className="type-card">
                    <span className="icon">✨</span>
                    <span>Skill Provider</span>
                  </div>
                </label>
              </div>

              <input
                type="text"
                placeholder="City"
                value={formData.location.city}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, city: e.target.value}
                })}
                required
              />
              <input
                type="text"
                placeholder="State"
                value={formData.location.state}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, state: e.target.value}
                })}
                required
              />
              <input
                type="text"
                placeholder="Country"
                value={formData.location.country}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, country: e.target.value}
                })}
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('explore');
  
  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>SkillShare</h2>
        </div>
        <div className="nav-menu">
          <button 
            className={activeTab === 'explore' ? 'active' : ''}
            onClick={() => setActiveTab('explore')}
          >
            <span className="icon">🔍</span> Explore
          </button>
          <button 
            className={activeTab === 'requests' ? 'active' : ''}
            onClick={() => setActiveTab('requests')}
          >
            <span className="icon">📋</span> Requests
            <NotificationBadge tab="requests" />
          </button>
          <button 
            className={activeTab === 'connections' ? 'active' : ''}
            onClick={() => setActiveTab('connections')}
          >
            <span className="icon">🤝</span> Connections
          </button>
          {user.userType === 'provider' && (
            <button 
              className={activeTab === 'skills' ? 'active' : ''}
              onClick={() => setActiveTab('skills')}
            >
              <span className="icon">⚡</span> My Skills
            </button>
          )}
          <button 
            className={activeTab === 'sessions' ? 'active' : ''}
            onClick={() => setActiveTab('sessions')}
          >
            <span className="icon">📅</span> Sessions
          </button>
          <button 
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
          >
            <span className="icon">💬</span> Chat
          </button>
        </div>
        <div className="nav-user">
          <div className="user-info">
            <div className="avatar">{user.name[0].toUpperCase()}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-type">{user.userType}</div>
            </div>
          </div>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {activeTab === 'explore' && <ExplorePage user={user} />}
        {activeTab === 'requests' && <RequestsPage user={user} />}
        {activeTab === 'connections' && <ConnectionsPage user={user} />}
        {activeTab === 'skills' && <SkillsPage user={user} />}
        {activeTab === 'sessions' && <SessionsPage user={user} />}
        {activeTab === 'chat' && <ChatPage user={user} />}
      </div>
    </div>
  );
}

function NotificationBadge({ tab }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const requests = await api.request('/requests');
        const pending = requests.filter(r => r.status === 'pending').length;
        setCount(pending);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return count > 0 ? <span className="notification-badge">{count}</span> : null;
}

function ExplorePage({ user }) {
  const [providers, setProviders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    fetchProviders();
    if (user.userType === 'requester' && !search) {
      fetchRecommendations();
    }
  }, [search]);

  const fetchRecommendations = async () => {
    try {
      const data = await api.request('/recommendations');
      setRecommendations(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProviders = async () => {
    try {
      const data = await api.request(`/providers?search=${search}`);
      setProviders(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="explore-page">
      <div className="page-header">
        <h1>Discover Skill Providers</h1>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!search && user.userType === 'requester' && recommendations.length > 0 && (
        <div className="recommendations-section" style={{marginBottom: '3rem'}}>
          <h2 style={{color: '#8b5cf6', marginBottom: '1.5rem'}}>✨ AI Recommended for You</h2>
          <div className="providers-grid recommendations-grid">
            {recommendations.map(provider => (
              <div key={provider._id} className="provider-card recommended" style={{border: '2px solid #8b5cf6', boxShadow: '0 10px 25px rgba(139, 92, 246, 0.15)'}} onClick={() => setSelectedProvider(provider)}>
                <div className="ai-badge" style={{background: '#8b5cf6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'inline-block', marginBottom: '1rem'}}>{provider.matchReason}</div>
                <div className="provider-header">
                  <div className="provider-avatar">{provider.name[0].toUpperCase()}</div>
                  <div className="provider-info">
                    <h3>{provider.name}</h3>
                    <div className="location">📍 {provider.location?.city}, {provider.location?.state}</div>
                    <div className="rating">⭐ {provider.rating?.toFixed(1) || '0.0'}</div>
                  </div>
                </div>
                <div className="skills-list">
                  {provider.skills?.map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill.name}</span>
                  ))}
                </div>
                <button className="connect-btn">Connect</button>
              </div>
            ))}
          </div>
          <h2 style={{marginTop: '3rem'}}>All Providers</h2>
        </div>
      )}

      <div className="providers-grid">
        {providers.map(provider => (
          <div key={provider._id} className="provider-card" onClick={() => setSelectedProvider(provider)}>
            <div className="provider-header">
              <div className="provider-avatar">{provider.name[0].toUpperCase()}</div>
              <div className="provider-info">
                <h3>{provider.name}</h3>
                <div className="location">
                  📍 {provider.location?.city}, {provider.location?.state}
                </div>
                <div className="rating">
                  ⭐ {provider.rating.toFixed(1)} ({provider.totalRatings} reviews)
                </div>
              </div>
            </div>
            <div className="skills-list">
              {provider.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill.name}</span>
              ))}
            </div>
            <button className="connect-btn">Connect</button>
          </div>
        ))}
      </div>

      {selectedProvider && (
        <ProviderModal 
          provider={selectedProvider} 
          onClose={() => setSelectedProvider(null)}
          user={user}
        />
      )}
    </div>
  );
}

function ProviderModal({ provider, onClose, user }) {
  const [requestData, setRequestData] = useState({
    skill: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.request('/requests', {
        method: 'POST',
        body: JSON.stringify({
          providerId: provider._id,
          ...requestData
        })
      });
      alert('Request sent successfully!');
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="provider-avatar large">{provider.name[0].toUpperCase()}</div>
          <div>
            <h2>{provider.name}</h2>
            <div className="location">
              📍 {provider.location?.city}, {provider.location?.state}
            </div>
            <div className="rating">
              ⭐ {provider.rating.toFixed(1)} ({provider.totalRatings} reviews)
            </div>
          </div>
        </div>

        <div className="skills-section">
          <h3>Skills</h3>
          <div className="skills-list">
            {provider.skills.map((skill, idx) => (
              <div key={idx} className="skill-item">
                <span className="skill-name">{skill.name}</span>
                {skill.description && <p className="skill-desc">{skill.description}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="reviews-section">
          <h3>Reviews</h3>
          {provider.reviews.slice(0, 3).map((review, idx) => (
            <div key={idx} className="review-item">
              <div className="review-header">
                <span className="reviewer-name">{review.from?.name || 'Anonymous'}</span>
                <span className="review-rating">⭐ {review.rating}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>

        {provider.portfolio && provider.portfolio.length > 0 && (
          <div className="portfolio-section" style={{marginBottom: '1.5rem'}}>
            <h3>Study Materials & Portfolio</h3>
            <div className="portfolio-grid" style={{display: 'grid', gap: '0.75rem', marginTop: '0.5rem'}}>
              {provider.portfolio.map((item, idx) => (
                <div key={idx} className="portfolio-item" style={{background: '#f8f9fa', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center'}}>
                  <span className="icon" style={{fontSize: '1.2rem'}}>
                    {item.fileType === 'pdf' ? '📄' : item.fileType === 'video' ? '🎥' : item.fileType === 'audio' ? '🎵' : item.fileType === 'image' ? '🖼️' : '📁'}
                  </span>
                  <a href={`http://localhost:5000${item.url}`} target="_blank" rel="noreferrer" style={{marginLeft: '0.75rem', color: '#4f46e5', textDecoration: 'none', fontWeight: '500'}}>
                    {item.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="request-form">
          <h3>Send Request</h3>
          <select
            value={requestData.skill}
            onChange={(e) => setRequestData({...requestData, skill: e.target.value})}
            required
          >
            <option value="">Select a skill</option>
            {provider.skills.map((skill, idx) => (
              <option key={idx} value={skill.name}>{skill.name}</option>
            ))}
          </select>
          <textarea
            placeholder="Tell them why you'd like to connect..."
            value={requestData.message}
            onChange={(e) => setRequestData({...requestData, message: e.target.value})}
            rows="4"
          />
          <button type="submit" className="submit-btn">Send Request</button>
        </form>
      </div>
    </div>
  );
}

function RequestsPage({ user }) {
  const [requests, setRequests] = useState([]);
  const [feedbackRequest, setFeedbackRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
    
    socket.on('newRequest', () => {
      fetchRequests();
    });

    return () => socket.off('newRequest');
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await api.request('/requests');
      setRequests(data.filter(r => r.status === 'pending' || r.status === 'rejected'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await api.request(`/requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="requests-page">
      <h1>{user.userType === 'provider' ? 'Incoming Requests' : 'My Requests'}</h1>
      
      <div className="requests-list">
        {requests.map(request => (
          <div key={request._id} className={`request-card ${request.status}`}>
            <div className="request-header">
              <div className="user-info">
                <div className="avatar">
                  {(user.userType === 'provider' ? request.requester.name : request.provider.name)[0].toUpperCase()}
                </div>
                <div>
                  <h3>{user.userType === 'provider' ? request.requester.name : request.provider.name}</h3>
                  <p className="location">
                    📍 {user.userType === 'provider' 
                      ? `${request.requester.location?.city}, ${request.requester.location?.state}`
                      : `${request.provider.location?.city}, ${request.provider.location?.state}`
                    }
                  </p>
                </div>
              </div>
              <span className={`status-badge ${request.status}`}>{request.status}</span>
            </div>

            <div className="request-body">
              <div className="skill-requested">
                <strong>Skill:</strong> {request.skill}
              </div>
              {request.message && (
                <div className="request-message">
                  <strong>Message:</strong> {request.message}
                </div>
              )}
              <div className="request-date">
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </div>

            {user.userType === 'provider' && request.status === 'pending' && (
              <div className="request-actions">
                <button 
                  className="accept-btn"
                  onClick={() => handleStatusUpdate(request._id, 'accepted')}
                >
                  ✓ Accept
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => handleStatusUpdate(request._id, 'rejected')}
                >
                  × Decline
                </button>
              </div>
            )}
          </div>
        ))}

        {requests.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No requests yet</p>
          </div>
        )}
      </div>

      {feedbackRequest && (
        <RequestFeedbackModal 
          request={feedbackRequest}
          onClose={() => {
            setFeedbackRequest(null);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
}

function RequestFeedbackModal({ request, onClose }) {
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.request(`/requests/${request._id}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedback)
      });
      alert('Feedback submitted successfully!');
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content feedback-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Connection Feedback</h2>
        <p>How was your experience learning with {request.provider.name}?</p>

        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star ${feedback.rating >= star ? 'filled' : ''}`}
                onClick={() => setFeedback({...feedback, rating: star})}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Share your experience..."
            value={feedback.comment}
            onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
            rows="4"
            required
          />

          <button type="submit" className="submit-btn">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
}

function ConnectionsPage({ user }) {
  const [connections, setConnections] = useState([]);
  const [feedbackRequest, setFeedbackRequest] = useState(null);
  const [scheduleRequest, setScheduleRequest] = useState(null);

  useEffect(() => {
    fetchConnections();
    socket.on('requestUpdated', () => fetchConnections());
    return () => socket.off('requestUpdated');
  }, []);

  const fetchConnections = async () => {
    try {
      const data = await api.request('/requests');
      setConnections(data.filter(r => r.status === 'accepted' || r.status === 'completed'));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="requests-page">
      <h1>My Connections</h1>
      
      <div className="requests-list">
        {connections.map(request => (
          <div key={request._id} className={`request-card ${request.status}`}>
            <div className="request-header">
              <div className="user-info">
                <div className="avatar">
                  {(user.userType === 'provider' ? request.requester.name : request.provider.name)[0].toUpperCase()}
                </div>
                <div>
                  <h3>{user.userType === 'provider' ? request.requester.name : request.provider.name}</h3>
                  <p className="location">
                    📍 {user.userType === 'provider' 
                      ? `${request.requester.location?.city}, ${request.requester.location?.state}`
                      : `${request.provider.location?.city}, ${request.provider.location?.state}`
                    }
                  </p>
                </div>
              </div>
              <span className={`status-badge ${request.status}`}>{request.status}</span>
            </div>

            <div className="request-body">
              <div className="skill-requested">
                <strong>Skill connected:</strong> {request.skill}
              </div>
              {request.connectedAt && (
                <div className="request-date">
                  Connected on: {new Date(request.connectedAt).toLocaleDateString()}
                </div>
              )}
              {request.endedAt && (
                <div className="request-date">
                  Ended on: {new Date(request.endedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {request.status === 'accepted' && (
              <div className="request-actions" style={{marginTop: '1rem', display: 'flex', gap: '10px'}}>
                {user.userType === 'provider' && (
                  <button 
                    className="accept-btn"
                    style={{flex: 1, background: '#8b5cf6', borderColor: '#8b5cf6', color: 'white'}}
                    onClick={() => setScheduleRequest(request)}
                  >
                    📅 Schedule Live Session
                  </button>
                )}
                <button 
                  className="reject-btn"
                  style={{flex: 1}}
                  onClick={async () => {
                    if(window.confirm('Are you sure you want to end this connection?')) {
                      try {
                        await api.request(`/requests/${request._id}/end`, { method: 'POST' });
                        fetchConnections();
                      } catch (err) { alert(err.message); }
                    }
                  }}
                >
                  🚫 End Connection
                </button>
              </div>
            )}

            {user.userType === 'requester' && request.status === 'completed' && !request.feedback?.given && (
              <div className="request-actions" style={{marginTop: '1rem'}}>
                <button 
                  className="accept-btn"
                  style={{width: '100%', background: '#f59e0b', color: 'white'}}
                  onClick={() => setFeedbackRequest(request)}
                >
                  ⭐ Give Feedback
                </button>
              </div>
            )}
            
            {request.status === 'completed' && request.feedback?.given && (
              <div className="feedback-display" style={{marginTop: '1rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px'}}>
                <div className="rating">⭐ {request.feedback.rating}</div>
                <p>{request.feedback.comment}</p>
              </div>
            )}
          </div>
        ))}

        {connections.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">🤝</span>
            <p>No active connections yet</p>
          </div>
        )}
      </div>

      {feedbackRequest && (
        <RequestFeedbackModal 
          request={feedbackRequest}
          onClose={() => {
            setFeedbackRequest(null);
            fetchConnections();
          }}
        />
      )}
      {scheduleRequest && (
        <ScheduleSessionModal 
          request={scheduleRequest}
          onClose={() => setScheduleRequest(null)}
        />
      )}
    </div>
  );
}

function ScheduleSessionModal({ request, onClose }) {
  const [sessionData, setSessionData] = useState({ date: '', time: '', duration: 30 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const datePart = sessionData.date;
      const timePart = sessionData.time;
      const scheduledDate = new Date(`${datePart}T${timePart}`).toISOString();
      await api.request('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          requestId: request._id,
          scheduledDate,
          duration: sessionData.duration
        })
      });
      alert('Session scheduled successfully! Live link generated.');
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Schedule Live Session</h2>
        <p style={{marginBottom: '1rem'}}>Schedule a video call with {request.requester.name}</p>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <input type="date" required value={sessionData.date} onChange={e => setSessionData({...sessionData, date: e.target.value})} style={{padding: '10px', borderRadius: '8px', border: '1px solid #ccc'}} />
          <input type="time" required value={sessionData.time} onChange={e => setSessionData({...sessionData, time: e.target.value})} style={{padding: '10px', borderRadius: '8px', border: '1px solid #ccc'}} />
          <select value={sessionData.duration} onChange={e => setSessionData({...sessionData, duration: Number(e.target.value)})} style={{padding: '10px', borderRadius: '8px', border: '1px solid #ccc'}}>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
          </select>
          <button type="submit" style={{background: '#8b5cf6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Schedule Session</button>
        </form>
      </div>
    </div>
  );
}

function SkillsPage({ user }) {
  const [skills, setSkills] = useState(user.skills || []);
  const [portfolio, setPortfolio] = useState(user.portfolio || []);
  const [newSkill, setNewSkill] = useState({ name: '', description: '', category: '' });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    api.request(`/profile/${user.id}`).then(data => {
      setProfileData(data);
      if (data.portfolio) setPortfolio(data.portfolio);
      if (data.skills) setSkills(data.skills);
    }).catch(console.error);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);

    setUploadLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${response.status}`);
      }
      const data = await response.json();
      const newPortfolio = [...portfolio, data.item];
      setPortfolio(newPortfolio);
      
      const currUser = JSON.parse(localStorage.getItem('user') || '{}');
      currUser.portfolio = newPortfolio;
      localStorage.setItem('user', JSON.stringify(currUser));

      alert('File uploaded successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.name) {
      setSkills([...skills, newSkill]);
      setNewSkill({ name: '', description: '', category: '' });
    }
  };

  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await api.request('/skills', {
        method: 'POST',
        body: JSON.stringify({ skills })
      });
      alert('Skills updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="skills-page">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>My Profile & Skills</h1>
        {profileData && (
          <div className="rating-badge" style={{background: '#fef3c7', color: '#d97706', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold'}}>
            ⭐ {profileData.rating.toFixed(1)} ({profileData.totalRatings} Reviews)
          </div>
        )}
      </div>
      
      <div className="skills-container">
        <div className="add-skill-section">
          <h3>Add New Skill</h3>
          <input
            type="text"
            placeholder="Skill name (e.g., Python Programming)"
            value={newSkill.name}
            onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Category (e.g., Programming)"
            value={newSkill.category}
            onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
          />
          <textarea
            placeholder="Description (optional)"
            value={newSkill.description}
            onChange={(e) => setNewSkill({...newSkill, description: e.target.value})}
            rows="3"
          />
          <button onClick={handleAddSkill} className="add-btn">+ Add Skill</button>
        </div>

        <div className="skills-display">
          <h3>Your Skills</h3>
          {skills.map((skill, idx) => (
            <div key={idx} className="skill-card">
              <div className="skill-content">
                <h4>{skill.name}</h4>
                {skill.category && <span className="category">{skill.category}</span>}
                {skill.description && <p>{skill.description}</p>}
              </div>
              <button onClick={() => handleRemoveSkill(idx)} className="remove-btn">×</button>
            </div>
          ))}
          
          {skills.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">⚡</span>
              <p>Add your first skill to get started!</p>
            </div>
          )}
        </div>

        {skills.length > 0 && (
          <button onClick={handleSave} className="save-btn">Save Changes</button>
        )}

        <div className="portfolio-section" style={{marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
          <h3 style={{marginBottom: '1rem'}}>📁 Study Materials & Portfolio (PDF, Audio, Video, Image)</h3>
          <div className="upload-box" style={{border: '2px dashed #cbd5e1', padding: '2rem', textAlign: 'center', borderRadius: '12px'}}>
            <input type="file" onChange={handleFileUpload} accept=".pdf,audio/*,video/*,image/*" disabled={uploadLoading} />
            {uploadLoading && <p style={{marginTop: '1rem', color: '#6366f1'}}>Uploading securely...</p>}
          </div>
          
          <div className="portfolio-grid" style={{marginTop: '1.5rem', display: 'grid', gap: '1rem'}}>
            {portfolio.map((item, idx) => (
              <div key={idx} className="portfolio-item" style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center'}}>
                <span className="icon" style={{fontSize: '1.5rem'}}>
                  {item.fileType === 'pdf' ? '📄' : item.fileType === 'video' ? '🎥' : item.fileType === 'audio' ? '🎵' : item.fileType === 'image' ? '🖼️' : '📁'}
                </span>
                <a href={`http://localhost:5000${item.url}`} target="_blank" rel="noreferrer" style={{marginLeft: '1rem', color: '#4f46e5', fontWeight: 'bold', textDecoration: 'none'}}>
                  {item.name}
                </a>
              </div>
            ))}
          </div>
        </div>

        {profileData && profileData.reviews?.length > 0 && (
          <div className="reviews-section" style={{marginTop: '3rem', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
            <h3 style={{marginBottom: '1rem'}}>🗣️ Student Feedback</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {profileData.reviews.map((rev, i) => (
                <div key={i} style={{background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <strong>{rev.from?.name || 'Anonymous'}</strong>
                    <span style={{color: '#f59e0b', fontWeight: 'bold'}}>⭐ {rev.rating}</span>
                  </div>
                  <p style={{color: '#4b5563', margin: 0, fontSize: '0.95rem', lineHeight: '1.5'}}>{rev.comment}</p>
                  <small style={{color: '#9ca3af', display: 'block', marginTop: '0.5rem'}}>{new Date(rev.date).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionsPage({ user }) {
  const [sessions, setSessions] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await api.request('/sessions');
      setSessions(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="sessions-page">
      <div className="page-header">
        <h1>My Sessions</h1>
      </div>

      <div className="sessions-list">
        {sessions.map(session => (
          <div key={session._id} className={`session-card ${session.status}`}>
            <div className="session-header">
              <div className="user-info">
                <div className="avatar">
                  {(user.userType === 'provider' ? session.requester.name : session.provider.name)[0].toUpperCase()}
                </div>
                <div>
                  <h3>{user.userType === 'provider' ? session.requester.name : session.provider.name}</h3>
                  <p>{user.userType === 'provider' ? session.requester.email : session.provider.email}</p>
                </div>
              </div>
              <span className={`status-badge ${session.status}`}>{session.status}</span>
            </div>

            <div className="session-details">
              <div className="detail-item">
                <span className="icon">📅</span>
                <span>{new Date(session.scheduledDate).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="icon">⏱️</span>
                <span>{session.duration} minutes</span>
              </div>
            </div>

            {session.meetLink && session.status !== 'cancelled' && (
              <div className="live-session-action" style={{marginTop: '1.5rem', textAlign: 'center'}}>
                <a 
                  href={session.meetLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="join-live-btn"
                  style={{background: '#ef4444', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', display: 'inline-block', fontWeight: 'bold', width: '100%'}}
                >
                  🎥 Join Live Session
                </a>
              </div>
            )}

            {session.status === 'completed' && session.feedback.given && (
              <div className="feedback-display">
                <div className="rating">⭐ {session.feedback.rating}</div>
                <p>{session.feedback.comment}</p>
              </div>
            )}

            {user.userType === 'requester' && session.status === 'completed' && !session.feedback.given && (
              <button 
                className="feedback-btn"
                onClick={() => setFeedbackSession(session)}
              >
                Give Feedback
              </button>
            )}
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <p>No sessions scheduled yet</p>
          </div>
        )}
      </div>

      {feedbackSession && (
        <FeedbackModal 
          session={feedbackSession}
          onClose={() => {
            setFeedbackSession(null);
            fetchSessions();
          }}
        />
      )}
    </div>
  );
}

function FeedbackModal({ session, onClose }) {
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.request(`/sessions/${session._id}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedback)
      });
      alert('Feedback submitted successfully!');
      onClose();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content feedback-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Session Feedback</h2>
        <p>How was your session with {session.provider.name}?</p>

        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star ${feedback.rating >= star ? 'filled' : ''}`}
                onClick={() => setFeedback({...feedback, rating: star})}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Share your experience..."
            value={feedback.comment}
            onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
            rows="4"
            required
          />

          <button type="submit" className="submit-btn">Submit Feedback</button>
        </form>
      </div>
    </div>
  );
}

function ChatPage({ user }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchAcceptedRequests();
    
    socket.emit('join', user.id);
    socket.on('newMessage', (message) => {
      if (selectedRequest && message.request === selectedRequest._id) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => socket.off('newMessage');
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      fetchMessages(selectedRequest._id);
    }
  }, [selectedRequest]);

  const fetchAcceptedRequests = async () => {
    try {
      const data = await api.request('/requests');
      setRequests(data.filter(r => r.status === 'accepted'));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async (requestId) => {
    try {
      const data = await api.request(`/messages/${requestId}`);
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const otherUser = user.userType === 'provider' ? selectedRequest.requester : selectedRequest.provider;
      await api.request('/messages', {
        method: 'POST',
        body: JSON.stringify({
          requestId: selectedRequest._id,
          receiverId: otherUser._id,
          message: newMessage
        })
      });

      setNewMessage('');
      fetchMessages(selectedRequest._id);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h3>Conversations</h3>
        {requests.map(request => {
          const otherUser = user.userType === 'provider' ? request.requester : request.provider;
          return (
            <div 
              key={request._id} 
              className={`chat-item ${selectedRequest?._id === request._id ? 'active' : ''}`}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="avatar">{otherUser.name[0].toUpperCase()}</div>
              <div className="chat-info">
                <h4>{otherUser.name}</h4>
                <p className="skill">{request.skill}</p>
              </div>
            </div>
          );
        })}
        
        {requests.length === 0 && (
          <div className="empty-state">
            <p>No active conversations</p>
          </div>
        )}
      </div>

      <div className="chat-main">
        {selectedRequest ? (
          <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            <div className="chat-header" style={{
              background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div className="avatar" style={{width: 40, height: 40, marginRight: 15, background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold'}}>
                {(user.userType === 'provider' ? selectedRequest.requester.name : selectedRequest.provider.name)[0].toUpperCase()}
              </div>
              <div>
                <h3 style={{margin: 0, fontSize: '1.1rem'}}>{user.userType === 'provider' ? selectedRequest.requester.name : selectedRequest.provider.name}</h3>
                <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>{selectedRequest.skill}</p>
              </div>
            </div>

            <div className="messages-container" style={{
              flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#eef2f6'
            }}>
              {messages.map(message => {
                const isSent = message.sender === user.id;
                return (
                  <div 
                    key={message._id} 
                    style={{
                      alignSelf: isSent ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{
                      background: isSent ? '#007aff' : 'white',
                      color: isSent ? 'white' : '#1e293b',
                      padding: '10px 15px',
                      borderRadius: '18px',
                      borderBottomRightRadius: isSent ? '4px' : '18px',
                      borderBottomLeftRadius: isSent ? '18px' : '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      fontSize: '0.95rem',
                      lineHeight: '1.4'
                    }}>
                      {message.message}
                    </div>
                    <div style={{
                      fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', textAlign: isSent ? 'right' : 'left'
                    }}>
                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} style={{
              padding: '15px 20px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px'
            }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{
                  flex: 1, padding: '12px 20px', borderRadius: '24px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem'
                }}
              />
              <button type="submit" style={{
                background: '#007aff', color: 'white', border: 'none', borderRadius: '50%', width: 45, height: 45, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,122,255,0.3)'
              }}>
                <span style={{fontSize: '1.2rem', marginLeft: '3px'}}>➤</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = getUser();
    const token = getToken();
    if (savedUser.id && token) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="app">
      {!user ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
