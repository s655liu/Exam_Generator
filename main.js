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
    courseDropdown: document.getElementById('course-dropdown')
};

let allCourses = [];
let currentCourse = null;
let currentSubject = 'all';

// Initialize
async function init() {
    try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        allCourses = data.courses.filter(c => c.has_exam);

        applyFilters();
    } catch (error) {
        console.error('Failed to load courses:', error);
        alert('Failed to load course data. Make sure the server is running.');
    }
}

function applyFilters() {
    const searchTerm = elements.courseSearch.value.toLowerCase().trim();

    const filteredCourses = allCourses.filter(course => {
        const matchesSubject = currentSubject === 'all' || course.code.toLowerCase().startsWith(currentSubject.toLowerCase());
        const matchesSearch = course.code.toLowerCase().includes(searchTerm);
        return matchesSubject && matchesSearch;
    });

    renderCourseList(filteredCourses);
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
    elements.courseSearch.value = course.code;
    elements.courseDropdown.classList.add('hidden');

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
    elements.courseDropdown.classList.remove('hidden');
    applyFilters();
});

elements.courseSearch.addEventListener('focus', () => {
    elements.courseDropdown.classList.remove('hidden');
    applyFilters();
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
        primaryLanguages: currentCourse.primary_languages || [],
        hasProofs: currentCourse.has_proofs ?? currentCourse.question_types?.includes('proof'),
        hasCoding: currentCourse.has_coding ?? currentCourse.question_types?.includes('coding')
    };

    const prompt = buildExamPrompt(config);

    // UI Loading State
    setLoading(true);

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        displayResults(data.content);
        elements.resultsSection.classList.remove('hidden');
        elements.resultsSection.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error('Generation Error:', error);
        alert('Failed to generate exam: ' + error.message);
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    elements.generateBtn.disabled = isLoading;
    if (isLoading) {
        elements.loader.classList.remove('hidden');
        elements.btnText.textContent = 'Generating...';
    } else {
        elements.loader.classList.add('hidden');
        elements.btnText.textContent = 'Generate Exam';
    }
}

function displayResults(content) {
    const [exam, key] = content.split('---ANSWER_KEY_START---');

    // Render Markdown
    elements.examTab.innerHTML = exam ? marked.parse(exam.trim()) : '<p>Error generating exam paper.</p>';
    elements.keyTab.innerHTML = key ? marked.parse(key.trim()) : '<p>Answer key not found in response.</p>';
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
