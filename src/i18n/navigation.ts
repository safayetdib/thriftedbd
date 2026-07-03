import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware drop-ins for next/link and next/navigation. Storefront code
 * must import Link/redirect/usePathname/useRouter from here so /bn users stay
 * on /bn when navigating. Admin code keeps using next/link — it's not localized.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
