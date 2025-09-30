import { Logo } from "@/components/docs/Logo";
import { usePathname } from "next/navigation";
import { useTheme } from "nextra-theme-docs";
import { useEffect, useState } from "react";

// const SITE_ROOT = "http://localhost:3000/";
const SITE_ROOT = "https://tobechain.net/";

const METADATA_DEFAULT = {
  title: "VietChain",
  description: "VietChain Description",
  image: SITE_ROOT + "/Layer_1-2.png",
};

const config = {
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  useNextSeoProps: function SEO() {
    const pathname = usePathname();
    const { systemTheme = "dark" } = useTheme();

    const fullUrl = pathname === "" ? SITE_ROOT : `${SITE_ROOT}${pathname}`;

    const defaultTitle = "VietChain";

    return {
      description: METADATA_DEFAULT.description,
      defaultTitle,
      titleTemplate: "Document VietChain",
      canonical: fullUrl,
      openGraph: {
        type: "website",
        url: fullUrl,
        defaultTitle,
        description: METADATA_DEFAULT.description,
        images: [
          {
            url: Logo.src,
          },
        ],
        siteName: "VietChain",
        locale: "en_US",
      },
      additionalLinkTags: [
        {
          as: "document",
          href: "/docs",
          rel: "prefetch",
        },
        {
          rel: "icon",
          href: `/favicon.ico`,
          type: "image/svg+xml",
        },
      ],
      gitTimestamp({ timestamp }) {
        const [dateString, setDateString] = useState(timestamp.toISOString());

        useEffect(() => {
          try {
            setDateString(
              timestamp.toLocaleDateString(navigator.language, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            );
          } catch (e) {
            // Ignore errors here; they get the ISO string.
            // At least one person out there has manually misconfigured navigator.language.
          }
        }, [timestamp]);

        return <>Last updated on {dateString}</>;
      },
    };
  },

  toc: {
    float: true,
    backToTop: true,
  },
  // font: false,
  logo: Logo,
  logoLink: false,
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="VietChain" />
      <meta property="og:description" content="VietChain Description" />
    </>
  ),
  footer: false,
  feedback: {
    content: null,
  },

  primaryHue: { dark: 159, light: 159 },
  primarySaturation: { dark: 90, light: 90 },
  nextThemes: {
    defaultTheme: "light",
  },
};

export default config;
