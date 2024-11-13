import Image from 'next/image'

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-extrabold mb-4">Supercharge Your GPA</h1>
      <p className="text-xl mb-8 text-center max-w-lg">
        Atlas&apos;s AI studies your class materials to help you nail your homework and ace your tests.
      </p>
      <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full mb-4">
        Use Atlas — 100% free
      </button>
      <div className="flex space-x-4 mt-8">
        <div className="flex items-center">
          <Image src="/path/to/trusted-icon.png" alt="Trusted" width={32} height={32} />
          <span>Trusted by thousands of students</span>
        </div>
      </div>
    </div>
  )
} 