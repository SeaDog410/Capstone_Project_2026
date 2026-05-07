---
title: SOAP Notes + Voice Transcription
github: https://github.com/SeaDog410/Capstone_Project_2026/issues/3
labels: needs-triage
skill: .claude/skills/to-issues/SKILL.md
---

## What to build

Trainer can create a SOAP note for an athlete encounter using four free-text fields (Subjective, Objective, Assessment, Plan). A record button captures audio, sends it to the OpenAI Whisper API, and pre-fills the form with the transcript for the trainer to review and edit before saving. Past notes for an athlete are viewable in a history list.

## Acceptance criteria

- [ ] Trainer can open a New Encounter form and select an athlete
- [ ] Form has separate free-text fields for Subjective, Objective, Assessment, and Plan
- [ ] Record button captures browser audio via MediaRecorder API
- [ ] Audio is sent to POST /voice/transcribe which forwards to OpenAI Whisper API and returns transcript text
- [ ] Transcript pre-fills the SOAP form fields; trainer can edit before saving
- [ ] Completed note (including raw voice_transcript) is saved to the database
- [ ] Trainer can view a list of past encounters for any athlete, sorted by date descending

## Blocked by

- [#2 Athlete + Clearance + Coach Roster](02-athlete-clearance-coach-roster.md)
