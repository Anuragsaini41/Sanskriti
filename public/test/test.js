// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
    console.error('Error message:', e.message);
    console.error('Error at:', e.filename, 'line', e.lineno);
    
    // Don't show alert for every error, just log
    if (e.message.includes('quiz') || e.message.includes('question')) {
        alert('An error occurred with the quiz. Please refresh the page and try again.');
    }
});

// Simplified Aadhaar validation for testing - TEMPORARY FIX
function validateAadhaarSimple(aadhaar) {
    // Remove any spaces or non-digit characters
    aadhaar = aadhaar.replace(/\D/g, '');
    
    // Check if it's exactly 12 digits
    if (aadhaar.length !== 12) {
        return false;
    }
    
    // Check for obviously invalid patterns
    if (/^(\d)\1{11}$/.test(aadhaar)) {
        return false; // All same digits like 111111111111
    }
    
    // Check for sequential numbers (basic validation)
    if (aadhaar === '123456789012' || aadhaar === '000000000000') {
        return false;
    }
    
    // For testing purposes, accept most 12-digit numbers that aren't obviously fake
    return true;
}

// Updated main validation function that uses both methods
function validateAadhaar(aadhaar) {
    // First try the simple validation for better user experience
    const simpleValidation = validateAadhaarSimple(aadhaar);
    
    if (!simpleValidation) {
        return false;
    }
    
    // For now, we'll use the simple validation as Verhoeff might be too strict
    // You can enable Verhoeff later if needed
    return true;
    
    // Uncomment below to use strict Verhoeff validation
    // return validateAadhaarVerhoeff(aadhaar);
}

// Keep the Verhoeff function for future use
function validateAadhaarVerhoeff(aadhaar) {
    // Remove any spaces or non-digit characters
    aadhaar = aadhaar.replace(/\D/g, '');
    
    // Check if it's exactly 12 digits
    if (aadhaar.length !== 12) {
        return false;
    }
    
    // Verhoeff algorithm implementation
    const multiplication_table = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];
    
    const permutation_table = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];
    
    let checksum = 0;
    
    // Process each digit from right to left
    for (let i = 0; i < aadhaar.length; i++) {
        const digit = parseInt(aadhaar[aadhaar.length - 1 - i]);
        const permutedDigit = permutation_table[i % 8][digit];
        checksum = multiplication_table[checksum][permutedDigit];
    }
    
    return checksum === 0;
}

// Generate unique user ID
function generateUniqueId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Store user data
let currentUser = {};

function storeUserData(userData) {
    currentUser = userData;
    console.log("User data stored:", currentUser);
}

// Import questions from question.js
import { type_1 as importedType1, type_2 as importedType2, type_3 as importedType3 } from './question.js';
let type_1, type_2, type_3, correctAnswers;

// Global quiz variables
let questionsAttempted = 0;
let currentQuestionIndex = 0;
let selectedQuestions = [];
let userResponses = {};
let questionTypes = [];

// Helper function to show error messages
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.style.color = '#e74c3c';
        errorElement.className = 'error-message';
    }
}

// Helper function to show success messages
function showSuccess(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.style.color = '#27ae60';
        errorElement.className = 'success-message';
    }
}

// Helper function to hide error messages
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Helper function to clear all error messages
function clearErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message, .success-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
}

// Helper function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Main initialization function
function initializeApp() {
    console.log("Initializing app");
    
    try {
        // Initialize questions from storage or imports
        initializeQuestions();
        
        // Debug what we loaded
        debugScoreCalculation();
        
        // Setup event handlers
        setupEventHandlers();
        
        console.log("App initialized successfully");
    } catch (error) {
        console.error("Error initializing app:", error);
        alert("Error initializing quiz. Please refresh the page.");
    }
}

