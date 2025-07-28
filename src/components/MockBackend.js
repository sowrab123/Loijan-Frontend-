// Mock Backend for Development
// This provides a simple mock API when the real backend is not available

class MockBackend {
  constructor() {
    this.users = [
      {
        id: 1,
        username: 'sender1',
        email: 'sender@example.com',
        role: 'sender',
        phone: '+1234567890',
        address: '123 Main St'
      },
      {
        id: 2,
        username: 'traveler1',
        email: 'traveler@example.com',
        role: 'traveller',
        phone: '+0987654321',
        address: '456 Oak Ave',
        vehicle_type: 'Car',
        license_number: 'ABC123',
        experience_years: 3
      }
    ];

    this.jobs = [
      {
        id: 1,
        goods_name: 'Electronics Package',
        pickup_location: '123 Tech Street, San Francisco, CA',
        drop_location: '456 Innovation Ave, San Jose, CA',
        delivery_time: '2024-12-25T14:00:00Z',
        sender: 1,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        goods_name: 'Documents',
        pickup_location: '789 Business Blvd, Oakland, CA',
        drop_location: '321 Corporate Dr, Fremont, CA',
        delivery_time: '2024-12-26T09:00:00Z',
        sender: 1,
        created_at: '2024-01-16T11:00:00Z'
      }
    ];

    this.bids = [
      {
        id: 1,
        job: 1,
        traveler: 2,
        traveler_username: 'traveler1',
        amount: 25.00,
        message: 'I can deliver this safely and on time!',
        status: 'pending',
        created_at: '2024-01-15T12:00:00Z'
      }
    ];

    this.messages = [
      {
        id: 1,
        job: 1,
        sender: 1,
        sender_username: 'sender1',
        text: 'Hi, when can you pick up the package?',
        timestamp: '2024-01-15T13:00:00Z'
      },
      {
        id: 2,
        job: 1,
        sender: 2,
        sender_username: 'traveler1',
        text: 'I can pick it up tomorrow morning around 10 AM.',
        timestamp: '2024-01-15T13:05:00Z'
      }
    ];

    this.currentUser = null;
    this.nextId = {
      users: 3,
      jobs: 3,
      bids: 2,
      messages: 3
    };
  }

  // Auth endpoints
  login(username, password) {
    const user = this.users.find(u => u.username === username);
    if (user && password) {
      this.currentUser = user;
      return {
        access: 'mock-token-' + user.id,
        token: 'mock-token-' + user.id,
        user: user
      };
    }
    throw new Error('Invalid credentials');
  }

  register(userData) {
    const existingUser = this.users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: this.nextId.users++,
      ...userData,
      created_at: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  getProfile() {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }
    return this.currentUser;
  }

  updateProfile(profileData) {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }
    
    Object.assign(this.currentUser, profileData);
    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      this.users[userIndex] = this.currentUser;
    }
    return this.currentUser;
  }

  // Jobs endpoints
  getJobs(userId = null) {
    if (userId) {
      return this.jobs.filter(job => job.sender === userId);
    }
    return this.jobs;
  }

  createJob(jobData) {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }

    const newJob = {
      id: this.nextId.jobs++,
      ...jobData,
      sender: this.currentUser.id,
      created_at: new Date().toISOString()
    };
    this.jobs.push(newJob);
    return newJob;
  }

  getJob(id) {
    const job = this.jobs.find(j => j.id === parseInt(id));
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  // Bids endpoints
  getBids(jobId = null) {
    if (jobId) {
      return this.bids.filter(bid => bid.job === parseInt(jobId));
    }
    return this.bids;
  }

  createBid(bidData) {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }

    const newBid = {
      id: this.nextId.bids++,
      ...bidData,
      traveler: this.currentUser.id,
      traveler_username: this.currentUser.username,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    this.bids.push(newBid);
    return newBid;
  }

  // Messages endpoints
  getMessages(jobId) {
    return this.messages.filter(msg => msg.job === parseInt(jobId));
  }

  createMessage(messageData) {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }

    const newMessage = {
      id: this.nextId.messages++,
      ...messageData,
      sender: this.currentUser.id,
      sender_username: this.currentUser.username,
      timestamp: new Date().toISOString()
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  // Set current user from token
  setCurrentUserFromToken(token) {
    if (token && token.startsWith('mock-token-')) {
      const userId = parseInt(token.replace('mock-token-', ''));
      this.currentUser = this.users.find(u => u.id === userId);
    }
  }
}

// Create global mock backend instance
window.mockBackend = new MockBackend();

export default window.mockBackend;