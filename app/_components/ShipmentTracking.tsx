'use client'

type TrackStep = {
  label: string
  detail: string
  status: 'completed' | 'current' | 'upcoming'
  date?: string
}

export default function ShipmentTracking({ createdAt }: { createdAt: string }) {
  const orderDate = new Date(createdAt)
  
  // Mock logic to determine status based on days since order
  const daysSince = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
  
  const steps: TrackStep[] = [
    {
      label: 'Processing',
      detail: 'Order received and being reviewed by our concierge.',
      status: daysSince >= 0 ? 'completed' : 'upcoming',
      date: orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },
    {
      label: 'Wood Selection',
      detail: 'Selecting prime hardwoods for your custom pieces.',
      status: daysSince >= 2 ? 'completed' : daysSince >= 1 ? 'current' : 'upcoming',
      date: daysSince >= 2 ? new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined
    },
    {
      label: 'Crafting',
      detail: 'Artisan production at our Pacific Northwest workshop.',
      status: daysSince >= 7 ? 'completed' : daysSince >= 3 ? 'current' : 'upcoming',
      date: daysSince >= 7 ? new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined
    },
    {
      label: 'Quality Check',
      detail: 'Final inspection of joinery and finish application.',
      status: daysSince >= 10 ? 'completed' : daysSince >= 8 ? 'current' : 'upcoming'
    },
    {
      label: 'In Transit',
      detail: 'Safely packed and on the way to your residence.',
      status: daysSince >= 14 ? 'completed' : daysSince >= 11 ? 'current' : 'upcoming'
    },
    {
      label: 'Delivered',
      detail: 'Successfully placed in your curated space.',
      status: daysSince >= 16 ? 'completed' : daysSince >= 15 ? 'current' : 'upcoming'
    }
  ]

  return (
    <div className="rounded-3xl border border-[#E6D9C8] bg-white p-6 md:p-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-4">
        {steps.map((step, idx) => (
          <div key={step.label} className="relative flex flex-1 gap-4 md:flex-col md:items-center md:gap-6">
            {/* Thread/Line */}
            {idx !== steps.length - 1 && (
              <div className="absolute left-[11px] top-10 h-full w-[2px] bg-[#E6D9C8] md:left-[50%] md:top-[15px] md:h-[2px] md:w-full">
                <div 
                  className={`h-full bg-[#7C4E2F] transition-all duration-1000 ${step.status === 'completed' ? 'w-full' : 'w-0'}`} 
                  style={{ height: step.status === 'completed' ? '100%' : '0' }}
                />
              </div>
            )}

            {/* Icon/Circle */}
            <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors duration-500 ${step.status === 'completed' ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : step.status === 'current' ? 'border-[#7C4E2F] bg-white' : 'border-[#E6D9C8] bg-white'}`}>
              {step.status === 'completed' ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <div className={`h-2 w-2 rounded-full ${step.status === 'current' ? 'bg-[#7C4E2F] animate-pulse' : 'bg-[#E6D9C8]'}`} />
              )}
            </div>

            {/* Label and Detail */}
            <div className="space-y-1.5 md:text-center">
              <div className="flex items-center gap-2 md:justify-center">
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${step.status !== 'upcoming' ? 'text-[#2B2119]' : 'text-[#8C7A6B]'}`}>
                  {step.label}
                </span>
                {step.date && (
                  <span className="text-[9px] text-[#8C7A6B]">{step.date}</span>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-[#6B594A] md:px-2">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
