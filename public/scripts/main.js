import { buildExamPrompt } from './prompts.js';

const elements = {
    // courseSelect: document.getElementById('course-select'), // kept for compatibility if needed elsewhere but mostly unused now
    examType: document.getElementById('exam-type'),
    topicsSection: document.getElementById('topics-section'),
    topicsGrid: document.getElementById('topics-grid'),
    generateBtn: document.getElementById('generate-btn'),
    resultsSection: document.getElementById('results-section'),
    examTab: document.getElementById('exam-tab'),
    keyTab: document.getElementById('key-tab'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    loader: document.querySelector('.loader'),
    btnText: document.querySelector('.btn-text'),
    printBtn: document.getElementById('print-btn'),
    subjectSelect: document.getElementById('subject-select'),
    courseSearch: document.getElementById('course-search'),
    courseDropdown: document.getElementById('course-dropdown'),
    clearSearchBtn: document.getElementById('clear-search'),
    difficultySelect: document.getElementById('difficulty-select')
}

let allCourses = [];
let currentCourse = null;
let currentSubject = 'all';
let lastSelectedCode = "";

// Initialize
async function init() {
    console.log('🚀 Initializing dashboard...');
    // Guard: Only run if we are on the dashboard (index.html)
    if (!elements.courseSearch || !elements.generateBtn) {
        console.log('ℹ️ Non-dashboard page detected. Skipping generation logic.');
        return;
    }

    // Tiny delay to ensure browser has settled
    await new Promise(r => setTimeout(r, 100));

    try {
        console.log('📡 Fetching courses from API...');
        const response = await fetch('/api/courses');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        allCourses = data.courses.filter(c => c.has_exam);
        console.log(`✅ Loaded ${allCourses.length} exam-ready courses.`);

        applyFilters();
    } catch (error) {
        console.error('❌ Failed to load courses:', error);
        alert(`Failed to load course data: ${error.message}\n\nPlease check if the local server is running at http://localhost:3000`);
    }
}

function applyFilters(shouldShow = false) {
    const searchTerm = elements.courseSearch.value.toLowerCase().trim();
    const isNewSearch = searchTerm !== lastSelectedCode.toLowerCase();

    const filteredCourses = allCourses.filter(course => {
        const matchesSubject = currentSubject === 'all' || course.code.toLowerCase().startsWith(currentSubject.toLowerCase());
        const matchesSearch = course.code.toLowerCase().includes(searchTerm);
        return matchesSubject && matchesSearch;
    });

    renderCourseList(filteredCourses);

    // Show dropdown if requested (on focus or input)
    // Hide if no results or specifically not requested
    if (shouldShow && filteredCourses.length > 0) {
        elements.courseDropdown.classList.remove('hidden');
    } else if (filteredCourses.length === 0 || !shouldShow) {
        elements.courseDropdown.classList.add('hidden');
    }
}

function renderCourseList(courses) {
    elements.courseDropdown.innerHTML = '';

    if (courses.length === 0) {
        elements.courseDropdown.innerHTML = '<div class="dropdown-item"><span>No courses found</span></div>';
        return;
    }

    courses.forEach(course => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = `<b>${course.code}</b><span>${course.name}</span>`;

        item.onclick = () => selectCourse(course);
        elements.courseDropdown.appendChild(item);
    });
}

function selectCourse(course) {
    currentCourse = course;
    lastSelectedCode = course.code;
    elements.courseSearch.value = course.code;
    elements.courseDropdown.classList.add('hidden');

    // Show clear button when choice is locked
    elements.clearSearchBtn?.classList.remove('hidden');

    renderTopics(course.topics);
    elements.topicsSection.classList.remove('hidden');
    elements.generateBtn.disabled = false;
}

// No change needed for subject select, keep it
elements.subjectSelect.addEventListener('change', (e) => {
    currentSubject = e.target.value;
    applyFilters();
});

// Search input logic for custom dropdown
elements.courseSearch.addEventListener('input', () => {
    const value = elements.courseSearch.value;

    // Show/Hide clear button
    if (value.length > 0) {
        elements.clearSearchBtn?.classList.remove('hidden');
    } else {
        elements.clearSearchBtn?.classList.add('hidden');
    }

    // If user starts typing again, reset the 'lastSelected' lock
    if (value !== lastSelectedCode) {
        applyFilters(true);
    }
});

// Clear button logic
elements.clearSearchBtn?.addEventListener('click', () => {
    elements.courseSearch.value = '';
    elements.clearSearchBtn.classList.add('hidden');
    elements.courseDropdown.classList.add('hidden');
    currentCourse = null;
    lastSelectedCode = "";
    elements.topicsSection.classList.add('hidden');
    elements.generateBtn.disabled = true;
    elements.courseSearch.focus();
});

elements.courseSearch.addEventListener('focus', () => {
    // Show the full list for the current subject on focus
    applyFilters(true);
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.searchable-select')) {
        elements.courseDropdown.classList.add('hidden');
    }
});

