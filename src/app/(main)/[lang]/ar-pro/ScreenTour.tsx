"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Expand, X } from "lucide-react";
import { screenGroups, screens } from "./screens";
import styles from "./product.module.css";

type Lang = "ar" | "en";
type Group = keyof typeof screenGroups | "all";
const screenPath = (id: string) => "/images/ar-pro/" + id + ".webp";
const groups = Object.keys(screenGroups) as Array<keyof typeof screenGroups>;

export default function ScreenTour({ lang }: { lang: Lang }) {
  const ar = lang === "ar";
  const [group, setGroup] = useState<Group>("all");
  const [selected, setSelected] = useState("sales");
  const dialog = useRef<HTMLDialogElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const filtered = group === "all" ? screens : screens.filter((screen) => screen.group === group);
  const index = Math.max(0, filtered.findIndex((screen) => screen.id === selected));
  const active = filtered[index];
  const PrevIcon = ar ? ArrowRight : ArrowLeft;
  const NextIcon = ar ? ArrowLeft : ArrowRight;
  const change = (delta: number) => setSelected(filtered[(index + delta + filtered.length) % filtered.length].id);

  return (
    <section id="screens" className={styles.tour}>
      <div className={styles.wrap}>
        <div className={styles.sectionTitle}>
          <h2>{ar ? "شوف البرنامج من جوّه." : "See inside ar-pro."}</h2>
          <p>{ar ? "اختار الشاشة اللي تهمك. كل صورة من البرنامج وتقدر تفتحها بحجمها الكامل." : "Choose a screen to see the full application workspace and what you can do with it."}</p>
        </div>
        <div className={styles.filters} aria-label={ar ? "تصفية الشاشات" : "Filter screens"}>
          {(["all", ...groups] as Group[]).map((name) => (
            <button key={name} type="button" aria-pressed={group === name} onClick={() => setGroup(name)}>
              {name === "all" ? (ar ? "كل الشاشات" : "All screens") : screenGroups[name][lang]}
            </button>
          ))}
        </div>
        <div ref={viewer} className={styles.viewer} aria-label={ar ? "الشاشة المختارة" : "Selected screen"}>
          <div className={styles.viewerCopy}>
            <p className={styles.viewerGroup}>{screenGroups[active.group][lang]}</p>
            <h3>{active.title[lang]}</h3>
            <p>{active.detail[lang]}</p>
            <ul>{active.steps[lang].map((step) => <li key={step}><Check size={16} aria-hidden="true" /><span>{step}</span></li>)}</ul>
            <div className={styles.viewerNav}>
              <button type="button" aria-label={ar ? "الشاشة السابقة" : "Previous screen"} onClick={() => change(-1)}><PrevIcon size={18} /></button>
              <button type="button" aria-label={ar ? "الشاشة التالية" : "Next screen"} onClick={() => change(1)}><NextIcon size={18} /></button>
              <bdi aria-live="polite">{index + 1} / {filtered.length}</bdi>
            </div>
          </div>
          <button className={styles.primaryScreen} type="button" onClick={() => dialog.current?.showModal()} aria-label={(ar ? "تكبير شاشة " : "Enlarge ") + active.title[lang]}>
            <Image src={screenPath(active.id)} alt={active.title[lang]} width={1440} height={900} sizes="(max-width: 820px) 94vw, 65vw" loading="eager" unoptimized />
            <span><Expand size={15} aria-hidden="true" />{ar ? "عرض بالحجم الكامل" : "View full size"}</span>
          </button>
        </div>
        <div className={styles.screenGrid}>
          {filtered.map((screen) => (
            <button key={screen.id} className={styles.screenCard} type="button" aria-pressed={active.id === screen.id} onClick={() => {
              setSelected(screen.id);
              viewer.current?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
            }}>
              <Image src={screenPath(screen.id)} alt="" width={1440} height={900} sizes="(max-width: 700px) 44vw, (max-width: 980px) 29vw, 22vw" unoptimized />
              <span>{screen.title[lang]}</span>
            </button>
          ))}
        </div>
      </div>
      <dialog ref={dialog} className={styles.dialog} aria-label={active.title[lang]} onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}>
        <div className={styles.dialogInner}>
          <div><strong>{active.title[lang]}</strong><button autoFocus type="button" aria-label={ar ? "إغلاق الصورة" : "Close image"} onClick={() => dialog.current?.close()}><X size={22} /></button></div>
          <Image src={screenPath(active.id)} alt={active.title[lang]} width={1440} height={900} sizes="95vw" unoptimized />
        </div>
      </dialog>
    </section>
  );
}
