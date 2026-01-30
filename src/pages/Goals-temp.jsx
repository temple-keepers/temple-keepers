import { useTheme } from '../contexts/ThemeContext'

const Goals = () => {
  const { isDark } = useTheme()
  
  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-8">
      <div>
        <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Goals
        </h1>
        <p className={`text-sm mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Goals feature is being upgraded. Check back soon!
        </p>
      </div>
    </div>
  )
}

export default Goals
