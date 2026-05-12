# 季節の行事 素材生成リスト

保育園で実際に使われる行事を網羅した生成計画。

## 共通仕様

- **命名**: `{event}-{item}-{unit}-{連番}`  例: `christmas-tree-rich-1`
- **Unit 展開** (4段階固定):
  - `simple` … アイテム1個・背景なし（2〜3歳）
  - `easy` … アイテム＋1要素（3歳）
  - `normal` … ミニシーン（3〜4歳）
  - `rich` … **園の行事風景**（4〜6歳・園便り/卒園アルバム用）
- **rich は「園での行事の様子」に振る**（保育士のリピート利用を最大化）

## 凡例

- 🟢 標準実施 — 即生成OK
- 🟡 要判断 — 家族構成・宗教色・地域差で取扱注意
- 🔴 保育園では稀 — 今回は除外

---

## 4月｜入園・進級

**event: `enrollment` 🟢**

| item_id | 表示名 |
|---|---|
| randoseru | ランドセル |
| enrollment-bag | つうえんバッグ |
| sakura-arch | さくらのアーチ |
| name-badge | おなまえバッジ |
| shoe-locker | げたばこ |

---

## 5月｜こどもの日

**event: `childrensday` 🟢**

| item_id | 表示名 |
|---|---|
| koinobori | こいのぼり |
| kabuto | かぶと |
| shobu | しょうぶ |
| kashiwamochi | かしわもち |
| kintaro | きんたろう |
| castle | おしろ |

## 5月｜母の日

**event: `mothersday` 🟡** ※家族構成への配慮で園により実施差あり

| item_id | 表示名 |
|---|---|
| carnation | カーネーション |
| mother-portrait | おかあさん似顔絵枠 |
| thank-you-letter | おてがみ |
| flower-bouquet | はなたば |

---

## 6月｜父の日 / 時の記念日 / 虫歯予防デー

**event: `fathersday` 🟡**

| item_id | 表示名 |
|---|---|
| necktie | ネクタイ |
| father-portrait | おとうさん似顔絵枠 |
| gift-box | プレゼント |

**event: `timeday` 🟢**

| item_id | 表示名 |
|---|---|
| alarm-clock | めざましどけい |
| sand-clock | すなどけい |
| calendar | カレンダー |

**event: `toothday` 🟢**

| item_id | 表示名 |
|---|---|
| tooth | は |
| toothbrush | はぶらし |
| tooth-cup | コップ |
| smile-mouth | にっこりの口 |

---

## 7月｜七夕 / プール開き

**event: `tanabata` 🟢**

| item_id | 表示名 |
|---|---|
| bamboo | ささ |
| tanzaku | たんざく |
| orihime | おりひめ |
| hikoboshi | ひこぼし |
| amanogawa | あまのがわ |
| star-decoration | ほし飾り |

**event: `pool` 🟢**

| item_id | 表示名 |
|---|---|
| swim-ring | うきわ |
| beach-ball | ビーチボール |
| water-gun | みずでっぽう |
| goggles | ゴーグル |
| bucket-watering | バケツとじょうろ |

---

## 8月｜夏祭り

**event: `summerfestival` 🟢**

| item_id | 表示名 |
|---|---|
| chochin | ちょうちん |
| yagura | やぐら |
| uchiwa | うちわ |
| jinbei | じんべい |
| yukata | ゆかた |
| cotton-candy | わたあめ |
| goldfish-scooping | きんぎょすくい |
| yoyo-tsuri | ヨーヨーつり |
| festival-mask | おめん |
| kakigori-stall | かきごおり屋台 |

---

## 9月｜お月見 / 敬老の日

**event: `tsukimi` 🟢**

| item_id | 表示名 |
|---|---|
| moon | つき |
| moon-rabbit | つきうさぎ |
| dango | だんご |
| susuki | すすき |
| satoimo | さといも |

**event: `respectday` 🟡** ※実施園は限定的

| item_id | 表示名 |
|---|---|
| grandfather | おじいちゃん |
| grandmother | おばあちゃん |
| letter-to-grandparent | おてがみ |
| shoulder-massage-ticket | かたたたきけん |

---

## 10月｜運動会 / ハロウィン / いもほり

**event: `sports` 🟢**

| item_id | 表示名 |
|---|---|
| medal | メダル |
| trophy | トロフィー |
| hachimaki | はちまき |
| cheer-flag | おうえんはた |
| baton | バトン |
| tug-of-war | つなひき |
| tamaire-basket | たまいれかご |
| finish-tape | ゴールテープ |

**event: `halloween` 🟢**

| item_id | 表示名 |
|---|---|
| pumpkin | かぼちゃ |
| ghost | おばけ |
| bat | こうもり |
| witch-hat | まじょのぼうし |
| candy-bucket | おかしバケツ |
| jack-o-lantern | ジャックオランタン |
| black-cat | くろねこ |

**event: `imohori` 🟢**

| item_id | 表示名 |
|---|---|
| sweet-potato | さつまいも |
| sweet-potato-vine | つる |
| shovel | シャベル |
| harvest-basket | かご |
| muddy-hands | どろんこの手 |

---

## 11月｜七五三

**event: `shichigosan` 🟡** ※神社要素・地域差大

