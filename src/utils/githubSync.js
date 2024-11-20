const GITHUB_API = 'https://api.github.com';

class GitHubSync {
  constructor(token, repo, branch = 'main') {
    this.token = token;
    this.repo = repo;
    this.branch = branch;
  }

  async saveProgress(progress) {
    try {
      // Получаем текущий SHA файла, если он существует
      const currentFile = await this.getFile('progress/ai-progress.json');
      const content = Buffer.from(JSON.stringify(progress)).toString('base64');

      const response = await fetch(`${GITHUB_API}/repos/${this.repo}/contents/progress/ai-progress.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update AI progress',
          content: content,
          sha: currentFile?.sha,
          branch: this.branch
        })
      });

      if (!response.ok) throw new Error('Failed to save progress');
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  async loadProgress() {
    try {
      const file = await this.getFile('progress/ai-progress.json');
      if (file) {
        const content = Buffer.from(file.content, 'base64').toString();
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
    return null;
  }

  async getFile(path) {
    try {
      const response = await fetch(`${GITHUB_API}/repos/${this.repo}/contents/${path}?ref=${this.branch}`, {
        headers: {
          'Authorization': `token ${this.token}`,
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting file:', error);
    }
    return null;
  }
}

export default GitHubSync;