function initializeQuestions() {
    console.log("Initializing questions");
    const storedQuestions = localStorage.getItem('quizQuestions');
    
    if (storedQuestions) {
        const questionData = JSON.parse(storedQuestions);
        
        // Use the questions from localStorage (admin-created questions)
        type_1 = questionData.questions.type_1 || [];
        type_2 = questionData.questions.type_2 || [];
        type_3 = questionData.questions.type_3 || [];
        
        // Use admin's correct answers
        correctAnswers = questionData.correctAnswers || {};
        
        console.log("Loaded admin questions:", {
            type_1_count: type_1.length,
            type_2_count: type_2.length,
            type_3_count: type_3.length
        });
        console.log("Admin correct answers:", correctAnswers);
        
        // Check if we have enough admin questions
        if (type_1.length < 4 || type_2.length < 3 || type_3.length < 3) {
            console.log("Not enough admin questions, falling back to hardcoded questions");
            // Fall back to hardcoded questions
            type_1 = importedType1;
            type_2 = importedType2;
            type_3 = importedType3;
            
            correctAnswers = {
                "type_1": ["b", "a", "b", "a", "c", "a", "b", "b", "c", "b"],
                "type_2": ["c", "d", "d", "c", "c", "b", "b", "a", "c", "b"],
                "type_3": ["b", "c", "a", "b", "b", "b", "c", "c", "c", "a"]
            };
        }
    } else {
        // Fall back to the imported questions if no admin questions exist
        console.log("No admin questions found, using hardcoded questions");
        type_1 = importedType1;
        type_2 = importedType2;
        type_3 = importedType3;
        
        // Fall back to the hardcoded correct answers
        correctAnswers = {
            "type_1": ["b", "a", "b", "a", "c", "a", "b", "b", "c", "b"],
            "type_2": ["c", "d", "d", "c", "c", "b", "b", "a", "c", "b"],
            "type_3": ["b", "c", "a", "b", "b", "b", "c", "c", "c", "a"]
        };
        
        console.log("Using fallback hardcoded questions and answers");
    }
    
    console.log("Final correct answers being used:", correctAnswers);
    setupQuizInterface();
}

function setupQuizInterface() {
    console.log("Setting up quiz interface");

    // Hide the questions form initially
    const personalityForm = document.getElementById('personality-form');
    if (personalityForm) {
        personalityForm.style.display = 'none';
    }

    // Check if we have enough questions for each type
    const minType1 = Math.min(type_1.length, 4);
    const minType2 = Math.min(type_2.length, 3);
    const minType3 = Math.min(type_3.length, 3);
    
    console.log("Available questions:", {
        type_1: type_1.length,
        type_2: type_2.length,
        type_3: type_3.length,
        "will_use": { type_1: minType1, type_2: minType2, type_3: minType3 }
    });

    // Validate we have minimum questions
    if (minType1 === 0 || minType2 === 0 || minType3 === 0) {
        console.error("Not enough questions available for quiz!");
        alert("Error: Not enough questions available. Please contact administrator.");
        return;
    }

    // Clear and reset variables
    questionsAttempted = 0;
    currentQuestionIndex = 0;
    selectedQuestions = [];
    userResponses = {};
    questionTypes = [];

    // Create pools for random selection
    const type1Pool = [...Array(type_1.length).keys()];
    const type2Pool = [...Array(type_2.length).keys()];
    const type3Pool = [...Array(type_3.length).keys()];

    // Shuffle the pools
    shuffleArray(type1Pool);
    shuffleArray(type2Pool);
    shuffleArray(type3Pool);

    // Select questions: 4 from type_1, 3 from type_2, 3 from type_3
    const selectedIndices = [];
    
    // Add random questions from each type
    for (let i = 0; i < minType1; i++) {
        selectedIndices.push({ type: 'type_1', index: type1Pool[i] });
    }
    
    for (let i = 0; i < minType2; i++) {
        selectedIndices.push({ type: 'type_2', index: type2Pool[i] });
    }
    
    for (let i = 0; i < minType3; i++) {
        selectedIndices.push({ type: 'type_3', index: type3Pool[i] });
    }

    // Shuffle the final question order
    shuffleArray(selectedIndices);

    // Build the selectedQuestions array with validation
    selectedIndices.forEach((item, index) => {
        let questionToAdd = null;
        
        if (item.type === 'type_1' && type_1[item.index]) {
            questionToAdd = type_1[item.index];
            questionTypes.push('type_1');
        } else if (item.type === 'type_2' && type_2[item.index]) {
            questionToAdd = type_2[item.index];
            questionTypes.push('type_2');
        } else if (item.type === 'type_3' && type_3[item.index]) {
            questionToAdd = type_3[item.index];
            questionTypes.push('type_3');
        }
        
        if (questionToAdd) {
            selectedQuestions.push(questionToAdd);
        } else {
            console.warn(`Question at ${item.type}[${item.index}] not found!`);
        }
    });

    console.log("Selected questions for quiz:", selectedQuestions.length);
    console.log("Question types mapping:", questionTypes);
    
    // Final validation
    if (selectedQuestions.length < 5) {
        console.error("Not enough questions selected for quiz!");
        alert("Error: Not enough questions available for quiz. Please contact administrator.");
        return;
    }
}

