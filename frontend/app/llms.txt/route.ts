const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"

function buildLlmsTxt(): string {
  return `# CORE IT

> CORE IT delivers website development, mobile apps, AI automation, CRM & ERP, e-commerce, SEO, and more — professional software solutions for every business need. Core IT also builds and operates its own CRM/ERP product.

## Pages

- [Home](${SITE_URL}/): Overview of Core IT's services and products.
- [Web Development](${SITE_URL}/services/web-development): Custom websites and web apps.
- [Software Development](${SITE_URL}/services/software-development): Custom software built around your business.
- [Hosting](${SITE_URL}/hosting): VPS hosting plans and pricing.
- [Domains](${SITE_URL}/domains): Domain search and registration.
- [Contact](${SITE_URL}/contact): Get in touch with Core IT.
- [Sign up](${SITE_URL}/signup): Create a Core IT account.
- [Log in](${SITE_URL}/login): Sign in to an existing account.
- [Privacy Policy](${SITE_URL}/privacy): How Core IT collects, uses, and shares information.
- [Terms of Service](${SITE_URL}/terms): Terms governing use of Core IT's websites and services.

## Contact

- Email: info@coreitbd.com
- LinkedIn: https://www.linkedin.com/company/core-it-bd
`
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
