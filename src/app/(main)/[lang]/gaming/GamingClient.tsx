"use client";

import { userApiFetch } from "@/lib/user-api-fetch";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface FoxreloadRegion {
  id: string;
  slug: string;
  name: string;
  inStockCount: number;
  hasProducts: boolean;
  bestOfferPrice?: string | null;
}

export interface FoxreloadBundle {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  inStockCount: number;
  imagePath?: string | null;
  thumbnailPath?: string | null;
  bestOfferPrice?: string | null;
  sectionId: string;
  regions: FoxreloadRegion[];
  isHidden?: boolean;
}

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  categoryId: string;
  categorySlug?: string;
  costPrice: number;
  price: number;
  currency: string;
  stock: number;
  minQty: number;
  maxQty?: number | null;
  deliveryType: string;
  isService: boolean;
  requiredNoteFields: string[];
  noteFieldOptions: Record<string, any>;
  noteFieldTypes: Record<string, string>;
  attributes?: Record<string, any>;
  userGuide?: string | null;
  imagePath?: string | null;
  thumbnailPath?: string | null;
  isHidden: boolean;
}

interface SectionData {
  id: string;
  nameAr: string;
  nameEn: string;
  icon?: string;
  bundles?: FoxreloadBundle[];
  items?: CatalogItem[];
}

interface CatalogResponse {
  isEnabled: boolean;
  defaultMargin: number;
  popularBundles?: FoxreloadBundle[];
  sections: {
    popular: SectionData;
    topups?: SectionData;
    appStores?: SectionData;
    gameCurrency?: SectionData;
    subscriptions?: SectionData;
    giftCards?: SectionData;
    esim?: SectionData;
    rewarble?: SectionData;
    games?: SectionData;
    services?: SectionData;
    telegram?: SectionData;
    steam?: SectionData;
  };
  totalBundlesCount?: number;
  updatedAt: string;
}

const CURRENCY_RATES: Record<string, { rate: number; symbolAr: string; symbolEn: string }> = {
  USD: { rate: 1.0, symbolAr: "$", symbolEn: "$" },
  EGP: { rate: 50.0, symbolAr: "ج.م", symbolEn: "EGP" },
  SAR: { rate: 3.75, symbolAr: "ر.س", symbolEn: "SAR" },
  AED: { rate: 3.67, symbolAr: "د.إ", symbolEn: "AED" },
  SDG: { rate: 600.0, symbolAr: "ج.س", symbolEn: "SDG" },
  EUR: { rate: 0.92, symbolAr: "€", symbolEn: "€" },
  GBP: { rate: 0.78, symbolAr: "£", symbolEn: "£" },
};

const SECTION_TABS = [
  { id: "popular", labelAr: "الأكثر شعبية", labelEn: "Most Popular", icon: "local_fire_department" },
  { id: "topups", labelAr: "شحن الألعاب المباشر", labelEn: "In-Game Top-Ups", icon: "sports_esports" },
  { id: "appStores", labelAr: "متاجر التطبيقات", labelEn: "App Stores", icon: "store" },
  { id: "gameCurrency", labelAr: "أكواد الألعاب", labelEn: "Game Codes", icon: "vpn_key" },
  { id: "subscriptions", labelAr: "الاشتراكات والترفيه", labelEn: "Subscriptions", icon: "subscriptions" },
  { id: "esim", labelAr: "شرائح الإنترنت eSIM", labelEn: "eSIM", icon: "sim_card" },
  { id: "rewarble", labelAr: "Rewarble", labelEn: "Rewarble", icon: "account_balance_wallet" },
];

const TAB_ALIAS_MAP: Record<string, string> = {
  popular: "popular",
  "الأكثر شعبية": "popular",
  "most-popular": "popular",
  "most popular": "popular",

  topups: "topups",
  games: "topups",
  "شحن الألعاب المباشر": "topups",
  "شحن الألعاب": "topups",
  "شحن مباشر": "topups",
  "in-game top-ups": "topups",
  "direct top-up": "topups",

  appstores: "appStores",
  "app-stores": "appStores",
  "app stores": "appStores",
  "متاجر التطبيقات": "appStores",
  "متاجر تطبيقات": "appStores",

  gamecurrency: "gameCurrency",
  "game-currency": "gameCurrency",
  "game currency": "gameCurrency",
  "أكواد الألعاب": "gameCurrency",
  "بطاقات الألعاب": "gameCurrency",
  "أكواد وبطاقات الألعاب": "gameCurrency",
  "game codes": "gameCurrency",

  subscriptions: "subscriptions",
  subscription: "subscriptions",
  "الاشتراكات والترفيه": "subscriptions",
  الاشتراكات: "subscriptions",

  esim: "esim",
  "شرائح الإنترنت esim": "esim",
  "شرائح الإنترنت": "esim",
  "شريحة esim": "esim",

  rewarble: "rewarble",
};

const ITEMS_PER_PAGE = 24;

