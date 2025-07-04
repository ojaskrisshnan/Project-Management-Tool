const ActivityLog = require('../models/ActivityLog');

exports.getLogsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const logs = await ActivityLog.find({ project: projectId }).populate('user', 'name email role');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getLogsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const logs = await ActivityLog.find({ task: taskId }).populate('user', 'name email role');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 