import json, urllib.request

B = "http://127.0.0.1:5000/api"


def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(
        B + path,
        data=data,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(r, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())


# 1. questions
status, qs = req("GET", "/questions")
print("questions:", status, len(qs))
q = qs[0]
qid = q["id"]
correct_idx = next((i for i, a in enumerate(q["answers"]) if a["is_correct"]), -1)
print(" q", qid, "correct_idx", correct_idx, "answers", [a["text"] for a in q["answers"]])

# 2. submit answer (correct one)
status, res = req("POST", "/answers", {"question_id": qid, "answer_index": correct_idx})
print("answer:", status, res)

# 3. submit answer (wrong one)
wrong = 0 if correct_idx != 0 else 1
status, res = req("POST", "/answers", {"question_id": qid, "answer_index": wrong})
print("answer wrong:", status, res)

# 4. submit score
status, res = req(
    "POST",
    "/scores",
    {"player_name": "Tester", "score": 100, "correct_count": 1, "total_count": 1},
)
print("score:", status, res)

# 5. leaderboard
status, res = req("GET", "/leaderboard?limit=5")
print("leaderboard:", status, res)

# 6. stats
status, res = req("GET", "/stats")
print("stats:", status, res)

# 7. create a question via creator
status, res = req(
    "POST",
    "/questions",
    {
        "snippet": "print('Hello' + ' ' + 'world')",
        "answers": ["Hello world", "Helloworld", "Hello", "error"],
        "correct_index": 0,
    },
)
print("create question:", status, res)

# 8. delete it
if res.get("id") is not None:
    status, res = req("DELETE", "/questions/%d" % res["id"])
    print("delete question:", status, res)

print("E2E OK")
