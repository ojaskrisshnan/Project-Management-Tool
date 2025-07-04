const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');

exports.createProject = async (req, res) => {
  try {
    const { name, description, deadline, team } = req.body;
    const project = new Project({ name, description, deadline, team });
    await project.save();
    await ActivityLog.create({ user: req.user.userId, action: `Created project: ${name}`, project: project._id });
    res.status(201).json(project);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('team', 'name email role');
    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('team', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description, deadline, status, team } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, deadline, status, team },
      { new: true }
    ).populate('team', 'name email role');
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    await ActivityLog.create({ 
      user: req.user.userId, 
      action: `Updated project: ${project.name}`, 
      project: project._id 
    });
    
    res.json(project);
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await ActivityLog.create({ user: req.user.userId, action: `Deleted project: ${project.name}`, project: project._id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 