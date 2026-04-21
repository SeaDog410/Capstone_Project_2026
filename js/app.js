document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    renderView('athlete');
});

// Mock Data
const athleteData = {
    name: 'Alex Johnson',
    status: 'yellow', // red, yellow, green
    recoveryScore: 82,
    tasks: [
        { id: 1, title: 'Ankle mobility exercises (15 mins)', done: false },
        { id: 2, title: 'Ice bath recovery', done: true },
        { id: 3, title: 'Check in with Trainer', done: false }
    ]
};

const rosterData = [
    { name: 'Alex Johnson', sport: 'Football', status: 'yellow' },
    { name: 'Marcus Smith', sport: 'Basketball', status: 'green' },
    { name: 'David Lee', sport: 'Soccer', status: 'red' },
    { name: 'Sarah Connor', sport: 'Track', status: 'green' },
];

function switchRole(role) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    const clickedItem = document.querySelector(`.nav-item[data-role="${role}"]`);
    if(clickedItem) clickedItem.classList.add('active');

    // Update title and view
    const title = document.getElementById('current-view-title');
    title.innerText = role.charAt(0).toUpperCase() + role.slice(1) + ' View';
    
    renderView(role);
}

function renderView(role) {
    const container = document.getElementById('dynamic-content');
    container.innerHTML = ''; // Clear current view
    
    // Trigger animation re-flow
    container.classList.remove('fadeIn');
    void container.offsetWidth; 
    container.classList.add('fadeIn');

    if (role === 'athlete') {
        container.innerHTML = renderAthleteView();
    } else if (role === 'trainer') {
        container.innerHTML = renderTrainerView();
    } else if (role === 'coach') {
        container.innerHTML = renderCoachView();
    }
}

function getStatusBadge(status) {
    if(status === 'green') return `<span class="status-badge status-green">Cleared</span>`;
    if(status === 'yellow') return `<span class="status-badge status-yellow">Limited</span>`;
    if(status === 'red') return `<span class="status-badge status-red">Out</span>`;
    return '';
}

function renderAthleteView() {
    return `
        <div class="dashboard-grid">
            <div class="glass-card">
                <div class="card-header">
                    <span class="card-title">My Recovery Status</span>
                    <i class="fa-solid fa-heart-pulse card-icon"></i>
                </div>
                <div style="font-size: 3rem; font-weight: 700; color: var(--primary); margin: 1rem 0;">
                    ${athleteData.recoveryScore}%
                </div>
                <p style="color: var(--text-muted); margin-bottom: 1rem;">Current Status: ${getStatusBadge(athleteData.status)}</p>
                <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${athleteData.recoveryScore}%; height: 100%; background: var(--primary);"></div>
                </div>
            </div>
            
            <div class="glass-card">
                <div class="card-header">
                    <span class="card-title">Home Exercise Program (HEP)</span>
                    <i class="fa-solid fa-list-check card-icon"></i>
                </div>
                <ul style="list-style: none; padding-top: 1rem;">
                    ${athleteData.tasks.map(t => `
                        <li style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 0.5rem; background: rgba(255,255,255,0.02); border-radius: 8px;">
                            <input type="checkbox" ${t.done ? 'checked' : ''} style="cursor: pointer; width: 18px; height: 18px; accent-color: var(--primary);">
                            <span style="${t.done ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${t.title}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
}

function renderTrainerView() {
    return `
        <div class="dashboard-grid">
            <div class="glass-card">
                <div class="card-header">
                    <span class="card-title">Quick Actions</span>
                    <i class="fa-solid fa-bolt card-icon"></i>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="alert('Voice recognition started...')">
                        <i class="fa-solid fa-microphone"></i> Voice-to-Note (SOAP)
                    </button>
                    <button class="btn btn-outline" onclick="alert('Scanner opened')">
                        <i class="fa-solid fa-qrcode"></i> Scan Inventory
                    </button>
                    <button class="btn btn-outline">
                        <i class="fa-solid fa-user-plus"></i> New Athlete Encounter
                    </button>
                </div>
            </div>

            <div class="glass-card">
                <div class="card-header">
                    <span class="card-title">Injury Analytics (Team-wide)</span>
                    <i class="fa-solid fa-chart-column card-icon"></i>
                </div>
                <div style="height: 150px; display: flex; align-items: flex-end; gap: 10%; margin-top: 2rem; border-bottom: 1px solid var(--panel-border);">
                    <div style="width: 20%; height: 40%; background: var(--primary); border-radius: 4px 4px 0 0; position: relative;">
                        <span style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.8rem;">Ankle</span>
                    </div>
                    <div style="width: 20%; height: 80%; background: var(--danger); border-radius: 4px 4px 0 0; position: relative;">
                        <span style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.8rem;">Knee</span>
                    </div>
                    <div style="width: 20%; height: 30%; background: var(--warning); border-radius: 4px 4px 0 0; position: relative;">
                        <span style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.8rem;">Shoulder</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderCoachView() {
    return `
        <div class="glass-card" style="max-width: 800px;">
            <div class="card-header">
                <span class="card-title">Roster Clearance Status</span>
                <i class="fa-solid fa-shield-halved card-icon"></i>
            </div>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem;">
                * Due to HIPAA compliance, only clearance status is shown to coaches.
            </p>
            <div style="overflow-x: auto;">
                <table style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--panel-border); color: var(--text-muted);">
                            <th style="padding: 1rem;">Athlete Name</th>
                            <th style="padding: 1rem;">Sport</th>
                            <th style="padding: 1rem;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rosterData.map(athlete => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 1rem; font-weight: 600;">${athlete.name}</td>
                                <td style="padding: 1rem; color: var(--text-muted);">${athlete.sport}</td>
                                <td style="padding: 1rem;">${getStatusBadge(athlete.status)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
