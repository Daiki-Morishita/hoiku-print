'use client'

import { useState } from 'react'
import { saveOnboarding } from './actions'

const FACILITY_OPTIONS = [
  { value: 'nursery',      label: '保育園' },
  { value: 'kindergarten', label: '幼稚園' },
  { value: 'combined',     label: '認定こども園' },
  { value: 'afterschool',  label: '学童保育' },
  { value: 'individual',   label: '個人' },
  { value: 'other',        label: 'その他' },
]

const NEEDS_NAME = ['nursery', 'kindergarten', 'combined', 'afterschool']

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
]

export function OnboardingForm() {
  const [facilityType, setFacilityType] = useState('')
  const [loading, setLoading] = useState(false)

  const showName = NEEDS_NAME.includes(facilityType)

  return (
    <form
      action={async (fd) => { setLoading(true); await saveOnboarding(fd) }}
      className="flex flex-col gap-5"
    >
      {/* 施設種別 */}
      <div>
        <label className="block text-sm font-medium mb-2">施設の種別</label>
        <div className="grid grid-cols-2 gap-2">
          {FACILITY_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer text-sm transition-all
                ${facilityType === value
                  ? 'border-primary bg-primary/5 font-medium text-primary'
                  : 'border-border hover:border-primary/40'}`}
            >
              <input
                type="radio"
                name="facilityType"
                value={value}
                checked={facilityType === value}
                onChange={e => setFacilityType(e.target.value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* 施設名（条件付き表示） */}
      {showName && (
        <div>
          <label className="block text-sm font-medium mb-2">
            施設名 <span className="text-muted-foreground font-normal">（任意）</span>
          </label>
          <input
            type="text"
            name="facilityName"
            placeholder="例：ひまわり保育園"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>
      )}

      {/* 都道府県 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          都道府県 <span className="text-muted-foreground font-normal">（任意）</span>
        </label>
        <select
          name="prefecture"
          className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        >
          <option value="">選択してください</option>
          {PREFECTURES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {loading ? '保存中…' : '設定を保存して始める'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => { setLoading(true); saveOnboarding(new FormData()) }}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          スキップ
        </button>
      </div>
    </form>
  )
}
