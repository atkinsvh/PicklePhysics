import Image from "next/image";
import { type ReactNode } from "react";
interface CalloutProps {
  title?: string;
  children: ReactNode;
  icon?: string;
}
function CalloutBase({
  title,
  children,
  icon,
  borderColor,
  bgColor,
}: CalloutProps & { borderColor: string; bgColor: string }) {
  return (
    <div
      className={`border-l-4 rounded-r-lg p-4 my-6 ${borderColor} ${bgColor}`}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-2">
          {icon && (
            <Image
              src={icon}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5"
            />
          )}
          {title && (
            <h4 className="font-semibold text-sm text-foreground">{title}</h4>
          )}
        </div>
      )}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
export function ImportantNote({ title = "Important Note", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/important-note-icon-v01-01.png"
      borderColor="border-pickle-green"
      bgColor="bg-pickle-lighter"
    >
      {children}
    </CalloutBase>
  );
}
export function Definition({ title = "Definition", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/definition-icon-v01-01.png"
      borderColor="border-pickle-green"
      bgColor="bg-pickle-light/50"
    >
      {children}
    </CalloutBase>
  );
}
export function Warning({ title = "Warning", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/warning-icon-v01-01.png"
      borderColor="border-amber-500"
      bgColor="bg-amber-50"
    >
      {children}
    </CalloutBase>
  );
}
export function Example({ title = "Example", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/example-icon-v01-01.png"
      borderColor="border-purple-500"
      bgColor="bg-purple-50"
    >
      {children}
    </CalloutBase>
  );
}
export function KeyConcept({ title = "Key Concept", children }: { title?: string; children: ReactNode }) {
  return (
    <div className="my-6 border border-pickle-dark rounded-lg bg-pickle-lighter p-5 relative overflow-hidden">
      <div className="absolute top-2 right-2 opacity-20">
        <Image
          src="/stickers/pickle-showing-a-key-concept-v01-01.png"
          alt=""
          width={64}
          height={64}
        />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Image
          src="/images/interface/important-note-icon-v01-01.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
        />
        <h4 className="font-semibold text-sm text-pickle-dark">{title}</h4>
      </div>
      <div className="text-sm leading-relaxed relative z-10">{children}</div>
    </div>
  );
}
export function Question({ title = "Question", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/question-icon-v01-01.png"
      borderColor="border-blue-400"
      bgColor="bg-blue-50"
    >
      {children}
    </CalloutBase>
  );
}
export function Answer({ title = "Answer", children }: { title?: string; children: ReactNode }) {
  return (
    <details className="my-4 group">
      <summary className="flex items-center gap-2 cursor-pointer px-4 py-3 border border-border rounded-lg hover:bg-pickle-lighter transition-colors">
        <Image
          src="/images/interface/answer-icon-v01-01.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
        />
        <span className="font-semibold text-sm text-foreground">{title}</span>
        <svg className="w-4 h-4 text-muted ml-auto transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </summary>
      <div className="mt-2 px-4 py-3 text-sm leading-relaxed border border-t-0 border-border rounded-b-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
        {children}
      </div>
    </details>
  );
}
export function Experiment({ title = "Experiment", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/experiment-icon-v01-01.png"
      borderColor="border-orange-400"
      bgColor="bg-orange-50"
    >
      {children}
    </CalloutBase>
  );
}
export function Summary({ title = "Summary", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/summary-icon-v01-01.png"
      borderColor="border-pickle-green"
      bgColor="bg-pickle-light"
    >
      {children}
    </CalloutBase>
  );
}
export function LearningObjectives({ title = "Learning Objectives", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/learning-objectives-icon-v01-01.png"
      borderColor="border-pickle-green"
      bgColor="bg-pickle-lighter"
    >
      {children}
    </CalloutBase>
  );
}
export function Vocabulary({ title = "Vocabulary", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/vocabulary-icon-v01-01.png"
      borderColor="border-teal-500"
      bgColor="bg-teal-50"
    >
      {children}
    </CalloutBase>
  );
}
