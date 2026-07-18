import { cn } from "@/lib/utils";

interface WhatWeDoProps {
  className?: string;
}

const WhatWeDo = ({ className }: WhatWeDoProps) => {
  return (
    <section
      id="about"
      className={cn("relative z-10 border-t border-border bg-background py-32", className)}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-4xl font-medium text-foreground md:text-5xl">
          What We Do
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Core IT is a software development company based in Bangladesh. We design
          and build websites, mobile apps, and e-commerce platforms for clients,
          and we also build and operate our own CRM &amp; ERP software product —
          a business management platform where companies create an account, invite
          their team, and manage proposals, contracts, projects, invoicing, and
          domain hosting all in one place. We also offer domain registration,
          VPS hosting, SEO, and digital marketing services.
        </p>
      </div>
    </section>
  );
};

export { WhatWeDo };
