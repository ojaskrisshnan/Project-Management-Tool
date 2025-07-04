const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');

exports.addComment = async (req, res) => {
  try {
    const { taskId, content } = req.body;
    const comment = new Comment({ task: taskId, user: req.user.userId, content });
    await comment.save();
    await ActivityLog.create({ user: req.user.userId, action: `Commented on task`, task: taskId });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ task: taskId }).populate('user', 'name email role');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 