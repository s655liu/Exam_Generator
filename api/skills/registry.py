from skills.base import BaseSubjectSkill
from skills.math.math import MathSkill
from skills.math.amath import AmathSkill
from skills.math.pmath import PmathSkill
from skills.math.stat import StatSkill
from skills.math.co import CoSkill
from skills.cs.cs import CsSkill

skill_registry = {
    'MATH': MathSkill,
    'AMATH': AmathSkill,
    'PMATH': PmathSkill,
    'STAT': StatSkill,
    'CO': CoSkill,
    'CS': CsSkill
}

def get_skill(subject_code: str) -> BaseSubjectSkill:
    clean_code = (subject_code or '').upper().strip()
    skill_class = skill_registry.get(clean_code, BaseSubjectSkill)
    return skill_class(clean_code)
