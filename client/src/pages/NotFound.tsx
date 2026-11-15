import { Link } from "react-router-dom";
import { Page } from "../components/Layout";

export default function NotFound() {
  return (
    <Page>
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-accent-700">404</p>
        <h1 className="mt-2 text-4xl font-bold text-stone-900">Page not found</h1>
        <p className="mt-2 text-stone-500">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary mt-6">
          Back home
        </Link>
      </div>
    </Page>
  );
}
