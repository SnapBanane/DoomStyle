//
// Smart Console - Made by SnapBanane
//
// Parameters:
//

const release = 0; // Set the release version 
const phase = 'BETA'; // Set the phase of the project

const repo = 'SnapBanane/doomstyle'; // Set the repo; format: Username/Reponame (this only works on GitHub).

const title = 'DOOMSTYLE'; // Name of the Project

const contributers = 'SnapBanane & GamekniteC7 & PlutoEdiMedi'; // Contributers or Developer

//
// Functions:
//

// get latest commit
const fetchLatestCommit = async () => {
    try {
        const response = await fetch(`https://api.github.com/repos/${repo}/commits/main`);
        const data = await response.json();
        return data.sha.substring(0, 7); // Short commit hash
    } catch (error) {
        console.error('Error fetching commit:', error);
        return 'unknown';
    }
};

// get commit count
const fetchCommitCount = async () => {
    try {
        const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1&page=1`);
        const linkHeader = response.headers.get('Link');
        const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
        return match ? parseInt(match[1], 10) : 'unknown';
    } catch (error) {
        console.error('Error fetching commit count:', error);
        return 'unknown';
    }
};

// set window title and print message
const setMessageAndTitle = async () => {
    console.clear();

    const commitNumber = await fetchCommitCount();
    const version = commitNumber !== 'unknown' ? `v${release}.${commitNumber}` : `v${release}.?`;
    const commit = await fetchLatestCommit();

    // Set document title for commit updating :)
    document.title = `${title} - ${phase} - ${version}`

    console.log(`\n🚀 Welcome to ${title} ${version} \n🔗 Commit: ${commit} \n\n Made by: \n ${contributers} \n`);
};

// execute
setMessageAndTitle();