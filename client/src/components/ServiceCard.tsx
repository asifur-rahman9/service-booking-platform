import { Link } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import type { Service } from "../lib/types";
import { businessName, formatDuration, formatMoney } from "../lib/format";
import { CategoryIcon, CategoryTag } from "./ui";

export function ServiceCard({ service }: { service: Service }) {
  const city = typeof service.business === "object" ? service.business.business?.city : "";
  return (
    <Link
      to={`/services/${service._id}`}
      className="card group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-brand-600/30 hover:shadow-lg hover:shadow-stone-900/5"
    >
      <div className="flex items-center justify-between">
        <CategoryIcon category={service.category} />
        <CategoryTag category={service.category} />
      </div>
      <div>
        <h3 className="font-display text-xl font-bold text-stone-900 group-hover:text-brand-700">{service.name}</h3>
        <p className="text-sm text-stone-600">{businessName(service.business)}</p>
      </div>
      <p className="line-clamp-2 flex-1 text-sm text-stone-700">{service.description}</p>
      <div className="flex items-center gap-3 border-t border-stone-100 pt-4 text-sm text-stone-600">
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatDuration(service.durationMinutes)}
        </span>
        {city && (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {city}
          </span>
        )}
        <span className="ml-auto text-lg font-bold text-brand-600">{formatMoney(service.price)}</span>
      </div>
    </Link>
  );
}
