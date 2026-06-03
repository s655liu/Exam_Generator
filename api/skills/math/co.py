from skills.base import BaseSubjectSkill

class CoSkill(BaseSubjectSkill):
    def get_instructions(self, config: dict) -> str:
        return """
COMBINATORICS & OPTIMIZATION SPECIFIC INSTRUCTIONS:
- Include topics from graph theory (e.g., planarity, coloring, matching, tree properties), generating functions, or recurrence relations.
- For optimization questions, include linear programming formulations, duality theory, the simplex algorithm, network flows, or integer programming.
- Require rigorous combinatorial arguments (e.g., bijection, double counting, Pigeonhole Principle) or optimization duality proofs.
- Where appropriate, describe graphs or networks textually and ask the student to trace flow algorithms (e.g., Ford-Fulkerson, Dijkstra).
"""

    def get_prompt_overrides(self, config: dict) -> dict:
        return {
            "structure_rule": "- Focus on combinatorial proofs, duality concepts, and algorithm tracing/formulations."
        }