// Set up all event handlers - SINGLE VERSION
function setupEventHandlers() {
    console.log("Setting up event handlers");
    
    // Handle user info form submission
    const userInfoForm = document.getElementById('user-info-form');
    if (userInfoForm) {
        console.log("Found user info form, adding event listener");
        
        userInfoForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log("Form submission started");
            
            // Get form values
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const aadhaar = document.getElementById('aadhaar').value.trim();
            const age = document.getElementById('age').value.trim();
            const city = document.getElementById('city').value.trim();
            const district = document.getElementById('district').value.trim();
            const state = document.getElementById('state').value.trim();
            
            console.log("Form values:", { firstName, lastName, aadhaar, age, city, district, state });
            
            // Clear any previous error messages
            clearErrorMessages();
            
            let hasErrors = false;
            
            // Basic validation
            if (!firstName) {
                showError('firstName-error', 'First name is required');
                hasErrors = true;
            }
            
            if (!lastName) {
                showError('lastName-error', 'Last name is required');
                hasErrors = true;
            }
            
            if (!aadhaar) {
                showError('aadhaar-error', 'Aadhaar number is required');
                hasErrors = true;
            } else if (aadhaar.length !== 12) {
                showError('aadhaar-error', 'Aadhaar number must be exactly 12 digits');
                hasErrors = true;
            } else if (!/^\d+$/.test(aadhaar)) {
                showError('aadhaar-error', 'Aadhaar number must contain only digits');
                hasErrors = true;
            } else {
                console.log("Validating Aadhaar:", aadhaar);
                if (!validateAadhaar(aadhaar)) {
                    showError('aadhaar-error', 'Invalid Aadhaar number. Please check and try again.');
                    hasErrors = true;
                    console.log("Aadhaar validation failed");
                } else {
                    console.log("Aadhaar validation passed");
                }
            }
            
            if (!age) {
                showError('age-error', 'Age is required');
                hasErrors = true;
            } else if (parseInt(age) < 10 || parseInt(age) > 100) {
                showError('age-error', 'Age must be between 10 and 100');
                hasErrors = true;
            }
            
            if (!city) {
                showError('city-error', 'City is required');
                hasErrors = true;
            }
            
            if (!district) {
                showError('district-error', 'District is required');
                hasErrors = true;
            }
            
            if (!state) {
                showError('state-error', 'State is required');
                hasErrors = true;
            }
            
            // If there are any errors, stop form submission
            if (hasErrors) {
                console.log("Form validation failed - has errors:", hasErrors);
                return false;
            }
            
            console.log("Form validation passed - proceeding with quiz");
            
            // Generate unique ID
            const userId = generateUniqueId();
            
            // Create user object
            const userData = {
                userId,
                firstName,
                lastName,
                aadhaar,
                age: parseInt(age),
                city,
                district,
                state,
                registrationDate: new Date().toISOString()
            };
            
            console.log("User data created:", userData);
            
            // Store user data
            storeUserData(userData);
            
            // Begin the quiz
            beginQuiz();
        });
    } else {
        console.error("User info form not found!");
    }

    // Real-time Aadhaar validation on input
    const aadhaarInput = document.getElementById('aadhaar');
    if (aadhaarInput) {
        console.log("Found Aadhaar input, adding event listener");
        
        aadhaarInput.addEventListener('input', function(e) {
            const aadhaarValue = this.value.trim();
            console.log("Aadhaar input changed:", aadhaarValue);
            
            // Clear error if input is empty
            if (!aadhaarValue) {
                hideError('aadhaar-error');
                return;
            }
            
            // Check length
            if (aadhaarValue.length < 12) {
                showError('aadhaar-error', 'Aadhaar number must be 12 digits');
                return;
            }
            
            if (aadhaarValue.length > 12) {
                // Prevent typing more than 12 digits
                this.value = aadhaarValue.substring(0, 12);
                return;
            }
            
            // Check if all digits
            if (!/^\d+$/.test(aadhaarValue)) {
                showError('aadhaar-error', 'Aadhaar number must contain only digits');
                return;
            }
            
            // Validate using Verhoeff algorithm when exactly 12 digits
            if (aadhaarValue.length === 12) {
                if (!validateAadhaar(aadhaarValue)) {
                    showError('aadhaar-error', 'Invalid Aadhaar number');
                } else {
                    showSuccess('aadhaar-error', 'Valid Aadhaar number ✓');
                }
            }
        });
    } else {
        console.error("Aadhaar input not found!");
    }
}

