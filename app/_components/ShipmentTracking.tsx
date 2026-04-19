'use client'

import { getTrackingEntries } from '@/lib/orderTracking'

type ShipmentTrackingProps = {
  trackingStage?: string
  trackingUpdatedAt?: string | Date | null
}

export default function ShipmentTracking({ trackingStage, trackingUpdatedAt }: ShipmentTrackingProps) {
  const steps = getTrackingEntries({ trackingStage, trackingUpdatedAt })

  return (
    <div className="rounded-3xl border border-[#E6D9C8] bg-white p-6 md:p-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-4">
        {steps.map((step, idx) => (
          <div key={step.stage} className="relative flex flex-1 gap-4 md:flex-col md:items-center md:gap-6">
            {idx !== steps.length - 1 && (
              <div className="absolute left-[11px] top-10 h-full w-[2px] bg-[#E6D9C8] md:left-[50%] md:top-[15px] md:h-[2px] md:w-full">
                <div
                  className={`bg-[#7C4E2F] transition-all duration-1000 ${step.completed ? 'w-full md:h-full' : 'w-0 md:w-0'}`}
                  style={{ height: step.completed ? '100%' : '0' }}
                />
              </div>
            )}

            <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors duration-500 ${step.completed ? 'border-[#7C4E2F] bg-[#7C4E2F] text-white' : step.current ? 'border-[#7C4E2F] bg-white' : 'border-[#E6D9C8] bg-white'}`}>
              {step.completed ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <div className={`h-2 w-2 rounded-full ${step.current ? 'bg-[#7C4E2F] animate-pulse' : 'bg-[#E6D9C8]'}`} />
              )}
            </div>

            <div className="space-y-1.5 md:text-center">
              <div className="flex items-center gap-2 md:justify-center">
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${step.completed || step.current ? 'text-[#2B2119]' : 'text-[#8C7A6B]'}`}>
                  {step.label}
                </span>
                {step.updatedAt ? (
                  <span className="text-[9px] text-[#8C7A6B]">
                    {new Date(step.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] leading-relaxed text-[#6B594A] md:px-2">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
