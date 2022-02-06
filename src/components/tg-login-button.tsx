import { FC, HTMLAttributes, useEffect, useRef } from 'react'

export type TGUser = {
  auth_date: number
  first_name: string
  last_name?: string
  hash: string
  id: number
  photo_url?: string
  username?: string
}

type Props = {
  botName: string
  buttonSize: 'large' | 'medium' | 'small'
  cornerRadius?: number
  onAuthCallback?: (user: TGUser) => void
  redirectUrl?: string
  requestAccess?: 'write'
  usePic?: boolean
  lang?: string
} & HTMLAttributes<HTMLDivElement>

const _window: any = window

const TelegramLoginButton: FC<Props> = (props) => {
  const {
    botName,
    buttonSize = 'medium',
    cornerRadius = 0,
    requestAccess,
    usePic,
    onAuthCallback,
    redirectUrl,
    lang,
    ...rest
  } = props
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!_window.Telegram) {
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?15'
      script.async = true

      script.setAttribute('data-telegram-login', botName)
      if (buttonSize) script.setAttribute('data-size', buttonSize)
      if (`${cornerRadius}`) script.setAttribute('data-radius', `${cornerRadius}`)
      if (usePic) script.setAttribute('data-userpic', `${usePic}`)
      if (lang) script.setAttribute('data-lang', lang)
      if (requestAccess) script.setAttribute('data-request-access', requestAccess)
      if (redirectUrl) script.setAttribute('data-auth-url', redirectUrl)

      if (onAuthCallback) {
        script.setAttribute('data-onauth', 'TelegramOnAuthCb(user)')
        _window.TelegramOnAuthCb = (user: TGUser) => onAuthCallback(user)
      }

      containerRef.current?.appendChild(script)
    }
  }, [])

  return <div ref={containerRef} {...rest} />
}

export default TelegramLoginButton
