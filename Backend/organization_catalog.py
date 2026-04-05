"""
Canonical colleges and departments for signup dropdowns and approval routing.

Department codes are globally unique (max 10 chars per API).
"""

from __future__ import annotations

from typing import List, TypedDict


class DepartmentRow(TypedDict):
    code: str
    name: str


class CollegeRow(TypedDict):
    code: str
    name: str
    departments: List[DepartmentRow]


ORGANIZATION: List[CollegeRow] = [
    {
        "code": "CAES",
        "name": "College of Agriculture and Environmental Sciences",
        "departments": [
            {"code": "CAES_AECON", "name": "Agricultural Economics and Agribusiness"},
            {"code": "CAES_ANRS", "name": "Animal and Range Science"},
            {"code": "CAES_NRES", "name": "Natural Resources and Environmental Science"},
            {"code": "CAES_PLSC", "name": "Plant Sciences"},
            {"code": "CAES_RDAI", "name": "Rural Development and Agricultural Innovation"},
        ],
    },
    {
        "code": "CBE",
        "name": "College of Business and Economics",
        "departments": [
            {"code": "CBE_ACFN", "name": "Accounting and Finance"},
            {"code": "CBE_COOP", "name": "Cooperatives"},
            {"code": "CBE_ECON", "name": "Economics"},
            {"code": "CBE_MGT", "name": "Management"},
            {"code": "CBE_PADM", "name": "Public Administration and Development Management"},
        ],
    },
    {
        "code": "CCI",
        "name": "College of Computing and Informatics",
        "departments": [
            {"code": "CCI_COSC", "name": "Computer Science"},
            {"code": "CCI_IT", "name": "Information Technology"},
            {"code": "CCI_ISYS", "name": "Information System"},
            {"code": "CCI_ISCI", "name": "Information Science"},
            {"code": "CCI_SENG", "name": "Software Engineering"},
            {"code": "CCI_STAT", "name": "Statistics"},
        ],
    },
    {
        "code": "CEBS",
        "name": "College of Education and Behavioural Sciences",
        "departments": [
            {"code": "CEBS_AECD", "name": "Adult Education and Community Development"},
            {"code": "CEBS_EPM", "name": "Educational Planning and Management"},
            {"code": "CEBS_PSY", "name": "Psychology"},
            {"code": "CEBS_SNIE", "name": "Special Needs and Inclusive Education"},
        ],
    },
    {
        "code": "CHMS",
        "name": "College of Health and Medical Science",
        "departments": [
            {"code": "CHMS_EHS", "name": "Environmental Health Sciences"},
            {"code": "CHMS_MED", "name": "Medicine"},
            {"code": "CHMS_MLS", "name": "Medical Laboratory Sciences"},
            {"code": "CHMS_NURS", "name": "Nursing and Midwifery"},
            {"code": "CHMS_PHAR", "name": "Pharmacy"},
            {"code": "CHMS_PUBH", "name": "Public Health"},
        ],
    },
    {
        "code": "CLAW",
        "name": "College of Law",
        "departments": [
            {"code": "CLAW_LAW", "name": "Law"},
        ],
    },
    {
        "code": "CNCS",
        "name": "College of Natural and Computational Science",
        "departments": [
            {"code": "CNCS_BIOT", "name": "Biological Sciences and Biotechnology"},
            {"code": "CNCS_MATH", "name": "Mathematics"},
            {"code": "CNCS_PHYS", "name": "Physics"},
            {"code": "CNCS_CHEM", "name": "Chemistry"},
        ],
    },
    {
        "code": "CSSH",
        "name": "College of Social Sciences and Humanities",
        "departments": [
            {"code": "CSSH_GES", "name": "Geography and Environmental Studies"},
            {"code": "CSSH_HHM", "name": "History and Heritage Management"},
            {"code": "CSSH_FLS", "name": "Foreign Language Studies"},
            {"code": "CSSH_OROM", "name": "Afaan Oromoo"},
            {"code": "CSSH_GDS", "name": "Gender and Development Studies"},
            {"code": "CSSH_SOC", "name": "Sociology"},
        ],
    },
    {
        "code": "CVM",
        "name": "College of Veterinary Medicine",
        "departments": [
            {"code": "CVM_DVM", "name": "Doctor of Veterinary Medicine"},
            {"code": "CVM_VLT", "name": "Veterinary Laboratory Technology"},
        ],
    },
    {
        "code": "HIT",
        "name": "Haramaya Institute of Technology (HIT)",
        "departments": [
            {"code": "HIT_WREE", "name": "School of Water Resources and Environmental Engineering"},
            {"code": "HIT_ECE", "name": "School of Electrical and Computer Engineering"},
            {"code": "HIT_CHEE", "name": "Chemical Engineering"},
            {"code": "HIT_CIVE", "name": "Civil Engineering"},
            {"code": "HIT_FSPT", "name": "Food Science and Post-harvest Technology"},
            {"code": "HIT_FTP", "name": "Food Technology and Process"},
            {"code": "HIT_MECH", "name": "Mechanical Engineering"},
        ],
    },
]
