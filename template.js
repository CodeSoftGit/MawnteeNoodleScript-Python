import json

INPUT = "ExpertStandard.dat"
OUTPUT = "ExpertPlusStandard.dat"

with open(INPUT, "r") as file:
    difficulty = json.load(file)

difficulty["_customData"] = {"_pointDefinitions": [], "_customEvents": []}

_customData = difficulty["_customData"]
_obstacles = difficulty["_obstacles"]
_notes = difficulty["_notes"]
_customEvents = _customData["_customEvents"]
_pointDefinitions = _customData["_pointDefinitions"]

filterednotes = None

for wall in _obstacles:
    if "_customData" not in wall:
        wall["_customData"] = {}

for note in _notes:
    if "_customData" not in note:
        note["_customData"] = {}

def getJumps(njs, offset):
    _startHalfJumpDurationInBeats = 4
    _maxHalfJumpDistance = 18
    _startBPM = 420
    bpm = 666
    _startNoteJumpMovementSpeed = 23
    _noteJumpStartBeatOffset = -0.5

    _noteJumpMovementSpeed = (_startNoteJumpMovementSpeed * bpm) / _startBPM
    num = 60 / bpm
    num2 = _startHalfJumpDurationInBeats
    while _noteJumpMovementSpeed * num * num2 > _maxHalfJumpDistance:
        num2 /= 2
    num2 += _noteJumpStartBeatOffset
    if num2 < 1:
        num2 = 1
    _jumpDuration = num * num2 * 2
    _jumpDistance = _noteJumpMovementSpeed * _jumpDuration
    return {"half": num2, "dist": _jumpDistance}

def noteScale(startBeat, endBeat, track, interval, duration, magnitude):
    for i in range(startBeat, endBeat, interval):
        currentBeat = i
        _customEvents.append({
            "_time": currentBeat,
            "_type": "AnimateTrack",
            "_data": {
                "_track": track,
                "_duration": duration,
                "_scale": [
                    [magnitude, magnitude, magnitude, 0, "easeOutExpo"],
                    [1, 1, 1, 0.9, "easeOutBack"]
                ]
            }
        })

def arrowFlash(startBeat, endBeat, track, interval, duration):
    for i in range(startBeat, endBeat, interval):
        currentBeat = i
        _customEvents.append({
            "_time": currentBeat,
            "_type": "AnimateTrack",
            "_data": {
                "_track": track,
                "_duration": duration,
                "_dissolveArrow": [[0, 0.499], [1, 0.5], [1, 1]]
            }
        })

def bloqFlash(startBeat, endBeat, track, interval, duration):
    for i in range(startBeat, endBeat, interval):
        currentBeat = i
        _customEvents.append({
            "_time": currentBeat,
            "_type": "AnimateTrack",
            "_data": {
                "_track": track,
                "_duration": duration,
                "_dissolve": [[0, 0.499], [1, 0.5], [1, 1]]
            }
        })

def genCircle(radius, n):
    pointss = []
    for i in range(n):
        pointss.append([
            radius * math.cos(((2 * math.pi) / n) * i) - 0.5,
            radius * math.sin(((2 * math.pi) / n) * i) * 1.16 - 1.6
        ])
    return pointss

def genCircleNoCorrection(radius, n):
    pointss = []

    for i in range(n):
        pointss.append([
            radius * math.cos(((2 * math.pi) / n) * i),
            radius * math.sin(((2 * math.pi) / n) * i)
        ])
    return pointss

def round(value, decimals):
    return round(value + "e" + decimals) + "e-" + decimals

def DecayShakePath(xAmp, yAmp, zAmp, points, easing = "easeStep"):
    step = 1 / points
    tog = False
    WOWTHISISANAME = [[0, 0, 0, 0]]
    for i in range(points):
        xVal = xAmp * (1 - i * step)
        yVal = yAmp * (1 - i * step)
        zVal = zAmp * (1 - i * step)
        if tog:
            xVal = -xVal
            yVal = -yVal
            zVal = -zVal
        WOWTHISISANAME.append([xVal, yVal, zVal, (i + 1) * step, easing])

        tog = not tog
    return WOWTHISISANAME

def offestOnNotesBetween(p1, p2, offset):
    filterednotes = [n for n in _notes if n["_time"] >= p1 and n["_time"] <= p2]
    for object in filterednotes:
        if offset is not None:
            object["_customData"]["_noteJumpStartBeatOffset"] = offset
    return filterednotes

def lerp(v0, v1, t):
    return v0 * (1 - t) + v1 * t

def notesAt(times):
    return [n for n in _notes if any(n["_time"] == t for t in times)]

def trackOnNotesBetween(track, p1, p2, potentialOffset):
    filterednotes = [n for n in _notes if n["_time"] >= p1 and n["_time"] <= p2]
    for object in filterednotes:
        object["_customData"]["_track"] = track
        if potentialOffset is not None:
            object["_customData"]["_noteJumpStartBeatOffset"] = potentialOffset
    return filterednotes