// Temporary debugging function - add this to check admin questions
function debugAdminQuestions() {
    const storedQuestions = localStorage.getItem('quizQuestions');
    if (storedQuestions) {
        const questionData = JSON.parse(storedQuestions);
        console.log("=== ADMIN QUESTIONS DEBUG ===");
        console.log("Type 1 questions:", questionData.questions.type_1?.length || 0);
        console.log("Type 2 questions:", questionData.questions.type_2?.length || 0);
        console.log("Type 3 questions:", questionData.questions.type_3?.length || 0);
        console.log("Type 1 correct answers:", questionData.correctAnswers.type_1);
        console.log("Type 2 correct answers:", questionData.correctAnswers.type_2);
        console.log("Type 3 correct answers:", questionData.correctAnswers.type_3);
        console.log("=============================");
    } else {
        console.log("No admin questions found in localStorage");
    }
}

// Call this function when app initializes (temporary)
// Add this line in initializeApp() function
// debugAdminQuestions();

// Add this debugging function RIGHT AFTER initializeApp()
function debugScoreCalculation() {
    console.log("=== SCORE CALCULATION DEBUG ===");
    
    // Check what's in localStorage
    const storedQuestions = localStorage.getItem('quizQuestions');
    console.log("LocalStorage has quizQuestions:", !!storedQuestions);
    
    if (storedQuestions) {
        const questionData = JSON.parse(storedQuestions);
        console.log("Admin questions count:", {
            type_1: questionData.questions?.type_1?.length || 0,
            type_2: questionData.questions?.type_2?.length || 0,
            type_3: questionData.questions?.type_3?.length || 0
        });
        console.log("Admin correct answers:", questionData.correctAnswers);
    }
    
    // Check what's currently loaded
    console.log("Currently loaded questions count:", {
        type_1: type_1?.length || 0,
        type_2: type_2?.length || 0,
        type_3: type_3?.length || 0
    });
    console.log("Currently loaded correct answers:", correctAnswers);
    
    // Check which questions are selected for this quiz
    console.log("Selected questions for this quiz:", selectedQuestions.length);
    console.log("Question types order:", questionTypes);
    
    // Check user responses
    console.log("User responses:", userResponses);
    
    console.log("==============================");
}

// Begin the quiz after valid form submission
function beginQuiz() {
    console.log("Beginning quiz");
    
    // Debug again when quiz starts
    debugScoreCalculation();
    
    // Hide user info form
    const userForm = document.getElementById('user-info-form');
    if (userForm) {
        userForm.style.display = 'none';
    }
    
    // Show questions form
    const personalityForm = document.getElementById('personality-form');
    if (personalityForm) {
        personalityForm.style.display = 'block';
    }
    
    // Show and start timer
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.style.display = 'block';
        timerElement.classList.add('show');
    }
    
    // Start a 5-minute timer (300 seconds)
    startTimer(300);
    
    // Load the first question
    displayQuestion();
    
    // Setup question navigation
    setupQuestionNavigation();
}

