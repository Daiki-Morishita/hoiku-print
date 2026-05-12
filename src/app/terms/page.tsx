import Link from 'next/link'
import { ChevronRight, FileText } from 'lucide-react'

export const metadata = {
  title: '利用規約｜ぬりえプリント',
  description: 'ぬりえプリントの利用規約。教材の使用範囲、商用利用、免責事項、規約の変更などについて定めています。',
  alternates: { canonical: 'https://nurie-print.com/terms' },
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">ホーム</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">利用規約</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
        <FileText className="w-7 h-7 text-primary" />
        利用規約
      </h1>

      <p className="text-sm text-muted-foreground mb-8">最終更新日: 2026年5月13日</p>

      <section className="prose max-w-none text-sm leading-relaxed space-y-6">
        <p>
          この利用規約（以下「本規約」）は、ぬりえプリント（以下「当サイト」）が提供する教材プリントおよび関連サービス（以下「本サービス」）の利用条件を定めるものです。本サービスを利用される方（以下「利用者」）には、本規約に同意した上でご利用いただきます。
        </p>

        <h2 className="text-lg font-bold mt-8 mb-3">第1条（適用範囲）</h2>
        <p>
          本規約は、本サービスを利用するすべての利用者に適用されます。当サイトは、本規約のほか、利用にあたってのルールやガイドラインを定めることがあり、それらも本規約の一部を構成します。
        </p>

        <h2 className="text-lg font-bold mt-8 mb-3">第2条（教材の利用範囲）</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>当サイトが配布する教材プリントは、保育・教育・家庭での個人利用に限り、無料でご利用いただけます。</li>
          <li>保育園・幼稚園・学童保育・児童館・子育て支援センター等の現場でのご利用、ならびに家庭での印刷利用は自由に行えます。</li>
          <li>ライセンスは原則として CC BY-NC 4.0（クリエイティブ・コモンズ 表示 - 非営利 4.0 国際）に準じます。</li>
        </ul>

        <h2 className="text-lg font-bold mt-8 mb-3">第3条（禁止事項）</h2>
        <p>利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
        <ul className="space-y-2 list-disc pl-5">
          <li>教材ファイル・画像を販売、有料配布、または商用目的で再配布する行為</li>
          <li>教材を加工して当サイトのオリジナル素材として配布する行為</li>
          <li>サーバーへの不正アクセス、過剰なアクセス、その他システムに支障を与える行為</li>
          <li>第三者の著作権・肖像権・プライバシー権を侵害する行為</li>
          <li>当サイトの運営を妨害する行為、または他の利用者に迷惑をかける行為</li>
          <li>その他、法令・公序良俗に反する行為</li>
        </ul>

        <h2 className="text-lg font-bold mt-8 mb-3">第4条（知的財産権）</h2>
        <p>
          本サービスで提供される教材・テキスト・画像・デザインに関する著作権その他の知的財産権は、当サイトまたは正当な権利者に帰属します。第2条で許諾された範囲を超える利用については、事前に当サイトの許諾を得る必要があります。
        </p>

        <h2 className="text-lg font-bold mt-8 mb-3">第5条（免責事項）</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>当サイトは、本サービスの内容について、正確性・完全性・有用性を保証するものではありません。</li>
          <li>掲載するコラム記事は一般的な保育・幼児教育の知見をもとに作成していますが、医療・心理等の専門的判断を必要とするケースについては、別途専門家にご相談ください。</li>
          <li>教材の使用によって生じた損害（印刷ミス・誤った使用・お子様のケガ等）について、当サイトは一切の責任を負いません。</li>
          <li>本サービスは予告なく内容を変更・中断・終了することがあります。</li>
        </ul>

        <h2 className="text-lg font-bold mt-8 mb-3">第6条（リンク）</h2>
        <p>
          当サイトへのリンクは原則自由です。ただし、当サイトの趣旨に反する形でのリンクや、利用者に誤解を与える表示と組み合わせたリンクはお断りします。
        </p>

        <h2 className="text-lg font-bold mt-8 mb-3">第7条（広告の表示）</h2>
        <p>
          当サイトは運営費用をまかなうため、Google AdSense をはじめとする第三者配信の広告サービスを利用することがあります。広告の表示にあたって取得される情報の取り扱いについては、当サイトの<Link href="/privacy" className="text-primary underline">プライバシーポリシー</Link>をご確認ください。
        </p>

        <h2 className="text-lg font-bold mt-8 mb-3">第8条（規約の変更）</h2>
        <p>
          当サイトは、必要と判断した場合、利用者への事前通知なく本規約を変更できるものとします。変更後の規約は、当サイト上に掲載した時点から効力を生じます。
        </p>

        <h2 className="text-lg font-bold mt-8 mb-3">第9条（準拠法および管轄裁判所）</h2>
        <p>
          本規約の解釈および適用は、日本法に準拠します。本サービスに関連して紛争が生じた場合は、当サイト運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
        </p>

        <h2 className="text-lg font-bold mt-8 mb-3">第10条（お問い合わせ）</h2>
        <p>
          本規約に関するご質問は、<Link href="/contact" className="text-primary underline">お問い合わせフォーム</Link>よりご連絡ください。
        </p>
      </section>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/privacy" className="block bg-white border border-border text-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
          プライバシーポリシー
        </Link>
        <Link href="/editorial-policy" className="block bg-white border border-border text-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
          編集方針
        </Link>
        <Link href="/contact" className="block bg-white border border-border text-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
          お問い合わせ
        </Link>
      </div>
    </div>
  )
}
