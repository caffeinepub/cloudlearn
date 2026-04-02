import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, Layout, Video } from "lucide-react";
import type { Material } from "../backend";

const TYPE_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badge: string;
  }
> = {
  document: {
    icon: FileText,
    label: "Document",
    badge: "bg-blue-100 text-blue-700",
  },
  slide: {
    icon: Layout,
    label: "Slides",
    badge: "bg-purple-100 text-purple-700",
  },
  video: { icon: Video, label: "Video", badge: "bg-red-100 text-red-700" },
  link: {
    icon: ExternalLink,
    label: "Link",
    badge: "bg-green-100 text-green-700",
  },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type.toLowerCase()] || TYPE_CONFIG.document;
}

export default function MaterialItem({ material }: { material: Material }) {
  const config = getConfig(material.materialType);
  const Icon = config.icon;

  const handleOpen = async () => {
    if (material.url) {
      window.open(material.url, "_blank", "noopener,noreferrer");
    } else if (material.blob) {
      const url = material.blob.getDirectURL();
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const formattedDate = new Date(
    Number(material.createdAt / BigInt(1_000_000)),
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const hasFile = !!(material.url || material.blob);

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:bg-accent/30 transition-all duration-150">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">
          {material.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
      </div>
      <Badge className={`text-xs px-2 py-0.5 border-0 ${config.badge}`}>
        {config.label}
      </Badge>
      {hasFile ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpen}
          className="flex-shrink-0 text-primary hover:text-primary hover:bg-primary/10"
          data-ocid="material.button"
        >
          {material.materialType === "link" ? (
            <ExternalLink className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>
      ) : (
        <Badge
          className="text-xs px-2 py-0.5 border border-border bg-muted text-muted-foreground flex-shrink-0"
          data-ocid="material.button"
        >
          Unavailable
        </Badge>
      )}
    </div>
  );
}
