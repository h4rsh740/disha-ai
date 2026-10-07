import { useEffect, useRef, useState, type CSSProperties } from "react";

export type KiboriLandingPageProps = { className?: string; style?: CSSProperties };

export function KiboriLandingPage({ className = "", style }: KiboriLandingPageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [documentVisible, setDocumentVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  const [hostVisible, setHostVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry?.isIntersecting ?? true;
      setHostVisible(visible);
      if (!visible) setReady(false);
    }, { rootMargin: "80px" });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const update = () => {
      const visible = !document.hidden;
      setDocumentVisible(visible);
      if (!visible) setReady(false);
    };
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const mounted = hostVisible && documentVisible;

  return (
    <div ref={hostRef} className={`threeui-background kibori-landing-page${className ? ` ${className}` : ""}`} role="group" aria-label="Interactive Kibori landing page" data-state={!mounted ? "paused" : ready ? "ready" : "loading"} style={{ position: "relative", overflow: "hidden", background: "#0a0806", pointerEvents: "auto", ...style }} suppressHydrationWarning>
      {mounted ? (
        <iframe title="Kibori" src="/landing-pages/kibori.html" sandbox="allow-scripts" loading="eager" onLoad={() => setReady(true)} style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", border: 0, background: "#0a0806", opacity: ready ? 1 : 0, pointerEvents: ready ? "auto" : "none", transition: "opacity 240ms ease-out" }} />
      ) : null}
    </div>
  );
}
