type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left'

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow ? (
        <span className="text-xs uppercase tracking-[0.4em] text-neutral-500">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-3xl sm:text-4xl text-neutral-900">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm sm:text-base text-neutral-600">
          {description}
        </p>
      ) : null}
    </div>
  )
}

