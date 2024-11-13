'use client'

import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold">Welcome to StudySync</h1>
      {session ? (
        <p>Welcome, {session.user?.name || 'User'}</p>
      ) : (
        <p>Please sign in to access your dashboard.</p>
      )}
    </div>
  )
}