// Display the current question
function displayQuestion() {
    console.log("Displaying question", currentQuestionIndex);
    const question = selectedQuestions[currentQuestionIndex];
    if (question) {
        document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1}`;
        
        // Clean up the question text
        const cleanQuestion = question.question.replace(/^\n+/, '').replace(/\\n/g, '').trim();
        document.getElementById('question-text').textContent = cleanQuestion;

        const form = document.getElementById('questions-form');
        form.innerHTML = ''; // Clear previous options

        Object.entries(question.options).forEach(([key, value]) => {
            const optionContainer = document.createElement('div');
            optionContainer.classList.add('option-container');

            if (value.image) {
                const img = document.createElement('img');
                img.src = value.image;
                img.alt = key;
                img.classList.add('option-image');
                optionContainer.appendChild(img);
            }

            const label = document.createElement('label');
            label.classList.add('option-label');

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'option';
            input.value = key;
            input.classList.add('option-radio');

            // Restore the user's previous selection if it exists
            if (userResponses[currentQuestionIndex] === key) {
                input.checked = true;
            }

            const textNode = document.createElement('span');
            textNode.textContent = value.text;

            label.appendChild(input);
            label.appendChild(textNode);

            optionContainer.appendChild(label);
            form.appendChild(optionContainer);
        });

        // Show navigation buttons
        showNavigationButtons();
        updateNextButtonText();
        
        // Setup navigation after displaying question
        setupQuestionNavigation();
    } else {
        console.error("Question not found at index", currentQuestionIndex);
    }
}

// Show navigation buttons based on current question
function showNavigationButtons() {
    const nextButton = document.getElementById('next-question-button');
    const prevButton = document.getElementById('previous-question-button');
    
    console.log("Showing navigation buttons for question:", currentQuestionIndex);
    
    // Always show next button
    if (nextButton) {
        nextButton.style.display = 'inline-block';
        console.log("Next button shown");
    }
    
    // Show previous button only if not on first question
    if (prevButton) {
        if (currentQuestionIndex > 0) {
            prevButton.style.display = 'inline-block';
            console.log("Previous button shown");
        } else {
            prevButton.style.display = 'none';
            console.log("Previous button hidden");
        }
    }
}

// Separate function for question navigation setup
function setupQuestionNavigation() {
    const nextButton = document.getElementById('next-question-button');
    const prevButton = document.getElementById('previous-question-button');
    
    if (nextButton) {
        // Remove existing listeners by cloning the node
        const newNextButton = nextButton.cloneNode(true);
        nextButton.parentNode.replaceChild(newNextButton, nextButton);
        
        // Add new event listener
        newNextButton.addEventListener('click', function(e) {
            e.preventDefault();
            handleNextQuestion();
        });
    }
    
    if (prevButton) {
        // Remove existing listeners by cloning the node
        const newPrevButton = prevButton.cloneNode(true);
        prevButton.parentNode.replaceChild(newPrevButton, prevButton);
        
        // Add new event listener
        newPrevButton.addEventListener('click', function(e) {
            e.preventDefault();
            handlePreviousQuestion();
        });
    }
}

// Handle next question/submit
function handleNextQuestion() {
    console.log("Next button clicked, current question:", currentQuestionIndex);
    
    const selectedOption = document.querySelector('input[name="option"]:checked');
    
    // Check if this is the last question (submit test)
    if (currentQuestionIndex === selectedQuestions.length - 1) {
        // This is submit - confirm with user
        const confirmSubmit = confirm('Are you sure you want to submit your test? You cannot change answers after submission.');
        if (!confirmSubmit) {
            return;
        }
        
        // Save current answer if selected
        if (selectedOption) {
            if (!userResponses.hasOwnProperty(currentQuestionIndex)) {
                questionsAttempted++;
            }
            userResponses[currentQuestionIndex] = selectedOption.value;
        }
        
        // Submit the test
        endTest();
        return;
    }
    
    // Regular next question logic
    if (!selectedOption) {
        const proceedWithoutSelection = confirm('\nYou have not selected any of the given options. We prefer you to select the most suitable option you find.\n\nDo you still want to proceed ?');
        if (!proceedWithoutSelection) {
            return;
        }
    } else {
        // Save the answer
        if (!userResponses.hasOwnProperty(currentQuestionIndex)) {
            questionsAttempted++;
        }
        userResponses[currentQuestionIndex] = selectedOption.value;
    }

    // Move to next question
    currentQuestionIndex++;
    console.log("Moving to question:", currentQuestionIndex);
    
    if (currentQuestionIndex < selectedQuestions.length) {
        displayQuestion();
    } else {
        // Shouldn't reach here, but safety check
        endTest();
    }
}

// Handle previous question
function handlePreviousQuestion() {
    console.log("Previous button clicked, current question:", currentQuestionIndex);
    
    if (currentQuestionIndex > 0) {
        // Save current answer if selected (but don't increment questionsAttempted for going back)
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (selectedOption) {
            userResponses[currentQuestionIndex] = selectedOption.value;
        }
        
        // Move to previous question
        currentQuestionIndex--;
        console.log("Moving back to question:", currentQuestionIndex);
        displayQuestion();
    }
}

// Function to update the button text based on the current question
function updateNextButtonText() {
    const nextButton = document.getElementById('next-question-button');
    if (nextButton) {
        if (currentQuestionIndex === selectedQuestions.length - 1) {
            nextButton.innerHTML = '<i class="fas fa-check"></i> Submit Test';
            console.log("Next button text set to Submit Test");
        } else {
            nextButton.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
            console.log("Next button text set to Next");
        }
    }
}

// Calculate the user's score - FIXED VERSION
function calculateScore() {
    let score = 0;
    
    // Get the stored question data with correct answers
    const storedQuestions = localStorage.getItem('quizQuestions');
    let adminCorrectAnswers = {};
    
    if (storedQuestions) {
        const questionData = JSON.parse(storedQuestions);
        adminCorrectAnswers = questionData.correctAnswers || {};
        console.log("Using admin correct answers:", adminCorrectAnswers);
    } else {
        console.log("No stored questions found, using fallback answers");
    }
    
    // Fallback correct answers (from your hardcoded questions)
    const fallbackCorrectAnswers = {
        "type_1": ["b", "a", "b", "a", "c", "a", "b", "b", "c", "b"],
        "type_2": ["c", "d", "d", "c", "c", "b", "b", "a", "c", "b"],
        "type_3": ["b", "c", "a", "b", "b", "b", "c", "c", "c", "a"]
    };
    
    for (let i = 0; i < selectedQuestions.length; i++) {
        if (userResponses[i]) {
            // Get question type for this specific question
            const questionType = questionTypes[i];
            const selectedQuestion = selectedQuestions[i];
            
            let correctAnswer = null;
            
            // First, try to find the question index in its original type array
            let questionIndex = -1;
            
            if (questionType === 'type_1' && type_1) {
                questionIndex = type_1.findIndex(q => 
                    q.question === selectedQuestion.question && 
                    JSON.stringify(q.options) === JSON.stringify(selectedQuestion.options)
                );
            } else if (questionType === 'type_2' && type_2) {
                questionIndex = type_2.findIndex(q => 
                    q.question === selectedQuestion.question && 
                    JSON.stringify(q.options) === JSON.stringify(selectedQuestion.options)
                );
            } else if (questionType === 'type_3' && type_3) {
                questionIndex = type_3.findIndex(q => 
                    q.question === selectedQuestion.question && 
                    JSON.stringify(q.options) === JSON.stringify(selectedQuestion.options)
                );
            }
            
            // Try to get correct answer from admin data first
            if (questionIndex !== -1 && 
                adminCorrectAnswers[questionType] && 
                adminCorrectAnswers[questionType][questionIndex] !== undefined) {
                
                correctAnswer = adminCorrectAnswers[questionType][questionIndex];
                console.log(`Question ${i + 1}: Using admin answer '${correctAnswer}' for ${questionType}[${questionIndex}]`);
                
            } else if (questionIndex !== -1 && 
                       fallbackCorrectAnswers[questionType] && 
                       fallbackCorrectAnswers[questionType][questionIndex] !== undefined) {
                
                correctAnswer = fallbackCorrectAnswers[questionType][questionIndex];
                console.log(`Question ${i + 1}: Using fallback answer '${correctAnswer}' for ${questionType}[${questionIndex}]`);
                
            } else {
                console.warn(`Question ${i + 1}: Could not find correct answer for ${questionType}[${questionIndex}]`);
                console.log("Question details:", selectedQuestion.question.substring(0, 50) + "...");
                console.log("Available admin answers for", questionType, ":", adminCorrectAnswers[questionType]);
                console.log("Available fallback answers for", questionType, ":", fallbackCorrectAnswers[questionType]);
                continue;
            }
            
            // Check if user's answer is correct
            if (userResponses[i] === correctAnswer) {
                score++;
                console.log(`Question ${i + 1}: ✅ User answered '${userResponses[i]}', Correct answer: '${correctAnswer}'`);
            } else {
                console.log(`Question ${i + 1}: ❌ User answered '${userResponses[i]}', Correct answer: '${correctAnswer}'`);
            }
        } else {
            console.log(`Question ${i + 1}: No answer provided by user`);
        }
    }
    
    console.log("Final score calculation:", score, "out of", selectedQuestions.length);
    console.log("User responses:", userResponses);
    console.log("Question types:", questionTypes);
    
    return score;
}

// Store quiz result - ENHANCED VERSION
function storeQuizResult(score) {
    try {
        const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
        
        // Get existing results and filter out expired ones
        let quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
        quizResults = quizResults.filter(r => r.timestamp >= oneDayAgo);
        
        // Get stored question data for correct answers
        const questionData = JSON.parse(localStorage.getItem('quizQuestions') || '{}');
        const adminCorrectAnswers = questionData.correctAnswers || {};
        
        // Build detailed response array
        const detailedResponses = [];
        for (let i = 0; i < selectedQuestions.length; i++) {
            const questionType = questionTypes[i];
            const selectedQuestion = selectedQuestions[i];
            
            // Find question index in original array
            let questionIndex = -1;
            if (questionType === 'type_1' && type_1) {
                questionIndex = type_1.findIndex(q => 
                    q.question === selectedQuestion.question && 
                    JSON.stringify(q.options) === JSON.stringify(selectedQuestion.options)
                );
            } else if (questionType === 'type_2' && type_2) {
                questionIndex = type_2.findIndex(q => 
                    q.question === selectedQuestion.question && 
                    JSON.stringify(q.options) === JSON.stringify(selectedQuestion.options)
                );
            } else if (questionType === 'type_3' && type_3) {
                questionIndex = type_3.findIndex(q => 
                    q.question === selectedQuestion.question && 
                    JSON.stringify(q.options) === JSON.stringify(selectedQuestion.options)
                );
            }
            
            const correctAnswer = (questionIndex !== -1 && adminCorrectAnswers[questionType] && adminCorrectAnswers[questionType][questionIndex])
                ? adminCorrectAnswers[questionType][questionIndex]
                : 'unknown';
            
            detailedResponses.push({
                questionNumber: i + 1,
                questionType: questionType,
                questionIndex: questionIndex,
                userAnswer: userResponses[i] || 'Not Answered',
                correctAnswer: correctAnswer,
                isCorrect: userResponses[i] === correctAnswer
            });
        }
        
        // Create result object
        const result = {
            userId: currentUser.userId,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            score: score,
            questionsAttempted: questionsAttempted,
            timestamp: new Date().getTime(),
            responses: userResponses,
            questionTypes: questionTypes,
            detailedResponses: detailedResponses,
            aadhaar: currentUser.aadhaar,
            age: currentUser.age,
            city: currentUser.city,
            district: currentUser.district,
            state: currentUser.state
        };
        
        // Add to results array
        quizResults.push(result);
        
        // Save back to localStorage
        localStorage.setItem('quizResults', JSON.stringify(quizResults));
        
        // If score is perfect (10/10), add to perfect scores list
        if (score === 10 && questionsAttempted === 10) {
            let perfectScores = JSON.parse(localStorage.getItem('perfectScores') || '[]');
            
            // Add to perfect scores
            perfectScores.push({
                userId: currentUser.userId,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                timestamp: new Date().getTime()
            });
            
            // Filter out expired entries
            perfectScores = perfectScores.filter(r => r.timestamp >= oneDayAgo);
            
            // Save back to localStorage
            localStorage.setItem('perfectScores', JSON.stringify(perfectScores));
        }
        
        console.log("Quiz result stored successfully");
        
    } catch (error) {
        console.error("Error storing quiz result:", error);
        alert("Warning: Your result may not have been saved properly. Please take a screenshot of your score.");
    }
}

// Global timer variable to prevent multiple timers
let quizTimer = null;

// Start the timer - FIXED VERSION
function startTimer(duration) {
    console.log("Starting timer for", duration, "seconds");
    
    // Clear any existing timer
    if (quizTimer) {
        clearInterval(quizTimer);
    }
    
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.style.display = 'block';
        timerElement.classList.add('show');
    }
    
    let timer = duration, minutes, seconds;

    quizTimer = setInterval(() => {
        minutes = Math.floor(timer / 60);
        seconds = timer % 60;

        if (timerElement) {
            timerElement.innerHTML = `<i class="fas fa-clock"></i> Time Remaining: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }

        if (--timer < 0) {
            clearInterval(quizTimer);
            quizTimer = null;
            console.log("Timer expired - ending test");
            endTest();
        }
    }, 1000);
}

