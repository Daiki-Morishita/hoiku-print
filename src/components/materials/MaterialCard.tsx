import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Material } from '@/lib/types'
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/types'

interface MaterialCardProps {
  material: Material
}

const difficultyColor: Record<number, string> = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-orange-100 text-orange-800',
  4: 'bg-red-100 text-red-800',
}

const categoryEmoji: Record<string, string> = {
  coloring: '🖍️', hiragana: 'あ', numbers: '1', drawing: '✏️',
  maze: '🗺', dotconnect: '⚫', craft: '🎨', scissors: '✂️',
}

const themeEmoji: Record<string, string> = {
  animals: '🐾', dinosaurs: '🦕', vehicles: '🚒', trains: '🚃',
  food: '🍎', sea: '🐟', flowers: '🌸', insects: '🐛', characters: '⭐',
  park: '🌳',
}

export function MaterialCard({ material }: MaterialCardProps) {
  const ageLabel = material.ageMin === material.ageMax
    ? `${material.ageMin}歳`
    : `${material.ageMin}〜${material.ageMax}歳`

  // SVG・JPG・PNG・WebP 問わず imageUrl があれば画像表示
  const hasImage = !!material.imageUrl

  return (
    <Link
      href={`/materials/${material.id}`}
      className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col"
    >
      {/* プレビューエリア */}
      <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 aspect-[4/3] flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <Image
            src={material.imageUrl}
            alt={material.title}
            width={320}
            height={240}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-200"
            unoptimized
          />
        ) : (
          <div className="text-6xl select-none group-hover:scale-110 transition-transform duration-200">
            {material.theme ? (themeEmoji[material.theme] ?? categoryEmoji[material.category] ?? '🖨') : (categoryEmoji[material.category] ?? '🖨')}
          </div>
        )}
        {material.popular && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 text-xs bg-accent text-white px-2 py-0.5 rounded-full font-medium">
              <Star className="w-3 h-3" />
              人気
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[material.difficulty]}`}>
            {DIFFICULTY_LABELS[material.difficulty]}
          </span>
        </div>
      </div>

      {/* カード情報 */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {material.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {material.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {CATEGORY_LABELS[material.category]}
          </Badge>
          {material.tags.slice(0, 1).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {ageLabel}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {material.duration}分
          </span>
        </div>
      </div>
    </Link>
  )
}
