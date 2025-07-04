require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/projectveract';

async function markTasksUndone() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to MongoDB');

  const result = await Task.updateMany({ status: 'Done' }, { $set: { status: 'To Do' } });
  console.log(`Updated ${result.modifiedCount || result.nModified} tasks from 'Done' to 'To Do'.`);

  await mongoose.disconnect();
}

markTasksUndone().catch((err) => {
  console.error(err);
  process.exit(1);
}); 