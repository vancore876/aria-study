async function loadKnowledgeTree() {
  try {
    const res = await fetch('/api/knowledge/tree');
    const nodes = await res.json();
    
    // Build tree visualization
    const treeContainer = document.getElementById('knowledge-tree');
    treeContainer.innerHTML = buildTreeHTML(nodes);
    
    // Add click handlers
    document.querySelectorAll('.knowledge-node').forEach(node => {
      node.addEventListener('click', () => showNodeContent(node.dataset.id));
    });
  } catch (err) {
    console.error('Failed to load knowledge tree:', err);
  }
}

function buildTreeHTML(nodes) {
  const level1 = nodes.filter(n => n.level === 1);
  const level2 = nodes.filter(n => n.level === 2);

  return level1.map(root => {
    const children = level2.filter(child =>
      child.prerequisites?.some(p => p._id === root._id || p === root._id)
    );

    return `
      <div class="knowledge-node root-node" data-id="${root._id}">
        <h4>📁 ${root.title}</h4>
        <div class="subnodes">
          ${children.map(child => `
            <div class="knowledge-node subnode" data-id="${child._id}">
              <h5>📄 ${child.title}</h5>
              <p class="node-preview">${child.content?.substring(0, 120) || ''}...</p>
              ${buildRelatedPapersHTML(child)}
            </div>
          `).join('')}
          ${buildRelatedPapersHTML(root)}
        </div>
      </div>
    `;
  }).join('');
}

function buildRelatedPapersHTML(node) {
  if (!node.relatedPapers?.length) return '';
  return `
    <div class="related-papers">
      <h6>📚 Related Past Papers:</h6>
      <ul>
        ${node.relatedPapers.map(paper => `
          <li><a href="/pastpapers/${paper._id}">${paper.subject} ${paper.year}</a></li>
        `).join('')}
      </ul>
    </div>
  `;
}

async function showNodeContent(nodeId) {
  try {
    const res = await fetch(`/api/knowledge/tree`);
    const nodes = await res.json();
    const node = nodes.find(n => n._id === nodeId);
    
    const contentDiv = document.getElementById('node-content');
    contentDiv.innerHTML = `
      <h3>${node.title}</h3>
      <div class="content-body">${node.content}</div>
      ${node.prerequisites.length ? `
        <div class="prerequisites">
          <h4>🎯 Prerequisites:</h4>
          <ul>
            ${node.prerequisites.map(p => `
              <li><a href="#" class="knowledge-node" data-id="${p._id}">${p.title}</a></li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    `;
    
    // Add click handlers for prerequisites
    document.querySelectorAll('.knowledge-node').forEach(node => {
      node.addEventListener('click', (e) => {
        e.preventDefault();
        showNodeContent(node.dataset.id);
      });
    });
  } catch (err) {
    console.error('Failed to load node content:', err);
  }
}

// Filter by level
document.querySelectorAll('.level-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    loadKnowledgeTree();
  });
});

document.addEventListener('DOMContentLoaded', loadKnowledgeTree);
