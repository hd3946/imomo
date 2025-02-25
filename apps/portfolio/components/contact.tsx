import { EmailIcon, GithubIcon, LinkedinIcon } from '@repo/ui/icons'
import Link from 'next/link'

export function Contact() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50" id="contact">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Get In Touch
        </h2>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Email Card */}
            <Link
              href="mailto:hd3946@naver.com"
              className="transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              aria-label="Send email to hd3946@naver.com"
            >
              <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg hover:shadow-xl">
                <div className="p-4 bg-blue-50 rounded-full">
                  <EmailIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Email</h3>
                <span className="sr-only">hd3946@naver.com</span>
              </div>
            </Link>

            {/* GitHub Card */}
            <Link
              href="https://github.com/hd3946"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              aria-label="Visit GitHub profile"
            >
              <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg hover:shadow-xl">
                <div className="p-4 bg-gray-50 rounded-full">
                  <GithubIcon className="w-8 h-8 text-gray-800" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">GitHub</h3>
                <span className="sr-only">github.com/hd3946</span>
              </div>
            </Link>

            {/* LinkedIn Card */}
            <Link
              href="https://linkedin.com/in/imomo2"
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              aria-label="Visit LinkedIn profile"
            >
              <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg hover:shadow-xl">
                <div className="p-4 bg-blue-50 rounded-full">
                  <LinkedinIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">LinkedIn</h3>
                <span className="sr-only">linkedin.com/in/imomo2</span>
              </div>
            </Link>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Send me a message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your message"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
