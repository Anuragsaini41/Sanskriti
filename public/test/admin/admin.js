document.addEventListener('DOMContentLoaded', function() {
    // Check session first
    const adminSession = JSON.parse(localStorage.getItem('adminSession') || 'null');
    if (!adminSession) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize admin user info from session
    const usernameEl = document.getElementById('admin-username');
    const accessLevelEl = document.getElementById('admin-access-level');
    const userInitialEl = document.getElementById('user-initial');
    
    if (usernameEl) usernameEl.textContent = adminSession.username;
    if (accessLevelEl) accessLevelEl.textContent = adminSession.accessLevel === 'full' ? 'Full Access' : 'View Access Only';
    if (userInitialEl) userInitialEl.textContent = adminSession.username.charAt(0);

    // Set read-only mode for guest users
    if (adminSession.accessLevel === 'read') {
        const editableElements = document.querySelectorAll('input, textarea, select, button:not(#logout-btn)');
        editableElements.forEach(element => {
            if (element.id !== 'logout-btn') {
                element.classList.add('readonly');
                element.setAttribute('disabled', 'disabled');
            }
        });
    }

    // Initialize everything
    initTabs();
    loadQuestions();
    loadQuizSettings();
    loadResultsData();
    initEventListeners();
});

// Tab navigation functionality
function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove 'active' class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add 'active' class to current tab and content
            this.classList.add('active');
            
            // Find and activate the corresponding tab content
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // Load specific data based on tab
                if (tabId === 'questions-tab') {
                    loadQuestions();
                } else if (tabId === 'settings-tab') {
                    loadQuizSettings();
                } else if (tabId === 'results-tab') {
                    loadResultsData();
                }
            }
        });
    });
}

// Initialize event listeners
function initEventListeners() {
    // Type selector change
    const typeSelector = document.getElementById('type-selector');
    if (typeSelector) {
        typeSelector.addEventListener('change', function() {
            loadQuestions();
        });
    }
    
    // Create new question button
    const createBtn = document.getElementById('create-question');
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            if (!checkPermissions()) return;
            createNewQuestion();
        });
    }
    
    // Save settings button
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            saveQuizSettings();
        });
    }
    
    // Export results button
    const exportBtn = document.getElementById('admin-export-results');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportResults();
        });
    }
    
    // Reset results button - NEW
    const resetBtn = document.getElementById('admin-reset-results');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (!checkPermissions()) return;
            showResetConfirmation();
        });
    }
    
    // Question editor buttons
    const saveQuestionBtn = document.getElementById('save-question');
    const cancelEditBtn = document.getElementById('cancel-edit');
    
    if (saveQuestionBtn) {
        saveQuestionBtn.addEventListener('click', saveQuestion);
    }
    
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEdit);
    }
}

