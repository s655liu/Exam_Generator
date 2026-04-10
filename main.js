import { buildExamPrompt } from './prompts.js';

const elements = {
    courseSelect: document.getElementById('course-select'),
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
    printBtn: document.getElementById('print-btn')
};

let courses = [];
let currentCourse = null;

// Initialize
async function init() {
    try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        courses = data.courses.filter(c => c.has_exam);
        
        // Populate dropdown
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.code;
            option.textContent = `${course.code} - ${course.name}`;
            elements.courseSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load courses:', error);
        alert('Failed to load course data. Make sure the server is running.');
    }
}

// Handle course selection
elements.courseSelect.addEventListener('change', (e) => {
    const code = e.target.value;
    currentCourse = courses.find(c => c.code === code);
    
    if (currentCourse) {
        renderTopics(currentCourse.topics);
        elements.topicsSection.classList.remove('hidden');
        elements.generateBtn.disabled = false;
    } else {
        elements.topicsSection.classList.add('hidden');
        elements.generateBtn.disabled = true;
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
        primaryLanguages: currentCourse.primary_languages,
        hasProofs: currentCourse.has_proofs,
        hasCoding: currentCourse.has_coding
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
