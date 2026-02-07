export const HealthDisclaimer = ({ compact = false }) => {
  if (compact) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center px-4 py-2">
        Temple Keepers does not provide medical advice. Always consult a healthcare professional before starting any fasting, dietary, or wellness programme.
      </p>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200/30 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-4 text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed">
      <p className="font-semibold mb-1">Health & Wellness Disclaimer</p>
      <p>
        Temple Keepers is a faith-based wellness platform for educational and inspirational purposes only. 
        It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your 
        doctor or qualified healthcare provider before starting any fasting programme, dietary changes, or 
        wellness routine — especially if you have existing health conditions, are pregnant, or are taking medication.
      </p>
    </div>
  )
}