// Show reset confirmation dialog
function showResetConfirmation() {
    // Check if dialog already exists
    if (document.querySelector('.reset-confirmation-dialog')) {
        return;
    }
    
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const participantCount = results.length;
    
    const dialog = document.createElement('div');
    dialog.className = 'reset-confirmation-dialog';
    dialog.innerHTML = `
        <div class="reset-dialog-content">
            <h3><i class="fas fa-exclamation-triangle"></i> Reset All Results</h3>
            <p>
                <strong>Warning:</strong> This action will permanently delete all quiz results and statistics.<br><br>
                <strong>Current Data:</strong><br>
                • ${participantCount} participant records<br>
                • All scores and attempt history<br>
                • Weekly winners data<br>
                • Perfect scores records<br><br>
                <span style="color: #e74c3c; font-weight: 600;">This action cannot be undone!</span>
            </p>
            <div class="reset-dialog-buttons">
                <button class="reset-cancel-btn" onclick="closeResetConfirmation()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="reset-confirm-btn" onclick="confirmResetResults()">
                    <i class="fas fa-trash-alt"></i> Reset All Data
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Close on background click
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            closeResetConfirmation();
        }
    });
}

// Close reset confirmation dialog
function closeResetConfirmation() {
    const dialog = document.querySelector('.reset-confirmation-dialog');
    if (dialog) {
        dialog.style.animation = 'dialogSlideOut 0.3s ease';
        setTimeout(() => {
            dialog.remove();
        }, 300);
    }
}

// Confirm and execute results reset
function confirmResetResults() {
    try {
        // Get current admin session for logging
        const adminSession = JSON.parse(localStorage.getItem('adminSession') || '{}');
        const adminName = adminSession.username || 'Unknown Admin';
        
        // Create a backup before deletion (optional - can be exported)
        const backupData = {
            quizResults: JSON.parse(localStorage.getItem('quizResults') || '[]'),
            perfectScores: JSON.parse(localStorage.getItem('perfectScores') || '[]'),
            exportableResults: JSON.parse(localStorage.getItem('exportableResults') || '[]'),
            resetDate: new Date().toISOString(),
            resetBy: adminName
        };
        
        // Store backup temporarily (for 24 hours in case admin wants to recover)
        const backupKey = `backup_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(backupData));
        
        // Clear all result data
        localStorage.removeItem('quizResults');
        localStorage.removeItem('perfectScores');
        localStorage.removeItem('exportableResults');
        
        // Clean up old backups (keep only last 3)
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys.filter(key => key.startsWith('backup_')).sort();
        if (backupKeys.length > 3) {
            const keysToRemove = backupKeys.slice(0, backupKeys.length - 3);
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        // Close confirmation dialog
        closeResetConfirmation();
        
        // Reload results data to reflect changes
        loadResultsData();
        
        // Show success message with backup info
        showSuccessMessage(`
            ✅ All results have been reset successfully!<br>
            🔄 Data backup created: ${backupKey}<br>
            👤 Reset by: ${adminName}<br>
            📅 Reset on: ${new Date().toLocaleString()}
        `);
        
        console.log(`Results reset by ${adminName} at ${new Date().toISOString()}`);
        console.log(`Backup created: ${backupKey}`);
        
    } catch (error) {
        console.error('Error resetting results:', error);
        alert('Error resetting results. Please try again.');
        closeResetConfirmation();
    }
}

// Load questions from storage or create default structure
function loadQuestions() {
    let questionData = localStorage.getItem('quizQuestions');
    
    if (!questionData) {
        // Create default structure
        questionData = {
            questions: {
                type_1: [],
                type_2: [],
                type_3: []
            },
            correctAnswers: {
                type_1: [],
                type_2: [],
                type_3: []
            }
        };
        localStorage.setItem('quizQuestions', JSON.stringify(questionData));
    } else {
        questionData = JSON.parse(questionData);
    }
    
    displayQuestions(questionData);
}

