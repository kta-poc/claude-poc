# スプレッドシート項目定義書

当面のテスト情報源は、1 sheetを1画面として扱う項目定義書だけである。画面遷移は [flows.yml](../flows.yml)、遷移用の有効値は [defaults.yml](../defaults.yml) から取得し、項目定義書から推測しない。

## 必須列

列順は問わないが、次の見出しを完全一致で1列ずつ持つ。

| 見出し | 用途 |
|---|---|
| `項目名` | ラベルと人間向け項目名 |
| `DOMのid` | DOMの生ID。先頭の `#` は付けない |
| `形式` | [spreadsheet-mappings.yml](../spreadsheet-mappings.yml) の `source_values` |
| `必須有無` | mappingの `required_values` |
| `初期値` | 画面を初期表示したときの期待値。空欄は空の初期状態 |
| `補足文言` | 画面に表示される期待文言。空欄は補足なし |

列不足、同名列の重複、空の項目名、空のDOM ID、同一sheet内のDOM ID重複は `configuration error` とする。完全な空行は無視する。未知の `形式` や `必須有無` は推測せず、行とセルを `unresolved` に記録する。

## セルの正規化

- `DOMのid` は `{ type: id, value: <生ID> }` として保存する。CSS selectorへ先に変換しない。
- `形式` はraw値を保存したうえで、mappingから `control_type`、format制約、テスト値、秘密値属性へ変換する。
- `初期値` は `spreadsheet-mappings.yml` の `initial_value_rules` でcontrol別に正規化する。text-input/textareaはDOM value、select/radioの非空値は選択肢の表示label、checkboxはchecked状態と比較する。
- `初期値` の空欄は「値が不明」ではない。text-input/textareaは空文字、select/radioは未選択、checkboxは未チェックを期待する。checkboxの非空値がmappingのtrue/false語彙へ一致しなければ `unresolved` とする。
- `補足文言` の空欄はケースを生成しない。値があれば完全一致の画面内表示を検証する。6列だけでは特定項目とのDOM上の関連付けまでは保証しない。
- 秘密値形式の初期値はraw、normalized、case、Markdownのいずれにも平文を保存せず、workbook、sheet、セル番地への `value_ref`、`redacted: true`、`display: "***"` だけを保存する。
- 各raw値と正規化結果には `Sheet!A2` のようなセル単位の `source_ref` を付ける。

## ケース導出

各項目について次を判定する。

1. controlとラベルの表示ケースを生成する。
2. 空欄を含む初期値の一致ケースを生成する。
3. mappingに有効なテスト値があれば、入力または選択の反映ケースを生成する。
4. 必須かつ通常UIで空状態を作れるcontrolなら、必須エラーケースを生成する。選択系で解除方法を6列から確定できない場合は非適用理由を記録する。
5. mappingに不正値があれば、形式エラーケースを生成する。
6. 補足文言があれば、完全一致表示ケースを生成する。

最大長、最小値、選択肢一覧、送信結果、エラー文言そのものは6列から確定できないため追加しない。validation errorはmappingの観測規約を使う。規約で観測方法を構成できなければケースを作らず `unresolved` とする。

select/radioの非空初期値は表示labelとして扱う。DOMのvalueと比較したいプロジェクトでは、仕様書生成前に対応mappingの `comparison` を `value` へ変更し、そのmapping版を仕様書へ固定する。承認後の実行時にlabelまたはvalueを一意に解決できなければ `configuration drift` とする。

## 初期値と遷移用default

項目定義書の `初期値` は初期画面の期待状態であり、[defaults.yml](../defaults.yml) の `default` は画面遷移や非対象項目を有効状態にするテストデータである。値が異なっても矛盾ではない。

初期値ケースは、対象へdefaultを設定しない専用reset profileで、新規セッションまたは確実に初期状態へ戻した直後に実行する。他ケースのresetでは必要に応じてdefaultを使う。同じ項目が両方に登録されている場合、DOM ID由来locatorとdefaultsのlocatorが異なれば `configuration error` とする。
