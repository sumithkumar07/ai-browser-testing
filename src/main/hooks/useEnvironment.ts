export const useEnvironment = () => {
  const isElectron = typeof window !== 'undefined' && 
    typeof window.electronAPI !== 'undefined' && 
    window.electronAPI !== null

  const isWeb = !isElectron

  console.log('Phase 5: Environment detection:')
  console.log('  - typeof window:', typeof window)
  console.log('  - window.electronAPI exists:', typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined')
  console.log('  - window.electronAPI value:', typeof window !== 'undefined' ? window.electronAPI : 'no window')
  console.log('  - isElectron:', isElectron)
  console.log('  - isWeb:', isWeb)

  return {
    isElectron,
    isWeb
  }
}
