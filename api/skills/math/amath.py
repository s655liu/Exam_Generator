from skills.base import BaseSubjectSkill

class AmathSkill(BaseSubjectSkill):
    def get_instructions(self, config: dict) -> str:
        return """
APPLIED MATHEMATICS SPECIFIC INSTRUCTIONS:
- Questions must emphasize mathematical modeling of physical, engineering, or biological systems.
- Include differential equations (ODEs, PDEs), dynamical systems, boundary value problems, or Fourier series where applicable.
- Require students to physically interpret the mathematical parameters and boundary conditions of the equations.
- Include qualitative analysis of solutions (e.g., phase plane analysis, stability of equilibria, conservation laws).
"""

    def get_prompt_overrides(self, config: dict) -> dict:
        return {
            "structure_rule": "- Emphasize modeling assumptions and physical context in the problem statement."
        }
