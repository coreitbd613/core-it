import Image from "next/image";
import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";

const officePhotos = [
  {
    src: "/office/1st.jpeg",
    alt: "Core IT team workspace beneath the Core Values wall",
    className: "sm:col-span-2 sm:row-span-2",
    priority: true,
  },
  {
    src: "/office/91f750ea-56dd-4c17-beb0-da1d20c4cda6.jpeg",
    alt: "Workstations beneath the 'Together we build something Bigger' wall",
    className: "sm:col-span-2",
  },
  {
    src: "/office/c3131351-285e-4177-935c-73d95ef68ccf.jpeg",
    alt: "A 'Work Hard, Dream Big' corner of the office",
    className: "",
  },
  {
    src: "/office/369bd4a3-58d1-460f-af67-952a62fcb5a6.jpeg",
    alt: "The team's lounge and break area",
    className: "",
  },
  {
    src: "/office/db1349bb-0ca0-4146-9f11-60e6ce806d87.jpeg",
    alt: "A quiet reading nook inside the office",
    className: "sm:col-span-2",
  },
  {
    src: "/office/0297f5bf-f349-4072-90ce-2e3fd501c580.jpeg",
    alt: "The office's focus and motivation wall, lined with books and plants",
    className: "",
  },
  {
    src: "/office/47311d36-b5f7-4d21-ab2e-051f3e05a207.jpeg",
    alt: "A quiet two-person desk with a view into the lounge",
    className: "",
  },
] as const;

interface OfficeGalleryProps {
  className?: string;
}

const OfficeGallery = ({ className }: OfficeGalleryProps) => {
  return (
    <section
      className={cn(
        "relative z-10 overflow-hidden border-t border-border bg-background py-32",
        className
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#FD6005]/40 bg-[#FD6005]/10 px-4 py-1.5 text-sm font-medium text-[#FD6005] backdrop-blur-sm">
            <Building2 className="size-4" />
            Inside Core IT
          </span>
          <h2 className="mt-6 text-balance text-4xl font-medium text-foreground md:text-6xl">
            A space built for{" "}
            <span className="text-[#FD6005]">focused work</span>
          </h2>
          <p className="mt-4 text-base tracking-tight text-muted-foreground">
            A look inside our Dhaka office, where the team designs, builds, and
            ships every project.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:auto-rows-[13rem] sm:grid-cols-4 lg:auto-rows-[15rem]">
          {officePhotos.map((photo) => (
            <div
              key={photo.src}
              className={cn(
                "group relative h-56 overflow-hidden rounded-2xl border border-border shadow-lg sm:h-auto",
                photo.className
              )}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority={"priority" in photo ? photo.priority : false}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { OfficeGallery };
