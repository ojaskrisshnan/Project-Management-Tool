require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/projectveract';

async function seed() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  // Clear existing data
  await Task.deleteMany({});
  await Project.deleteMany({});
  await User.deleteMany({});

  // Create users
  const password = await bcrypt.hash('password123', 10);
  const users = await User.insertMany([
    { name: 'Alice Admin', email: 'alice@admin.com', password, role: 'Admin' },
    { name: 'Bob Manager', email: 'bob@manager.com', password, role: 'Manager' },
    { name: 'Charlie Dev', email: 'charlie@dev.com', password, role: 'Developer' },
    { name: 'Dana Dev', email: 'dana@dev.com', password, role: 'Developer' },
  ]);

  // Create projects
  const projects = await Project.insertMany([
    {
      name: 'Website Redesign',
      description: 'Redesign the company website for a modern look.',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      status: 'In Progress',
      team: [users[0]._id, users[1]._id, users[2]._id],
    },
    {
      name: 'Mobile App Launch',
      description: 'Launch the new mobile app for iOS and Android.',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      status: 'Not Started',
      team: [users[1]._id, users[2]._id, users[3]._id],
    },
  ]);

  // Create tasks
  await Task.insertMany([
    {
      title: 'Design new homepage',
      description: 'Create a modern homepage design.',
      project: projects[0]._id,
      assignedTo: users[2]._id,
      priority: 'High',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      status: 'In Progress',
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Automate deployment for the website.',
      project: projects[0]._id,
      assignedTo: users[1]._id,
      priority: 'Medium',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      status: 'To Do',
    },
    {
      title: 'Develop login screen',
      description: 'Implement login for the mobile app.',
      project: projects[1]._id,
      assignedTo: users[3]._id,
      priority: 'High',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
      status: 'To Do',
    },
    {
      title: 'Test user registration',
      description: 'QA for the registration process.',
      project: projects[1]._id,
      assignedTo: users[2]._id,
      priority: 'Low',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
      status: 'To Do',
    },
  ]);

  console.log('Database seeded!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
}); 