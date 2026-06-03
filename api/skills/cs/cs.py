from skills.base import BaseSubjectSkill

class CsSkill(BaseSubjectSkill):
    def get_instructions(self, config: dict) -> str:
        return """
COMPUTER SCIENCE SPECIFIC INSTRUCTIONS:
- Coding questions must use the primary language of the course (e.g. C++ for CS 240/246, Racket for CS 135, Python for CS 115/116).
- Include standard test cases (input/output) and runtime/space complexity requirements (e.g., $O(n \\log n)$).
- Coding questions should require functional code implementations, focusing on proper algorithms and data structures.
- Short answer questions should test trade-offs between different design paradigms, databases, memory allocation, or network layers.
"""

    def get_prompt_overrides(self, config: dict) -> dict:
        return {
            "structure_rule": "- For systems-oriented courses (like CS 136/246/350), emphasize memory management, pointers, and memory leaks if coding in C/C++."
        }