const COUNTRY_CODE_MAP: Record<string, string> = {
  afghanistan: "af",
  albania: "al",
  algeria: "dz",
  andorra: "ad",
  angola: "ao",
  anguilla: "ai",
  "antigua and barbuda": "ag",
  argentina: "ar",
  armenia: "am",
  aruba: "aw",
  australia: "au",
  austria: "at",
  azerbaijan: "az",
  bahamas: "bs",
  bahrain: "bh",
  bangladesh: "bd",
  barbados: "bb",
  belarus: "by",
  belgium: "be",
  belize: "bz",
  benin: "bj",
  bermuda: "bm",
  bhutan: "bt",
  bolivia: "bo",
  bosnia: "ba",
  "bosnia and herzegovina": "ba",
  botswana: "bw",
  brazil: "br",
  brunei: "bn",
  bulgaria: "bg",
  "burkina faso": "bf",
  burundi: "bi",
  cambodia: "kh",
  cameroon: "cm",
  canada: "ca",
  "cape verde": "cv",
  "cayman islands": "ky",
  "central african republic": "cf",
  chad: "td",
  chile: "cl",
  china: "cn",
  colombia: "co",
  congo: "cg",
  "costa rica": "cr",
  croatia: "hr",
  cuba: "cu",
  cyprus: "cy",
  "czech republic": "cz",
  czechia: "cz",
  denmark: "dk",
  djibouti: "dj",
  dominica: "dm",
  "dominican republic": "do",
  ecuador: "ec",
  egypt: "eg",
  "el salvador": "sv",
  "equatorial guinea": "gq",
  eritrea: "er",
  estonia: "ee",
  eswatini: "sz",
  ethiopia: "et",
  fiji: "fj",
  finland: "fi",
  france: "fr",
  gabon: "ga",
  gambia: "gm",
  georgia: "ge",
  germany: "de",
  ghana: "gh",
  greece: "gr",
  grenada: "gd",
  guatemala: "gt",
  guinea: "gn",
  guyana: "gy",
  haiti: "ht",
  honduras: "hn",
  "hong kong": "hk",
  hungary: "hu",
  iceland: "is",
  india: "in",
  indonesia: "id",
  iran: "ir",
  iraq: "iq",
  ireland: "ie",
  israel: "il",
  italy: "it",
  "ivory coast": "ci",
  "côte d'ivoire": "ci",
  jamaica: "jm",
  japan: "jp",
  jordan: "jo",
  kazakhstan: "kz",
  kenya: "ke",
  kuwait: "kw",
  kyrgyzstan: "kg",
  laos: "la",
  latvia: "lv",
  lebanon: "lb",
  lesotho: "ls",
  liberia: "lr",
  libya: "ly",
  liechtenstein: "li",
  lithuania: "lt",
  luxembourg: "lu",
  macao: "mo",
  madagascar: "mg",
  malawi: "mw",
  malaysia: "my",
  maldives: "mv",
  mali: "ml",
  malta: "mt",
  mauritania: "mr",
  mauritius: "mu",
  mexico: "mx",
  moldova: "md",
  monaco: "mc",
  mongolia: "mn",
  montenegro: "me",
  morocco: "ma",
  mozambique: "mz",
  myanmar: "mm",
  namibia: "na",
  nepal: "np",
  netherlands: "nl",
  "new zealand": "nz",
  nicaragua: "ni",
  niger: "ne",
  nigeria: "ng",
  "north macedonia": "mk",
  norway: "no",
  oman: "om",
  pakistan: "pk",
  palestine: "ps",
  panama: "pa",
  paraguay: "py",
  peru: "pe",
  philippines: "ph",
  poland: "pl",
  portugal: "pt",
  qatar: "qa",
  romania: "ro",
  russia: "ru",
  rwanda: "rw",
  "saudi arabia": "sa",
  saudi: "sa",
  senegal: "sn",
  serbia: "rs",
  seychelles: "sc",
  "sierra leone": "sl",
  singapore: "sg",
  slovakia: "sk",
  slovenia: "si",
  somalia: "so",
  "south africa": "za",
  "south korea": "kr",
  korea: "kr",
  spain: "es",
  "sri lanka": "lk",
  sudan: "sd",
  suriname: "sr",
  sweden: "se",
  switzerland: "ch",
  syria: "sy",
  taiwan: "tw",
  tajikistan: "tj",
  tanzania: "tz",
  thailand: "th",
  togo: "tg",
  "trinidad and tobago": "tt",
  tunisia: "tn",
  turkey: "tr",
  "türkiye": "tr",
  turkmenistan: "tm",
  uganda: "ug",
  ukraine: "ua",
  "united arab emirates": "ae",
  uae: "ae",
  "united kingdom": "gb",
  uk: "gb",
  scotland: "gb-sct",
  "united states": "us",
  usa: "us",
  uruguay: "uy",
  uzbekistan: "uz",
  vanuatu: "vu",
  vatican: "va",
  "holy see": "va",
  "holy see vatican city state": "va",
  venezuela: "ve",
  vietnam: "vn",
  "virgin islands, british": "vg",
  "british virgin islands": "vg",
  yemen: "ye",
  zambia: "zm",
  zimbabwe: "zw",
  "åland islands": "ax",
  "cabo verde": "cv",
  "bonaire, sint eustatius and saba": "bq",
  bonaire: "bq",
  guadeloupe: "gp",
  guernsey: "gg",
  gibraltar: "gi",
  greenland: "gl",
  guam: "gu",
  jersey: "je",
  "curaçao": "cw",
  curacao: "cw",
  mayotte: "yt",
  martinique: "mq",
  montserrat: "ms",
  nauru: "nr",
  "new caledonia": "nc",
  "isle of man": "im",
  "turks and caicos islands": "tc",
  "turks and caicos": "tc",
  "puerto rico": "pr",
  "réunion": "re",
  reunion: "re",
  samoa: "ws",
  "san marino": "sm",
  "saint barthélemy": "bl",
  "saint barthelemy": "bl",
  "saint martin": "mf",
  "saint martin (french part)": "mf",
  "saint vincent and the grenadines": "vc",
  "saint vincent": "vc",
  "saint kitts and nevis": "kn",
  "saint kitts": "kn",
  "saint lucia": "lc",
  tonga: "to",
  "faroe islands": "fo",
  "french guiana": "gf",
  "french polynesia": "pf",
};

const BRAND_LOGOS: Record<string, string> = {
  steam: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/steam.png",
  telegram: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/telegram.png",
  apple: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/apple.png",
  itunes: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/apple.png",
  "google play": "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/google-play.png",
  playstation: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/playstation.png",
  psn: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/playstation.png",
  xbox: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/xbox.png",
  discord: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/discord.png",
  spotify: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/spotify.png",
  netflix: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/netflix.png",
  roblox: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/roblox.png",
  valorant: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/valorant.png",
  twitch: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/twitch.png",
  nintendo: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/nintendo-switch.png",
  razer: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/razer.png",
  rewarble: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/visa.png",
  adobe: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/adobe.png",
  youtube: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/youtube.png",
  amazon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/amazon.png",
  crunchyroll: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/crunchyroll.png",
  "business services": "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/microsoft-office.png",
  "microsoft 365": "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/microsoft-office.png",
  microsoft: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/microsoft-office.png",
  windows: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/windows.svg",
  pubg: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/pubg.svg",
  huawei: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/huawei.svg",
  tiktok: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tiktok.svg",
  tinder: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tinder.svg",
  deezer: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/deezer.png",
  hulu: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/hulu.png",
  surfshark: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/surfshark.png",
  bilibili: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/bilibili.png",
  tidal: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tidal.png",
  minecraft: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png",
  "epic games": "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/epic-games.png",
  "league of legends": "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/leagueoflegends.svg",
  riot: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/riotgames.svg",
  ea: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/ea.svg",
  paramount: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/paramountplus.svg",
};

export function getCountryFlag(name: string): string | null {
  if (!name) return null;
  const n = name.toLowerCase().trim();

  if (n.includes("europe") || n.includes("balkans")) {
    return "https://flagcdn.com/w160/eu.png";
  }
  if (
    n.includes("global") ||
    n.includes("worldwide") ||
    n.includes("world") ||
    n.includes("oceania") ||
    n.includes("asia") ||
    n.includes("africa") ||
    n.includes("middle east") ||
    n.includes("mena") ||
    n.includes("caribbean") ||
    n.includes("gcc") ||
    n.includes("gulf") ||
    n.includes("central asia") ||
    n.includes("south america") ||
    n.includes("north america") ||
    n.includes("physical sim")
  ) {
    return "https://flagcdn.com/w160/un.png";
  }

  if (COUNTRY_CODE_MAP[n]) {
    return `https://flagcdn.com/w160/${COUNTRY_CODE_MAP[n]}.png`;
  }

  for (const [country, code] of Object.entries(COUNTRY_CODE_MAP)) {
    if (
      n === country ||
      n.startsWith(country + " ") ||
      n.startsWith(country + "(") ||
      n.includes(" " + country) ||
      n.includes(country)
    ) {
      return `https://flagcdn.com/w160/${code}.png`;
    }
  }
  return null;
}

