import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ContactForm } from "@/components/ContactForm";
import { getProperty } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Enquire with SAparts to book a serviced apartment.",
};

const DESKS = [
  { label: "Book a residence", email: "enquiry@serviceapartment.hk" },
  { label: "Corporate mobility", email: "enquiry@serviceapartment.hk" },
  { label: "Operator partnerships", email: "enquiry@serviceapartment.hk" },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const { listing: slug } = await searchParams;
  const property = slug ? getProperty(slug) : undefined;
  const defaultMessage = property
    ? `I would like to book ${property.name}${property.neighborhood ? ` in ${property.neighborhood}` : ""}.\n\nMove-in date:\nLength of stay:\nGuests:\n`
    : "";

  return (
    <div>
      <Breadcrumb items={[{ label: "Contact" }]} />
      <section className="hairline-bottom">
        <div className="container py-14 lg:py-24 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="section-mark">Contact</span>
            <h1 className="display text-[3rem] sm:text-[5rem] mt-5">
              Book
              <br />
              <em>with us.</em>
            </h1>
            <p className="mt-6 font-serif text-[1.1rem] text-muted-foreground max-w-lg leading-relaxed">
              {property
                ? `Enquiry for ${property.name}. We handle the booking. You do not need to contact the operator.`
                : "Tell us the city, dates, and who is staying. We handle the booking. You do not need to contact the operator."}
            </p>
          </div>
          <div className="lg:col-span-5 space-y-3">
            {DESKS.map((d) => (
              <div key={d.label} className="paper p-4 flex justify-between gap-4">
                <span className="tracker-muted">{d.label}</span>
                <a href={`mailto:${d.email}`} className="text-sm hover:text-forest">
                  {d.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="container py-14 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <span className="section-mark">§ 01</span>
            <h2 className="display text-[2rem] mt-4">Send a message.</h2>
            <p className="mt-4 text-sm text-muted-foreground">We respond within two business days.</p>
          </div>
          <div className="lg:col-span-8">
            <ContactForm
              source={property ? `booking:${property.slug}` : "contact"}
              defaultSubject="booking"
              defaultMessage={defaultMessage}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
