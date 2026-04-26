const COLLEGE_DEMO_PAPERS = [
  { subject: 'Calculus I', year: 2023, level: 'College', fileUrl: '#', downloads: 342 },
  { subject: 'Organic Chemistry', year: 2023, level: 'College', fileUrl: '#', downloads: 289 },
  { subject: 'Intro to Psychology', year: 2022, level: 'College', fileUrl: '#', downloads: 410 },
  { subject: 'Microeconomics', year: 2023, level: 'College', fileUrl: '#', downloads: 305 },
  { subject: 'Data Structures', year: 2023, level: 'College', fileUrl: '#', downloads: 378 },
  { subject: 'English Composition', year: 2022, level: 'College', fileUrl: '#', downloads: 256 },
];

async function loadPastPapers() {
  try {
    const levelFilter = document.getElementById('level-filter').value;
    const url = levelFilter ? `/api/pastpapers?level=${encodeURIComponent(levelFilter)}` : '/api/pastpapers';
    const res = await fetch(url);
    let papers = await res.json();

    // Merge demo college papers if none exist for that level
    const hasCollege = papers.some(p => p.level === 'College');
    if (!hasCollege && (!levelFilter || levelFilter === 'College')) {
      papers = [...papers, ...COLLEGE_DEMO_PAPERS];
    }

    const grid = document.getElementById('papers-grid');
    if (!papers.length) {
      grid.innerHTML = '<p style="color:#888; text-align:center;">No papers found for this filter.</p>';
      return;
    }

    grid.innerHTML = papers.map(paper => `
      <div class="paper-card">
        <h3>${paper.subject}</h3>
        <p><strong>Year:</strong> ${paper.year}</p>
        <p><strong>Level:</strong> ${paper.level}</p>
        <a href="${paper.fileUrl}" target="_blank" class="download-btn">
          📥 Download (${paper.downloads || 0} downloads)
        </a>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load past papers:', err);
    // Fallback to demo data if API is unreachable
    const grid = document.getElementById('papers-grid');
    grid.innerHTML = COLLEGE_DEMO_PAPERS.map(paper => `
      <div class="paper-card">
        <h3>${paper.subject}</h3>
        <p><strong>Year:</strong> ${paper.year}</p>
        <p><strong>Level:</strong> ${paper.level}</p>
        <a href="${paper.fileUrl}" target="_blank" class="download-btn">
          📥 Download (${paper.downloads || 0} downloads)
        </a>
      </div>
    `).join('');
  }
}

// Filter functionality
document.getElementById('subject-filter').addEventListener('change', loadPastPapers);
document.getElementById('level-filter').addEventListener('change', loadPastPapers);

document.addEventListener('DOMContentLoaded', loadPastPapers);
