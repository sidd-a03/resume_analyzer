import { SectionHeading } from "@/components/shared/section-heading"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BlurFade } from "@/components/ui/blur-fade"

// TODO before launch: state the real retention period, and add the "Do you use my resume to
// train AI?" answer once the AI provider's data-use terms are confirmed.
const faqs = [
  {
    q: "What files can I upload?",
    a: "Text-based PDF resumes, up to 5 MB and a few pages. Scanned or image-only PDFs are not supported yet.",
  },
  {
    q: "Is my resume stored?",
    a: "Files are stored privately and deleted automatically after the retention period. You can delete them yourself any time.",
  },
  {
    q: "How do credits work?",
    a: "A full analysis costs 1 credit, adding a job description costs 1 more, and the free preview costs nothing. Credits never expire.",
  },
  { q: "What if an analysis fails?", a: "The credits are refunded automatically." },
  {
    q: "Is this an ATS simulator?",
    a: "No. We check for common ATS-friendly practices and give feedback, but nobody can promise a resume will pass every employer's system.",
  },
  { q: "How accurate is the AI feedback?", a: "It is guidance, not a guarantee. Use your own judgement." },
  {
    q: "Can I sign in with more than one account?",
    a: "Yes, you can link Google, GitHub and LinkedIn in Settings.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="section-y">
      <div className="container-page">
        <BlurFade inView>
          <SectionHeading eyebrow="FAQ" title="Questions, answered" align="center" />
        </BlurFade>
        <BlurFade inView delay={0.1} className="mx-auto mt-12 max-w-[720px]">
          <Accordion className="rounded-xl border bg-card px-5">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="cursor-pointer py-5 text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </BlurFade>
      </div>
    </section>
  )
}
