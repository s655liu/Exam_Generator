export const buildExamPrompt = (config) => {
    const { 
        courseCode, 
        courseLevel, 
        topics, 
        isFinal, 
        primaryLanguages, 
        hasProofs, 
        hasCoding 
    } = config;

    const duration = isFinal ? "2.5 hours" : "1.5 hours";
    const examType = isFinal ? "Final Exam" : "Midterm Exam";
    
    // Distribution logic
    const mcCount = isFinal ? 25 : 15;
    const saCount = isFinal ? 8 : 4;
    const proofCount = hasProofs ? (isFinal ? 2 : 1) : 0;
    const codingCount = hasCoding ? (isFinal ? 3 : 1) : 0;

    const language = primaryLanguages && primaryLanguages.length > 0 ? primaryLanguages[0] : "Python";

    let prompt = `Generate a high-quality ${examType} for ${courseCode} (${duration}).

Topics to cover (including specific sub-topics/details):
${topics.map(t => `- ${t}`).join("\n")}

IMPORTANT: Ensure the questions specifically address the sub-topics and details listed above. For Enriched or Advanced courses, ensure the questions reflect the increased difficulty and deeper theoretical depth characteristic of those versions.


The exam must be divided into two sections: the EXAM itself and the ANSWER KEY.
Use the exact separator '---ANSWER_KEY_START---' between them.

Here are the requirements for each question type:

1. Multiple Choice Questions (${mcCount} questions)
Requirements:
- Each question tests conceptual understanding, not trivial facts
- Provide 4 options (A, B, C, D)
- Exactly one correct answer per question
- Include plausible distractors that reflect common misconceptions

2. Short Answer Questions (${saCount} questions)
Requirements:
- Questions should require 2-4 sentence explanations
- Test understanding of concepts, algorithms, or trade-offs
- Avoid yes/no questions

3. Proof Questions (${proofCount} questions)
Requirements:
- Suitable for written exam (15-20 minutes per proof)
- Include natural deduction, induction, or formal language proofs
- Specify what technique to use (e.g., "Prove by induction...")

4. Coding Questions (${codingCount} questions)
Language: ${language}
Requirements:
- Include function signature and problem description
- Provide 2-3 test cases
- Avoid requiring external libraries
- For CS 136: include memory management considerations

FORMATTING FOR EXAM:
For Multiple Choice:
Q[Number]. [Question text]
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]

FORMATTING FOR ANSWER KEY:
For Multiple Choice: Provide the correct letter and a brief explanation.
For Short Answer: Provide a model 2-4 sentence answer.
For Proofs: Provide a detailed proof sketch.
For Coding: Provide a model solution and explain the test case results.

Ensure the combined difficulty of these questions is appropriate for a ${duration} exam.
`;

    return prompt;
};
