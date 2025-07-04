const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, deadline } = req.body;
    const task = new Task({ title, description, project, assignedTo, priority, deadline });
    await task.save();
    await ActivityLog.create({ user: req.user.userId, action: `Created task: ${title}`, project, task: task._id });
    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email role')
      .populate('project', 'name team')
      .populate('project.team', 'name email role');
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('project', 'name team')
      .populate('project.team', 'name email role');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline, status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, priority, deadline, status },
      { new: true }
    ).populate('assignedTo', 'name email role')
     .populate('project', 'name team')
     .populate('project.team', 'name email role');
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    await ActivityLog.create({ 
      user: req.user.userId, 
      action: `Updated task: ${task.title}`, 
      project: task.project, 
      task: task._id 
    });
    
    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await ActivityLog.create({ user: req.user.userId, action: `Deleted task: ${task.title}`, project: task.project, task: task._id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 