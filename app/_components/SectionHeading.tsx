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
        <span className="text-xs uppercase tracking-[0.4em] text-[#8B9A78]">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-3xl sm:text-4xl text-[#2A3320]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm sm:text-base text-[#6B665A]">
          {description}
        </p>
      ) : null}
    </div>
  )
}

