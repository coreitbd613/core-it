"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ServiceProps = {
  title: string;
  image: string;
  url: string;
};

const services: ServiceProps[] = [
  {
    title: "Web Development",
    image: "/web-development.png",
    url: "",
  },
  {
    title: "Mobile App Development",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-gDmVqxZt1hg-unsplash.jpg",
    url: "",
  },
  {
    title: "UI/UX Design",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-9__Q24sJqKg-unsplash.jpg",
    url: "",
  },
  {
    title: "Digital Marketing",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-duxeKbu9FDE-unsplash.jpg",
    url: "",
  },
  {
    title: "Cloud Solutions",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-5oYbG-sEImY-unsplash.jpg",
    url: "",
  },
];

interface Services12Props {
  className?: string;
}

const Services12 = ({ className }: Services12Props) => {
  return (
    <section
      id="services"
      className={cn("relative z-10 bg-background py-32", className)}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col">
          <h2 className="mb-4 text-4xl font-medium text-foreground md:text-6xl">
            Featured Services
          </h2>
          <p className="w-72 text-base tracking-tight text-muted-foreground">
            We offer comprehensive digital solutions to help your business
            grow. From web development to mobile apps, we deliver quality
            results that exceed expectations.
          </p>
          <Button variant="outline"  className="mt-8 w-fit">
            View all services <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Featured - spans 2 of 3 columns */}
          <motion.a
            href={services[0].url}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group block overflow-hidden rounded-xl border border-border/60 lg:col-span-2"
          >
            <Card className="relative aspect-[4/3] overflow-hidden rounded-xl border-0 p-0 shadow-xl ring-0 transition-shadow duration-300 group-hover:shadow-2xl lg:aspect-auto lg:h-[26rem]">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 border-b border-white/10 bg-black/30 px-3.5 py-2.5 backdrop-blur-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <img
                src={services[0].image}
                alt={services[0].title}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <CardContent className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="pr-4 font-semibold text-white">
                  {services[0].title}
                </div>
              </CardContent>
              <ArrowUpRight className="absolute top-14 right-6 h-6 w-6 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Card>
          </motion.a>

          {/* Second - 1 of 3 columns, same row/height as featured */}
          <motion.a
            href={services[1].url}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="group block overflow-hidden rounded-xl border border-border/60"
          >
            <Card className="relative aspect-[4/3] overflow-hidden rounded-xl border-0 p-0 shadow-xl ring-0 transition-shadow duration-300 group-hover:shadow-2xl lg:aspect-auto lg:h-[26rem]">
              <img
                src={services[1].image}
                alt={services[1].title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <CardContent className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="pr-4 font-semibold text-white">
                  {services[1].title}
                </div>
              </CardContent>
              <ArrowUpRight className="absolute top-6 right-6 h-6 w-6 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Card>
          </motion.a>

          {/* Remaining 3 - evenly split across the row below */}
          {services.slice(2).map((service, idx) => (
            <motion.a
              key={idx + 2}
              href={service.url}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group block overflow-hidden rounded-xl border border-border/60"
            >
              <Card className="relative aspect-[4/3] overflow-hidden rounded-xl border-0 p-0 shadow-xl ring-0 transition-shadow duration-300 group-hover:shadow-2xl">
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <CardContent className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="pr-4 text-sm font-semibold text-white">
                    {service.title}
                  </div>
                </CardContent>
                <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Card>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Services12 };
