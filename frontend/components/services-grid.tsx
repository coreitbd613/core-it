import { Card, CardContent } from "@/components/ui/card";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";

interface ServicesGridProps {
  className?: string;
}

const ServicesGrid = ({ className }: ServicesGridProps) => {
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
            We offer comprehensive digital solutions to help your business
            grow. From web development to mobile apps, we deliver quality
            results that exceed expectations.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {services.map((service) => (
            <Card
              key={service.title}
              className="rounded-2xl py-6 shadow-none transition-colors hover:bg-muted/40 sm:py-8"
            >
              <CardContent className="flex flex-col gap-4 sm:gap-5">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
                  <service.icon className="size-5 sm:size-7" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground sm:text-lg">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export { ServicesGrid };
