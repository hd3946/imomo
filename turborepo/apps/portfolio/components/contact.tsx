import { Button } from "@repo/ui/components/ui/button";

export function Contact() {
  return (
    <section className="container py-24" id="contact">
      <h2 className="text-3xl font-bold mb-12 text-center">Contact</h2>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="flex flex-col items-center gap-2 p-6 border rounded-lg">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24" 
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="font-semibold">Email</h3>
            <p className="text-sm text-muted-foreground">example@email.com</p>
          </div>

          <div className="flex flex-col items-center gap-2 p-6 border rounded-lg">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <h3 className="font-semibold">Phone</h3>
            <p className="text-sm text-muted-foreground">010-1234-5678</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg">
            GitHub
          </Button>
          <Button variant="outline" size="lg">
            LinkedIn
          </Button>
          <Button variant="outline" size="lg">
            Resume
          </Button>
        </div>
      </div>
    </section>
  );
}
