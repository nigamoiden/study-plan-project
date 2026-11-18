export default function ResourceViewer({ url, title }: { url: string; title: string }) {
  return (
    <iframe
      src={url}
      title={title}
      sandbox="allow-scripts allow-same-origin"
      referrerPolicy="no-referrer"
      loading="lazy"
      className="aspect-video w-full rounded-lg border border-slate-200"
    />
  );
}