function renderTopics(topics) {
    elements.topicsGrid.innerHTML = '';
    topics.forEach(topic => {
        const label = document.createElement('label');
        label.className = 'topic-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = topic; // Keep full detailed topic as the value
        checkbox.checked = true;

        label.appendChild(checkbox);

        // Only display the category part before the colon
        const displayTopic = topic.split(':')[0];
        label.appendChild(document.createTextNode(displayTopic));

        elements.topicsGrid.appendChild(label);
    });
}

// Handle Generation
if (elements.generateBtn) {
    elements.generateBtn.addEventListener('click', async () => {
        const selectedTopics = Array.from(elements.topicsGrid.querySelectorAll('input:checked')).map(i => i.value);

        if (selectedTopics.length === 0) {
            alert('Please select at least one topic.');
            return;
        }

        const config = {
            courseCode: currentCourse.code,
            courseLevel: currentCourse.code.split(' ')[1].charAt(0) + '00',
            topics: selectedTopics,
            isFinal: elements.examType.value === 'final',
            difficulty: elements.difficultySelect.value,
            primaryLanguages: currentCourse.primary_languages || [],
            hasProofs: currentCourse.has_proofs ?? currentCourse.question_types?.includes('proof'),
            hasCoding: currentCourse.has_coding ?? currentCourse.question_types?.includes('coding')
        };

        const examPrompt = buildExamPrompt(config);

        // UI Loading State
        setLoading(true);

        try {
            // STEP 1: Generate Exam Questions
            const examResponse = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: examPrompt })
            });

            const examData = await examResponse.json();
            if (examData.error) throw new Error(examData.error);
            const examContent = examData.content;

            // Display Exam Immediately
            elements.examTab.innerHTML = marked.parse(examContent.trim());
            renderMathContent(elements.examTab);
            renderCharts(elements.examTab);
            
            elements.resultsSection.classList.remove('hidden');
            elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Switch to exam tab visually
            elements.tabBtns.forEach(btn => btn.classList.remove('active'));
            elements.tabBtns[0].classList.add('active');
            
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            elements.examTab.classList.add('active');

            // STEP 2: Generate Answer Key in Background
            elements.keyTab.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--text-dim);">
                    <div class="loader" style="margin: 0 auto 1.5rem auto;"></div>
                    <p style="font-size: 1.1rem; letter-spacing: 0.05em;">SOLVING EXAM QUESTIONS...</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.7;">Generating detailed solutions and marking scheme.</p>
                </div>
            `;
            
            const keyPrompt = buildAnswerKeyPrompt(examContent);
            const keyResponse = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: keyPrompt })
            });

            const keyData = await keyResponse.json();
            if (keyData.error) throw new Error(keyData.error);
            const keyContent = keyData.content;

            // Display Answer Key
            elements.keyTab.innerHTML = marked.parse(keyContent.trim());
            renderMathContent(elements.keyTab);
            renderCharts(elements.keyTab);

        } catch (error) {
            console.error('Generation Error:', error);
            alert('Failed to generate: ' + error.message);
        } finally {
            setLoading(false);
        }
    });
}

function setLoading(isLoading) {
    elements.generateBtn.disabled = isLoading;
    if (isLoading) {
        elements.loader.classList.remove('hidden');
        elements.btnText.textContent = 'GENERATING...';
    } else {
        elements.loader.classList.add('hidden');
        elements.btnText.textContent = 'GENERATE EXAM (AI Powered)';
    }
}

// Navigation Interactivity handled by sidebar.js in multi-page mode


function renderMathContent(container) {
    if (window.renderMathInElement) {
        renderMathInElement(container, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true },
                { left: '[ ', right: ' ]', display: true },
                { left: '( ', right: ' )', display: false }
            ],
            throwOnError: false
        });
    }
}

function renderCharts(container) {
    const chartBlocks = container.querySelectorAll('code.language-chart');

    chartBlocks.forEach((block, index) => {
        try {
            const config = JSON.parse(block.textContent.trim());
            const preElement = block.parentElement;

            // Create canvas
            const canvasWrapper = document.createElement('div');
            canvasWrapper.className = 'chart-container';
            canvasWrapper.style.position = 'relative';
            canvasWrapper.style.height = '300px';
            canvasWrapper.style.margin = '2rem 0';

            const canvas = document.createElement('canvas');
            canvas.id = `chart-${Date.now()}-${index}`;
            canvasWrapper.appendChild(canvas);

            // Replace the <pre> block with the canvas
            preElement.parentNode.replaceChild(canvasWrapper, preElement);

            // Initialize Chart
            new Chart(canvas, config);
        } catch (e) {
            console.error('Failed to render chart:', e);
            block.textContent = 'Error rendering chart: ' + e.message;
        }
    });
}

// Print Functionality
elements.printBtn.addEventListener('click', () => {
    window.print();
});

// Tab Switching
elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // Update buttons
        elements.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update panes
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(`${tab}-tab`).classList.add('active');
    });
});

init();