export function getServiceVisual(bundle: FoxreloadBundle | null): {
  imageUrl: string | null;
  isFlag: boolean;
  fallbackIcon: string;
} {
  if (!bundle) return { imageUrl: null, isFlag: false, fallbackIcon: "category" };

  if (bundle.imagePath && bundle.imagePath.trim()) {
    return { imageUrl: bundle.imagePath, isFlag: false, fallbackIcon: "category" };
  }
  if (bundle.thumbnailPath && bundle.thumbnailPath.trim()) {
    return { imageUrl: bundle.thumbnailPath, isFlag: false, fallbackIcon: "category" };
  }

  const flagUrl = getCountryFlag(bundle.name);
  if (bundle.sectionId === "esim" && flagUrl) {
    return { imageUrl: flagUrl, isFlag: true, fallbackIcon: "sim_card" };
  }

  const nameLower = bundle.name.toLowerCase();
  for (const [key, logoUrl] of Object.entries(BRAND_LOGOS)) {
    if (nameLower.includes(key)) {
      return { imageUrl: logoUrl, isFlag: false, fallbackIcon: "sports_esports" };
    }
  }

  if (flagUrl) {
    return { imageUrl: flagUrl, isFlag: true, fallbackIcon: "flag" };
  }

  return { imageUrl: null, isFlag: false, fallbackIcon: "sports_esports" };
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function GamingClient({
  lang,
  initialSectionParam,
}: {
  lang: string;
  initialSectionParam?: string;
}) {
  const isAr = lang === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [userSession, setUserSession] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0.0);
  const [currentCurrency, setCurrentCurrency] = useState<string>("USD");

  const [selectedBundle, setSelectedBundle] = useState<FoxreloadBundle | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<FoxreloadRegion | null>(null);
  const [regionProducts, setRegionProducts] = useState<CatalogItem[]>([]);
  const [loadingRegionProducts, setLoadingRegionProducts] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [packageSearch, setPackageSearch] = useState("");

  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [fieldInputs, setFieldInputs] = useState<Record<string, string>>({});
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const [completedOrderData, setCompletedOrderData] = useState<{
    orderId: string;
    status: string;
    codes?: string[];
    reply?: string;
    message: string;
  } | null>(null);

  const initialUrlCheckedRef = useRef(false);
  const dismissedBundleRef = useRef<string | null>(null);


  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    if (savedCurrency && CURRENCY_RATES[savedCurrency]) {
      setCurrentCurrency(savedCurrency);
    }

    const saved = localStorage.getItem("user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserSession(parsed);
        setUserBalance(parseFloat(parsed.balance || 0));

        if (parsed.email || parsed.id) {
          const token = localStorage.getItem("user_token");
          const queryParam = parsed.id
            ? `userId=${encodeURIComponent(parsed.id)}`
            : `email=${encodeURIComponent(parsed.email)}`;
          const headers: Record<string, string> = {};
          if (token && token !== "null" && token !== "undefined") {
            headers["Authorization"] = `Bearer ${token}`;
          }
          userApiFetch(`/api/users/profile?${queryParam}`, {
            headers,
            credentials: "include",
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.user) {
                setUserBalance(data.user.balance);
                const updatedSession = { ...parsed, balance: data.user.balance };
                localStorage.setItem("user_session", JSON.stringify(updatedSession));
              }
            })
            .catch(() => {});
        }
      } catch {}
    }
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/foxreload/catalog");
      const data = await res.json();
      if (res.ok && data.sections) {
        setCatalog(data);
      }
    } catch {
      console.error("Failed to load FoxReload catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSection, searchQuery]);

  const convertPrice = (priceUsd: number) => {
    const info = CURRENCY_RATES[currentCurrency] || CURRENCY_RATES.USD;
    const converted = priceUsd * info.rate;
    const formatted = currentCurrency === "USD" ? converted.toFixed(2) : Math.round(converted).toLocaleString();
    const symbol = isAr ? info.symbolAr : info.symbolEn;
    return `${formatted} ${symbol}`;
  };

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "esim":
        return "sim_card";
      case "topups":
      case "games":
        return "sports_esports";
      case "appStores":
      case "app-stores":
        return "store";
      case "gameCurrency":
      case "game-currency":
        return "vpn_key";
      case "subscriptions":
        return "subscriptions";
      case "rewarble":
        return "account_balance_wallet";
      default:
        return "category";
    }
  };

  const getSectionLabel = (sectionId: string) => {
    if (sectionId === "app-stores" || sectionId === "appStores") {
      return isAr ? "متاجر التطبيقات" : "App Stores";
    }
    if (sectionId === "game-currency" || sectionId === "gameCurrency") {
      return isAr ? "أكواد الألعاب" : "Game Codes";
    }
    const match = SECTION_TABS.find((t) => t.id === sectionId);
    if (match) return isAr ? match.labelAr : match.labelEn;
    return sectionId;
  };

  const allBundlesList = useMemo(() => {
    if (!catalog?.sections) return [];
    const set = new Map<string, FoxreloadBundle>();
    Object.values(catalog.sections).forEach((sec: any) => {
      if (sec && Array.isArray(sec.bundles)) {
        sec.bundles.forEach((b: FoxreloadBundle) => {
          if (!set.has(b.id)) {
            set.set(b.id, b);
          }
        });
      }
    });
    return Array.from(set.values());
  }, [catalog]);

  const getBundlesForTab = useCallback(
    (tabId: string): FoxreloadBundle[] => {
      if (!catalog?.sections) return [];
      if (tabId === "popular") {
        return catalog.popularBundles || catalog.sections.popular?.bundles || [];
      }
      const s = catalog.sections as any;
      const direct =
        s[tabId] ||
        (tabId === "appStores" ? s["app-stores"] : undefined) ||
        (tabId === "app-stores" ? s.appStores : undefined) ||
        (tabId === "gameCurrency" ? s["game-currency"] : undefined) ||
        (tabId === "game-currency" ? s.gameCurrency : undefined) ||
        Object.values(s).find((sec: any) => sec?.id === tabId);

      if (direct && Array.isArray(direct.bundles) && direct.bundles.length > 0) {
        return direct.bundles;
      }

      return allBundlesList.filter((b) => {
        const sid = (b.sectionId || "").toLowerCase();
        const t = tabId.toLowerCase();
        if (t === "topups") return sid === "topups" || sid === "games";
        if (t === "appstores" || t === "app-stores") return sid === "app-stores" || sid === "appstores";
        if (t === "gamecurrency" || t === "game-currency") return sid === "game-currency" || sid === "gamecurrency";
        if (t === "subscriptions") return sid === "subscriptions";
        if (t === "esim") return sid === "esim";
        if (t === "rewarble") return sid === "rewarble";
        return sid === t;
      });
    },
    [catalog, allBundlesList]
  );

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of SECTION_TABS) {
      counts[tab.id] = getBundlesForTab(tab.id).filter(
        (b) => !b.isHidden && (b.inStockCount > 0 || (b.regions && b.regions.length > 0))
      ).length;
    }
    return counts;
  }, [getBundlesForTab]);

  const currentBundles = useMemo(() => {
    if (!catalog?.sections) return [];

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return allBundlesList.filter((b) => {
        if (b.isHidden) return false;
        if (b.inStockCount <= 0 && (!b.regions || b.regions.length === 0)) return false;

        const matchName = b.name.toLowerCase().includes(q);
        const matchSlug = b.slug.toLowerCase().includes(q);
        const matchRegion = b.regions?.some((r) => r.name.toLowerCase().includes(q));
        return matchName || matchSlug || matchRegion;
      });
    }

    const rawList = getBundlesForTab(activeSection);
    return rawList.filter((b) => {
      if (b.isHidden) return false;
      if (b.inStockCount <= 0 && (!b.regions || b.regions.length === 0)) return false;
      return true;
    });
  }, [catalog, activeSection, searchQuery, allBundlesList, getBundlesForTab]);

  const totalItems = currentBundles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const paginatedBundles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return currentBundles.slice(start, start + ITEMS_PER_PAGE);
  }, [currentBundles, currentPage]);

  const loadRegionProducts = async (regionId: string) => {
    setLoadingRegionProducts(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/foxreload/category/${encodeURIComponent(regionId)}/products`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setRegionProducts(data.products);
        setSelectedProduct(null);
        setIsPurchaseModalOpen(false);
      } else {
        setRegionProducts([]);
        setSelectedProduct(null);
        setIsPurchaseModalOpen(false);
      }
    } catch {
      setErrorMessage(isAr ? "تعذر جلب باقات هذه المنطقة حالياً" : "Failed to load packages for this region");
      setRegionProducts([]);
      setSelectedProduct(null);
      setIsPurchaseModalOpen(false);
    } finally {
      setLoadingRegionProducts(false);
    }
  };

  const handleOpenPurchaseModal = (prod: CatalogItem) => {
    setSelectedProduct(prod);
    setOrderQuantity(Math.max(1, prod.minQty || 1));
    setFieldInputs({});
    setErrorMessage(null);
    setIsPurchaseModalOpen(true);
  };

  const handleClosePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
    setErrorMessage(null);
  };

  const handleOpenBundle = (bundle: FoxreloadBundle, updateUrl = true) => {
    dismissedBundleRef.current = null;
    setSelectedBundle(bundle);
    setSelectedProduct(null);
    setIsPurchaseModalOpen(false);
    setCountrySearch("");
    setPackageSearch("");
    setErrorMessage(null);

    if (updateUrl) {
      const newUrl = `${pathname}?section=${encodeURIComponent(bundle.name)}`;
      window.history.pushState({}, "", newUrl);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const regions = bundle.regions || [];
    if (regions.length > 0) {
      const preferred =
        regions.find((r) => {
          const n = r.name.toLowerCase();
          return n.includes("middle east") || n.includes("mena") || n.includes("global") || n.includes("saudi");
        }) || regions[0];

      setSelectedRegion(preferred);
      loadRegionProducts(preferred.id);
    } else {
      setSelectedRegion({
        id: bundle.id,
        slug: bundle.slug,
        name: "Global",
        inStockCount: bundle.inStockCount,
        hasProducts: true,
      });
      loadRegionProducts(bundle.id);
    }
  };

  const handleCloseBundle = () => {
    if (selectedBundle) {
      dismissedBundleRef.current = selectedBundle.name.toLowerCase();
    } else {
      dismissedBundleRef.current = "dismissed";
    }
    setSelectedBundle(null);
    setSelectedRegion(null);
    setSelectedProduct(null);
    setIsPurchaseModalOpen(false);
    setRegionProducts([]);
    setFieldInputs({});
    setErrorMessage(null);
    router.replace(pathname, { scroll: false });
    window.history.replaceState({}, "", pathname);
  };

  const handleTabClick = (tabId: string) => {
    dismissedBundleRef.current = "dismissed";
    setActiveSection(tabId);
    setSearchQuery("");
    setCurrentPage(1);
    if (selectedBundle) {
      setSelectedBundle(null);
      setSelectedRegion(null);
      setSelectedProduct(null);
      setIsPurchaseModalOpen(false);
      setRegionProducts([]);
    }
    window.history.replaceState({}, "", `${pathname}?section=${encodeURIComponent(tabId)}`);
  };

  const copyBundleLink = (e: React.MouseEvent, bundleName: string) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}${pathname}?section=${encodeURIComponent(bundleName)}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedNotification(bundleName);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  useEffect(() => {
    if (!catalog || allBundlesList.length === 0) return;

    let rawParam =
      searchParams.get("section") ||
      searchParams.get("bundle") ||
      searchParams.get("group") ||
      searchParams.get("search");

    if (!rawParam && !initialUrlCheckedRef.current && initialSectionParam) {
      rawParam = initialSectionParam;
    }
    initialUrlCheckedRef.current = true;

    if (!rawParam) {
      if (selectedBundle && dismissedBundleRef.current) {
        setSelectedBundle(null);
      }
      return;
    }

    let target = "";
    try {
      target = decodeURIComponent(rawParam).trim().toLowerCase();
    } catch {
      target = rawParam.trim().toLowerCase();
    }
    target = target.replace(/^%20/, "").trim();

    if (!target) return;

    // Check if target corresponds to a category tab
    const matchedTab =
      TAB_ALIAS_MAP[target] ||
      TAB_ALIAS_MAP[target.replace(/\s+/g, "-")] ||
      TAB_ALIAS_MAP[target.replace(/-/g, " ")];

    if (matchedTab) {
      setActiveSection(matchedTab);
      setSelectedBundle(null);
      return;
    }

    // Ignore if this bundle was explicitly closed by the user
    if (
      dismissedBundleRef.current &&
      (target === dismissedBundleRef.current ||
        target.includes(dismissedBundleRef.current) ||
        dismissedBundleRef.current === "dismissed")
    ) {
      return;
    }

    const exactMatch = allBundlesList.find(
      (b) => b.name.trim().toLowerCase() === target || b.slug.trim().toLowerCase() === target
    );

    if (exactMatch) {
      if (!selectedBundle || selectedBundle.id !== exactMatch.id) {
        handleOpenBundle(exactMatch, false);
      }
      return;
    }

    const partialMatch = allBundlesList.find((b) => {
      const bName = b.name.trim().toLowerCase();
      return bName.includes(target) || (target.length >= 4 && target.includes(bName));
    });

    if (partialMatch) {
      if (!selectedBundle || selectedBundle.id !== partialMatch.id) {
        handleOpenBundle(partialMatch, false);
      }
    }
  }, [catalog, searchParams, allBundlesList, initialSectionParam]);

  const handleSelectRegion = (region: FoxreloadRegion) => {
    setSelectedRegion(region);
    setPackageSearch("");
    loadRegionProducts(region.id);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldInputs((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmitPurchase = async () => {
    if (!selectedProduct) return;

    if (!userSession) {
      alert(isAr ? "يرجى تسجيل الدخول أولاً لإتمام عملية الشراء" : "Please log in first to complete your purchase");
      router.push(`/${lang}/login`);
      return;
    }

    if (Array.isArray(selectedProduct.requiredNoteFields) && selectedProduct.requiredNoteFields.length > 0) {
      for (const field of selectedProduct.requiredNoteFields) {
        if (!fieldInputs[field] || !fieldInputs[field].trim()) {
          setErrorMessage(
            isAr
              ? `يرجى إدخال ${getFieldLabel(field)} المطلوب بدقة`
              : `Please provide the required field: ${getFieldLabel(field)}`
          );
          return;
        }
      }
    }

    const totalPrice = Number((selectedProduct.price * orderQuantity).toFixed(2));
    if (userBalance < totalPrice) {
      setErrorMessage(
        isAr
          ? `رصيد محفظتك غير كافٍ. المطلوب: $${totalPrice.toFixed(2)} USD، المتاح: $${userBalance.toFixed(2)} USD.`
          : `Insufficient balance. Required: $${totalPrice.toFixed(2)} USD, Available: $${userBalance.toFixed(2)} USD.`
      );
      return;
    }

    setSubmittingOrder(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const primaryTarget =
        fieldInputs["account_id"] ||
        fieldInputs["player_id"] ||
        fieldInputs["user_id"] ||
        fieldInputs["username"] ||
        fieldInputs["email"] ||
        fieldInputs["phone"] ||
        Object.values(fieldInputs)[0] ||
        (selectedProduct.deliveryType === "code" ? "كود رقمي فوري" : "شحن مباشر");

      const res = await userApiFetch("/api/foxreload/order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: orderQuantity,
          targetInput: primaryTarget,
          notes: fieldInputs,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newBal = Math.max(0, Number((userBalance - totalPrice).toFixed(2)));
        setUserBalance(newBal);
        if (userSession) {
          const updatedSession = { ...userSession, balance: newBal };
          localStorage.setItem("user_session", JSON.stringify(updatedSession));
        }

        setIsPurchaseModalOpen(false);
        setCompletedOrderData({
          orderId: data.orderId,
          status: data.status,
          codes: data.codes,
          reply: data.reply,
          message: data.message || (isAr ? "تم تنفيذ طلبك وشحن الحساب بنجاح" : "Order processed successfully"),
        });
      } else {
        setErrorMessage(data.error || (isAr ? "فشل إتمام الطلب" : "Failed to place order"));
      }
    } catch {
      setErrorMessage(isAr ? "حدث خطأ أثناء الاتصال بالخادم" : "Connection error, please try again");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const getFieldLabel = (rawName: string) => {
    const key = rawName.toLowerCase();
    const map: Record<string, { ar: string; en: string }> = {
      account_id: { ar: "معرف الحساب / الآيدي (Player ID)", en: "Account ID / Player ID" },
      player_id: { ar: "معرف اللاعب (Player ID)", en: "Player ID" },
      user_id: { ar: "معرف الحساب (User ID)", en: "User ID" },
      server_id: { ar: "معرف السيرفر (Server ID / Zone ID)", en: "Server ID / Zone ID" },
      zone_id: { ar: "معرف المنطقة (Zone ID)", en: "Zone ID" },
      server: { ar: "السيرفر / المنطقة", en: "Server / Region" },
      username: { ar: "اسم المستخدم (Username - @user)", en: "Username (@user)" },
      email: { ar: "البريد الإلكتروني للحساب", en: "Account Email" },
      phone: { ar: "رقم الهاتف المسجل", en: "Phone Number" },
      character_name: { ar: "اسم الشخصية باللعبة", en: "Character Name" },
    };

    if (map[key]) {
      return isAr ? map[key].ar : map[key].en;
    }
    return rawName;
  };

  const filteredRegions = useMemo(() => {
    if (!selectedBundle?.regions) return [];
    if (!countrySearch.trim()) return selectedBundle.regions;
    const q = countrySearch.toLowerCase();
    return selectedBundle.regions.filter((r) => r.name.toLowerCase().includes(q));
  }, [selectedBundle, countrySearch]);

  const filteredProducts = useMemo(() => {
    if (!regionProducts) return [];
    if (!packageSearch.trim()) return regionProducts;
    const q = packageSearch.toLowerCase();
    return regionProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [regionProducts, packageSearch]);

  const selectedVisual = useMemo(() => {
    return getServiceVisual(selectedBundle);
  }, [selectedBundle]);

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface pb-24" dir={isAr ? "rtl" : "ltr"}>
      {/* Toast Notification for Link Copying */}
      {copiedNotification && (
        <div className="fixed bottom-6 left-6 z-50 bg-primary text-surface font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 border border-primary/40">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
          <span>
            {isAr
              ? `تم نسخ رابط صفحة قسم "${copiedNotification}" بنجاح!`
              : `Copied direct link for "${copiedNotification}"!`}
          </span>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-container-high/80 via-surface-container/50 to-surface border-b border-outline-variant/30 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>{isAr ? "شحن وتفعيل فوري 24/7" : "Instant Top-Up & Vouchers 24/7"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-on-surface">
            {isAr ? "شحن الألعاب والخدمات والبطاقات الرقمية" : "Gaming, Digital Vouchers & Subscriptions"}
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-on-surface-variant font-medium">
            {isAr
              ? "اختر لعبتك أو بطاقتك المفضلة، حدد دولتك وسيرفرك، ثم اختر الباقة المناسبة مع شحن وتفعيل مباشر من رصيد محفظتك المعتمد."
              : "Select your game or voucher, choose your country or region, and top up your account or receive instant digital keys directly from your wallet balance."}
          </p>

          {/* User Balance Quick Indicator */}
          {userSession && (
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-surface-container-highest/80 border border-outline-variant/40 backdrop-blur-md mt-2 shadow-sm">
              <span className="material-symbols-outlined text-emerald-400 text-xl">account_balance_wallet</span>
              <div className="text-xs">
                <span className="text-on-surface-variant">{isAr ? "رصيدك المتاح: " : "Available Balance: "}</span>
                <span className="font-extrabold text-on-surface font-mono mr-1">
                  ${userBalance.toFixed(2)} USD
                </span>
                <span className="text-on-surface-variant text-[11px] font-mono mr-1">
                  ({convertPrice(userBalance)})
                </span>
              </div>
              <Link
                href={`/${lang}/wallet`}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 mr-2"
              >
                <span>{isAr ? "شحن المحفظة" : "Top up"}</span>
                <span className="material-symbols-outlined text-sm">{isAr ? "arrow_back" : "arrow_forward"}</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ========================================================================= */}
        {/* STANDALONE SINGLE BUNDLE FULL-PAGE VIEW (MATCHING PRICING SECTION DESIGN) */}
        {/* ========================================================================= */}
        {selectedBundle ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Breadcrumb & Navigation Header Bar with Featured Image */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-surface-container/70 p-5 sm:p-7 rounded-3xl border border-outline-variant/30 backdrop-blur-md shadow-sm">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                {/* Large Service / Country Image Emblem */}
                {selectedVisual.imageUrl ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-container-highest/90 border border-primary/30 p-1 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                    <img
                      src={selectedVisual.imageUrl}
                      alt={selectedBundle.name}
                      className={
                        selectedVisual.isFlag
                          ? "w-full h-full object-cover rounded-xl shadow-xs"
                          : "w-full h-full object-contain rounded-xl"
                      }
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary">
                      {getSectionIcon(selectedBundle.sectionId)}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1.5">
                    <button onClick={handleCloseBundle} className="hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">
                        {isAr ? "arrow_forward" : "arrow_back"}
                      </span>
                      <span>{isAr ? "جميع الخدمات والألعاب" : "All Services"}</span>
                    </button>
                    <span>/</span>
                    <span className="text-on-surface-variant">{getSectionLabel(selectedBundle.sectionId)}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold text-on-surface">
                    {selectedBundle.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1 font-medium">
                    {isAr
                      ? `عرض متكامل لباقات وخدمات ${selectedBundle.name} (${selectedBundle.regions?.length || 1} دولة ومنطقة متاحة للشحن والتسليم الفوري)`
                      : `Standalone view for ${selectedBundle.name} (${selectedBundle.regions?.length || 1} regions ready for instant top-up)`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => copyBundleLink(e, selectedBundle.name)}
                  className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">share</span>
                  <span>{isAr ? "مشاركة رابط هذا القسم" : "Share Section Link"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseBundle}
                  className="btn-secondary py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base sm:text-lg">apps</span>
                  <span>{isAr ? "العودة لجميع الخدمات" : "Back to All"}</span>
                </button>
              </div>
            </div>

            {/* Region / Country Selector (Only displayed if bundle has multiple regions) */}
            {selectedBundle.regions && selectedBundle.regions.length > 1 && (
              <div className="bg-surface-container/60 border border-outline-variant/30 rounded-3xl p-5 sm:p-6 backdrop-blur-md space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">public</span>
                    <span>
                      {isAr ? "اختر الدولة أو السيرفر أو المنطقة أولاً:" : "Choose Country / Region / Server First:"}
                    </span>
                  </div>

                  {selectedBundle.regions.length > 6 && (
                    <div className="relative w-full sm:w-60">
                      <span className="material-symbols-outlined absolute right-3 top-2 text-on-surface-variant text-base">
                        search
                      </span>
                      <input
                        type="text"
                        placeholder={isAr ? "بحث في الدول..." : "Filter country..."}
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full pl-3 pr-9 py-1.5 bg-surface-container-highest border border-outline-variant/40 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto p-1">
                  {filteredRegions.map((region) => {
                    const isSelected = selectedRegion?.id === region.id;
                    const flag = getCountryFlag(region.name);
                    return (
                      <button
                        key={region.id}
                        type="button"
                        onClick={() => handleSelectRegion(region)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-primary text-on-primary shadow-md ring-2 ring-primary/40 scale-[1.02]"
                            : "bg-surface-container-highest hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                        }`}
                      >
                        {flag ? (
                          <img
                            src={flag}
                            alt={region.name}
                            className="w-4 h-3 object-cover rounded-xs shrink-0 shadow-xs border border-white/20"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-xs">
                            {region.name.toLowerCase().includes("global") ? "public" : "flag"}
                          </span>
                        )}
                        <span>{region.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isSelected ? "bg-black/25 text-white" : "bg-black/15 text-on-surface-variant"
                          }`}
                        >
                          {region.inStockCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Services & Packages Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container/50 p-4 sm:p-5 rounded-3xl border border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">category</span>
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-on-surface">
                    {isAr ? "الخدمات والباقات المتاحة للشحن المباشر" : "Available Services & Packages"}
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    {isAr
                      ? `اختر الخدمة المطلوبة واضغط عليها لفتح نافذة إدخال الآيدي والشراء (${filteredProducts.length} باقة)`
                      : `Click any service card to enter your player ID and complete checkout (${filteredProducts.length} items)`}
                  </span>
                </div>
              </div>

              {regionProducts.length > 4 && (
                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-base">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder={isAr ? "بحث في الباقات (GB, UC, Pass)..." : "Filter packages..."}
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-surface-container-highest border border-outline-variant/40 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              )}
            </div>

            {/* SERVICES CARDS GRID */}
            {loadingRegionProducts ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-3 bg-surface-container/30 rounded-3xl border border-outline-variant/30">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs sm:text-sm text-on-surface-variant font-medium">
                  {isAr ? "جاري تحميل خدمات وباقات هذا القسم..." : "Loading packages for this service..."}
                </span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-xs sm:text-sm text-on-surface-variant bg-surface-container/30 rounded-3xl border border-outline-variant/30 space-y-2">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
                <div className="font-bold text-on-surface">
                  {isAr
                    ? "لا توجد خدمات مطابقة لبحثك في هذه المنطقة"
                    : "No matching packages found for this region"}
                </div>
                <p>
                  {isAr
                    ? "يرجى مسح كلمة البحث أو اختيار دولة/منطقة أخرى من القائمة."
                    : "Please adjust search term or select another country/region."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((prod) => {
                  const prodImage = prod.imagePath || prod.thumbnailPath;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleOpenPurchaseModal(prod)}
                      className="group cursor-pointer bg-surface-container/60 hover:bg-surface-container-high/90 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 relative"
                    >
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          {/* Thumbnail / Delivery Badge */}
                          {prodImage ? (
                            <div className="w-12 h-12 rounded-xl bg-surface-container-highest p-1 border border-outline-variant/30 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                              <img
                                src={prodImage}
                                alt={prod.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          ) : selectedBundle.sectionId === "esim" ? (
                            <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center shrink-0 font-bold shadow-xs">
                              <span className="material-symbols-outlined text-xl">sim_card</span>
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs">
                              <span className="material-symbols-outlined text-xl">
                                {prod.deliveryType === "code" ? "vpn_key" : "sports_esports"}
                              </span>
                            </div>
                          )}

                          <div className="flex-1 space-y-1">
                            <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {prod.name}
                            </h4>
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>{isAr ? "تسليم فوري ومباشر" : "Instant Delivery"}</span>
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-on-surface-variant line-clamp-1 mb-2">
                          {prod.deliveryType === "code"
                            ? isAr
                              ? "كود رقمي فوري للشحن"
                              : "Instant digital redemption code"
                            : isAr
                            ? "شحن مباشر للحساب عبر الآيدي"
                            : "Direct account top-up via ID"}
                        </div>
                      </div>

                      {/* Price & Action Button */}
                      <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-base font-extrabold text-primary font-mono">
                            {convertPrice(prod.price)}
                          </div>
                          <div className="text-[10px] font-mono text-on-surface-variant">
                            ${prod.price.toFixed(2)} USD
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPurchaseModal(prod);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs transition-all shadow-md flex items-center gap-1 group-hover:scale-105"
                        >
                          <span>{isAr ? "شراء وشحن" : "Buy Now"}</span>
                          <span className="material-symbols-outlined text-sm">
                            {isAr ? "arrow_back" : "arrow_forward"}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DEDICATED PURCHASE & DATA ENTRY MODAL (صفحة/نافذة إدخال البيانات والشراء) */}
            {isPurchaseModalOpen && selectedProduct && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
                <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl relative animate-in zoom-in-95 my-8">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-outline-variant/30 pb-4">
                    <div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                        {selectedBundle.name}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-on-surface mt-0.5">
                        {selectedProduct.name}
                      </h3>
                      <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-2">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{isAr ? "تسليم فوري ومباشر" : "Instant Delivery"}</span>
                        </span>
                        {selectedRegion && selectedRegion.name !== "Global" && (
                          <>
                            <span>•</span>
                            <span className="text-primary font-semibold">{selectedRegion.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClosePurchaseModal}
                      className="text-on-surface-variant hover:text-on-surface p-2 rounded-full bg-surface-container-highest transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>

                  {/* Error Notification inside modal */}
                  {errorMessage && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2.5 shadow-sm">
                      <span className="material-symbols-outlined text-lg">error</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* REQUIRED DATA FIELDS (بيانات الشحن المطلوبة) */}
                  {selectedProduct.deliveryType !== "code" &&
                  Array.isArray(selectedProduct.requiredNoteFields) &&
                  selectedProduct.requiredNoteFields.length > 0 ? (
                    <div className="space-y-3.5 bg-surface-container/60 p-4 sm:p-5 rounded-2xl border border-outline-variant/30">
                      <div className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-base">person</span>
                        <span>{isAr ? "بيانات الحساب المطلوبة للشحن المباشر:" : "Required Account Information:"}</span>
                      </div>

                      {selectedProduct.requiredNoteFields.map((field) => (
                        <div key={field} className="space-y-1.5">
                          <label className="block text-xs font-bold text-on-surface">
                            {getFieldLabel(field)} <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            autoFocus
                            placeholder={
                              isAr
                                ? `أدخل ${getFieldLabel(field)} الخاص بك هنا بدقة...`
                                : `Enter your ${getFieldLabel(field)} here...`
                            }
                            value={fieldInputs[field] || ""}
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                            className="w-full px-4 py-3 bg-surface-container-highest border border-outline-variant/40 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary font-mono shadow-inner"
                          />
                        </div>
                      ))}

                      {selectedProduct.userGuide && (
                        <div className="text-[11px] text-on-surface-variant flex items-start gap-1.5 pt-1">
                          <span className="material-symbols-outlined text-sm text-primary shrink-0">info</span>
                          <span>{selectedProduct.userGuide}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/30 text-xs sm:text-sm text-on-surface-variant flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-2xl">confirmation_number</span>
                      <div>
                        <span className="font-bold text-on-surface block text-sm">
                          {isAr ? "تسليم كود رقمي فوري" : "Instant Digital Voucher"}
                        </span>
                        <span className="text-xs">
                          {isAr
                            ? "هذه الخدمة كود رقمي ولا تتطلب إدخال آيدي، سيتم تسليم الكود وتفاصيل البطاقة مباشرة على الشاشة فور تأكيد الطلب وحفظها في حسابك."
                            : "No account ID required. Your voucher code will be displayed instantly upon checkout."}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between bg-surface-container/50 p-3.5 rounded-2xl border border-outline-variant/30">
                    <span className="text-xs font-bold text-on-surface">
                      {isAr ? "الكمية المطلوبة:" : "Quantity:"}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setOrderQuantity((q) => Math.max(selectedProduct.minQty || 1, q - 1))
                        }
                        className="w-8 h-8 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold text-sm flex items-center justify-center border border-outline-variant/30"
                      >
                        -
                      </button>
                      <span className="font-mono font-extrabold text-base w-8 text-center text-on-surface">
                        {orderQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setOrderQuantity((q) => {
                            if (selectedProduct.maxQty && q >= selectedProduct.maxQty) return q;
                            return q + 1;
                          })
                        }
                        className="w-8 h-8 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold text-sm flex items-center justify-center border border-outline-variant/30"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Financial Summary & Balance Check */}
                  <div className="p-4 rounded-2xl bg-surface-container/60 border border-outline-variant/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>{isAr ? "سعر الباقة:" : "Unit Price:"}</span>
                      <span className="font-mono text-on-surface">
                        {convertPrice(selectedProduct.price)} (${selectedProduct.price.toFixed(2)} USD)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>{isAr ? "الكمية:" : "Quantity:"}</span>
                      <span className="font-mono text-on-surface">x {orderQuantity}</span>
                    </div>

                    <div className="flex items-center justify-between text-on-surface-variant pt-2 border-t border-outline-variant/20">
                      <span>{isAr ? "رصيدك المتاح بالمحفظة:" : "Available Balance:"}</span>
                      <span
                        className={`font-mono font-bold ${
                          userBalance >= selectedProduct.price * orderQuantity
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        ${userBalance.toFixed(2)} USD
                      </span>
                    </div>

                    {userBalance < selectedProduct.price * orderQuantity ? (
                      <div className="text-[11px] text-rose-400 font-bold flex items-center justify-between pt-1">
                        <span>{isAr ? "رصيد المحفظة غير كافٍ" : "Insufficient balance"}</span>
                        <Link href={`/${lang}/wallet`} className="text-primary underline">
                          {isAr ? "شحن المحفظة الآن" : "Top up wallet"}
                        </Link>
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-400 font-medium pt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>
                          {isAr
                            ? `الرصيد كافٍ (سيتبقى $${(userBalance - selectedProduct.price * orderQuantity).toFixed(2)} USD)`
                            : `Sufficient balance (Remaining: $${(userBalance - selectedProduct.price * orderQuantity).toFixed(2)} USD)`}
                        </span>
                      </div>
                    )}

                    <div className="pt-2.5 border-t border-outline-variant/30 flex items-center justify-between">
                      <span className="font-bold text-sm text-on-surface">
                        {isAr ? "المجموع الكلي:" : "Total Price:"}
                      </span>
                      <div className="text-left font-mono">
                        <div className="text-xl font-extrabold text-primary">
                          {convertPrice(selectedProduct.price * orderQuantity)}
                        </div>
                        <div className="text-[10px] text-on-surface-variant">
                          ${(selectedProduct.price * orderQuantity).toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={
                        submittingOrder || userBalance < selectedProduct.price * orderQuantity
                      }
                      onClick={handleSubmitPurchase}
                      className="flex-1 py-3.5 px-5 rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 group"
                    >
                      {submittingOrder ? (
                        <>
                          <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                          <span>{isAr ? "جاري الشحن والتنفيذ..." : "Processing Order..."}</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">
                            shopping_cart_checkout
                          </span>
                          <span>
                            {isAr ? "تأكيد الطلب وشحن الحساب" : "Confirm & Pay from Wallet"}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleClosePurchaseModal}
                      className="px-5 py-3.5 rounded-2xl bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold text-sm transition-all border border-outline-variant/30"
                    >
                      {isAr ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* ALL CATEGORIES & CATALOG VIEW MODE (WITH PAGINATION & IMAGES)             */
          /* ========================================================================= */
          <>
            {/* Category Filter Tabs - Wrapped Layout (بدون اسكرول - تحت بعض) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pb-4 pt-1 border-b border-outline-variant/30">
              {SECTION_TABS.map((tab) => {
                const isActive = activeSection === tab.id && !searchQuery.trim();
                const count = tabCounts[tab.id] || 0;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                      isActive
                        ? "bg-primary text-on-primary shadow-lg shadow-primary/25 scale-[1.02]"
                        : "bg-surface-container/70 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                    <span
                      className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono font-bold transition-colors ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-surface-container-highest text-on-surface-variant border border-outline-variant/20"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar & Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container/50 p-4 rounded-2xl border border-outline-variant/30">
              <div className="relative w-full sm:w-96">
                <span className="material-symbols-outlined absolute right-3.5 top-3 text-on-surface-variant text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder={
                    isAr
                      ? "ابحث في كافة الألعاب والخدمات والبطاقات..."
                      : "Search across all games, services & cards..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 bg-surface-container-highest border border-outline-variant/40 rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-3 text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                )}
              </div>

              <div className="text-xs font-semibold text-on-surface-variant">
                {searchQuery.trim()
                  ? isAr
                    ? `نتائج البحث عن "${searchQuery}" (${totalItems} خدمة في كافة الأقسام)`
                    : `Search results for "${searchQuery}" (${totalItems} services across all categories)`
                  : isAr
                  ? `عرض ${paginatedBundles.length} من أصل ${totalItems} خدمة متاحة في ${getSectionLabel(activeSection)}`
                  : `Showing ${paginatedBundles.length} of ${totalItems} services in ${getSectionLabel(activeSection)}`}
              </div>
            </div>

            {/* All Sections Dedicated BNB Top-Up Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-surface-container to-teal-500/15 border border-emerald-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-on-surface">
                      {isAr
                        ? "طريقة الدفع والشحن المعتمدة لكافة الأقسام والخدمات"
                        : "Approved Top-Up Method for All Sections & Services"}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                      BNB / BEP20
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant font-mono select-all mt-1">
                    {isAr ? "اسم التحويل: BNB | الرابط: " : "Transfer Name: BNB | Link: "}
                    <span className="text-emerald-400 font-bold">0xaCc3ab6f0165B39Cf2F1286ED8A778735Ae8314f</span>
                  </p>

                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-[11px] text-on-surface-variant">
                    <span className="text-primary font-bold">{isAr ? "تشمل:" : "Includes:"}</span>
                    <span className="px-2 py-0.5 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">sports_esports</span>
                      <span>{isAr ? "شحن الألعاب المباشر" : "In-Game Topups"}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">store</span>
                      <span>{isAr ? "متاجر التطبيقات" : "App Stores"}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">vpn_key</span>
                      <span>{isAr ? "أكواد الألعاب" : "Game Codes"}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">subscriptions</span>
                      <span>{isAr ? "الاشتراكات والترفيه" : "Subscriptions"}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">sim_card</span>
                      <span>{isAr ? "شرائح الإنترنت eSIM" : "eSIM"}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-surface-container-highest border border-outline-variant/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">account_balance_wallet</span>
                      <span>Rewarble</span>
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/${lang}/wallet?method=bnb`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shrink-0 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">add_card</span>
                <span>{isAr ? "شحن المحفظة عبر BNB" : "Top-up Wallet via BNB"}</span>
              </Link>
            </div>

            {/* Bundles Grid with Rich Visual Cards */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-on-surface-variant font-medium text-sm">
                  {isAr ? "جاري تحميل أحدث الخدمات والباقات من السيرفر..." : "Loading games and services..."}
                </span>
              </div>
            ) : paginatedBundles.length === 0 ? (
              <div className="py-20 text-center space-y-3 bg-surface-container/30 rounded-3xl border border-outline-variant/30 p-8">
                <span className="material-symbols-outlined text-on-surface-variant text-5xl">search_off</span>
                <div className="text-base font-bold text-on-surface">
                  {searchQuery
                    ? isAr
                      ? "لم نتمكن من العثور على أي خدمة مطابقة لبحثك"
                      : "No matching games or services found"
                    : isAr
                    ? "هذا القسم قيد التحديث والربط المباشر حالياً"
                    : "This section is currently being updated by the provider"}
                </div>
                <p className="text-xs text-on-surface-variant">
                  {searchQuery
                    ? isAr
                      ? "يرجى تجربة كلمة بحث أخرى أو تصفح باقي الأقسام."
                      : "Try another search term or browse other categories."
                    : isAr
                    ? "يمكنك تصفح باقي الأقسام مثل الأكثر شعبية، شحن الألعاب ومتاجر التطبيقات."
                    : "Please browse other categories like Most Popular, Top-Ups, and App Stores."}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {paginatedBundles.map((bundle) => {
                    const regionCount = bundle.regions?.length || 0;
                    const visual = getServiceVisual(bundle);

                    return (
                      <div
                        key={bundle.id}
                        onClick={() => handleOpenBundle(bundle)}
                        className="group bg-surface-container/60 hover:bg-surface-container-high/80 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden cursor-pointer"
                      >
                        <div>
                          {/* Visual Image / Banner Container */}
                          <div className="w-full h-32 rounded-xl bg-surface-container-highest/70 border border-outline-variant/20 mb-3.5 overflow-hidden relative flex items-center justify-center group-hover:border-primary/40 transition-all">
                            {visual.imageUrl ? (
                              <img
                                src={visual.imageUrl}
                                alt={bundle.name}
                                loading="lazy"
                                className={
                                   visual.isFlag
                                    ? "w-20 h-14 object-cover rounded-md shadow-md border border-white/20 transition-transform duration-300 group-hover:scale-105"
                                    : "w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                                }
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector(".card-fallback-box") as HTMLElement;
                                    if (fallback) fallback.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}

                            <div
                              className="card-fallback-box w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-surface-container-highest to-surface-container p-3"
                              style={{ display: visual.imageUrl ? "none" : "flex" }}
                            >
                              <span className="material-symbols-outlined text-4xl text-primary/70 mb-1">
                                {getSectionIcon(bundle.sectionId)}
                              </span>
                              <span className="text-[11px] font-bold text-on-surface-variant line-clamp-1">
                                {bundle.name}
                              </span>
                            </div>

                            {/* Top Badges Overlay */}
                            <div className="absolute top-2 start-2 end-2 flex items-center justify-between pointer-events-none">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/10">
                                {regionCount > 1
                                  ? isAr
                                    ? `${regionCount} مناطق`
                                    : `${regionCount} Regions`
                                  : "Global"}
                              </span>

                              <span className="text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span>{isAr ? "متوفر" : "In Stock"}</span>
                              </span>
                            </div>
                          </div>

                          {/* Game / Service Title */}
                          <div className="space-y-1 mb-4">
                            {searchQuery.trim() && (
                              <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 inline-block w-fit mb-1">
                                {getSectionLabel(bundle.sectionId)}
                              </span>
                            )}
                            <h3 className="font-bold text-base sm:text-lg text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                              {bundle.name}
                            </h3>
                            <p className="text-xs text-on-surface-variant line-clamp-1">
                              {isAr
                                ? "شحن حساب مباشر وفوري مع تسليم الأكواد"
                                : "Direct in-game top-up and instant voucher delivery"}
                            </p>
                          </div>
                        </div>

                        {/* Action Button & Packages Count */}
                        <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-3">
                          <div className="text-xs text-on-surface-variant">
                            <span className="block text-[10px]">{isAr ? "الباقات:" : "Packages:"}</span>
                            <span className="font-bold text-on-surface">
                              {bundle.inStockCount} {isAr ? "باقة" : "Items"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBundle(bundle);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs transition-all shadow-md flex items-center gap-1.5 group-hover:scale-105"
                          >
                            <span>{isAr ? "عرض الباقات" : "View Packages"}</span>
                            <span className="material-symbols-outlined text-sm">
                              {isAr ? "arrow_back" : "arrow_forward"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PAGINATION CONTROLS (زر التالي والسابق مع أرقام الصفحات) */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-outline-variant/30 mt-8">
                    <div className="text-xs font-semibold text-on-surface-variant">
                      {isAr
                        ? `عرض ${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            totalItems
                          )} من إجمالي ${totalItems} خدمة`
                        : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            totalItems
                          )} of ${totalItems} items`}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Previous Page Button */}
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 380, behavior: "smooth" });
                        }}
                        className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all border border-outline-variant/30 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isAr ? "arrow_forward" : "arrow_back"}
                        </span>
                        <span>{isAr ? "السابق" : "Previous"}</span>
                      </button>

                      {/* Page Numbers - Unique Keys */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                          if (typeof p === "string") {
                            return (
                              <span
                                key={`ellipsis-${idx}`}
                                className="px-2 text-on-surface-variant text-xs select-none"
                              >
                                ...
                              </span>
                            );
                          }
                          const isCurrent = p === currentPage;
                          return (
                            <button
                              key={`page-${p}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPage(p);
                                window.scrollTo({ top: 380, behavior: "smooth" });
                              }}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center font-mono ${
                                isCurrent
                                  ? "bg-primary text-on-primary shadow-md"
                                  : "bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Page Button (زر التالي المطلوب) */}
                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 380, behavior: "smooth" });
                        }}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                      >
                        <span>{isAr ? "التالي" : "Next"}</span>
                        <span className="material-symbols-outlined text-sm">
                          {isAr ? "arrow_back" : "arrow_forward"}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Success Modal */}
      {completedOrderData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-on-surface">
                {isAr ? "تم استلام وتنفيذ الطلب بنجاح" : "Order Completed Successfully"}
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                {isAr ? `رقم الطلب: #${completedOrderData.orderId}` : `Order #${completedOrderData.orderId}`}
              </p>
            </div>

            {completedOrderData.reply && (
              <div className="p-4 rounded-2xl bg-surface-container-highest border border-emerald-500/30 space-y-2 text-right">
                <span className="text-[11px] font-bold text-on-surface-variant block text-center uppercase tracking-wider">
                  {isAr ? "كود الشحن الرقمي" : "Digital Redemption Code"}
                </span>
                <div className="font-mono text-base font-extrabold text-emerald-400 text-center select-all p-3 bg-black/40 rounded-xl border border-outline-variant/20 tracking-wider">
                  {completedOrderData.reply}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(completedOrderData.reply || "");
                    alert(isAr ? "تم نسخ الكود بنجاح" : "Code copied to clipboard");
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  <span>{isAr ? "نسخ الكود" : "Copy Code"}</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompletedOrderData(null)}
                className="px-5 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface text-xs font-bold transition-all"
              >
                {isAr ? "متابعة التسوق" : "Continue Shopping"}
              </button>

              <Link
                href={`/${lang}/orders`}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-sm flex items-center gap-1"
              >
                <span>{isAr ? "عرض سجل الطلبات" : "View Orders"}</span>
                <span className="material-symbols-outlined text-sm">
                  {isAr ? "arrow_back" : "arrow_forward"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
