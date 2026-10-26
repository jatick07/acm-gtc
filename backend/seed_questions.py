#!/usr/bin/env python3
"""Seed the database with difficulty-tagged questions for the Guess the Output game."""

import requests

BASE_URL = "http://127.0.0.1:3000/api/questions"

questions = [
    # === EASY (12 questions) ===
    {
        "difficulty": "low",
        "snippet": "print(2 + 3)",
        "answers": ["5", "6", "4", "3"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "print(10 - 4)",
        "answers": ["6", "5", "7", "4"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "print(3 * 4)",
        "answers": ["12", "7", "10", "14"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "print(8 // 3)",
        "answers": ["2", "3", "2.66", "1"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "print('Hi' * 3)",
        "answers": ["HiHiHi", "Hi3", "3Hi", "Hi"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "print(len('hello'))",
        "answers": ["5", "4", "6", "2"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "x = 5\nprint(x + 2)",
        "answers": ["7", "52", "5", "2"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "print(True and False)",
        "answers": ["False", "True", "0", "None"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "print(10 % 3)",
        "answers": ["1", "3", "2", "0"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "print(type(5))",
        "answers": ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'bool'>"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "a = 10\nb = 5\nprint(a - b)",
        "answers": ["5", "15", "105", "0"],
        "correct_index": 0
    },
    {
        "difficulty": "low",
        "snippet": "print(2 ** 3)",
        "answers": ["8", "6", "5", "9"],
        "correct_index": 0
    },

    # === MEDIUM (9 questions) ===
    {
        "difficulty": "medium",
        "snippet": "for i in range(3):\n    print(i)",
        "answers": ["0 1 2", "1 2 3", "0 1 2 3", "1 2"],
        "correct_index": 0
    },
    {
        "difficulty": "medium",
        "snippet": "x = 5\nif x > 3:\n    print('Big')\nelse:\n    print('Small')",
        "answers": ["Big", "Small", "Error", "Nothing"],
        "correct_index": 0
    },
    {
        "difficulty": "medium",
        "snippet": "for i in range(2, 5):\n    print(i)",
        "answers": ["2 3 4", "3 4 5", "2 3 4 5", "1 2 3 4"],
        "correct_index": 0
    },
    {
        "difficulty": "medium",
        "snippet": "a = [1, 2, 3]\nprint(a[1])",
        "answers": ["2", "1", "3", "0"],
        "correct_index": 0
    },
    {
        "difficulty": "medium",
        "snippet": "i = 0\nwhile i < 3:\n    print(i)\n    i = i + 1",
        "answers": ["0 1 2", "1 2 3", "0 1 2 3", "1 2"],
        "correct_index": 0
    },
    {
        "difficulty": "medium",
        "snippet": "x = 10\nif x > 5 and x < 15:\n    print('Yes')\nelse:\n    print('No')",
        "answers": ["Yes", "No", "Error", "None"],
        "correct_index": 0
    },
    {
        "difficulty": "medium",
        "snippet": "for i in range(4):\n    print(i * 2)",
        "answers": ["0 2 4 6", "2 4 6 8", "0 1 2 3", "1 2 3 4"],
        "correct_index": 0
    },
    {
        "difficulty": "medium",
        "snippet": "s = 'hello'\nprint(s[0] + s[-1])",
        "answers": ["ho", "he", "ll", "eo"],
        "correct_index": 0
    },
    {
        "difficulty": "medium",
        "snippet": "i = 1\nwhile i <= 3:\n    print(i)\n    i += 1",
        "answers": ["1 2 3", "0 1 2", "1 2 3 4", "2 3"],
        "correct_index": 0
    },

    # === HARD (9 questions) ===
    {
        "difficulty": "high",
        "snippet": "for i in range(3):\n    for j in range(2):\n        print(i, j)",
        "answers": ["0 0 0 1 1 0 1 1 2 0 2 1", "0 0 0 1 1 0 2 0 2 1", "0 0 1 1 2 2", "0 1 1 2 2 3"],
        "correct_index": 0
    },
    {
        "difficulty": "high",
        "snippet": "x = 0\nfor i in range(1, 4):\n    x = x + i\nprint(x)",
        "answers": ["6", "5", "4", "3"],
        "correct_index": 0
    },
    {
        "difficulty": "high",
        "snippet": "a = [1, 2, 3, 4]\nfor i in range(len(a)):\n    a[i] = a[i] * 2\nprint(a)",
        "answers": ["[2, 4, 6, 8]", "[1, 2, 3, 4]", "[2, 3, 4, 5]", "[0, 2, 4, 6]"],
        "correct_index": 0
    },
    {
        "difficulty": "high",
        "snippet": "i = 0\nwhile i < 5:\n    if i % 2 == 0:\n        print(i)\n    i += 1",
        "answers": ["0 2 4", "1 3", "0 1 2 3 4", "2 4"],
        "correct_index": 0
    },
    {
        "difficulty": "high",
        "snippet": "s = ''\nfor c in 'abc':\n    s = c + s\nprint(s)",
        "answers": ["cba", "abc", "acb", "bca"],
        "correct_index": 0
    },
    {
        "difficulty": "high",
        "snippet": "x = 10\nwhile x > 0:\n    x = x - 3\nprint(x)",
        "answers": ["1", "0", "-2", "3"],
        "correct_index": 0
    },
    {
        "difficulty": "high",
        "snippet": "a = [1, 2, 3]\nb = []\nfor x in a:\n    if x % 2 == 1:\n        b.append(x)\nprint(b)",
        "answers": ["[1, 3]", "[2]", "[1, 2, 3]", "[2, 3]"],
        "correct_index": 0
    },
    {
        "difficulty": "high",
        "snippet": "i = 1\nresult = 1\nwhile i <= 4:\n    result = result * i\n    i += 1\nprint(result)",
        "answers": ["24", "10", "16", "4"],
        "correct_index": 0
    },
    {
        "difficulty": "high",
        "snippet": "for i in range(3):\n    for j in range(i, 3):\n        print(i, j)",
        "answers": ["0 0 0 1 0 2 1 1 1 2 2 2", "0 0 1 1 2 2", "0 1 2 1 2 2", "0 1 2"],
        "correct_index": 0
    },
]

def main():
    import sys
    # Clear existing questions first
    try:
        resp = requests.get(BASE_URL)
        if resp.ok:
            questions_list = resp.json()
            for q in questions_list:
                requests.delete(f"{BASE_URL}/{q['id']}")
    except Exception as e:
        print(f"Warning: Could not clear existing questions: {e}")

    created = 0
    for q in questions:
        try:
            resp = requests.post(BASE_URL, json={
                "snippet": q["snippet"],
                "answers": q["answers"],
                "correct_index": q["correct_index"],
                "difficulty": q["difficulty"]
            })
            if resp.ok:
                created += 1
                print(f"Created {q['difficulty']} question: {q['snippet'][:30]}...")
            else:
                print(f"Failed to create question: {resp.status_code} {resp.text}")
        except Exception as e:
            print(f"Error creating question: {e}")

    print(f"\nTotal created: {created} questions")

if __name__ == "__main__":
    main()