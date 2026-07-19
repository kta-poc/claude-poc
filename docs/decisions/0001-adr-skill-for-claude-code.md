# 0001. Claude Code用ADR作成スキルの導入

Date: 2026-06-28
Status: proposed

## Context and Problem Statement

このリポジトリでは設計上の意思決定を記録・共有する手段が存在しなかった。
Claude Codeとの壁打ちで決定した内容を、後から参照・追跡できる形式で残したい。

## Decision Drivers

- 議論はClaude Codeとの会話（grill-meスキル等）で行うため、その流れでそのままADRを生成できると効率的
- 数ヶ月後に同じ議論が再燃したときに根拠が残っていること
- チームが読みやすい標準的なフォーマットであること
- 日本語で運用するリポジトリに適合すること

## Considered Options

- Michael Nygard形式（Title / Status / Context / Decision / Consequences）
- MADR形式（Markdown Architectural Decision Records）

## Decision Outcome

Chosen option: 「MADR形式」, 却下した選択肢とその理由を記録する Alternatives Considered セクションがあり、決定の背景が後から理解しやすいため。

### Consequences

- Good: 壁打ち後に `/adr` とだけ打つだけで、会話の文脈からADRが自動生成される
- Good: 採番・日付・ファイル名の英訳が自動化され、手作業が不要
- Good: 確認フローにより、生成内容をユーザーが修正してからファイルが作成される
- Bad: 会話の文脈が不十分な場合、生成精度が下がる可能性がある

## Pros and Cons of the Options

### Michael Nygard形式

- Good: シンプルで書きやすい
- Bad: 却下した選択肢が記録されないため、後から決定の根拠が追いにくい

### MADR形式

- Good: Considered Options / Pros and Cons セクションで意思決定の全経緯が残る
- Good: 標準化されており、ツールやテンプレートが充実している
- Bad: Michael Nygard形式より記述量が多い
