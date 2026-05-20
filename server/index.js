const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JC_API = 'https://console.jumpcloud.com/api';
const JC_V2_API = 'https://console.jumpcloud.com/api/v2';

const headers = () => ({
  'x-api-key': process.env.JUMPCLOUD_API_KEY,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Create a new JumpCloud user
app.post('/api/users', async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      username,
      department,
      jobTitle,
      phoneNumber,
    } = req.body;

    if (!firstname || !lastname || !email || !username) {
      return res.status(400).json({ error: 'firstname, lastname, email, and username are required.' });
    }

    const payload = {
      firstname,
      lastname,
      email,
      username,
      department: department || '',
      jobTitle: jobTitle || '',
      phoneNumber: phoneNumber || '',
      // Custom attribute stamped with initials SJH
      attributes: [
        {
          name: 'created_by',
          value: 'SJH',
        },
        {
          name: 'sjh_created_at',
          value: new Date().toISOString(),
        },
      ],
    };

    const response = await axios.post(`${JC_API}/systemusers`, payload, { headers: headers() });
    res.status(201).json(response.data);
  } catch (err) {
    const msg = err.response?.data || err.message;
    res.status(err.response?.status || 500).json({ error: msg });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${JC_API}/systemusers?limit=100`, { headers: headers() });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
});

// Get a single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.get(`${JC_API}/systemusers/${req.params.id}`, { headers: headers() });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
});

// Update a user
app.put('/api/users/:id', async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      department,
      jobTitle,
      phoneNumber,
      attributes,
    } = req.body;

    const payload = {};
    if (firstname !== undefined) payload.firstname = firstname;
    if (lastname !== undefined) payload.lastname = lastname;
    if (email !== undefined) payload.email = email;
    if (department !== undefined) payload.department = department;
    if (jobTitle !== undefined) payload.jobTitle = jobTitle;
    if (phoneNumber !== undefined) payload.phoneNumber = phoneNumber;

    // Always preserve the SJH custom attribute; merge any extras passed in
    const baseAttrs = [
      { name: 'created_by', value: 'SJH' },
      { name: 'sjh_created_at', value: new Date().toISOString() },
    ];
    payload.attributes = attributes ? [...baseAttrs, ...attributes] : baseAttrs;

    const response = await axios.put(`${JC_API}/systemusers/${req.params.id}`, payload, { headers: headers() });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    await axios.delete(`${JC_API}/systemusers/${req.params.id}`, { headers: headers() });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Demo Bot server running on port ${PORT}`));
