const username = 'TheAidenTv'; // Replace with your GitHub username

async function fetchGitHubRepos() {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos`);
        const repos = await response.json();
        const projectsGrid = document.getElementById('projects-grid');

        repos.forEach(repo => {
            const card = document.createElement('div');
            card.classList.add('project-card');

            card.innerHTML = `
                <h2 class="project-title">${repo.name}</h2>
                <p class="project-description">${repo.description || 'No description provided'}</p>
                <a href="${repo.html_url}" target="_blank" class="project-link">View Repository</a>
            `;

            projectsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching repos:', error);
    }
}

fetchGitHubRepos();
