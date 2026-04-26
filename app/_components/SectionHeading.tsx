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
    <div className={`flex flex-col gap-3.5 sm:gap-4 ${alignClass}`}>
      {eyebrow ? (
        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8B9A78] sm:text-xs sm:tracking-[0.4em]">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-[2rem] leading-[0.98] text-[#2A3320] sm:text-4xl lg:text-[2.9rem]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-[#6B665A] sm:text-base sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  )
}

