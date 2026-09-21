---
name: targeted-e2e-execution
description: playwright-cli で対象UIを読み取り専用調査し、YAMLパターンからMarkdown計画を作成して、明示承認後に限定E2E検証を実行する。Playwrightテストコードを作らずブラウザ検証するときに使う。
allowed-tools: Bash(playwright-cli:*) Bash(mkdir:*) Write
---

# 対象限定 E2E 実行

起動済みWebアプリケーションのうち、ユーザーが指定したUI項目だけを検証する。Playwright spec、アプリケーションコード、既存テストは変更しない。

## 入力と設定

計画前に次を取得する。

- HTTP(S)のbase URL
- [defaults.yml](defaults.yml) に登録済みの画面ID
- 対象項目またはUI操作
- SPテストの要否。省略時はPCのみ

次を読む。

- [defaults.yml](defaults.yml): 画面pathと非対象フィールドの有効なdefault
- [test-patterns.yml](test-patterns.yml): 有効なpatternと期待仕様の正本
- [テストカタログ](references/test-catalog.md): YAMLキーワードの意味
- [計画テンプレート](templates/plan-template.md)
- [結果テンプレート](templates/report-template.md)
- 対象が `e2e-flow-*` なら [3ステップ入力フロー](references/e2e-form-flow.md)

ブラウザを開く前にURL、画面登録、default、YAML v2、テンプレートを検証する。未知のキーやキーワード、重複ID、不正なevidence参照は `configuration error` として具体的な場所を示し、ブラウザもrunディレクトリも作らず停止する。詳細な形式はテストカタログと [証跡形式](references/evidence-format.md) に従う。

`defaults.yml` へテストケースや不正値を追加しない。radio/checkboxの `default: true` は選択状態として扱う。

## 承認前の読み取り専用調査

計画作成に必要な範囲でexecution URLを開き、対象要素の `find`、要素単位の `snapshot`、DOMを変更しない `eval` を使ってUI種別、属性、ラベル、選択肢、露出済み制約、結果領域を確認してよい。

承認前は禁止する。

- 入力、選択、click、submit、DOM変更
- UI操作による画面遷移
- スクリーンショット
- サーバー起動

通常はexecution URLだけを調査する。`e2e-flow-*` は、登録済みの後続画面URLを別セッションで直接開いてよい。PC/SPの対象deviceごとに調査し、セッションを閉じる。

## パターン選定と計画

YAMLに記載されたpatternはすべて有効である。

- `controls` が対象UIと一致しないpatternは列挙しない
- controlは一致するが `when` を満たさないpatternは `not applicable` とし、理由を記録する
- 適用可能なpatternは全件採用し、裁量で省略しない
- `expect` を期待仕様の正本とし、現在のUI挙動から変更しない
- stepに必要な値をUIやdefaultから解決できなければ推測せず `not applicable`
- 秘密値は計画と結果でマスクする

case IDは `<screen>-<target>-<pattern>-<device>`、deviceは `pc` または `sp` とする。

調査後、run ID `YYYYMMDD-HHmmss-<screen>-<scope>` を発行する。1 runは変更されない1つの計画と最大1回の実行である。計画変更、独立画面、再実行は新しいrunにし、既存ディレクトリを上書きしない。

承認前に書き込めるのは `test-results/<run-id>/plan.md` だけである。計画テンプレートから、調査結果、採用ケース、非適用理由、default、状態変更操作を含むplanを生成する。

チャットには対象、ケース数、状態変更操作、非適用件数、planへのリンクを示し、「このテスト計画を承認しますか？」で応答を終了する。

## 承認ゲート

plan提示後の別メッセージで、提示済みplanを明確に承認された場合だけ実行する。依頼文、URL指定、過去の包括許可を承認として扱わない。

承認後にケース変更が必要になったら停止し、新しいrunでplanを作り直して再承認を得る。

## 承認後の実行

ケースごとに新しい `playwright-cli` セッションを使う。PCは `1920 x 1080`、SPはユーザー指定時だけモバイルdeviceを使う。非対象フィールドには `defaults.yml` の値を設定する。

YAMLの `steps` をカタログどおり順に実行する。YAMLから生のCLIやJavaScriptを実行しない。`tamper-unlisted-value` だけは、対象radioの `value` プロパティだけを変える要素単位のevalへ変換してよい。

実際のUI結果を `expect` と比較する。

- 一致: `OK`
- 操作できたが不一致: `NG`。後続ケースは続行
- 条件不足: `not applicable`
- 接続不能、操作不能、前提不足、証跡取得不能: `blocked`
- 画面共通の前提がblocked: 同画面の未実行ケースもblockedとして中止

ケース終了時にセッションを閉じる。この手順が起動した一時サーバーだけを最後に停止し、既存のユーザーサーバーは停止しない。

## 証跡と結果

最終step後に期待または明確な反対状態を待って判定する。YAMLの `evidence` が指定する中間stepは直後、最終stepは判定後に、`<case-id>--<checkpoint>.png` をフルページ取得する。

```text
playwright-cli screenshot --full-page --filename=<path>
```

`OK` / `NG` は全checkpoint、`not applicable` は証跡なし、`blocked` は取得済み分だけを記録する。秘密値が平文で写る場合は撮影せずblockedにする。

結果テンプレートから同じrunの `report.md` を生成する。全体判定は `NG > blocked > OK` とし、`not applicable` は影響させない。最後に件数、全体判定、reportへのリンクを伝える。
