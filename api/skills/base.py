class BaseSubjectSkill:
    def __init__(self, subject_code: str):
        self.subject_code = subject_code

    def get_instructions(self, config: dict) -> str:
        """
        Return subject-specific prompt instructions.
        """
        return ""

    def get_prompt_overrides(self, config: dict) -> dict:
        """
        Return prompt overrides like structure_rule.
        """
        return {}
