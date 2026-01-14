"use client";

import * as React from "react";
import SignUpButton from "@/views/Home/components/SignUpButton";

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

type Props = {
  title?: string;
  subtitle?: string;
  contactEmail?: string;
  onSubmit?: (values: Values) => Promise<void> | void;
};

export function ContactForm({
  title = "Get in Touch",
  subtitle = "Based in California",
  contactEmail = "contact@linkedspaces.com",
  onSubmit,
}: Props) {
  const [values, setValues] = React.useState<Values>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
      // 필요하면 성공 후 초기화:
      // setValues({ firstName: "", lastName: "", email: "", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full mr-[50px]">
      <h2 className="text-3xl font-semibold [font-family:var(--font-poppins)]">
        {title}
      </h2>
      <p className="text-base font-bold [font-family:var(--font-montserrat)]">
        {subtitle}
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <label className="block">
            <span className="mb-2 block text-[12px] font-medium text-neutral-700">
              First Name
            </span>
            <input
              value={values.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              className="h-10 w-full rounded-[3px] border border-neutral-400 bg-white px-3 text-[14px] outline-none transition focus:border-black-600 focus:ring-2 focus:ring-black-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[12px] font-medium text-neutral-700">
              Last Name
            </span>
            <input
              value={values.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              className="h-10 w-full rounded-[3px] border border-neutral-400 bg-white px-3 text-[14px] outline-none transition focus:border-black-600 focus:ring-2 focus:ring-black-200"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-[12px] font-medium text-neutral-700">
            Email <span>*</span>
          </span>
          <input
            type="email"
            required
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            className="h-10 w-full rounded-[5px] border border-neutral-400 bg-white px-3 text-[14px] outline-none transition focus:border-black-600 focus:ring-2 focus:ring-black-200"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-[12px] font-medium text-neutral-700">
            Message
          </span>
          <textarea
            value={values.message}
            onChange={(e) => setField("message", e.target.value)}
            rows={6}
            className="w-full resize-none rounded-[5px] border border-neutral-400 bg-white px-3 py-2 text-[14px] outline-none transition focus:border-black-600 focus:ring-2 focus:ring-black-200"
          />
        </label>

        <SignUpButton type="submit" className="rounded-none mt-5">
          Send
        </SignUpButton>
      </form>

      <p className="text-base font-bold [font-family:var(--font-montserrat)] mt-5 ">
        {contactEmail}
      </p>
    </div>
  );
}
