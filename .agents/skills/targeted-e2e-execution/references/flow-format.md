# 画面遷移フロー形式

[flows.yml](../flows.yml) は、リポジトリに登録する画面遷移を定義する。現在の項目定義書には画面遷移情報がないため、実行計画はここに登録されたflowだけを使う。各flowは単独で承認・実行できる完全な経路とし、別flowのstepを参照しない。

## schema

```yaml
schema_version: 1
flows:
  - id: application-standard
    description: 標準申込経路
    start_page: screen-a
    end_page: screen-c
    session_policy: auto
    steps:
      - id: a-to-b
        from: screen-a
        prepare:
          defaults: [field-a]
        action:
          type: submit
          locator: "#next"
        to: screen-b
```

rootで許可するキーは `schema_version` と `flows` だけである。flowで許可するキーは `id`、`description`、`start_page`、`end_page`、`session_policy`、`steps` だけである。

stepで許可するキーは `id`、`from`、任意の `prepare`、`action`、`to` だけである。`prepare` は遷移前に設定する `defaults` の配列を持つ。`action.type` は通常UI操作の `click` または `submit`、`action.locator` は対象画面で操作対象を一意に特定するlocatorとする。生のCLIやJavaScriptは記載しない。

## 静的検証

- `schema_version` は `1` とする。
- flow IDと同一flow内のstep IDは一意なASCII kebab-caseとする。
- `session_policy` は `auto` とする。
- `start_page`、`end_page`、全stepの `from` と `to` は [defaults.yml](../defaults.yml) のpage IDを参照する。
- 最初のstepの `from` は `start_page`、最後のstepの `to` は `end_page` と一致させる。
- 直前stepの `to` と次stepの `from` を一致させ、経路を途切れさせない。
- `prepare.defaults` の各field IDは、そのstepの `from` pageに登録されたfieldを参照する。
- radio/checkboxのdefaultがboolean `true` の場合は、登録locatorが指す要素を選択またはcheckする。boolean値を文字列としてfillしない。
- locatorの存在と一意性は承認後の実行時に確認する。意味を変えず解決できなければ `configuration drift` とする。

## 計画への展開

選択したflowの開始画面から、計画の `target_arrival` までのstepを `plan.yml` の `execution.resolved_flow` へ順序どおり複製する。対象が開始画面なら空配列にする。同じ画面へ複数回到達するflowでは、対象とする到達位置をstep IDで特定する。承認後は参照元が変更されても、当該runでは展開済み内容を使う。`plan.md` には同じ経路を画面遷移図と操作一覧で表示する。
