import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="relative w-80">
      <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
      <Input
        type="text"
        placeholder="Search projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
