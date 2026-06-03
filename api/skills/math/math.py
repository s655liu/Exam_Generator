from skills.base import BaseSubjectSkill

class MathSkill(BaseSubjectSkill):
    def get_instructions(self, config: dict) -> str:
        return """
MATHEMATICS SPECIFIC INSTRUCTIONS:
- Ensure all algebra, calculus, and linear algebra questions test conceptual clarity, not just arithmetic calculation.
- Require rigorous step-by-step proofs for proof questions, specifying the technique (e.g., induction, contradiction, direct proof).
- Structure problems cleanly with clear definitions of variables and domain sets (e.g., $x \\in \\mathbb{R}$).
- Avoid wordy problems unless they represent classic mathematical modeling questions.
"""

    def get_prompt_overrides(self, config: dict) -> dict:
        return {
            "structure_rule": "- Use standard mathematical notation and format equations in LaTeX block format ($$...$$) for readability."
        }
