import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Shared layout shell for /login, /signup, /account/password, etc.
// Single source of typography + max-width so the auth surfaces all
// land at the same visual register without needing each page to
// re-do the same eyebrow + h1 + card frame.
export function AuthCard({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main>
      <Container size="narrow">
        <div className="pt-12 sm:pt-16 pb-6">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-display italic text-burgundy font-medium tracking-tight m-0 mt-2 mb-3 text-[36px] sm:text-[48px] leading-tight">
            {title}
          </h1>
          {intro && (
            <p className="text-base text-warm-700 leading-relaxed max-w-[520px] m-0">
              {intro}
            </p>
          )}
        </div>
        <div className="card-surface p-6 sm:p-7 max-w-[480px]">
          {children}
        </div>
        <div className="h-16" />
      </Container>
    </main>
  );
}