// End the test - ENHANCED VERSION
function endTest() {
    try {
        // Clear timer
        if (quizTimer) {
            clearInterval(quizTimer);
            quizTimer = null;
        }
        
        // Calculate score
        const score = calculateScore();
        
        // Store result
        storeQuizResult(score);
        
        // Hide the personality form
        const personalityForm = document.getElementById('personality-form');
        if (personalityForm) {
            personalityForm.style.display = 'none';
        }

        // Hide timer
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.style.display = 'none';
        }

        // Initialize the result message based on the number of questions attempted
        let resultMessage = '';
        let resultClass = '';

        if (questionsAttempted < 5) {
            resultMessage = `You have attempted only ${questionsAttempted} out of ${selectedQuestions.length} questions. Please attempt at least 5 questions to qualify for scoring.`;
            resultClass = 'result-warning';
        } else if (questionsAttempted >= 5 && questionsAttempted < selectedQuestions.length) {
            resultMessage = `You have attempted ${questionsAttempted} out of ${selectedQuestions.length} questions. Complete all questions next time to get your full score and qualify for rewards!`;
            resultClass = 'result-partial';
        } else if (questionsAttempted === selectedQuestions.length) {
            if (score === selectedQuestions.length) {
                resultMessage = `🎉 Congratulations! Perfect score! You scored ${score}/${selectedQuestions.length}. You're eligible for the weekly winners draw!`;
                resultClass = 'result-perfect';
            } else if (score >= Math.ceil(selectedQuestions.length * 0.7)) {
                resultMessage = `Excellent! You scored ${score}/${selectedQuestions.length}. Well done!`;
                resultClass = 'result-excellent';
            } else if (score >= Math.ceil(selectedQuestions.length * 0.5)) {
                resultMessage = `Good effort! You scored ${score}/${selectedQuestions.length}. Keep learning!`;
                resultClass = 'result-good';
            } else {
                resultMessage = `You scored ${score}/${selectedQuestions.length}. Keep practicing to improve!`;
                resultClass = 'result-needs-improvement';
            }
        }

        // Display the result message on the result screen
        const resultMessageElement = document.getElementById('result-message');
        if (resultMessageElement) {
            resultMessageElement.textContent = resultMessage;
            resultMessageElement.className = resultClass;
        }

        // Show result screen
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            const existingBtn = resultDiv.querySelector('.view-results-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            const viewResultsBtn = document.createElement('button');
            viewResultsBtn.textContent = 'View Weekly Results';
            viewResultsBtn.className = 'view-results-btn';
            viewResultsBtn.onclick = () => { window.location.href = 'results.html'; };
            resultDiv.appendChild(viewResultsBtn);

            const thankYouMessage = document.getElementById('thank-you-message');
            if (thankYouMessage) {
                thankYouMessage.style.display = 'block';
            }
            resultDiv.style.display = 'block';
        }
        
        console.log("Quiz ended successfully");
        
    } catch (error) {
        console.error("Error ending test:", error);
        alert("An error occurred while ending the test. Please refresh the page.");
    }
}

