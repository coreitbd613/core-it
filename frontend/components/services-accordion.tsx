import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

interface ServicesAccordionProps {
  className?: string;
}

const serviceImages: Partial<Record<string, string>> = {
  "Web Development": "/website-development.jpeg",
  "Mobile App Development": "/mobile-app-development.webp",
  "E-Commerce": "/e-commerce-development.webp",
  "Domain & Hosting": "/domain-hosting-odepe.png",
  "Search Engine Optimization": "/SEO.png",
  "Digital Marketing": "/digital_marketing_strategies-1.webp",
  "Design & Branding": "/branding.webp",
};

const ServicesAccordion = ({ className }: ServicesAccordionProps) => {
  return (
    <section
      id="services"
      className={cn("relative z-10 bg-background py-32", className)}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-medium text-foreground md:text-6xl">
            Featured Services
          </h2>
          <p className="mt-4 max-w-xl text-base tracking-tight text-muted-foreground">
            Core IT offers comprehensive digital solutions to help your business
            grow. From web development to mobile apps, Core IT delivers quality
            results that exceed expectations.
          </p>
        </div>

        <div className="border-t border-border">
          {services.map((service) => {
            const image = serviceImages[service.title];

            return (
              <div key={service.title} className="group border-b border-border">
                <div className="flex flex-col-reverse gap-6 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
                  <div
                    className={cn(
                      "relative w-full shrink-0 overflow-hidden rounded-2xl lg:order-2",
                      image
                        ? "h-56 lg:h-48 lg:w-80"
                        : "flex h-40 items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-brand-navy/10 lg:h-28 lg:w-28"
                    )}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:group-hover:scale-105"
                        sizes="(min-width: 1024px) 20rem, 100vw"
                      />
                    ) : (
                      <service.icon className="size-10 text-primary lg:size-8" />
                    )}
                  </div>

                  <div className="lg:order-1">
                    <h3 className="text-2xl font-bold text-foreground transition-colors duration-500 ease-out sm:text-3xl lg:group-hover:text-primary">
                      {service.title}
                    </h3>

                    <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr]">
                      <div className="overflow-hidden">
                        <div className="translate-y-0 opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:delay-100">
                          <p className="mt-4 max-w-md text-muted-foreground">
                            {service.description}
                          </p>
                          {service.href && (
                            <Link
                              href={service.href}
                              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                            >
                              Read more
                              <ArrowUpRight className="size-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { ServicesAccordion };