// Display questions in the UI
function displayQuestions(questionData) {
    const questionList = document.getElementById('question-list');
    const typeSelector = document.getElementById('type-selector');
    
    if (!questionList || !typeSelector) return;
    
    const currentType = typeSelector.value;
    
    // Clear the list
    questionList.innerHTML = '';
    
    // Get questions of the selected type
    const questions = questionData.questions[currentType] || [];
    
    // Check if we have enough questions for quiz requirements
    const type1Count = questionData.questions.type_1 ? questionData.questions.type_1.length : 0;
    const type2Count = questionData.questions.type_2 ? questionData.questions.type_2.length : 0;
    const type3Count = questionData.questions.type_3 ? questionData.questions.type_3.length : 0;
    
    // Show warning if insufficient questions
    const requirementsMet = type1Count >= 4 && type2Count >= 3 && type3Count >= 3;
    
    if (!requirementsMet) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'quiz-warning';
        warningDiv.style.cssText = `
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
            color: white;
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
        `;
        warningDiv.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">⚠️ Quiz Requirements Not Met</h4>
            <p style="margin: 0; line-height: 1.4;">
                For the quiz to work properly, you need:<br>
                • <strong>Type 1:</strong> ${type1Count}/4 questions (need ${Math.max(0, 4 - type1Count)} more)<br>
                • <strong>Type 2:</strong> ${type2Count}/3 questions (need ${Math.max(0, 3 - type2Count)} more)<br>
                • <strong>Type 3:</strong> ${type3Count}/3 questions (need ${Math.max(0, 3 - type3Count)} more)
            </p>
        `;
        questionList.appendChild(warningDiv);
    }
    
    if (questions.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'question-item';
        emptyDiv.textContent = `No questions found for ${currentType}`;
        questionList.appendChild(emptyDiv);
        return;
    }
    
    // Add each question to the list
    questions.forEach((question, index) => {
        const item = document.createElement('div');
        item.className = 'question-item';
        item.dataset.index = index;
        
        // Truncate long questions
        const displayText = question.question && question.question.length > 70 
            ? question.question.substring(0, 70) + '...' 
            : question.question || 'Untitled Question';
        
        // Create question text element
        const questionTextEl = document.createElement('div');
        questionTextEl.className = 'question-text';
        questionTextEl.textContent = `${index + 1}. ${displayText}`;
        
        // Create actions container
        const actionsEl = document.createElement('div');
        actionsEl.className = 'question-actions-inline';
        
        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            openQuestionEditor(currentType, index, questionData);
        };
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            if (!checkPermissions()) return;
            showDeleteConfirmation(currentType, index, questionData);
        };
        
        // Add buttons to actions container
        actionsEl.appendChild(editBtn);
        actionsEl.appendChild(deleteBtn);
        
        // Add elements to question item
        item.appendChild(questionTextEl);
        item.appendChild(actionsEl);
        
        questionList.appendChild(item);
    });
    
    // Show total count
    const countDiv = document.createElement('div');
    countDiv.style.cssText = `
        text-align: center;
        padding: 15px;
        color: #666;
        font-style: italic;
        border-top: 1px solid #eee;
        margin-top: 15px;
    `;
    countDiv.textContent = `Total ${currentType} questions: ${questions.length}`;
    questionList.appendChild(countDiv);
}

// Create new question
function createNewQuestion() {
    const typeSelector = document.getElementById('type-selector');
    if (!typeSelector) return;
    
    const currentType = typeSelector.value;
    const questionData = JSON.parse(localStorage.getItem('quizQuestions') || '{}');
    
    // Initialize if needed
    if (!questionData.questions) questionData.questions = {};
    if (!questionData.correctAnswers) questionData.correctAnswers = {};
    if (!questionData.questions[currentType]) questionData.questions[currentType] = [];
    if (!questionData.correctAnswers[currentType]) questionData.correctAnswers[currentType] = [];
    
    // Create new empty question
    const newQuestion = {
        question: '',
        options: {
            a: { text: '' },
            b: { text: '' },
            c: { text: '' },
            d: { text: '' }
        }
    };
    
    // Add to questions array
    questionData.questions[currentType].push(newQuestion);
    questionData.correctAnswers[currentType].push('a'); // Default correct answer
    
    // Save and open editor
    localStorage.setItem('quizQuestions', JSON.stringify(questionData));
    
    const newIndex = questionData.questions[currentType].length - 1;
    openQuestionEditor(currentType, newIndex, questionData);
    
    // Refresh display
    displayQuestions(questionData);
}

// Open question editor
function openQuestionEditor(type, index, questionData) {
    const editor = document.getElementById('question-editor');
    if (!editor) return;
    
    const question = questionData.questions[type][index];
    const correctAnswer = questionData.correctAnswers[type][index];
    
    // Populate editor fields
    document.getElementById('question-text').value = question.question || '';
    document.getElementById('option-a').value = question.options?.a?.text || '';
    document.getElementById('option-b').value = question.options?.b?.text || '';
    document.getElementById('option-c').value = question.options?.c?.text || '';
    document.getElementById('option-d').value = question.options?.d?.text || '';
    
    // Clear all radio buttons first
    document.querySelectorAll('input[name="correct-option"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Set correct answer
    const correctRadio = document.getElementById(`correct-${correctAnswer || 'a'}`);
    if (correctRadio) {
        correctRadio.checked = true;
    }
    
    // Store current editing info
    editor.dataset.type = type;
    editor.dataset.index = index;
    
    // Show editor
    editor.style.display = 'block';
    document.getElementById('editor-heading').textContent = 
        index === questionData.questions[type].length - 1 && !question.question ? 'Create New Question' : 'Edit Question';
    
    // Show current correct answer in heading
    if (correctAnswer) {
        const heading = document.getElementById('editor-heading');
        heading.textContent += ` (Current correct answer: ${correctAnswer.toUpperCase()})`;
    }
}

// Save question
function saveQuestion() {
    if (!checkPermissions()) return;
    
    const editor = document.getElementById('question-editor');
    if (!editor) return;
    
    const type = editor.dataset.type;
    const index = parseInt(editor.dataset.index);
    
    const questionData = JSON.parse(localStorage.getItem('quizQuestions') || '{}');
    
    // Get form data
    const questionText = document.getElementById('question-text').value.trim();
    const optionA = document.getElementById('option-a').value.trim();
    const optionB = document.getElementById('option-b').value.trim();
    const optionC = document.getElementById('option-c').value.trim();
    const optionD = document.getElementById('option-d').value.trim();
    const correctAnswer = document.querySelector('input[name="correct-option"]:checked')?.value;
    
    // Validation
    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        alert('Please fill in all fields and select the correct answer.');
        return;
    }
    
    // Update question data
    questionData.questions[type][index] = {
        question: questionText,
        options: {
            a: { text: optionA },
            b: { text: optionB },
            c: { text: optionC },
            d: { text: optionD }
        }
    };
    
    questionData.correctAnswers[type][index] = correctAnswer;
    
    // Save to localStorage
    localStorage.setItem('quizQuestions', JSON.stringify(questionData));
    
    // Hide editor and refresh display
    editor.style.display = 'none';
    displayQuestions(questionData);
    
    showSuccessMessage('Question saved successfully!');
}

// Cancel edit
function cancelEdit() {
    const editor = document.getElementById('question-editor');
    if (editor) {
        editor.style.display = 'none';
    }
}

// Show delete confirmation dialog
function showDeleteConfirmation(type, index, questionData) {
    const question = questionData.questions[type][index];
    const displayText = question.question && question.question.length > 100 
        ? question.question.substring(0, 100) + '...' 
        : question.question || 'Untitled Question';
    
    // Create confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
        <div class="confirm-content">
            <h3>⚠️ Delete Question</h3>
            <p>Are you sure you want to delete this question?</p>
            <p><strong>"${displayText}"</strong></p>
            <p><em>This action cannot be undone.</em></p>
            <div class="confirm-actions">
                <button class="confirm-btn confirm-no" onclick="closeDeleteConfirmation()">Cancel</button>
                <button class="confirm-btn confirm-yes" onclick="confirmDeleteQuestion('${type}', ${index})">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add escape key handler
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeDeleteConfirmation();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Close delete confirmation dialog
function closeDeleteConfirmation() {
    const dialog = document.querySelector('.confirm-dialog');
    if (dialog) {
        dialog.remove();
    }
}

// Confirm and execute question deletion
function confirmDeleteQuestion(type, index) {
    const questionData = JSON.parse(localStorage.getItem('quizQuestions') || '{}');
    
    // Remove question from array
    if (questionData.questions[type]) {
        questionData.questions[type].splice(index, 1);
    }
    
    // Remove corresponding correct answer
    if (questionData.correctAnswers[type]) {
        questionData.correctAnswers[type].splice(index, 1);
    }
    
    // Save updated data
    localStorage.setItem('quizQuestions', JSON.stringify(questionData));
    
    // Close confirmation dialog
    closeDeleteConfirmation();
    
    // Refresh question list
    displayQuestions(questionData);
    
    // Show success message
    const remainingCount = questionData.questions[type] ? questionData.questions[type].length : 0;
    showSuccessMessage(`Question deleted successfully! Total questions in ${type}: ${remainingCount}`);
}

// Load quiz settings
function loadQuizSettings() {
    const settings = JSON.parse(localStorage.getItem('quizSettings') || '{}');
    
    // Set active quiz type
    if (settings.activeQuiz) {
        const radioButton = document.querySelector(`input[name="quiz-type"][value="${settings.activeQuiz}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }
    }
}