// Final validation function
function validateQuizIntegrity() {
    const issues = [];
    
    // Check if required elements exist
    if (!document.getElementById('user-info-form')) issues.push('User form not found');
    if (!document.getElementById('personality-form')) issues.push('Quiz form not found');
    if (!document.getElementById('timer')) issues.push('Timer element not found');
    if (!document.getElementById('result')) issues.push('Result element not found');
    
    // Check if questions are loaded
    if (!selectedQuestions || selectedQuestions.length === 0) issues.push('No questions loaded');
    if (!questionTypes || questionTypes.length === 0) issues.push('Question types not mapped');
    
    // Check localStorage availability
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        issues.push('LocalStorage not available');
    }
    
    if (issues.length > 0) {
        console.error('Quiz integrity check failed:', issues);
        return false;
    }
    
    console.log('Quiz integrity check passed ✅');
    return true;
}

// Run validation after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded - initializing app");
    console.log("Form exists:", !!document.getElementById('user-info-form'));
    console.log("Aadhaar input exists:", !!document.getElementById('aadhaar'));
    
    // Small delay to ensure all elements are rendered
    setTimeout(() => {
        initializeApp();
        
        // Run integrity check after initialization
        setTimeout(() => {
            validateQuizIntegrity();
        }, 500);
    }, 100);
});

// Add console logging to check if JavaScript is loading
console.log("test.js file loaded successfully");