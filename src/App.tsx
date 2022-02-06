import { useState } from 'react'

import TGLoginButton, { TGUser } from './components/tg-login-button'

const baseUrl = import.meta.env.VITE_FIREBASE_FUNC_URL || 'http://localhost:5001/firebase-custom-oauth/us-central1'
const TELEGRAM_LOGIN_URL = baseUrl + '/telegramLogin'

function App() {
  const [data, setData] = useState<unknown>()
  const [error, setError] = useState<unknown>()

  const handleAuth = async (user?: TGUser) => {
    setData('')
    setError('')
    try {
      const res = await fetch(TELEGRAM_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })
      if (res.status != 200) {
        setError(`${res.status}: ${res.statusText}`)
      } else {
        res.json().then((data) => setData(data))
      }
    } catch (err) {
      setError(err || 'Something went wrong...')
    }
  }

  return (
    <main className='flex items-center justify-center w-screen h-screen bg-slate-800'>
      <div className='container flex flex-col items-center max-w-sm space-y-5'>
        <h1 className='text-3xl font-bold underline text-cyan-300 decoration-cyan-200'>Hello world!</h1>

        <TGLoginButton
          botName='test_telegram_login_bot'
          buttonSize='medium'
          lang='en'
          onAuthCallback={(user) => handleAuth(user)}
        />

        {error && <p className='italic text-pink-300'>{JSON.stringify(error, null, 2)}</p>}

        {!!data && (
          <pre className='max-w-md px-5 py-3 overflow-auto border rounded-lg bg-slate-900 border-cyan-300 text-cyan-50'>
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        )}
      </div>
    </main>
  )
}

export default App
