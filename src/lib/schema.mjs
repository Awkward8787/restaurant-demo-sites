import { DAY_ORDER } from "./hours.mjs";

const SCHEMA_DAY = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function openingSpec(weekly) {
  if (!weekly) return undefined;
  const specs = [];
  for (const day of DAY_ORDER) {
    for (const [opens, closes] of weekly[day] ?? []) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SCHEMA_DAY[day],
        opens: opens === "24:00" ? "00:00" : opens,
        closes: closes === "24:00" ? "23:59" : closes,
      });
    }
  }
  return specs.length ? specs : undefined;
}

export function restaurantJsonLd(restaurant, pageUrl) {
  const address = restaurant.address;
  const node = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    servesCuisine: restaurant.servesCuisine,
    url: pageUrl,
    telephone: restaurant.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurant.geo.lat,
      longitude: restaurant.geo.lon,
    },
  };

  if (restaurant.menu.status !== "sample") {
    node.hasMenu = pageUrl + "#menu";
    node.menu = pageUrl + "#menu";
  }

  if (restaurant.rating?.value != null && Number.isFinite(restaurant.rating.count)) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: restaurant.rating.value,
      reviewCount: restaurant.rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const hours = openingSpec(restaurant.hours?.weekly);
  if (hours) node.openingHoursSpecification = hours;

  if (restaurant.menu.status === "published" || restaurant.menu.status === "partial") {
    const sections = restaurant.menu.categories
      .map((category) => {
        const items = category.items
          .filter((item) => item.sample !== true && item.price != null)
          .map((item) => ({
            "@type": "MenuItem",
            name: item.name,
            description: item.gloss || undefined,
            offers: {
              "@type": "Offer",
              price: item.price,
              priceCurrency: "USD",
            },
          }));
        if (!items.length) return null;
        return {
          "@type": "MenuSection",
          name: category.name,
          hasMenuItem: items,
        };
      })
      .filter(Boolean);
    if (sections.length) {
      node.hasMenu = {
        "@type": "Menu",
        name: `${restaurant.name} menu`,
        hasMenuSection: sections,
      };
    }
  }

  return node;
}
