import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, Star } from 'lucide-react'
import type { Material } from '@/lib/types'
import { DIFFICULTY_LABELS } from '@/lib/types'

interface MaterialCardProps {
  material: Material
}

export function MaterialCard({ material }: MaterialCardProps) {
  const ageLabel = material.ageMin === material.ageMax
    ? `${material.ageMin}歳`
    : `${material.ageMin}〜${material.ageMax}歳`

  const hasImage = !!material.imageUrl

  return (
    <Link
      href={`/materials/${material.id}`}
      className="group bg-white border border-border rounded-lg overflow-hidden hover:border-primary hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* Preview area */}
      <div className="relative bg-background aspect-[1.414/1] flex items-center justify-center overflow-hidden">
        {hasImage ? (
          <Image
            src={material.imageUrl}
            alt={material.title}
            width={420}
            height={297}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
            unoptimized
          />
        ) : (
          <div className="text-5xl select-none opacity-30">🎨</div>
        )}
        {material.popular && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center gap-1 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-medium">
              <Star className="w-2.5 h-2.5" />
              人気
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="text-[10px] bg-white/90 backdrop-blur px-2 py-0.5 rounded-full font-medium border border-border text-foreground">
            {DIFFICULTY_LABELS[material.difficulty]}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h3 className="font-mincho font-bold text-[14px] leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {material.title}
        </h3>

        {material.description && (
          <p className="text-[11px] text-primary/85 leading-relaxed line-clamp-2 italic border-l-2 border-primary/30 pl-2">
            &ldquo;{material.description.replace(/[。、]+$/, '')}&rdquo;
          </p>
        )}

        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto pt-2 border-t border-border">
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
