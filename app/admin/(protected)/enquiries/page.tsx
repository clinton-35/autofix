import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireOwner } from "@/lib/auth";
import { fmtDateTime } from "@/lib/format";
import { waLink } from "@/lib/utils";
import { deleteEnquiry, setRead } from "./actions";

export const metadata = { title: "Enquiries" };

const small =
  "px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors";

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const { supabase } = await requireOwner();
  const unreadOnly = filter === "unread";

  let q = supabase
    .from("enquiries")
    .select("id, customer_name, contact, message, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (unreadOnly) q = q.eq("is_read", false);

  const { data } = await q;
  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold uppercase tracking-tight">Enquiries</h1>

      <div className="mt-6 flex gap-2">
        <Link
          href="/admin/enquiries"
          className={`${small} ${!unreadOnly ? "bg-charcoal text-white" : "bg-white hover:bg-black/5"}`}
        >
          All
        </Link>
        <Link
          href="/admin/enquiries?filter=unread"
          className={`${small} ${unreadOnly ? "bg-charcoal text-white" : "bg-white hover:bg-black/5"}`}
        >
          Unread
        </Link>
      </div>

      <div className="mt-6 space-y-4">
        {rows.length === 0 && (
          <p className="bg-white p-8 text-center text-sm text-charcoal/60">
            {unreadOnly ? "No unread messages." : "No enquiries yet."}
          </p>
        )}

        {rows.map((e) => {
          const isEmail = e.contact.includes("@");
          const digits = e.contact.replace(/\D/g, "");
          const isPhone = !isEmail && digits.length >= 9;
          const wa = isPhone
            ? waLink(
                e.contact,
                `Hello ${e.customer_name}, thank you for contacting us.`
              )
            : null;

          return (
            <article
              key={e.id}
              className={`bg-white p-6 ${e.is_read ? "" : "border-l-4 border-brand"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {e.customer_name}
                    {!e.is_read && (
                      <span className="ml-3 bg-brand px-2 py-0.5 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm">
                    {isEmail ? (
                      <a href={`mailto:${e.contact}`} className="underline underline-offset-4">
                        {e.contact}
                      </a>
                    ) : isPhone ? (
                      <a href={`tel:${e.contact.replace(/\s/g, "")}`} className="underline underline-offset-4">
                        {e.contact}
                      </a>
                    ) : (
                      e.contact
                    )}
                  </p>
                </div>
                <p className="text-xs text-charcoal/50">
                  {fmtDateTime(e.created_at)}
                </p>
              </div>

              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-charcoal/80">
                {e.message}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${small} bg-[#25D366] text-white hover:opacity-90`}
                  >
                    WhatsApp
                  </a>
                )}
                {isEmail && (
                  <a
                    href={`mailto:${e.contact}`}
                    className={`${small} border border-charcoal hover:bg-charcoal hover:text-white`}
                  >
                    Reply by email
                  </a>
                )}

                <form action={setRead}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="read" value={e.is_read ? "false" : "true"} />
                  <button
                    type="submit"
                    className={`${small} border border-charcoal hover:bg-charcoal hover:text-white`}
                  >
                    {e.is_read ? "Mark as unread" : "Mark as read"}
                  </button>
                </form>

                <form action={deleteEnquiry}>
                  <input type="hidden" name="id" value={e.id} />
                  <ConfirmButton
                    message="Delete this enquiry permanently?"
                    className={`${small} border border-brand text-brand hover:bg-brand hover:text-white`}
                  >
                    Delete
                  </ConfirmButton>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}