def trackOnNotesBetweenRBSep(trackR, trackB, p1, p2, potentialOffset):
    filterednotes = [n for n in _notes if n["_time"] >= p1 and n["_time"] <= p2]
    for object in filterednotes:
        if potentialOffset is not None:
            object["_customData"]["_noteJumpStartBeatOffset"] = potentialOffset
        if object["_type"] == 0:
            object["_customData"]["_track"] = trackR
        if object["_type"] == 1:
            object["_customData"]["_track"] = trackB
    return filterednotes

def offestOnNotesBetweenRBSep(trackR, trackB, p1, p2, potentialOffset, offsetR, offsetB):
    filterednotes = [n for n in _notes if n["_time"] >= p1 and n["_time"] <= p2]
    for object in filterednotes:
        if potentialOffset is not None:
            object["_customData"]["_noteJumpStartBeatOffset"] = potentialOffset
        if object["_type"] == 0:
            object["_customData"]["_track"] = trackR
            object["_customData"]["_noteJumpStartBeatOffset"] = offsetR
        if object["_type"] == 1:
            object["_customData"]["_track"] = trackB
            object["_customData"]["_noteJumpStartBeatOffset"] = offsetB
    return filterednotes

def trackOnNotesBetweenDirSep(p1, p2, potentialOffset, trackUp, trackDown, trackLeft, trackRight):
    filterednotes = [n for n in _notes if n["_time"] >= p1 and n["_time"] <= p2]
    for object in filterednotes:
        if object["_cutDirection"] == 0 and trackUp is not None:
            object["_customData"]["_track"] = trackUp
        if object["_cutDirection"] == 1 and trackUp is not None:
            object["_customData"]["_track"] = trackDown
        if object["_cutDirection"] == 2 and trackUp is not None:
            object["_customData"]["_track"] = trackLeft
        if object["_cutDirection"] == 3 and trackUp is not None:
            object["_customData"]["_track"] = trackRight
        if potentialOffset is not None:
            object["_customData"]["_noteJumpStartBeatOffset"] = potentialOffset
    return filterednotes

def getRndInteger(min, max):
    return random.randint(min, max)

def BombNote(note, dissolve=True, bombTrack=None):
    if "_customData" not in note:
        note["_customData"] = {}
    if "_animation" not in note["_customData"]:
        note["_customData"]["_animation"] = {}
    bomb = note.copy()
    bomb["_type"] = 3
    bomb["_customData"]["_fake"] = True
    bomb["_customData"]["_interactable"] = False
    bomb["_time"] = bomb["_time"] + 0.05
    if dissolve:
        note["_customData"]["_animation"]["_dissolve"] = [[1, 0], [0, 0]]
        bomb["_customData"]["_animation"]["_dissolve"] = [[1, 0], [1, 0.5], [0, 0.525]]
    if "_color" not in bomb["_customData"]:
        if note["_type"] == 0:
            bomb["_customData"]["_color"] = [1, 0, 0]
        elif note["_type"] == 1:
            bomb["_customData"]["_color"] = [0, 0, 1]
    if bombTrack is not None:
        bomb["_customData"]["_track"] = bombTrack
    _notes.append(bomb)

def BombNoteBoom(note, dissolve=True, bombTrack=None):
    if "_customData" not in note:
        note["_customData"] = {}
    if "_animation" not in note["_customData"]:
        note["_customData"]["_animation"] = {}
    bomb = note.copy()
    bomb["_type"] = 3
    bomb["_customData"]["_fake"] = True
    bomb["_customData"]["_interactable"] = True
    bomb["_time"] = bomb["_time"] + 0.05
    if dissolve:
        note["_customData"]["_animation"]["_dissolve"] = [[1, 0], [0, 0]]
        bomb["_customData"]["_animation"]["_dissolve"] = [[1, 0], [1, 0.5], [0, 0.525]]
    if "_color" not in bomb["_customData"]:
        if note["_type"] == 0:
            bomb["_customData"]["_color"] = [1, 0, 0]
        elif note["_type"] == 1:
            bomb["_customData"]["_color"] = [0, 0, 1]
    if bombTrack is not None:
        bomb["_customData"]["_track"] = bombTrack
    _notes.append(bomb)
# write your script here v

# write your script here ^
precision = 4
jsonP = 10 ** precision
sortP = 10 ** 2

def deeperDaddy(obj):
    if obj:
        for key in obj:
            if obj[key] is None:
                del obj[key]
            elif isinstance(obj[key], dict) or isinstance(obj[key], list):
                deeperDaddy(obj[key])
            elif isinstance(obj[key], float):
                obj[key] = round(obj[key], precision)

deeperDaddy(difficulty)

difficulty["_notes"].sort(key=lambda x: (round(x["_time"], sortP), round(x["_lineIndex"], sortP), round(x["_lineLayer"], sortP)))
difficulty["_obstacles"].sort(key=lambda x: x["_time"])
difficulty["_events"].sort(key=lambda x: x["_time"])

with open(OUTPUT, "w") as file:
    json.dump(difficulty, file, indent=0)


