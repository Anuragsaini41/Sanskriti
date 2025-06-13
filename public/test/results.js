document.addEventListener('DOMContentLoaded', function() {
    // Load statistics and winners
    updateStatistics();
    populateWeekSelector();
    displayCurrentWeekWinners();

    // Add event listener for week selection
    document.getElementById('week-select').addEventListener('change', function() {
        const selectedWeek = this.value;
        displayWinnersByWeekId(selectedWeek);
    });
    
    // Add export results button functionality
    const exportBtn = document.getElementById('export-results');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
    }
    
    // Mobile menu toggle functionality
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Animate hamburger menu
            const spans = this.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
});

// Update statistics on the page
function updateStatistics() {
    // Get results from localStorage
    const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const perfectScores = JSON.parse(localStorage.getItem('perfectScores') || '[]');
    
    // Calculate statistics
    const totalParticipants = quizResults.length;
    const totalPerfectScores = perfectScores.length;
    
    let totalScore = 0;
    quizResults.forEach(result => {
        totalScore += result.score;
    });
    const averageScore = totalParticipants > 0 
        ? Math.round((totalScore / totalParticipants) * 10) / 10 
        : 0;
    
    // Update the DOM
    document.getElementById('total-participants').textContent = totalParticipants;
    document.getElementById('perfect-scores').textContent = totalPerfectScores;
    document.getElementById('avg-score').textContent = averageScore;
    
    // Show message if no data
    if (totalParticipants === 0) {
        const winnersContainer = document.getElementById('winners-container');
        if (winnersContainer) {
            winnersContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-trophy" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3>No Quiz Results Yet</h3>
                    <p>Be the first to take the quiz and see your name here!</p>
                    <a href="test.html" style="color: #ae8861; text-decoration: none; font-weight: 600;">
                        Take Quiz Now →
                    </a>
                </div>
            `;
        }
    }
}

// Export results to downloadable text file
function exportResults() {
    const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const exportableResults = JSON.parse(localStorage.getItem('exportableResults') || '[]');
    
    if (quizResults.length === 0) {
        alert("No results to export!");
        return;
    }
    
    // Convert to Indian Standard Time (UTC+5:30)
    const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true
    };
    
    // Create header for the file
    let resultText = "SANSKRITI QUIZ RESULTS\n";
    resultText += "Generated: " + new Date().toLocaleString('en-IN', options) + "\n\n";
    resultText += "=".repeat(80) + "\n\n";
    
    // Add previously formatted detailed results
    if (exportableResults.length > 0) {
        exportableResults.forEach(result => {
            resultText += result + "\n" + "=".repeat(80) + "\n\n";
        });
    } else {
        // Fall back to generating results from quiz data
        quizResults.forEach((result, index) => {
            const timestamp = new Date(result.timestamp).toLocaleString('en-IN', options);
            resultText += `Participant #${index + 1}\n`;
            resultText += `-`.repeat(40) + "\n";
            resultText += `User ID: ${result.userId}\n`;
            resultText += `Name: ${result.firstName} ${result.lastName}\n`;
            resultText += `Quiz taken: ${timestamp}\n`;
            resultText += `Score: ${result.score}/10\n`;
            resultText += `Questions Attempted: ${result.questionsAttempted}/10\n\n`;
            
            // Add response details
            resultText += "Response Details:\n";
            for (let i = 0; i < 10; i++) {
                const response = result.responses[i] || "Not Answered";
                const questionType = result.questionTypes ? result.questionTypes[i] : "Unknown";
                let isCorrect = "Unknown";
                
                if (response !== "Not Answered" && result.questionTypes) {
                    const questionData = JSON.parse(localStorage.getItem('quizQuestions') || '{}');
                    if (questionData.correctAnswers && questionData.correctAnswers[questionType]) {
                        isCorrect = questionData.correctAnswers[questionType][i % 10] === response ? "Correct" : "Incorrect";
                    }
                }
                
                resultText += `Question ${i + 1}: Answer: ${response} - ${isCorrect}\n`;
            }
            
            resultText += "\n" + "=".repeat(80) + "\n\n";
        });
    }
    
    // Create and trigger download
    const blob = new Blob([resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_results_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Get all available weeks for the selector
function populateWeekSelector() {
    const weeklyWinners = JSON.parse(localStorage.getItem('weeklyWinners') || '{}');
    const weekSelect = document.getElementById('week-select');
    
    // Clear existing options
    weekSelect.innerHTML = '';
    
    // Add current week as default
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentWeekId = `${currentWeek[0]}_${currentWeek[1]}`;
    
    const defaultOption = document.createElement('option');
    defaultOption.value = currentWeekId;
    defaultOption.textContent = `Current Week (${formatWeekDisplay(currentWeek)})`;
    weekSelect.appendChild(defaultOption);
    
    // Add all weeks that have winners
    for (const weekId in weeklyWinners) {
        if (weekId === currentWeekId) continue; // Skip current week
        
        const [year, week] = weekId.split('_');
        const option = document.createElement('option');
        option.value = weekId;
        option.textContent = `Week ${week}, ${year}`;
        weekSelect.appendChild(option);
    }
}

// Format week for display
function formatWeekDisplay(weekArray) {
    return `Week ${weekArray[1]}, ${weekArray[0]}`;
}

// Display winners for the current week
function displayCurrentWeekWinners() {
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    const currentWeekId = `${currentWeek[0]}_${currentWeek[1]}`;
    
    displayWinnersByWeekId(currentWeekId);
}

// Display winners by week ID
function displayWinnersByWeekId(weekId) {
    const weeklyWinners = JSON.parse(localStorage.getItem('weeklyWinners') || '{}');
    const winnersContainer = document.getElementById('winners-container');
    
    // Clear container
    winnersContainer.innerHTML = '';
    
    const weekData = weeklyWinners[weekId];
    
    if (weekData && weekData.winners && weekData.winners.length > 0) {
        // Create table for winners
        const table = document.createElement('table');
        table.className = 'winners-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        ['Rank', 'Name', 'Reward'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        weekData.winners.forEach((winner, index) => {
            const row = document.createElement('tr');
            
            // Rank cell
            const rankCell = document.createElement('td');
            rankCell.textContent = `#${index + 1}`;
            row.appendChild(rankCell);
            
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = `${winner.firstName} ${winner.lastName}`;
            row.appendChild(nameCell);
            
            // Reward cell
            const rewardCell = document.createElement('td');
            const discountBadge = document.createElement('span');
            discountBadge.className = 'discount-badge';
            discountBadge.textContent = `${winner.discountPoints} Points`;
            rewardCell.appendChild(discountBadge);
            row.appendChild(rewardCell);
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        winnersContainer.appendChild(table);
    } else {
        // No winners for this week yet
        const noWinners = document.createElement('p');
        noWinners.className = 'no-winners';
        noWinners.textContent = 'No winners announced for this week yet. Perfect scores from the quiz are eligible for weekly prizes!';
        winnersContainer.appendChild(noWinners);
    }
}

// Helper function to get week number from date (same as in test.js)
function getWeekNumber(d) {
    d = new Date(d.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getFullYear(), weekNo];
}