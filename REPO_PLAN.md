# Repository Refactor Plan

## Phase 1 (Safe)
- Add README / .gitignore
- Keep existing file locations unchanged

## Phase 2 (Low risk)
- Move *_old, *_temp into `legacy/`
- Keep backward-compatible wrappers if needed

## Phase 3 (Medium)
- Directory split by domain:
  - `forms/`
  - `mail/`
  - `notice/`
  - `schedule/`

## Phase 4
- Optional npm package structure + lint/format
