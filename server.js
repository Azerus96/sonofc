// server.js
const express = require('express');
const { Octokit } = require('@octokit/rest');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

const octokit = new Octokit({
  auth: process.env.AI_PROGRESS_TOKEN
});

// API endpoints для сохранения/загрузки прогресса
app.post('/api/progress', async (req, res) => {
  try {
    const { progress, filename } = req.body;
    
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      path: filename,
      message: 'Update AI progress',
      content: Buffer.from(JSON.stringify(progress)).toString('base64'),
      branch: 'main'
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/progress/:id', async (req, res) => {
  try {
    const filename = `progress/ai-progress-${req.params.id}.json`;
    
    const { data } = await octokit.repos.getContent({
      owner: process.env.REPO_OWNER,
      repo: process.env.REPO_NAME,
      path: filename,
      ref: 'main'
    });

    const content = Buffer.from(data.content, 'base64').toString();
    res.json({ progress: JSON.parse(content) });
  } catch (error) {
    res.status(404).json({ error: 'Progress not found' });
  }
});

// All remaining requests return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