// Save quiz settings
function saveQuizSettings() {
    if (!checkPermissions()) return;
    
    const activeQuiz = document.querySelector('input[name="quiz-type"]:checked');
    if (!activeQuiz) {
        alert('Please select an active quiz type');
        return;
    }
    
    const settings = {
        activeQuiz: activeQuiz.value,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('quizSettings', JSON.stringify(settings));
    showSuccessMessage('Quiz settings saved successfully!');
}

// Load results data
function loadResultsData() {
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    
    // Calculate statistics
    const totalAttempts = results.length;
    const completedQuizzes = results.filter(r => r.questionsAttempted >= 10);
    const perfectScores = results.filter(r => r.score >= 10);
    const avgScore = results.length > 0 
        ? Math.round((results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length) * 10) 
        : 0;
    const completionRate = totalAttempts > 0 
        ? Math.round((completedQuizzes.length / totalAttempts) * 100) 
        : 0;
    
    // Update statistics with safe element checks
    const totalEl = document.getElementById('admin-total-participants');
    const avgEl = document.getElementById('admin-avg-score');
    const perfectEl = document.getElementById('admin-perfect-scores');
    
    if (totalEl) totalEl.textContent = totalAttempts;
    if (avgEl) avgEl.textContent = avgScore + '%';
    if (perfectEl) perfectEl.textContent = perfectScores.length;
    
    // Load participants table
    loadParticipantsTable(results);
}

// Load participants table
function loadParticipantsTable(results) {
    const tbody = document.getElementById('participants-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No participants yet</td></tr>';
        return;
    }
    
    // Show recent participants (last 10)
    const recentResults = results
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    
    recentResults.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.name || 'Anonymous'}</td>
            <td>${new Date(result.timestamp).toLocaleDateString()}</td>
            <td>${result.score || 0}/10</td>
            <td>
                ${result.score >= 7 
                    ? '<span style="color: #27ae60; font-weight: 600;">Winner 🏆</span>' 
                    : '<span style="color: #e74c3c;">Try Again</span>'
                }
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Export results to CSV
function exportResults() {
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    
    if (results.length === 0) {
        alert('No results to export');
        return;
    }
    
    const csvContent = [
        ['Name', 'Score', 'Questions Attempted', 'Date', 'Time Taken'].join(','),
        ...results.map(r => [
            r.name || 'Anonymous',
            r.score || 0,
            r.questionsAttempted || 0,
            new Date(r.timestamp).toLocaleDateString(),
            r.timeTaken || 'N/A'
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSuccessMessage('Results exported successfully!');
}

// Show success message
function showSuccessMessage(message) {
    // Remove existing message if any
    const existing = document.querySelector('.admin-success-message');
    if (existing) {
        existing.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'admin-success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
        z-index: 10001;
        max-width: 400px;
        font-weight: 500;
        line-height: 1.5;
        animation: slideInRight 0.4s ease;
    `;
    successDiv.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 10px;">
            <i class="fas fa-check-circle" style="font-size: 20px; margin-top: 2px;"></i>
            <div>${message}</div>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        if (successDiv && successDiv.parentNode) {
            successDiv.style.animation = 'slideOutRight 0.4s ease';
            setTimeout(() => {
                successDiv.remove();
            }, 400);
        }
    }, 8000);
}

// Add CSS animation for success message
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes dialogSlideOut {
        from {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        to {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Make functions globally available
window.closeDeleteConfirmation = closeDeleteConfirmation;
window.confirmDeleteQuestion = confirmDeleteQuestion;
window.saveQuizSettings = saveQuizSettings;
window.exportResults = exportResults;
window.closeResetConfirmation = closeResetConfirmation;
window.confirmResetResults = confirmResetResults;
window.showResetConfirmation = showResetConfirmation;

// Add to the admin dashboard for viewing reset history
function showResetHistory() {
    const allKeys = Object.keys(localStorage);
    const backupKeys = allKeys.filter(key => key.startsWith('backup_')).sort().reverse();
    
    if (backupKeys.length === 0) {
        alert('No reset history found.');
        return;
    }
    
    let historyHTML = '<h3>Reset History</h3>';
    backupKeys.forEach(key => {
        const backup = JSON.parse(localStorage.getItem(key) || '{}');
        historyHTML += `
            <div style="padding: 10px; border: 1px solid #ddd; margin: 5px 0; border-radius: 5px;">
                <strong>Reset Date:</strong> ${new Date(backup.resetDate).toLocaleString()}<br>
                <strong>Reset By:</strong> ${backup.resetBy}<br>
                <strong>Records Cleared:</strong> ${backup.quizResults?.length || 0} participants
            </div>
        `;
    });
    
    // Create modal to show history
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000;">
            <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; max-height: 80%; overflow-y: auto;">
                ${historyHTML}
                <button onclick="this.closest('.modal').remove()" style="margin-top: 20px; padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    modal.className = 'modal';
    document.body.appendChild(modal);
}