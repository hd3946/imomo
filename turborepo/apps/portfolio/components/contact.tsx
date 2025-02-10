import { EmailIcon, GithubIcon } from '@repo/ui/lib/icons'
import Link from 'next/link'

export function Contact() {
  return (
    <section className="p-24" id="contact">
      <h2 className="text-3xl font-bold mb-12 text-center">Contact</h2>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col items-center gap-2 p-6 border rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="font-semibold">Email</h3>
            <p className="text-sm text-muted-foreground">hd3946@naver.com</p>
          </div>
        </div>

        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact</h1>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <EmailIcon className="h-6 w-6 text-gray-500" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-lg text-gray-900">hd3946@naver.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <GithubIcon className="h-6 w-6 text-gray-500" />
                <div>
                  <label className="block text-sm font-medium text-gray-700">GitHub</label>
                  <Link href="https://github.com" className="mt-1 text-lg text-blue-500 hover:text-blue-700">
                    github.com/yourusername
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* <FaLinkedin className="h-6 w-6 text-gray-500" /> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                  <Link href="https://linkedin.com" className="mt-1 text-lg text-blue-500 hover:text-blue-700">
                    linkedin.com/in/yourusername
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
