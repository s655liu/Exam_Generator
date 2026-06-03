from skills.base import BaseSubjectSkill

class StatSkill(BaseSubjectSkill):
    def get_instructions(self, config: dict) -> str:
        return """
STATISTICS SPECIFIC INSTRUCTIONS:
- Include questions testing probability theory, statistical inference, hypothesis testing, regression analysis, or stochastic processes.
- Questions should use realistic data settings and parameter values.
- GRAPHICS REQUIREMENT: At least one question MUST include a visual plot/graph. Provide a Chart.js JSON configuration inside a code block marked with ```chart.
- The JSON configuration must be a valid JSON object suitable for the second argument of `new Chart(ctx, config)`.
- Use translucent colors (rgba) to match the dark theme and include proper labels and titles.
"""

    def get_prompt_overrides(self, config: dict) -> dict:
        return {
            "structure_rule": "- Ensure standard data tables (e.g. z-tables, t-tables description) or visual probability models are referenced if required for calculations."
        }
