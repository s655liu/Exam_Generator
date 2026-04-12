export const buildExamPrompt = (config) => {
    const {
        courseCode,
        courseLevel,
        topics,
        isFinal,
        difficulty,
        primaryLanguages,
        hasProofs,
        hasCoding
    } = config;

    const duration = isFinal ? "2.5 hours" : "1.5 hours";
    const examType = isFinal ? "Final Exam" : "Midterm Exam";
    const difficultyLabel = difficulty ? difficulty.toUpperCase() : "MEDIUM";

    // Distribution logic
    const mcCount = 5; // User requested at most 4 MC questions
    const saCount = isFinal ? 12 : 6;
    const proofCount = hasProofs ? (isFinal ? 3 : 2) : 0;
    const codingCount = hasCoding ? (isFinal ? 4 : 2) : 0;

    const language = primaryLanguages && primaryLanguages.length > 0 ? primaryLanguages[0] : "Python";

    let prompt = `Generate a high-quality ${difficultyLabel} difficulty ${examType} for ${courseCode} (${duration}).

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
- IMPORTANT: Use double newlines between the question and each option to ensure they appear on separate lines.

FORMATTING FOR MULTIPLE CHOICE:
Q[Number]. [Question text]

A) [Option A text]

B) [Option B text]

C) [Option C text]

D) [Option D text]

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

5. Graph/Plot Generation (Especially for STAT courses)
- If a question would benefit from a visual graph (e.g., probability distribution, scatter plot, bar chart):
- Provide a Chart.js JSON configuration inside a code block marked with \`\`\`chart
- The configuration should be a valid JSON object suitable for the second argument of \`new Chart(ctx, config)\`.
- Use translucent colors (rgba) to match the dark theme and include proper labels and titles.

FORMATTING REQUIREMENTS (CRITICAL):
1. Math Notation: 
   - Use $ ... $ for all inline mathematical expressions (e.g., $n^2$).
   - Use $$ ... $$ for all block/centered mathematical formulas (e.g., $$S_n = \frac{n(n+1)}{2}$$).
   - Never use parentheses ( ) or brackets [ ] for math formulas unless they are part of the equation itself.

2. Multiple Choice Formatting:
   - Each option must be preceded by a double newline to ensure it starts a new Markdown paragraph.
   - Format:
     Q[Number]. [Question text]

     A) [Option A]

     B) [Option B]

     C) [Option C]

     D) [Option D]

3. Document Structure:
   - Use Markdown headers (## Section Name) for exam sections (## Multiple Choice Questions, ## Short Answer Questions, etc.).
   - Use double newlines between questions for proper Markdown rendering.

FORMATTING FOR EXAM:
## Multiple Choice Questions
Q[Number]. [Question text]

A) [Option 1]

B) [Option 2]

C) [Option 3]

D) [Option 4]

## Short Answer Questions
Q[Number]. [Question text]

## Proof Questions
Q[Number]. [Question text]

## Coding Questions
Q[Number]. [Question text]

FORMATTING FOR ANSWER KEY:
Use Markdown headers for each question type.
- Multiple Choice: Provide the correct letter and a brief explanation in $ math notation $ where applicable.
- Short Answer: Provide a model 2-4 sentence answer.
- Proofs: Provide a detailed proof sketch using $$ block math $$ for complex steps.
- Coding: Provide a model solution in a Markdown code block.

Ensure the combined difficulty of these questions is appropriate for a ${duration} exam.
`;

    return prompt;
};
