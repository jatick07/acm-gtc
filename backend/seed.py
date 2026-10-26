"""Populate the database with sample 'guess the output' questions if empty.

Run:  python seed.py
"""
from __future__ import annotations

import database

SAMPLES = [
    {
        "snippet": "print(2 + 3 * 4)",
        "answers": ["20", "14", "24", "11"],
        "correct_index": 1,  # 14
    },
    {
        "snippet": "print(type(3.0))",
        "answers": [
            "<class 'int'>",
            "<class 'float'>",
            "<class 'str'>",
            "<class 'double'>",
        ],
        "correct_index": 1,
    },
    {
        "snippet": "print('ab' * 3)",
        "answers": ["abb", "ababab", "abc", "ab3"],
        "correct_index": 1,
    },
    {
        "snippet": "print(10 // 3)",
        "answers": ["3.33", "3", "4", "1"],
        "correct_index": 1,
    },
    {
        "snippet": "x = [1, 2, 3]\nprint(len(x))",
        "answers": ["2", "4", "3", "Error"],
        "correct_index": 2,
    },
    {
        "snippet": "print(bool(0))",
        "answers": ["True", "False", "0", "None"],
        "correct_index": 1,
    },
]


def seed() -> int:
    existing = database.list_questions()
    if existing:
        print(f"{len(existing)} question(s) already present; skipping seed.")
        return 0
    count = 0
    for item in SAMPLES:
        qid = database.create_question(
            item["snippet"], item["answers"], item["correct_index"]
        )
        print(f"Inserted question {qid}: {item['snippet']!r}")
        count += 1
    print(f"Seeded {count} questions.")
    return count


if __name__ == "__main__":
    seed()
