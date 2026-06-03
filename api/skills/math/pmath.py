from skills.base import BaseSubjectSkill

class PmathSkill(BaseSubjectSkill):
    def get_instructions(self, config: dict) -> str:
        return """
PURE MATHEMATICS SPECIFIC INSTRUCTIONS:
- Emphasize abstract algebraic structures, topology, real analysis, complex analysis, or group theory.
- Questions must be highly theoretical and require rigorous mathematical proofs (no hand-waving or heuristic arguments).
- Prompt the student to construct counterexamples, prove classifications, or analyze topological spaces/algebraic morphisms.
- Frame questions using formal definitions (e.g., open covers, group homomorphisms, metric spaces) and require explicit theorem citations.
"""

    def get_prompt_overrides(self, config: dict) -> dict:
        return {
            "structure_rule": "- Focus heavily on abstract reasoning, counterexamples, and deductive proofs."
        }
