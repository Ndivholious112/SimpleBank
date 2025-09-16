import { useState, useEffect } from 'react'

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Consider it mobile if it's a mobile device OR has a small screen with touch capability
      const mobile = isMobileDevice || (isSmallScreen && isTouchDevice)
      
      setIsMobile(mobile)
      setIsLoading(false)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, isLoading }
}