| item_id | 表示名 |
|---|---|
| chitose-ame | ちとせあめ |
| kimono | きもの |
| hakama | はかま |
| torii | じんじゃのとりい |

---

## 12月｜クリスマス / もちつき / 冬至

**event: `christmas` 🟢** ※宗教色を出さずサンタ・ツリー中心に

| item_id | 表示名 |
|---|---|
| christmas-tree | ツリー |
| santa | サンタ |
| reindeer | トナカイ |
| sleigh | そり |
| christmas-present | プレゼント |
| wreath | リース |
| jingle-bell | ベル |
| stocking | くつした |
| gingerbread | ジンジャーマン |
| christmas-candle | キャンドル |

**event: `mochitsuki` 🟢**

| item_id | 表示名 |
|---|---|
| usu | うす |
| kine | きね |
| mochi | おもち |
| kinako-mochi | きなこもち |
| anko-mochi | あんこもち |

**event: `toji` 🟢**

| item_id | 表示名 |
|---|---|
| yuzu-bath | ゆずゆ |
| toji-pumpkin | かぼちゃ |

---

## 1月｜お正月

**event: `newyear` 🟢**

| item_id | 表示名 |
|---|---|
| kadomatsu | かどまつ |
| shimenawa | しめなわ |
| kagamimochi | かがみもち |
| daruma | だるま |
| koma | こま |
| tako-age | たこあげ |
| hanetsuki | はねつき |
| otoshidama-bag | おとしだま袋 |
| osechi | おせち |
| nengajo | ねんがじょう |

---

## 2月｜節分

**event: `setsubun` 🟢**

| item_id | 表示名 |
|---|---|
| aka-oni | あかおに |
| ao-oni | あおおに |
| fuku-mask | ふくのおめん |
| mame | まめ |
| masu | ます |
| iwashi | いわし |
| hiiragi | ひいらぎ |
| oni-horn-band | おにのつのカチューシャ |

---

## 3月｜ひな祭り / 卒園式

**event: `hinamatsuri` 🟢**

| item_id | 表示名 |
|---|---|
| odairi-sama | おだいりさま |
| ohina-sama | おひなさま |
| sannin-kanjo | さんにんかんじょ |
| gonin-bayashi | ごにんばやし |
| hishimochi | ひしもち |
| hina-arare | ひなあられ |
| bonbori | ぼんぼり |
| momo-flower | もものはな |

**event: `graduation` 🟢**

| item_id | 表示名 |
|---|---|
| diploma | そつえんしょうしょ |
| graduation-bouquet | はなたば |
| graduation-album | アルバム |
| gakushi-cap | がくし帽 |
| graduation-randoseru | ランドセル（門出） |

---

## 通年｜月例イベント

**event: `birthday` 🟢**

| item_id | 表示名 |
|---|---|
| birthday-cake | バースデーケーキ |
| birthday-crown | かんむり |
| birthday-gift | プレゼント |
| birthday-candle | ろうそく |
| balloon | ふうせん |
| message-card | メッセージカード |

**event: `excursion` 🟢**

| item_id | 表示名 |
|---|---|
| excursion-bus | えんそくバス |
| onigiri | おにぎり |
| water-bottle | すいとう |
| backpack | リュック |
| picnic-sheet | レジャーシート |

**event: `drill` 🟢**

| item_id | 表示名 |
|---|---|
| bosai-zukin | 防災ずきん |
| evacuation-sign | ひなんあんないず |
| name-tag | おなまえふだ |

※`fire-engine` しょうぼうしゃ は vehicles テーマで既出

---

## 集計

| 区分 | 行事数 | アイテム数 | 素材数（×4 unit） |
|---|---:|---:|---:|
| 🟢 標準実施 | 21 | 126 | 504 |
| 🟡 要判断 | 4 | 15 | 60 |
| **合計** | **25** | **141** | **564** |

## 生成優先順位（検索ピーク逆算）

保育士の検索ピークは行事の **2〜3週間前**。準備期間を考えて以下の順で投入：

1. **今すぐ**（5月需要中）: `childrensday` → `mothersday`(判断後)
2. **6月初旬**: `tanabata`, `pool`, `summerfestival`
3. **9月初旬**: `sports`, `halloween`, `imohori`, `tsukimi`
4. **11月初旬**: `christmas`, `mochitsuki`, `newyear`
5. **1月初旬**: `setsubun`, `hinamatsuri`, `graduation`
6. **通年いつでも**: `birthday`, `excursion`, `drill`, `enrollment`

## 取り扱い要判断（🟡）の方針案

- **mothersday / fathersday** → 「カーネーション」「ネクタイ」など**人物を入れない物だけ生成**し、似顔絵枠は除外する手も。または `familyday`（ありがとうの花・かぞくの似顔絵枠）に統合
- **respectday** → 高齢者の似顔絵は描き分けが難しい。「おてがみ」「かたたたきけん」などの**物中心**でいく
- **shichigosan** → ちとせあめ・きもの中心。とりいは宗教色が出るので除外も検討

## 次のアクション

1. 🟡 4行事の最終方針を決定（生成する/しない/物だけ）
2. このリストを `scripts/batch_seasonal_events.py` に変換（既存の `batch_vehicles.py` を雛形に）
3. 優先順1から順次生成

---

*最終更新: 2026-05-12*
